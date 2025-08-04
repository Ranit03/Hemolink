const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

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

// In-memory storage for demo data
let demoPatients = [
  {
    id: '1',
    name: 'John Doe',
    bloodType: 'A_POSITIVE',
    nextTransfusion: '2024-02-15',
    hemoglobin: 8.5,
    age: 28,
    location: 'Mumbai, Maharashtra'
  },
  {
    id: '2',
    name: 'Priya Sharma',
    bloodType: 'O_POSITIVE',
    nextTransfusion: '2024-02-18',
    hemoglobin: 7.8,
    age: 24,
    location: 'Delhi, Delhi'
  },
  {
    id: '3',
    name: 'Rajesh Kumar',
    bloodType: 'B_POSITIVE',
    nextTransfusion: '2024-02-20',
    hemoglobin: 9.2,
    age: 32,
    location: 'Bangalore, Karnataka'
  }
];

let demoDonors = [
  {
    id: '1',
    name: 'Jane Smith',
    bloodType: 'A_POSITIVE',
    available: true,
    lastDonation: '2024-01-01',
    donationCount: 12,
    location: 'Mumbai, Maharashtra',
    phone: '+91-9876543210',
    email: 'jane.smith@email.com',
    joinDate: '2022-03-15',
    totalImpact: {
      patientsHelped: 28,
      livesSaved: 7,
      donationStreak: 4,
      totalUnits: 15
    },
    achievements: [
      { id: '1', title: 'First Drop', description: 'Completed your first donation', icon: '🩸', unlockedDate: '2022-03-20', rarity: 'common' },
      { id: '2', title: 'Life Saver', description: 'Helped save 5 lives', icon: '💝', unlockedDate: '2023-06-10', rarity: 'rare' },
      { id: '3', title: 'Streak Master', description: 'Maintained 3+ donation streak', icon: '🔥', unlockedDate: '2023-12-01', rarity: 'epic' },
      { id: '4', title: 'Guardian Angel', description: 'Helped 25+ patients', icon: '👼', unlockedDate: '2024-01-01', rarity: 'legendary' }
    ],
    nextEligibleDate: '2024-04-01'
  },
  {
    id: '2',
    name: 'Amit Patel',
    bloodType: 'O_POSITIVE',
    available: true,
    lastDonation: '2023-12-15',
    donationCount: 8,
    location: 'Ahmedabad, Gujarat',
    phone: '+91-9876543211',
    email: 'amit.patel@email.com',
    joinDate: '2023-01-10',
    totalImpact: {
      patientsHelped: 18,
      livesSaved: 4,
      donationStreak: 2,
      totalUnits: 10
    },
    achievements: [
      { id: '1', title: 'First Drop', description: 'Completed your first donation', icon: '🩸', unlockedDate: '2023-01-15', rarity: 'common' },
      { id: '2', title: 'Life Saver', description: 'Helped save 5 lives', icon: '💝', unlockedDate: '2023-08-20', rarity: 'rare' }
    ],
    nextEligibleDate: '2024-03-15'
  },
  {
    id: '3',
    name: 'Sunita Reddy',
    bloodType: 'B_POSITIVE',
    available: false,
    lastDonation: '2024-01-20',
    donationCount: 15,
    location: 'Hyderabad, Telangana',
    phone: '+91-9876543212',
    email: 'sunita.reddy@email.com',
    joinDate: '2021-08-05',
    totalImpact: {
      patientsHelped: 35,
      livesSaved: 9,
      donationStreak: 6,
      totalUnits: 20
    },
    achievements: [
      { id: '1', title: 'First Drop', description: 'Completed your first donation', icon: '🩸', unlockedDate: '2021-08-10', rarity: 'common' },
      { id: '2', title: 'Life Saver', description: 'Helped save 5 lives', icon: '💝', unlockedDate: '2022-02-14', rarity: 'rare' },
      { id: '3', title: 'Streak Master', description: 'Maintained 3+ donation streak', icon: '🔥', unlockedDate: '2022-06-01', rarity: 'epic' },
      { id: '4', title: 'Guardian Angel', description: 'Helped 25+ patients', icon: '👼', unlockedDate: '2023-03-15', rarity: 'legendary' },
      { id: '5', title: 'Champion', description: 'Completed 15+ donations', icon: '🏆', unlockedDate: '2024-01-20', rarity: 'legendary' }
    ],
    nextEligibleDate: '2024-04-20'
  }
];

// Donor credentials for authentication
const donorCredentials = [
  { email: 'jane.smith@email.com', password: 'jane123', donorId: '1' },
  { email: 'amit.patel@email.com', password: 'amit123', donorId: '2' },
  { email: 'sunita.reddy@email.com', password: 'sunita123', donorId: '3' }
];

// Demo API endpoints
app.get('/api/demo/patients', (req, res) => {
  res.json({
    success: true,
    data: demoPatients
  });
});

// Add new patient
app.post('/api/demo/patients', (req, res) => {
  try {
    const { name, bloodType, nextTransfusion, hemoglobin, age, location } = req.body;

    if (!name || !bloodType || !nextTransfusion || !hemoglobin || !age || !location) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: name, bloodType, nextTransfusion, hemoglobin, age, location'
      });
    }

    const newPatient = {
      id: String(Date.now()),
      name,
      bloodType,
      nextTransfusion,
      hemoglobin: parseFloat(hemoglobin),
      age: parseInt(age),
      location
    };

    demoPatients.push(newPatient);

    res.status(201).json({
      success: true,
      message: 'Patient added successfully',
      data: newPatient
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to add patient'
    });
  }
});

// Delete patient
app.delete('/api/demo/patients/:id', (req, res) => {
  try {
    const { id } = req.params;
    const patientIndex = demoPatients.findIndex(patient => patient.id === id);

    if (patientIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Patient not found'
      });
    }

    const deletedPatient = demoPatients.splice(patientIndex, 1)[0];

    res.json({
      success: true,
      message: 'Patient deleted successfully',
      data: deletedPatient
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to delete patient'
    });
  }
});

// Clear all patients
app.delete('/api/demo/patients', (req, res) => {
  try {
    const deletedCount = demoPatients.length;
    demoPatients = [];

    res.json({
      success: true,
      message: `All ${deletedCount} patients deleted successfully`,
      data: { deletedCount }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to clear patients'
    });
  }
});

app.get('/api/demo/donors', (req, res) => {
  res.json({
    success: true,
    data: demoDonors
  });
});

// Add new donor
app.post('/api/demo/donors', (req, res) => {
  try {
    const { name, bloodType, available, lastDonation, donationCount, location, phone } = req.body;

    if (!name || !bloodType || !location || !phone) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: name, bloodType, location, phone'
      });
    }

    const newDonor = {
      id: String(Date.now()),
      name,
      bloodType,
      available: available !== undefined ? available : true,
      lastDonation: lastDonation || null,
      donationCount: donationCount ? parseInt(donationCount) : 0,
      location,
      phone
    };

    demoDonors.push(newDonor);

    res.status(201).json({
      success: true,
      message: 'Donor added successfully',
      data: newDonor
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to add donor'
    });
  }
});

// Delete donor
app.delete('/api/demo/donors/:id', (req, res) => {
  try {
    const { id } = req.params;
    const donorIndex = demoDonors.findIndex(donor => donor.id === id);

    if (donorIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Donor not found'
      });
    }

    const deletedDonor = demoDonors.splice(donorIndex, 1)[0];

    res.json({
      success: true,
      message: 'Donor deleted successfully',
      data: deletedDonor
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to delete donor'
    });
  }
});

// Clear all donors
app.delete('/api/demo/donors', (req, res) => {
  try {
    const deletedCount = demoDonors.length;
    demoDonors = [];

    res.json({
      success: true,
      message: `All ${deletedCount} donors deleted successfully`,
      data: { deletedCount }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to clear donors'
    });
  }
});

// Get donor dashboard data
app.get('/api/demo/donors/:id/dashboard', (req, res) => {
  try {
    const { id } = req.params;
    const donor = demoDonors.find(donor => donor.id === id);

    if (!donor) {
      return res.status(404).json({
        success: false,
        error: 'Donor not found'
      });
    }

    res.json({
      success: true,
      data: donor
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get donor dashboard data'
    });
  }
});

// Get leaderboard
app.get('/api/demo/leaderboard', (req, res) => {
  try {
    const leaderboard = demoDonors
      .map(donor => ({
        rank: 0, // Will be set below
        name: donor.name,
        donationCount: donor.donationCount,
        patientsHelped: donor.totalImpact.patientsHelped,
        id: donor.id
      }))
      .sort((a, b) => b.donationCount - a.donationCount)
      .map((entry, index) => ({
        ...entry,
        rank: index + 1
      }));

    res.json({
      success: true,
      data: leaderboard
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get leaderboard data'
    });
  }
});

// Blood banks endpoint
app.get('/api/demo/blood-banks', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: '1',
        name: 'Mumbai Blood Bank',
        location: 'Mumbai, Maharashtra',
        inventory: {
          'A_POSITIVE': 25,
          'A_NEGATIVE': 8,
          'B_POSITIVE': 18,
          'B_NEGATIVE': 5,
          'AB_POSITIVE': 12,
          'AB_NEGATIVE': 3,
          'O_POSITIVE': 35,
          'O_NEGATIVE': 10
        },
        contact: '+91-22-12345678'
      },
      {
        id: '2',
        name: 'Delhi Blood Center',
        location: 'Delhi, Delhi',
        inventory: {
          'A_POSITIVE': 30,
          'A_NEGATIVE': 12,
          'B_POSITIVE': 22,
          'B_NEGATIVE': 8,
          'AB_POSITIVE': 15,
          'AB_NEGATIVE': 6,
          'O_POSITIVE': 40,
          'O_NEGATIVE': 14
        },
        contact: '+91-11-12345678'
      }
    ]
  });
});

// ML Service integration endpoints
app.post('/api/predict/donor-availability', async (req, res) => {
  try {
    // In a real implementation, this would call the ML service
    // For demo, we'll simulate the response
    const { blood_type, urgency_level } = req.body;
    
    const mockResponse = {
      prediction_type: "donor_availability",
      result: {
        availability_score: 0.75,
        availability_category: "HIGH",
        confidence: 0.85,
        estimated_response_time: {
          estimated_hours: 12,
          min_hours: 6,
          max_hours: 24
        },
        recommendations: ["Contact regular donors", "Check nearby blood banks"]
      },
      confidence: 0.85,
      model_version: "1.0.0-demo"
    };
    
    res.json(mockResponse);
  } catch (error) {
    console.error('Donor availability prediction error:', error);
    res.status(500).json({ error: 'Prediction service unavailable' });
  }
});

app.post('/api/predict/compatibility', async (req, res) => {
  try {
    const { donor, patient } = req.body;
    
    const mockResponse = {
      prediction_type: "compatibility",
      result: {
        score: 0.92,
        compatible: true,
        confidence: 0.9,
        blood_compatibility: {
          compatible: true,
          donor_type: donor?.blood_type || 'O_POSITIVE',
          patient_type: patient?.blood_type || 'A_POSITIVE'
        },
        recommendations: ["Proceed with standard protocols"]
      },
      confidence: 0.9,
      model_version: "1.0.0-demo"
    };
    
    res.json(mockResponse);
  } catch (error) {
    console.error('Compatibility assessment error:', error);
    res.status(500).json({ error: 'Compatibility service unavailable' });
  }
});

// Statistics endpoint
app.get('/api/demo/statistics', (req, res) => {
  res.json({
    success: true,
    data: {
      totalPatients: 1247,
      activeDonors: 3892,
      successfulMatches: 2156,
      bloodBanks: 45,
      emergencyRequests: 23,
      monthlyDonations: 892,
      averageResponseTime: '4.2 hours',
      satisfactionRate: '94.8%'
    }
  });
});

// Donor authentication endpoint
app.post('/api/donor/login', (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    // Find matching credentials
    const credentials = donorCredentials.find(
      cred => cred.email === email && cred.password === password
    );

    if (!credentials) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    // Find donor data
    const donor = demoDonors.find(d => d.id === credentials.donorId);

    if (!donor) {
      return res.status(404).json({
        success: false,
        error: 'Donor not found'
      });
    }

    // Return donor data (excluding sensitive info)
    const donorData = {
      id: donor.id,
      name: donor.name,
      email: donor.email,
      bloodType: donor.bloodType,
      location: donor.location,
      phone: donor.phone
    };

    res.json({
      success: true,
      message: 'Login successful',
      data: donorData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Login failed'
    });
  }
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `The requested route ${req.originalUrl} does not exist.`
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: 'Something went wrong on the server.'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 HemoLink AI Backend Server running on port ${PORT}`);
  console.log(`📊 Health check available at http://localhost:${PORT}/health`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🩸 HemoLink AI - Empowering Thalassemia Care`);
  console.log(`📡 API Endpoints:`);
  console.log(`   GET    /health - Health check`);
  console.log(`   GET    /api/demo/patients - Demo patients data`);
  console.log(`   POST   /api/demo/patients - Add new patient`);
  console.log(`   DELETE /api/demo/patients/:id - Delete patient`);
  console.log(`   DELETE /api/demo/patients - Clear all patients`);
  console.log(`   GET    /api/demo/donors - Demo donors data`);
  console.log(`   POST   /api/demo/donors - Add new donor`);
  console.log(`   DELETE /api/demo/donors/:id - Delete donor`);
  console.log(`   DELETE /api/demo/donors - Clear all donors`);
  console.log(`   GET    /api/demo/blood-banks - Demo blood banks data`);
  console.log(`   GET    /api/demo/statistics - Demo statistics`);
  console.log(`   POST   /api/predict/donor-availability - Donor prediction`);
  console.log(`   POST   /api/predict/compatibility - Compatibility assessment`);
});

module.exports = app;
