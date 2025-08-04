import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';
import { cacheService } from '../config/redis';

const prisma = new PrismaClient();

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userRole?: string;
}

interface SocketUser {
  socketId: string;
  userId: string;
  userRole: string;
  connectedAt: Date;
}

class SocketService {
  private io: Server;
  private connectedUsers: Map<string, SocketUser> = new Map();

  constructor(io: Server) {
    this.io = io;
    this.setupMiddleware();
    this.setupEventHandlers();
  }

  private setupMiddleware() {
    // Authentication middleware
    this.io.use(async (socket: AuthenticatedSocket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
          return next(new Error('Authentication error: No token provided'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
        
        const user = await prisma.user.findUnique({
          where: { id: decoded.id },
          select: {
            id: true,
            role: true,
            isActive: true,
            isVerified: true,
          },
        });

        if (!user || !user.isActive) {
          return next(new Error('Authentication error: Invalid user'));
        }

        socket.userId = user.id;
        socket.userRole = user.role;
        next();
      } catch (error) {
        logger.error('Socket authentication error:', error);
        next(new Error('Authentication error'));
      }
    });
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket: AuthenticatedSocket) => {
      this.handleConnection(socket);
    });
  }

  private async handleConnection(socket: AuthenticatedSocket) {
    const userId = socket.userId!;
    const userRole = socket.userRole!;

    logger.info(`User connected: ${userId} (${userRole}) - Socket: ${socket.id}`);

    // Store connected user
    this.connectedUsers.set(socket.id, {
      socketId: socket.id,
      userId,
      userRole,
      connectedAt: new Date(),
    });

    // Join user-specific room
    socket.join(`user:${userId}`);
    
    // Join role-specific room
    socket.join(`role:${userRole}`);

    // Cache user's online status
    await cacheService.addToSet('online_users', userId);
    await cacheService.set(`user_socket:${userId}`, socket.id, 24 * 60 * 60); // 24 hours

    // Send connection confirmation
    socket.emit('connected', {
      message: 'Connected successfully',
      userId,
      userRole,
      timestamp: new Date().toISOString(),
    });

    // Handle events
    this.setupSocketEvents(socket);

    // Handle disconnection
    socket.on('disconnect', () => {
      this.handleDisconnection(socket);
    });
  }

  private setupSocketEvents(socket: AuthenticatedSocket) {
    const userId = socket.userId!;

    // Join specific rooms
    socket.on('join_room', (roomId: string) => {
      socket.join(roomId);
      logger.info(`User ${userId} joined room: ${roomId}`);
    });

    socket.on('leave_room', (roomId: string) => {
      socket.leave(roomId);
      logger.info(`User ${userId} left room: ${roomId}`);
    });

    // Handle private messages
    socket.on('send_message', async (data) => {
      try {
        await this.handlePrivateMessage(socket, data);
      } catch (error) {
        logger.error('Error handling private message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle donation request updates
    socket.on('donation_request_update', async (data) => {
      try {
        await this.handleDonationRequestUpdate(socket, data);
      } catch (error) {
        logger.error('Error handling donation request update:', error);
        socket.emit('error', { message: 'Failed to update donation request' });
      }
    });

    // Handle typing indicators
    socket.on('typing_start', (data) => {
      socket.to(`user:${data.receiverId}`).emit('user_typing', {
        userId,
        isTyping: true,
      });
    });

    socket.on('typing_stop', (data) => {
      socket.to(`user:${data.receiverId}`).emit('user_typing', {
        userId,
        isTyping: false,
      });
    });

    // Handle location updates (for donors)
    socket.on('location_update', async (data) => {
      if (socket.userRole === 'DONOR') {
        await this.handleLocationUpdate(socket, data);
      }
    });
  }

  private async handlePrivateMessage(socket: AuthenticatedSocket, data: any) {
    const { receiverId, content, messageType = 'TEXT' } = data;
    const senderId = socket.userId!;

    // Save message to database
    const message = await prisma.message.create({
      data: {
        senderId,
        receiverId,
        content,
        messageType,
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePicture: true,
          },
        },
      },
    });

    // Send to receiver if online
    this.io.to(`user:${receiverId}`).emit('new_message', {
      message,
      timestamp: new Date().toISOString(),
    });

    // Send confirmation to sender
    socket.emit('message_sent', {
      messageId: message.id,
      timestamp: message.createdAt,
    });

    // Create notification for receiver
    await this.createNotification(receiverId, 'MESSAGE', 'New Message', `You have a new message from ${message.sender.firstName}`);
  }

  private async handleDonationRequestUpdate(socket: AuthenticatedSocket, data: any) {
    const { requestId, status, donorId } = data;
    const userId = socket.userId!;

    // Verify user has permission to update this request
    const request = await prisma.donationRequest.findUnique({
      where: { id: requestId },
      include: {
        patient: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!request) {
      socket.emit('error', { message: 'Donation request not found' });
      return;
    }

    // Update request status
    const updatedRequest = await prisma.donationRequest.update({
      where: { id: requestId },
      data: { status },
    });

    // Notify relevant users
    const notificationData = {
      requestId,
      status,
      timestamp: new Date().toISOString(),
    };

    // Notify patient
    this.io.to(`user:${request.patient.userId}`).emit('donation_request_updated', notificationData);

    // Notify donor if specified
    if (donorId) {
      this.io.to(`user:${donorId}`).emit('donation_request_updated', notificationData);
    }

    // Notify healthcare providers
    this.io.to('role:HEALTHCARE_PROVIDER').emit('donation_request_updated', notificationData);
  }

  private async handleLocationUpdate(socket: AuthenticatedSocket, data: any) {
    const { latitude, longitude } = data;
    const userId = socket.userId!;

    // Update donor's current location in cache
    await cacheService.setHash(`donor_location:${userId}`, 'latitude', latitude.toString());
    await cacheService.setHash(`donor_location:${userId}`, 'longitude', longitude.toString());
    await cacheService.setHash(`donor_location:${userId}`, 'timestamp', new Date().toISOString());

    // Notify matching service about location update
    this.io.emit('donor_location_updated', {
      donorId: userId,
      location: { latitude, longitude },
      timestamp: new Date().toISOString(),
    });
  }

  private async handleDisconnection(socket: AuthenticatedSocket) {
    const userId = socket.userId!;
    
    logger.info(`User disconnected: ${userId} - Socket: ${socket.id}`);

    // Remove from connected users
    this.connectedUsers.delete(socket.id);

    // Remove from online users if no other sockets
    const userSockets = Array.from(this.connectedUsers.values()).filter(user => user.userId === userId);
    if (userSockets.length === 0) {
      await cacheService.removeFromSet('online_users', userId);
      await cacheService.del(`user_socket:${userId}`);
    }
  }

  // Public methods for sending notifications
  public async sendNotificationToUser(userId: string, notification: any) {
    this.io.to(`user:${userId}`).emit('notification', notification);
  }

  public async sendNotificationToRole(role: string, notification: any) {
    this.io.to(`role:${role}`).emit('notification', notification);
  }

  public async broadcastToAll(event: string, data: any) {
    this.io.emit(event, data);
  }

  public async sendToRoom(roomId: string, event: string, data: any) {
    this.io.to(roomId).emit(event, data);
  }

  private async createNotification(userId: string, type: string, title: string, message: string, data?: any) {
    try {
      const notification = await prisma.notification.create({
        data: {
          userId,
          type: type as any,
          title,
          message,
          data,
        },
      });

      // Send real-time notification
      this.sendNotificationToUser(userId, notification);

      return notification;
    } catch (error) {
      logger.error('Error creating notification:', error);
    }
  }

  public getConnectedUsers(): SocketUser[] {
    return Array.from(this.connectedUsers.values());
  }

  public isUserOnline(userId: string): boolean {
    return Array.from(this.connectedUsers.values()).some(user => user.userId === userId);
  }
}

let socketService: SocketService;

export const initializeSocket = (io: Server): SocketService => {
  socketService = new SocketService(io);
  return socketService;
};

export const getSocketService = (): SocketService => {
  if (!socketService) {
    throw new Error('Socket service not initialized');
  }
  return socketService;
};

export default SocketService;
