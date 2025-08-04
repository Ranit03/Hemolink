import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    service: 'HemoLink AI Backend',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Demo API endpoints
app.get('/api/demo/patients', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: '1',
        name: 'John Doe',
        bloodType: 'A_POSITIVE',
        nextTransfusion: '2024-02-15',
        hemoglobin: 8.5
      }
    ]
  });
});

app.get('/api/demo/donors', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: '1',
        name: 'Jane Smith',
        bloodType: 'A_POSITIVE',
        available: true,
        lastDonation: '2024-01-01'
      }
    ]
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `The requested route ${req.originalUrl} does not exist.`
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 HemoLink AI Backend Server running on port ${PORT}`);
  console.log(`📊 Health check available at http://localhost:${PORT}/health`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🩸 HemoLink AI - Empowering Thalassemia Care`);
});

export { app };
