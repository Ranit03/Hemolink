# HemoLink AI – Empowering Thalassemia Care

## 🩸 Project Overview

HemoLink AI is a smart AI-powered platform designed to connect Thalassemia patients with compatible blood donors in real time. The system uses machine learning to predict donor availability, assess compatibility, and facilitate secure communication between patients, doctors, and donors.

**🏆 Built for the AI for Good Hackathon 2025 - Supporting Blood Warriors' mission to eliminate Thalassemia in India by 2035**

## 🚀 Features

- **🤖 AI-Powered Donor Matching**: Smart algorithms to find the best donor-patient matches
- **📊 Predictive Analytics**: ML models to forecast blood availability and demand
- **💬 Real-time Communication**: Secure messaging between patients, donors, and healthcare providers
- **⚠️ Risk Assessment**: AI-driven risk evaluation for donations and transfusions
- **🏥 Healthcare Integration**: Seamless integration with existing healthcare systems
- **📱 Mobile-Responsive**: Works on all devices and screen sizes
- **🔒 Privacy-First**: Secure handling of sensitive medical data

## 🏗️ Architecture

### Frontend (React + TypeScript)
- Modern React application with TypeScript
- Responsive design with custom styling
- Real-time data visualization
- Interactive user interface
- Multiple pages: Home, Dashboard, AI Predictions

### Backend (Node.js + Express)
- RESTful API server
- CORS-enabled for cross-origin requests
- Demo data endpoints
- ML service integration
- Health monitoring

### ML Services (Python HTTP Server)
- Machine learning prediction endpoints
- Real-time inference capabilities
- Multiple AI models:
  - Donor Availability Prediction
  - Blood Demand Forecasting
  - Compatibility Assessment
  - Risk Analysis

## 🛠️ Technology Stack

### Frontend
- **React 18** - Modern UI framework
- **TypeScript** - Type-safe JavaScript
- **React Router** - Client-side routing
- **Custom CSS** - Responsive styling

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment configuration

### ML Services
- **Python 3.x** - Programming language
- **HTTP Server** - Built-in Python server
- **JSON API** - RESTful endpoints
- **Demo ML Models** - Simulated AI predictions

### Development Tools
- **npm** - Package management
- **Git** - Version control
- **VS Code** - Development environment

## 📦 Installation & Setup

### Prerequisites
- **Node.js** (v16 or higher) ✅
- **Python 3.8+** ✅
- **npm** or **yarn** ✅

### 🚀 Quick Start (3 Simple Steps)

#### 1. Clone & Install
```bash
git clone <repository-url>
cd Aiforgood

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install

# Install ml-services dependencies
cd ../ml-services && pip install -r requirements.txt
```
```

#### 2. Start All Services
```bash
# Terminal 1: Start Backend
cd backend && npm run dev

# Terminal 2: Start Frontend  
cd frontend && npm run dev

# Terminal 3: Start ML Services
cd ml-services && python app.py
```

#### 3. Access the Application
- **Frontend**: http://localhost:3000 🌐
- **Backend API**: http://localhost:5000 🔧
- **ML Services**: http://localhost:8001 🤖

## 🎯 Usage Guide

### 🏠 Home Page
- Welcome screen with project overview
- Navigation to different sections
- Feature highlights

### 📊 Dashboard
- **Real-time Statistics**: Patient count, donor availability, success rates
- **Patient Management**: View current patients needing transfusions
- **Donor Network**: Monitor available donors and their status
- **Live Data**: Connected to backend APIs for real-time updates

### 🤖 AI Predictions
- **Interactive Interface**: Select blood type and urgency level
- **Real-time Predictions**: Get AI-powered donor availability forecasts
- **Detailed Results**: Availability scores, response times, recommendations
- **Model Transparency**: View confidence scores and model versions

## 📊 API Documentation

### Backend API (Port 5000)
```bash
# Health Check
GET /health

# Demo Data Endpoints
GET /api/demo/patients        # Thalassemia patients data
GET /api/demo/donors          # Available blood donors
GET /api/demo/blood-banks     # Blood bank inventory
GET /api/demo/statistics      # System-wide statistics

# ML Integration
POST /api/predict/donor-availability
POST /api/predict/compatibility
```

### ML Services API (Port 8001)
```bash
# Health Check
GET /health

# AI Prediction Endpoints
POST /predict/donor-availability    # Predict donor availability
POST /predict/demand-forecast       # Forecast blood demand
POST /predict/compatibility         # Assess donor-patient compatibility
POST /predict/risk-assessment       # Evaluate medical risks

# Model Management
POST /models/train/{model_name}     # Train ML models
GET /models/{model_name}/metrics    # Get model performance
```

## 🧪 Testing & Validation

### ✅ Test Backend Services
```bash
# Health check
curl http://localhost:5000/health

# Get demo patients
curl http://localhost:5000/api/demo/patients

# Get system statistics
curl http://localhost:5000/api/demo/statistics
```

### ✅ Test ML Services
```bash
# Health check
curl http://localhost:8001/health

# Test donor prediction
curl -X POST http://localhost:8001/predict/donor-availability \
  -H "Content-Type: application/json" \
  -d '{"blood_type": "A_POSITIVE", "urgency_level": 3}'

# Test compatibility assessment
curl -X POST http://localhost:8001/predict/compatibility \
  -H "Content-Type: application/json" \
  -d '{
    "donor": {"blood_type": "O_NEGATIVE", "age": 30},
    "patient": {"blood_type": "A_POSITIVE", "age": 25}
  }'
```

## 🎨 Demo Features

### 🌟 Current Implementation
1. **📱 Interactive Dashboard**: Real-time statistics and data visualization
2. **🤖 AI Predictions Interface**: User-friendly ML prediction interface  
3. **📊 Demo Data**: Realistic sample data for patients, donors, and blood banks
4. **📱 Responsive Design**: Optimized for desktop and mobile devices
5. **🔗 Live API Integration**: Real-time connection between all services
6. **⚡ Fast Performance**: Optimized for quick response times
7. **🎯 User-Friendly**: Intuitive interface for healthcare professionals

### 🎭 Sample Data Includes
- **👥 Patients**: John Doe, Priya Sharma, Rajesh Kumar with realistic medical data
- **🩸 Donors**: Jane Smith, Amit Patel, Sunita Reddy with donation history
- **🏥 Blood Banks**: Mumbai Blood Bank, Delhi Blood Center with inventory
- **📈 Statistics**: 1,247 patients, 3,892 donors, 94.8% satisfaction rate

## 🔮 Future Roadmap

### Phase 1: Core Enhancements
- **🗄️ Database Integration**: PostgreSQL for data persistence
- **🔐 Authentication System**: Secure user login and role management
- **📧 Notification System**: Email/SMS alerts for urgent requests
- **🗺️ Geolocation**: GPS-based donor matching

### Phase 2: Advanced Features  
- **📱 Mobile App**: React Native application
- **🧠 Advanced ML**: Deep learning models for better predictions
- **🔗 e-RaktKosh Integration**: Government blood bank system
- **💳 Payment System**: Donation incentives and rewards

### Phase 3: Scale & Impact
- **☁️ Cloud Deployment**: Azure/AWS production deployment
- **📊 Analytics Dashboard**: Advanced reporting and insights
- **🌐 Multi-language**: Support for regional languages
- **🤝 Hospital Partnerships**: Direct integration with healthcare systems

## 🏆 Hackathon Submission

### 🎯 Problem Addressed
- **Challenge**: Thalassemia patients struggle to find compatible blood donors
- **Solution**: AI-powered platform for real-time donor matching
- **Impact**: Faster response times, better compatibility, improved patient outcomes

### 💡 Innovation Highlights
- **AI-First Approach**: Machine learning at the core of the solution
- **Real-time Processing**: Instant predictions and matching
- **User-Centric Design**: Built for healthcare professionals and patients
- **Scalable Architecture**: Ready for production deployment

### 📈 Potential Impact
- **🎯 Target**: Support Blood Warriors' mission to eliminate Thalassemia by 2035
- **📊 Scale**: Serve thousands of patients across India
- **⏱️ Efficiency**: Reduce donor search time from days to hours
- **💝 Lives Saved**: Enable timely transfusions for critical patients

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

1. **🍴 Fork** the repository
2. **🌿 Create** a feature branch (`git checkout -b feature/AmazingFeature`)
3. **💾 Commit** your changes (`git commit -m 'Add some AmazingFeature'`)
4. **📤 Push** to the branch (`git push origin feature/AmazingFeature`)
5. **🔄 Open** a Pull Request

### 🎯 Areas for Contribution
- **🤖 ML Models**: Improve prediction accuracy
- **🎨 UI/UX**: Enhance user interface design
- **🔧 Backend**: Add new API endpoints
- **📱 Mobile**: React Native app development
- **📚 Documentation**: Improve guides and tutorials

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **🩸 Blood Warriors**: For their inspiring mission to eliminate Thalassemia in India
- **🏆 AI for Good Hackathon 2025**: For providing the platform to develop this solution
- **☁️ Microsoft Azure**: For cloud computing resources and support
- **🤝 SVP India**: For mentorship and guidance
- **💻 Open Source Community**: For the amazing tools and libraries that made this possible

## 📞 Contact & Support

For questions, suggestions, or collaboration opportunities:

- **📧 Email**: [Your Email Address]
- **🐛 Issues**: [GitHub Issues URL]
- **💬 Discussions**: [GitHub Discussions URL]
- **🐦 Twitter**: [Your Twitter Handle]

---

<div align="center">

**🩸 HemoLink AI - Empowering Thalassemia Care Through Artificial Intelligence 🤖**

*Built with ❤️ for the AI for Good Hackathon 2025*

**🌟 Star this repo if you found it helpful! 🌟**

</div>
