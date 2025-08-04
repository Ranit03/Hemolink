import React, { useState, useEffect } from 'react'
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  LinearProgress,
  Alert,
  IconButton,
  Tooltip,
} from '@mui/material'
import {
  Add,
  Bloodtype,
  Schedule,
  LocalHospital,
  Notifications,
  TrendingUp,
  Warning,
  CheckCircle,
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { format, addDays, differenceInDays } from 'date-fns'

import { useAuth } from '@/contexts/AuthContext'
import DashboardCard from '@/components/dashboard/DashboardCard'
import RecentActivity from '@/components/dashboard/RecentActivity'
import UpcomingAppointments from '@/components/dashboard/UpcomingAppointments'
import HealthMetrics from '@/components/dashboard/HealthMetrics'
import QuickActions from '@/components/dashboard/QuickActions'

const PatientDashboard: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [healthData, setHealthData] = useState({
    currentHemoglobin: 8.5,
    targetHemoglobin: 10.0,
    lastTransfusion: '2024-01-15',
    nextTransfusion: '2024-02-15',
    transfusionFrequency: 28, // days
  })

  const patientProfile = user?.patientProfile

  // Calculate days until next transfusion
  const daysUntilNext = patientProfile?.nextTransfusion 
    ? differenceInDays(new Date(patientProfile.nextTransfusion), new Date())
    : null

  // Determine urgency level
  const getUrgencyLevel = () => {
    if (!daysUntilNext) return 'medium'
    if (daysUntilNext <= 3) return 'high'
    if (daysUntilNext <= 7) return 'medium'
    return 'low'
  }

  const urgencyLevel = getUrgencyLevel()

  const quickActions = [
    {
      title: 'Request Blood',
      description: 'Create a new blood donation request',
      icon: <Add />,
      color: 'primary',
      action: () => navigate('/donations/create'),
    },
    {
      title: 'Find Donors',
      description: 'Search for compatible donors nearby',
      icon: <Bloodtype />,
      color: 'secondary',
      action: () => navigate('/matching'),
    },
    {
      title: 'Schedule Appointment',
      description: 'Book your next transfusion',
      icon: <Schedule />,
      color: 'info',
      action: () => navigate('/appointments/create'),
    },
    {
      title: 'Health Records',
      description: 'View and manage your health data',
      icon: <LocalHospital />,
      color: 'success',
      action: () => navigate('/health'),
    },
  ]

  const recentActivities = [
    {
      id: '1',
      type: 'donation_request',
      title: 'Blood donation request created',
      description: 'Request for 2 units of A+ blood',
      timestamp: '2024-01-20T10:30:00Z',
      status: 'pending',
    },
    {
      id: '2',
      type: 'donor_match',
      title: 'Compatible donor found',
      description: 'John D. matched for your request',
      timestamp: '2024-01-20T14:15:00Z',
      status: 'success',
    },
    {
      id: '3',
      type: 'appointment',
      title: 'Transfusion scheduled',
      description: 'Appointment booked for Jan 25, 2024',
      timestamp: '2024-01-20T16:45:00Z',
      status: 'scheduled',
    },
  ]

  const upcomingAppointments = [
    {
      id: '1',
      title: 'Blood Transfusion',
      date: '2024-01-25T09:00:00Z',
      location: 'City General Hospital',
      type: 'transfusion',
      status: 'confirmed',
    },
    {
      id: '2',
      title: 'Hematologist Consultation',
      date: '2024-01-30T14:30:00Z',
      location: 'Dr. Smith\'s Clinic',
      type: 'consultation',
      status: 'pending',
    },
  ]

  return (
    <Box sx={{ p: 3 }}>
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom>
            Welcome back, {user?.firstName}!
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Here's your health overview and recent activity
          </Typography>
        </Box>
      </motion.div>

      {/* Urgent Alerts */}
      {urgencyLevel === 'high' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Alert 
            severity="error" 
            sx={{ mb: 3 }}
            action={
              <Button color="inherit" size="small" onClick={() => navigate('/donations/create')}>
                Request Now
              </Button>
            }
          >
            <Typography variant="subtitle2">
              Urgent: Your next transfusion is due in {daysUntilNext} days
            </Typography>
          </Alert>
        </motion.div>
      )}

      {urgencyLevel === 'medium' && daysUntilNext && daysUntilNext <= 7 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Alert 
            severity="warning" 
            sx={{ mb: 3 }}
            action={
              <Button color="inherit" size="small" onClick={() => navigate('/donations/create')}>
                Plan Ahead
              </Button>
            }
          >
            <Typography variant="subtitle2">
              Reminder: Your next transfusion is scheduled in {daysUntilNext} days
            </Typography>
          </Alert>
        </motion.div>
      )}

      <Grid container spacing={3}>
        {/* Key Metrics */}
        <Grid item xs={12} md={8}>
          <Grid container spacing={3}>
            {/* Hemoglobin Level */}
            <Grid item xs={12} sm={6}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <DashboardCard
                  title="Current Hemoglobin"
                  value={`${patientProfile?.currentHemoglobin || healthData.currentHemoglobin} g/dL`}
                  icon={<Bloodtype color="primary" />}
                  trend={healthData.currentHemoglobin >= healthData.targetHemoglobin ? 'up' : 'down'}
                  subtitle={`Target: ${healthData.targetHemoglobin} g/dL`}
                  color={healthData.currentHemoglobin >= healthData.targetHemoglobin ? 'success' : 'warning'}
                >
                  <LinearProgress
                    variant="determinate"
                    value={(healthData.currentHemoglobin / healthData.targetHemoglobin) * 100}
                    sx={{ mt: 1 }}
                    color={healthData.currentHemoglobin >= healthData.targetHemoglobin ? 'success' : 'warning'}
                  />
                </DashboardCard>
              </motion.div>
            </Grid>

            {/* Next Transfusion */}
            <Grid item xs={12} sm={6}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <DashboardCard
                  title="Next Transfusion"
                  value={daysUntilNext ? `${daysUntilNext} days` : 'Not scheduled'}
                  icon={<Schedule color="info" />}
                  subtitle={
                    patientProfile?.nextTransfusion 
                      ? format(new Date(patientProfile.nextTransfusion), 'MMM dd, yyyy')
                      : 'Schedule needed'
                  }
                  color={urgencyLevel === 'high' ? 'error' : urgencyLevel === 'medium' ? 'warning' : 'info'}
                />
              </motion.div>
            </Grid>

            {/* Blood Type */}
            <Grid item xs={12} sm={6}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <DashboardCard
                  title="Blood Type"
                  value={patientProfile?.bloodType?.replace('_', ' ') || 'Not specified'}
                  icon={<Bloodtype color="secondary" />}
                  subtitle={`Thalassemia: ${patientProfile?.thalassemiaType || 'Beta'}`}
                  color="secondary"
                />
              </motion.div>
            </Grid>

            {/* Transfusion Frequency */}
            <Grid item xs={12} sm={6}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <DashboardCard
                  title="Transfusion Frequency"
                  value={`Every ${patientProfile?.transfusionFrequency || healthData.transfusionFrequency} days`}
                  icon={<TrendingUp color="success" />}
                  subtitle="Regular schedule"
                  color="success"
                />
              </motion.div>
            </Grid>
          </Grid>

          {/* Health Metrics Chart */}
          <Grid item xs={12} sx={{ mt: 3 }}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <HealthMetrics />
            </motion.div>
          </Grid>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <QuickActions actions={quickActions} />
          </motion.div>

          {/* Upcoming Appointments */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Box sx={{ mt: 3 }}>
              <UpcomingAppointments appointments={upcomingAppointments} />
            </Box>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Box sx={{ mt: 3 }}>
              <RecentActivity activities={recentActivities} />
            </Box>
          </motion.div>
        </Grid>
      </Grid>
    </Box>
  )
}

export default PatientDashboard
