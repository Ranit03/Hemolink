import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Heart,
  Award,
  Users,
  Calendar,
  TrendingUp,
  Star,
  Trophy,
  Target,
  Clock,
  MapPin,
  Phone,
  Mail,
  Edit,
  Gift,
  Zap,
  Crown,
  Medal,
  Flame,
  LogOut
} from 'lucide-react'
import { useDonorAuth } from '../contexts/DonorAuthContext'

interface Donor {
  id: string
  name: string
  bloodType: string
  available: boolean
  lastDonation: string
  donationCount: number
  location: string
  phone: string
  email?: string
  joinDate?: string
  totalImpact?: {
    patientsHelped: number
    livesSaved: number
    donationStreak: number
    totalUnits: number
  }
  achievements?: Achievement[]
  nextEligibleDate?: string
}

interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  unlockedDate: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
}

interface LeaderboardEntry {
  rank: number
  name: string
  donationCount: number
  patientsHelped: number
  isCurrentUser?: boolean
}

const DonorDashboard: React.FC = () => {
  const { donor: authDonor, logout } = useDonorAuth()
  const [currentDonor, setCurrentDonor] = useState<Donor | null>(null)
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'impact' | 'achievements' | 'leaderboard'>('overview')

  // Fetch donor data from API
  useEffect(() => {
    const fetchDonorData = async () => {
      if (!authDonor) return

      try {
        // Fetch donor dashboard data using authenticated donor's ID
        const donorResponse = await fetch(`http://localhost:5000/api/demo/donors/${authDonor.id}/dashboard`)
        const donorData = await donorResponse.json()

        // Fetch leaderboard data
        const leaderboardResponse = await fetch('http://localhost:5000/api/demo/leaderboard')
        const leaderboardData = await leaderboardResponse.json()

        if (donorData.success && leaderboardData.success) {
          setCurrentDonor(donorData.data)

          // Mark current user in leaderboard
          const leaderboardWithCurrentUser = leaderboardData.data.map((entry: any) => ({
            ...entry,
            isCurrentUser: entry.id === authDonor.id
          }))

          setLeaderboard(leaderboardWithCurrentUser)
        }
      } catch (error) {
        console.error('Error fetching donor data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDonorData()
  }, [authDonor])

  const handleLogout = () => {
    logout()
    window.location.href = '/demo'
  }

  if (loading) {
    return (
      <div className="min-h-screen pt-20 md:pt-24 gradient-bg flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your donor dashboard...</p>
        </div>
      </div>
    )
  }

  if (!currentDonor) {
    return (
      <div className="min-h-screen pt-20 md:pt-24 gradient-bg flex items-center justify-center">
        <div className="text-center">
          <Heart className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Donor Not Found</h2>
          <p className="text-gray-600">Please check your login credentials.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-20 md:pt-24 gradient-bg">
      <div className="max-container container-padding section-padding">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center space-x-2 bg-red-50 text-red-700 px-4 py-2 rounded-full text-sm font-medium mb-6"
          >
            <Heart className="w-4 h-4" />
            <span>Donor Dashboard</span>
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl font-bold text-secondary-900 mb-6"
          >
            Welcome back,
            <span className="block text-gradient">{currentDonor.name}!</span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-secondary-600 leading-relaxed max-w-2xl mx-auto mb-6"
          >
            Your generosity has made a real difference. Here's your impact story.
          </motion.p>

          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            onClick={handleLogout}
            className="inline-flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </motion.button>
        </div>

        {/* Navigation Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex justify-center mb-8"
        >
          <div className="bg-white rounded-lg p-1 shadow-sm border border-gray-200">
            {[
              { id: 'overview', label: 'Overview', icon: Users },
              { id: 'impact', label: 'Impact', icon: TrendingUp },
              { id: 'achievements', label: 'Achievements', icon: Award },
              { id: 'leaderboard', label: 'Leaderboard', icon: Trophy }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-6 py-3 rounded-md font-medium transition-all duration-200 flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'overview' && <OverviewTab donor={currentDonor} />}
          {activeTab === 'impact' && <ImpactTab donor={currentDonor} />}
          {activeTab === 'achievements' && <AchievementsTab donor={currentDonor} />}
          {activeTab === 'leaderboard' && <LeaderboardTab leaderboard={leaderboard} />}
        </motion.div>
      </div>
    </div>
  )
}

// Overview Tab Component
const OverviewTab: React.FC<{ donor: Donor }> = ({ donor }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Profile Card */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
              {donor.name.split(' ').map(n => n[0]).join('')}
            </div>
            <h3 className="text-xl font-bold text-gray-900">{donor.name}</h3>
            <p className="text-gray-600">{donor.bloodType.replace('_', '')} Donor</p>
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mt-2 ${
              donor.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              <div className={`w-2 h-2 rounded-full mr-2 ${
                donor.available ? 'bg-green-500' : 'bg-red-500'
              }`} />
              {donor.available ? 'Available' : 'Not Available'}
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-3 text-gray-600">
              <MapPin className="w-4 h-4" />
              <span className="text-sm">{donor.location}</span>
            </div>
            <div className="flex items-center space-x-3 text-gray-600">
              <Phone className="w-4 h-4" />
              <span className="text-sm">{donor.phone}</span>
            </div>
            <div className="flex items-center space-x-3 text-gray-600">
              <Mail className="w-4 h-4" />
              <span className="text-sm">{donor.email}</span>
            </div>
            <div className="flex items-center space-x-3 text-gray-600">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">Joined {donor.joinDate}</span>
            </div>
          </div>
          
          <button className="w-full mt-6 btn btn-secondary btn-md">
            <Edit className="w-4 h-4 mr-2" />
            Edit Profile
          </button>
        </div>
      </div>

      {/* Stats and Quick Actions */}
      <div className="lg:col-span-2 space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            icon={<Heart className="w-6 h-6" />}
            title="Total Donations"
            value={donor.donationCount.toString()}
            color="from-red-500 to-red-600"
          />
          <StatCard
            icon={<Users className="w-6 h-6" />}
            title="Patients Helped"
            value={donor.totalImpact?.patientsHelped.toString() || '0'}
            color="from-blue-500 to-blue-600"
          />
          <StatCard
            icon={<Flame className="w-6 h-6" />}
            title="Current Streak"
            value={donor.totalImpact?.donationStreak.toString() || '0'}
            color="from-orange-500 to-orange-600"
          />
          <StatCard
            icon={<Star className="w-6 h-6" />}
            title="Lives Saved"
            value={donor.totalImpact?.livesSaved.toString() || '0'}
            color="from-yellow-500 to-yellow-600"
          />
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            <ActivityItem
              icon={<Heart className="w-4 h-4 text-red-500" />}
              title="Blood Donation Completed"
              description="Helped patient John Doe with A+ blood transfusion"
              date="Jan 1, 2024"
            />
            <ActivityItem
              icon={<Award className="w-4 h-4 text-yellow-500" />}
              title="Achievement Unlocked"
              description="Earned 'Guardian Angel' badge for helping 25+ patients"
              date="Jan 1, 2024"
            />
            <ActivityItem
              icon={<Calendar className="w-4 h-4 text-blue-500" />}
              title="Next Donation Eligible"
              description="You can donate again starting April 1, 2024"
              date="Upcoming"
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button className="btn btn-primary btn-md">
              <Calendar className="w-4 h-4 mr-2" />
              Schedule Donation
            </button>
            <button className="btn btn-secondary btn-md">
              <Users className="w-4 h-4 mr-2" />
              Find Patients in Need
            </button>
            <button className="btn btn-accent btn-md">
              <Gift className="w-4 h-4 mr-2" />
              Refer a Friend
            </button>
            <button className="btn btn-secondary btn-md">
              <TrendingUp className="w-4 h-4 mr-2" />
              View Full Impact
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Stat Card Component
const StatCard: React.FC<{
  icon: React.ReactNode
  title: string
  value: string
  color: string
}> = ({ icon, title, value, color }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <div className={`w-12 h-12 bg-gradient-to-r ${color} rounded-lg flex items-center justify-center text-white mb-3`}>
        {icon}
      </div>
      <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
      <div className="text-sm text-gray-600">{title}</div>
    </div>
  )
}

// Activity Item Component
const ActivityItem: React.FC<{
  icon: React.ReactNode
  title: string
  description: string
  date: string
}> = ({ icon, title, description, date }) => {
  return (
    <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
      <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900">{title}</p>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
      <div className="text-xs text-gray-400">{date}</div>
    </div>
  )
}

// Impact Tab Component
const ImpactTab: React.FC<{ donor: Donor }> = ({ donor }) => {
  const impact = donor.totalImpact!

  return (
    <div className="space-y-8">
      {/* Impact Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ImpactCard
          icon={<Users className="w-8 h-8" />}
          title="Patients Helped"
          value={impact.patientsHelped}
          subtitle="Lives touched by your generosity"
          color="from-blue-500 to-blue-600"
          trend="+3 this month"
        />
        <ImpactCard
          icon={<Heart className="w-8 h-8" />}
          title="Lives Saved"
          value={impact.livesSaved}
          subtitle="Critical situations resolved"
          color="from-red-500 to-red-600"
          trend="+1 this month"
        />
        <ImpactCard
          icon={<Zap className="w-8 h-8" />}
          title="Blood Units"
          value={impact.totalUnits}
          subtitle="Total units donated"
          color="from-purple-500 to-purple-600"
          trend="+2 this month"
        />
        <ImpactCard
          icon={<Flame className="w-8 h-8" />}
          title="Donation Streak"
          value={impact.donationStreak}
          subtitle="Consecutive donations"
          color="from-orange-500 to-orange-600"
          trend="Current streak"
        />
      </div>

      {/* Impact Stories */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Your Impact Stories</h3>
        <div className="space-y-6">
          <ImpactStory
            patientName="John D."
            bloodType="A+"
            story="Your donation helped John during his emergency transfusion. He's now recovering well and back with his family."
            date="Jan 1, 2024"
            outcome="Full Recovery"
          />
          <ImpactStory
            patientName="Priya S."
            bloodType="A+"
            story="Thanks to your regular donations, Priya was able to maintain her treatment schedule without delays."
            date="Dec 15, 2023"
            outcome="Treatment Continued"
          />
          <ImpactStory
            patientName="Rajesh K."
            bloodType="A+"
            story="Your blood donation was crucial during Rajesh's surgery. The operation was successful."
            date="Nov 20, 2023"
            outcome="Surgery Success"
          />
        </div>
      </div>

      {/* Monthly Impact Chart */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Monthly Impact Trend</h3>
        <div className="h-64 flex items-end justify-between space-x-2">
          {[
            { month: 'Aug', patients: 2, donations: 1 },
            { month: 'Sep', patients: 3, donations: 1 },
            { month: 'Oct', patients: 4, donations: 2 },
            { month: 'Nov', patients: 5, donations: 2 },
            { month: 'Dec', patients: 6, donations: 2 },
            { month: 'Jan', patients: 8, donations: 3 }
          ].map((data, index) => (
            <div key={data.month} className="flex-1 flex flex-col items-center">
              <div className="w-full max-w-12 space-y-1">
                <div
                  className="bg-blue-500 rounded-t"
                  style={{ height: `${(data.patients / 8) * 200}px` }}
                />
                <div
                  className="bg-red-500 rounded-b"
                  style={{ height: `${(data.donations / 3) * 100}px` }}
                />
              </div>
              <span className="text-xs text-gray-600 mt-2">{data.month}</span>
            </div>
          ))}
        </div>
        <div className="flex justify-center space-x-6 mt-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span className="text-sm text-gray-600">Patients Helped</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span className="text-sm text-gray-600">Donations Made</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// Achievements Tab Component
const AchievementsTab: React.FC<{ donor: Donor }> = ({ donor }) => {
  const achievements = donor.achievements || []
  const unlockedCount = achievements.length
  const totalAchievements = 12 // Total possible achievements

  return (
    <div className="space-y-8">
      {/* Achievement Progress */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">Achievement Progress</h3>
          <div className="text-sm text-gray-600">
            {unlockedCount} of {totalAchievements} unlocked
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
          <div
            className="bg-gradient-to-r from-yellow-400 to-yellow-600 h-3 rounded-full transition-all duration-500"
            style={{ width: `${(unlockedCount / totalAchievements) * 100}%` }}
          />
        </div>
        <p className="text-gray-600">
          Keep donating to unlock more achievements and earn exclusive badges!
        </p>
      </div>

      {/* Unlocked Achievements */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Unlocked Achievements</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {achievements.map((achievement) => (
            <AchievementCard key={achievement.id} achievement={achievement} />
          ))}
        </div>
      </div>

      {/* Locked Achievements */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Upcoming Achievements</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <LockedAchievementCard
            title="Century Club"
            description="Complete 100 donations"
            progress={donor.donationCount}
            target={100}
            icon="🏆"
          />
          <LockedAchievementCard
            title="Hero Status"
            description="Help 50 patients"
            progress={donor.totalImpact?.patientsHelped || 0}
            target={50}
            icon="🦸"
          />
          <LockedAchievementCard
            title="Streak Legend"
            description="Maintain 10+ donation streak"
            progress={donor.totalImpact?.donationStreak || 0}
            target={10}
            icon="⚡"
          />
          <LockedAchievementCard
            title="Community Champion"
            description="Refer 5 new donors"
            progress={0}
            target={5}
            icon="🌟"
          />
        </div>
      </div>
    </div>
  )
}

// Leaderboard Tab Component
const LeaderboardTab: React.FC<{ leaderboard: LeaderboardEntry[] }> = ({ leaderboard }) => {
  return (
    <div className="space-y-8">
      {/* Leaderboard Header */}
      <div className="text-center">
        <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Donor Leaderboard</h2>
        <p className="text-gray-600">Celebrating our top donors and their incredible impact</p>
      </div>

      {/* Top 3 Podium */}
      <div className="flex justify-center items-end space-x-4 mb-8">
        {leaderboard.slice(0, 3).map((entry, index) => (
          <PodiumCard
            key={entry.rank}
            entry={entry}
            position={index + 1}
          />
        ))}
      </div>

      {/* Full Leaderboard */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-xl font-bold text-gray-900">All Donors</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {leaderboard.map((entry) => (
            <LeaderboardRow key={entry.rank} entry={entry} />
          ))}
        </div>
      </div>

      {/* Monthly Challenge */}
      <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold mb-2">Monthly Challenge</h3>
            <p className="text-purple-100">Help 5 patients this month to earn the "Monthly Hero" badge</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">3/5</div>
            <div className="text-purple-200 text-sm">Patients Helped</div>
          </div>
        </div>
        <div className="w-full bg-purple-400 rounded-full h-2 mt-4">
          <div className="bg-white h-2 rounded-full" style={{ width: '60%' }} />
        </div>
      </div>
    </div>
  )
}


// Impact Card Component
const ImpactCard: React.FC<{
  icon: React.ReactNode
  title: string
  value: number
  subtitle: string
  color: string
  trend: string
}> = ({ icon, title, value, subtitle, color, trend }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
      <div className={`w-16 h-16 bg-gradient-to-r ${color} rounded-lg flex items-center justify-center text-white mb-4`}>
        {icon}
      </div>
      <div className="text-3xl font-bold text-gray-900 mb-2">{value}</div>
      <div className="text-lg font-semibold text-gray-900 mb-1">{title}</div>
      <div className="text-sm text-gray-600 mb-2">{subtitle}</div>
      <div className="text-xs text-green-600 font-medium">{trend}</div>
    </div>
  )
}

// Impact Story Component
const ImpactStory: React.FC<{
  patientName: string
  bloodType: string
  story: string
  date: string
  outcome: string
}> = ({ patientName, bloodType, story, date, outcome }) => {
  return (
    <div className="border-l-4 border-red-500 pl-4 py-2">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <h4 className="font-semibold text-gray-900">{patientName}</h4>
          <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">{bloodType}</span>
        </div>
        <span className="text-xs text-gray-500">{date}</span>
      </div>
      <p className="text-gray-600 text-sm mb-2">{story}</p>
      <div className="flex items-center space-x-2">
        <span className="text-xs font-medium text-green-600">✓ {outcome}</span>
      </div>
    </div>
  )
}



// Achievement Card Component
const AchievementCard: React.FC<{ achievement: Achievement }> = ({ achievement }) => {
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'from-gray-400 to-gray-500'
      case 'rare': return 'from-blue-400 to-blue-500'
      case 'epic': return 'from-purple-400 to-purple-500'
      case 'legendary': return 'from-yellow-400 to-yellow-500'
      default: return 'from-gray-400 to-gray-500'
    }
  }

  return (
    <div className={`bg-gradient-to-r ${getRarityColor(achievement.rarity)} p-4 rounded-xl text-white`}>
      <div className="flex items-center space-x-3 mb-3">
        <span className="text-2xl">{achievement.icon}</span>
        <div>
          <h4 className="font-bold">{achievement.title}</h4>
          <p className="text-sm opacity-90">{achievement.description}</p>
        </div>
      </div>
      <div className="text-xs opacity-75">Unlocked {achievement.unlockedDate}</div>
    </div>
  )
}

// Locked Achievement Card Component
const LockedAchievementCard: React.FC<{
  title: string
  description: string
  progress: number
  target: number
  icon: string
}> = ({ title, description, progress, target, icon }) => {
  const progressPercentage = Math.min((progress / target) * 100, 100)

  return (
    <div className="bg-gray-100 p-4 rounded-xl border-2 border-dashed border-gray-300">
      <div className="flex items-center space-x-3 mb-3">
        <span className="text-2xl grayscale">{icon}</span>
        <div>
          <h4 className="font-bold text-gray-700">{title}</h4>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-gray-600">
          <span>Progress</span>
          <span>{progress}/{target}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>
    </div>
  )
}



// Podium Card Component
const PodiumCard: React.FC<{ entry: LeaderboardEntry; position: number }> = ({ entry, position }) => {
  const getPositionStyle = (pos: number) => {
    switch (pos) {
      case 1: return { height: '120px', bg: 'from-yellow-400 to-yellow-500', icon: '🥇' }
      case 2: return { height: '100px', bg: 'from-gray-400 to-gray-500', icon: '🥈' }
      case 3: return { height: '80px', bg: 'from-orange-400 to-orange-500', icon: '🥉' }
      default: return { height: '60px', bg: 'from-gray-300 to-gray-400', icon: '🏅' }
    }
  }

  const style = getPositionStyle(position)

  return (
    <div className="text-center">
      <div
        className={`bg-gradient-to-t ${style.bg} rounded-t-lg p-4 text-white flex flex-col justify-end`}
        style={{ height: style.height, width: '120px' }}
      >
        <div className="text-2xl mb-2">{style.icon}</div>
        <div className="font-bold text-sm">{entry.name}</div>
        <div className="text-xs opacity-90">{entry.donationCount} donations</div>
      </div>
      <div className="bg-gray-200 p-2 rounded-b-lg">
        <div className="text-xs text-gray-600">{entry.patientsHelped} patients helped</div>
      </div>
    </div>
  )
}

// Leaderboard Row Component
const LeaderboardRow: React.FC<{ entry: LeaderboardEntry }> = ({ entry }) => {
  return (
    <div className={`p-4 flex items-center justify-between ${entry.isCurrentUser ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''}`}>
      <div className="flex items-center space-x-4">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
          entry.rank <= 3 ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-600'
        }`}>
          {entry.rank}
        </div>
        <div>
          <div className={`font-semibold ${entry.isCurrentUser ? 'text-blue-900' : 'text-gray-900'}`}>
            {entry.name} {entry.isCurrentUser && '(You)'}
          </div>
          <div className="text-sm text-gray-600">{entry.patientsHelped} patients helped</div>
        </div>
      </div>
      <div className="text-right">
        <div className="font-bold text-gray-900">{entry.donationCount}</div>
        <div className="text-sm text-gray-600">donations</div>
      </div>
    </div>
  )
}

export default DonorDashboard
