import React from 'react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  AppBar,
  Toolbar,
  useTheme,
  alpha,
} from '@mui/material'
import {
  Favorite,
  Psychology,
  Security,
  Speed,
  People,
  Analytics,
  LocalHospital,
  Phone,
} from '@mui/icons-material'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'

const LandingPage: React.FC = () => {
  const theme = useTheme()
  const navigate = useNavigate()

  const features = [
    {
      icon: <Psychology color="primary" sx={{ fontSize: 48 }} />,
      title: 'AI-Powered Matching',
      description: 'Advanced machine learning algorithms match patients with compatible donors in real-time based on blood type, location, and availability patterns.',
    },
    {
      icon: <Speed color="primary" sx={{ fontSize: 48 }} />,
      title: 'Real-Time Notifications',
      description: 'Instant notifications and updates keep all parties informed about donation requests, scheduling, and emergency situations.',
    },
    {
      icon: <Security color="primary" sx={{ fontSize: 48 }} />,
      title: 'Secure & Private',
      description: 'HIPAA-compliant platform with end-to-end encryption ensures all medical data and communications remain secure and private.',
    },
    {
      icon: <Analytics color="primary" sx={{ fontSize: 48 }} />,
      title: 'Predictive Analytics',
      description: 'Predict donor availability and blood demand patterns to optimize donation scheduling and reduce waiting times.',
    },
    {
      icon: <People color="primary" sx={{ fontSize: 48 }} />,
      title: 'Community Network',
      description: 'Connect with a supportive community of patients, donors, and healthcare providers dedicated to fighting Thalassemia.',
    },
    {
      icon: <LocalHospital color="primary" sx={{ fontSize: 48 }} />,
      title: 'Healthcare Integration',
      description: 'Seamless integration with hospitals, blood banks, and healthcare providers for coordinated care management.',
    },
  ]

  const stats = [
    { number: '10,000+', label: 'Thalassemia Patients Helped' },
    { number: '25,000+', label: 'Registered Donors' },
    { number: '95%', label: 'Successful Match Rate' },
    { number: '24/7', label: 'Emergency Support' },
  ]

  return (
    <>
      <Helmet>
        <title>HemoLink AI - Empowering Thalassemia Care</title>
        <meta name="description" content="AI-powered platform connecting Thalassemia patients with compatible blood donors in real-time. Revolutionizing blood donation and care access through technology." />
      </Helmet>

      {/* Navigation */}
      <AppBar position="fixed" sx={{ bgcolor: 'white', boxShadow: 1 }}>
        <Toolbar>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <Favorite sx={{ color: 'primary.main', mr: 1 }} />
            <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
              HemoLink AI
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button color="primary" onClick={() => navigate('/login')}>
              Login
            </Button>
            <Button variant="contained" onClick={() => navigate('/register')}>
              Get Started
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Hero Section */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
          pt: 12,
          pb: 8,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <Typography
                  variant="h2"
                  component="h1"
                  gutterBottom
                  sx={{
                    fontWeight: 'bold',
                    background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  Empowering Thalassemia Care with AI
                </Typography>
                <Typography variant="h5" color="text.secondary" paragraph>
                  Connect patients with compatible blood donors in real-time using advanced AI matching, 
                  predictive analytics, and secure communication platform.
                </Typography>
                <Box sx={{ mt: 4, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => navigate('/register')}
                    sx={{ px: 4, py: 1.5 }}
                  >
                    Join as Patient
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={() => navigate('/register')}
                    sx={{ px: 4, py: 1.5 }}
                  >
                    Become a Donor
                  </Button>
                </Box>
              </motion.div>
            </Grid>
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <Box
                  sx={{
                    position: 'relative',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: -20,
                      left: -20,
                      right: 20,
                      bottom: 20,
                      background: `linear-gradient(45deg, ${alpha(theme.palette.primary.main, 0.2)}, ${alpha(theme.palette.secondary.main, 0.2)})`,
                      borderRadius: 4,
                      zIndex: -1,
                    },
                  }}
                >
                  <img
                    src="/hero-image.jpg"
                    alt="Healthcare professionals and patients"
                    style={{
                      width: '100%',
                      height: 'auto',
                      borderRadius: theme.shape.borderRadius,
                      boxShadow: theme.shadows[8],
                    }}
                  />
                </Box>
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Stats Section */}
      <Box sx={{ py: 8, bgcolor: 'primary.main', color: 'white' }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            {stats.map((stat, index) => (
              <Grid item xs={6} md={3} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Box textAlign="center">
                    <Typography variant="h3" component="div" fontWeight="bold">
                      {stat.number}
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 1 }}>
                      {stat.label}
                    </Typography>
                  </Box>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Box sx={{ py: 12 }}>
        <Container maxWidth="lg">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <Typography variant="h3" component="h2" textAlign="center" gutterBottom>
              Revolutionary Features
            </Typography>
            <Typography variant="h6" textAlign="center" color="text.secondary" paragraph sx={{ mb: 6 }}>
              Cutting-edge technology meets compassionate care
            </Typography>
          </motion.div>

          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} md={4} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card
                    sx={{
                      height: '100%',
                      transition: 'transform 0.3s ease-in-out',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: theme.shadows[8],
                      },
                    }}
                  >
                    <CardContent sx={{ p: 4, textAlign: 'center' }}>
                      <Box sx={{ mb: 2 }}>{feature.icon}</Box>
                      <Typography variant="h5" component="h3" gutterBottom>
                        {feature.title}
                      </Typography>
                      <Typography color="text.secondary">
                        {feature.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box
        sx={{
          py: 12,
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
          color: 'white',
        }}
      >
        <Container maxWidth="md">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <Box textAlign="center">
              <Typography variant="h3" component="h2" gutterBottom>
                Ready to Make a Difference?
              </Typography>
              <Typography variant="h6" paragraph sx={{ mb: 4 }}>
                Join thousands of patients, donors, and healthcare providers in the fight against Thalassemia
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  size="large"
                  sx={{
                    bgcolor: 'white',
                    color: 'primary.main',
                    px: 4,
                    py: 1.5,
                    '&:hover': {
                      bgcolor: alpha('white', 0.9),
                    },
                  }}
                  onClick={() => navigate('/register')}
                >
                  Get Started Today
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  sx={{
                    borderColor: 'white',
                    color: 'white',
                    px: 4,
                    py: 1.5,
                    '&:hover': {
                      borderColor: 'white',
                      bgcolor: alpha('white', 0.1),
                    },
                  }}
                  startIcon={<Phone />}
                >
                  Contact Support
                </Button>
              </Box>
            </Box>
          </motion.div>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ py: 6, bgcolor: 'grey.900', color: 'white' }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Favorite sx={{ mr: 1 }} />
                <Typography variant="h6" fontWeight="bold">
                  HemoLink AI
                </Typography>
              </Box>
              <Typography color="grey.400">
                Empowering Thalassemia care through AI-powered blood donation matching and healthcare coordination.
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                AI for Good Hackathon 2025
              </Typography>
              <Typography color="grey.400">
                Built with ❤️ for Blood Warriors, Microsoft, and SVP India
              </Typography>
            </Grid>
          </Grid>
          <Box sx={{ mt: 4, pt: 4, borderTop: 1, borderColor: 'grey.800', textAlign: 'center' }}>
            <Typography color="grey.400">
              © 2025 HemoLink AI. Built for the AI for Good Hackathon.
            </Typography>
          </Box>
        </Container>
      </Box>
    </>
  )
}

export default LandingPage
