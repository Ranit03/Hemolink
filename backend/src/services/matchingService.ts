import { PrismaClient, BloodType, DonorProfile, DonationRequest } from '@prisma/client';
import { logger } from '../utils/logger';
import { cacheService } from '../config/redis';

const prisma = new PrismaClient();

interface MatchingCriteria {
  bloodType: BloodType;
  location: {
    latitude: number;
    longitude: number;
    radius?: number; // in kilometers
  };
  urgencyLevel: number;
  requiredBy: Date;
}

interface DonorMatch {
  donor: DonorProfile & {
    user: {
      id: string;
      firstName: string;
      lastName: string;
      phone: string | null;
      email: string;
    };
  };
  compatibilityScore: number;
  distance: number;
  availabilityScore: number;
  overallScore: number;
}

// Blood type compatibility matrix
const BLOOD_COMPATIBILITY: Record<BloodType, BloodType[]> = {
  A_POSITIVE: ['A_POSITIVE', 'A_NEGATIVE', 'O_POSITIVE', 'O_NEGATIVE'],
  A_NEGATIVE: ['A_NEGATIVE', 'O_NEGATIVE'],
  B_POSITIVE: ['B_POSITIVE', 'B_NEGATIVE', 'O_POSITIVE', 'O_NEGATIVE'],
  B_NEGATIVE: ['B_NEGATIVE', 'O_NEGATIVE'],
  AB_POSITIVE: ['A_POSITIVE', 'A_NEGATIVE', 'B_POSITIVE', 'B_NEGATIVE', 'AB_POSITIVE', 'AB_NEGATIVE', 'O_POSITIVE', 'O_NEGATIVE'],
  AB_NEGATIVE: ['A_NEGATIVE', 'B_NEGATIVE', 'AB_NEGATIVE', 'O_NEGATIVE'],
  O_POSITIVE: ['O_POSITIVE', 'O_NEGATIVE'],
  O_NEGATIVE: ['O_NEGATIVE'],
};

export class MatchingService {
  /**
   * Find compatible donors for a donation request
   */
  static async findCompatibleDonors(
    requestId: string,
    limit: number = 10
  ): Promise<DonorMatch[]> {
    try {
      // Get donation request details
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
        throw new Error('Donation request not found');
      }

      const criteria: MatchingCriteria = {
        bloodType: request.bloodType,
        location: request.location as any,
        urgencyLevel: request.urgencyLevel,
        requiredBy: request.requiredBy,
      };

      return await this.matchDonors(criteria, limit);
    } catch (error) {
      logger.error('Error finding compatible donors:', error);
      throw error;
    }
  }

  /**
   * Match donors based on criteria
   */
  static async matchDonors(
    criteria: MatchingCriteria,
    limit: number = 10
  ): Promise<DonorMatch[]> {
    try {
      // Get compatible blood types
      const compatibleBloodTypes = BLOOD_COMPATIBILITY[criteria.bloodType];

      // Find eligible donors
      const donors = await prisma.donorProfile.findMany({
        where: {
          bloodType: {
            in: compatibleBloodTypes,
          },
          isEligible: true,
          user: {
            isActive: true,
            isVerified: true,
          },
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              phone: true,
              email: true,
            },
          },
        },
      });

      // Score and rank donors
      const matches: DonorMatch[] = [];

      for (const donor of donors) {
        const score = await this.calculateDonorScore(donor, criteria);
        if (score.overallScore > 0) {
          matches.push({
            donor,
            ...score,
          });
        }
      }

      // Sort by overall score (descending)
      matches.sort((a, b) => b.overallScore - a.overallScore);

      return matches.slice(0, limit);
    } catch (error) {
      logger.error('Error matching donors:', error);
      throw error;
    }
  }

  /**
   * Calculate donor score based on multiple factors
   */
  private static async calculateDonorScore(
    donor: DonorProfile & {
      user: {
        id: string;
        firstName: string;
        lastName: string;
        phone: string | null;
        email: string;
      };
    },
    criteria: MatchingCriteria
  ): Promise<{
    compatibilityScore: number;
    distance: number;
    availabilityScore: number;
    overallScore: number;
  }> {
    // Blood type compatibility score
    const compatibilityScore = this.calculateCompatibilityScore(
      donor.bloodType,
      criteria.bloodType
    );

    // Distance score
    const distance = this.calculateDistance(
      donor.preferredLocations as any,
      criteria.location
    );
    const distanceScore = this.calculateDistanceScore(distance, criteria.location.radius);

    // Availability score
    const availabilityScore = await this.calculateAvailabilityScore(
      donor,
      criteria.requiredBy
    );

    // Urgency multiplier
    const urgencyMultiplier = criteria.urgencyLevel / 5; // Normalize to 0-1

    // Calculate overall score
    const overallScore = (
      compatibilityScore * 0.4 +
      distanceScore * 0.3 +
      availabilityScore * 0.3
    ) * urgencyMultiplier;

    return {
      compatibilityScore,
      distance,
      availabilityScore,
      overallScore,
    };
  }

  /**
   * Calculate blood type compatibility score
   */
  private static calculateCompatibilityScore(
    donorBloodType: BloodType,
    requiredBloodType: BloodType
  ): number {
    if (donorBloodType === requiredBloodType) {
      return 1.0; // Perfect match
    }

    // Check if donor blood type is compatible
    const compatibleTypes = BLOOD_COMPATIBILITY[requiredBloodType];
    if (compatibleTypes.includes(donorBloodType)) {
      // Universal donors get higher scores
      if (donorBloodType === 'O_NEGATIVE') return 0.9;
      if (donorBloodType === 'O_POSITIVE') return 0.8;
      return 0.7;
    }

    return 0; // Not compatible
  }

  /**
   * Calculate distance between donor and request location
   */
  private static calculateDistance(
    donorLocations: any,
    requestLocation: { latitude: number; longitude: number }
  ): number {
    if (!donorLocations || !Array.isArray(donorLocations)) {
      return Infinity;
    }

    let minDistance = Infinity;

    for (const location of donorLocations) {
      if (location.latitude && location.longitude) {
        const distance = this.haversineDistance(
          requestLocation.latitude,
          requestLocation.longitude,
          location.latitude,
          location.longitude
        );
        minDistance = Math.min(minDistance, distance);
      }
    }

    return minDistance;
  }

  /**
   * Calculate distance score based on proximity
   */
  private static calculateDistanceScore(distance: number, maxRadius: number = 50): number {
    if (distance === Infinity) return 0;
    if (distance <= 5) return 1.0; // Within 5km
    if (distance <= 15) return 0.8; // Within 15km
    if (distance <= 30) return 0.6; // Within 30km
    if (distance <= maxRadius) return 0.4; // Within max radius
    return 0; // Too far
  }

  /**
   * Calculate availability score based on donation history and schedule
   */
  private static async calculateAvailabilityScore(
    donor: DonorProfile,
    requiredBy: Date
  ): Promise<number> {
    try {
      // Check if donor has donated recently (minimum 56 days gap)
      const minDonationGap = 56 * 24 * 60 * 60 * 1000; // 56 days in milliseconds
      const now = new Date();

      if (donor.lastDonation) {
        const daysSinceLastDonation = now.getTime() - donor.lastDonation.getTime();
        if (daysSinceLastDonation < minDonationGap) {
          return 0; // Not eligible yet
        }
      }

      // Check availability schedule
      const availabilitySchedule = donor.availabilitySchedule as any;
      if (availabilitySchedule && availabilitySchedule.length > 0) {
        // Check if donor is available on the required date
        const requiredDay = requiredBy.getDay();
        const isAvailable = availabilitySchedule.some((schedule: any) => 
          schedule.dayOfWeek === requiredDay && schedule.available
        );
        if (!isAvailable) return 0.3; // Available but not on preferred day
      }

      // Check recent donation frequency (higher frequency = higher score)
      const recentDonations = await prisma.donation.count({
        where: {
          donorId: donor.id,
          actualDate: {
            gte: new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000), // Last year
          },
          status: 'COMPLETED',
        },
      });

      const frequencyScore = Math.min(recentDonations / 4, 1); // Max 4 donations per year

      return 0.7 + (frequencyScore * 0.3); // Base score + frequency bonus
    } catch (error) {
      logger.error('Error calculating availability score:', error);
      return 0.5; // Default score
    }
  }

  /**
   * Calculate distance between two points using Haversine formula
   */
  private static haversineDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private static toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Cache matching results for performance
   */
  static async cacheMatchingResults(
    requestId: string,
    matches: DonorMatch[],
    ttl: number = 300 // 5 minutes
  ): Promise<void> {
    try {
      await cacheService.set(
        `matching_results:${requestId}`,
        JSON.stringify(matches),
        ttl
      );
    } catch (error) {
      logger.error('Error caching matching results:', error);
    }
  }

  /**
   * Get cached matching results
   */
  static async getCachedMatchingResults(requestId: string): Promise<DonorMatch[] | null> {
    try {
      const cached = await cacheService.get(`matching_results:${requestId}`);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      logger.error('Error getting cached matching results:', error);
      return null;
    }
  }
}

export default MatchingService;
