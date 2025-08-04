import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navigation from './components/Navigation'
import Hero from './components/Hero'
import Features from './components/Features'
import Footer from './components/Footer'
import DoctorsPage from './components/DoctorsPage'
import ChatbotPage from './pages/ChatbotPage'
import DonorDashboard from './pages/DonorDashboard'
import DonorLogin from './components/DonorLogin'
import ProtectedDonorRoute from './components/ProtectedDonorRoute'
import FloatingChatbot from './components/FloatingChatbot'
import { DonorAuthProvider } from './contexts/DonorAuthContext'

const App: React.FC = () => {
  return (
    <DonorAuthProvider>
      <Router>
        <div className="min-h-screen bg-white">
          <Navigation />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/demo" element={<DemoPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/doctors" element={<DoctorsPage />} />
            <Route path="/ai-predictions" element={<AIPredictionsPage />} />
            <Route path="/chatbot" element={<ChatbotPage />} />
            <Route path="/donor-login" element={<DonorLogin />} />
            <Route path="/donor-dashboard" element={
              <ProtectedDonorRoute>
                <DonorDashboard />
              </ProtectedDonorRoute>
            } />
          </Routes>
          <FloatingChatbot />
        </div>
      </Router>
    </DonorAuthProvider>
  )
}

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen">
      <Hero />
      <Features />
      <Footer />
    </div>
  )
}

const DemoPage: React.FC = () => {
  const [demoData, setDemoData] = React.useState<any>(null)
  const [donorsData, setDonorsData] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)
  const [donorsLoading, setDonorsLoading] = React.useState(true)
  const [actionLoading, setActionLoading] = React.useState(false)
  const [donorActionLoading, setDonorActionLoading] = React.useState(false)
  const [message, setMessage] = React.useState<string>('')
  const [donorMessage, setDonorMessage] = React.useState<string>('')
  const [showForm, setShowForm] = React.useState(false)
  const [showDonorForm, setShowDonorForm] = React.useState(false)
  const [formData, setFormData] = React.useState({
    name: '',
    bloodType: 'A_POSITIVE',
    nextTransfusion: '',
    hemoglobin: '',
    age: '',
    location: ''
  })
  const [donorFormData, setDonorFormData] = React.useState({
    name: '',
    bloodType: 'A_POSITIVE',
    age: '',
    location: '',
    phone: '',
    lastDonation: ''
  })

  const fetchData = () => {
    setLoading(true)
    fetch('http://localhost:5000/api/demo/patients')
      .then(res => res.json())
      .then(data => {
        setDemoData(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Demo API error:', err)
        setLoading(false)
      })
  }

  const fetchDonors = () => {
    setDonorsLoading(true)
    fetch('http://localhost:5000/api/demo/donors')
      .then(res => res.json())
      .then(data => {
        setDonorsData(data)
        setDonorsLoading(false)
      })
      .catch(err => {
        console.error('Donors API error:', err)
        setDonorsLoading(false)
      })
  }

  React.useEffect(() => {
    fetchData()
    fetchDonors()
  }, [])

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setActionLoading(true)
    setMessage('')

    // Validate required fields
    if (!formData.name || !formData.nextTransfusion || !formData.hemoglobin || !formData.age || !formData.location) {
      setMessage('❌ Please fill in all required fields')
      setActionLoading(false)
      setTimeout(() => setMessage(''), 3000)
      return
    }

    try {
      const response = await fetch('http://localhost:5000/api/demo/patients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (result.success) {
        setMessage('✅ Patient added successfully!')
        setFormData({
          name: '',
          bloodType: 'A_POSITIVE',
          nextTransfusion: '',
          hemoglobin: '',
          age: '',
          location: ''
        })
        setShowForm(false)
        fetchData()
      } else {
        setMessage('❌ Failed to add patient: ' + result.error)
      }
    } catch (error) {
      setMessage('❌ Error adding patient: ' + error)
    }

    setActionLoading(false)
    setTimeout(() => setMessage(''), 3000)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const deletePatient = async (patientId: string, patientName: string) => {
    if (!confirm(`Are you sure you want to delete patient "${patientName}"? This cannot be undone.`)) {
      return
    }

    setActionLoading(true)
    setMessage('')

    try {
      const response = await fetch(`http://localhost:5000/api/demo/patients/${patientId}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (result.success) {
        setMessage(`✅ Patient "${patientName}" deleted successfully!`)
        fetchData()
      } else {
        setMessage('❌ Failed to delete patient: ' + result.error)
      }
    } catch (error) {
      setMessage('❌ Error deleting patient: ' + error)
    }

    setActionLoading(false)
    setTimeout(() => setMessage(''), 3000)
  }

  const handleDonorFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setDonorActionLoading(true)
    setDonorMessage('')

    // Validate required fields
    if (!donorFormData.name || !donorFormData.age || !donorFormData.location || !donorFormData.phone) {
      setDonorMessage('❌ Please fill in all required fields')
      setDonorActionLoading(false)
      setTimeout(() => setDonorMessage(''), 3000)
      return
    }

    try {
      const response = await fetch('http://localhost:5000/api/demo/donors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(donorFormData),
      })

      const result = await response.json()

      if (result.success) {
        setDonorMessage('✅ Donor added successfully!')
        setDonorFormData({
          name: '',
          bloodType: 'A_POSITIVE',
          age: '',
          location: '',
          phone: '',
          lastDonation: ''
        })
        setShowDonorForm(false)
        fetchDonors()
      } else {
        setDonorMessage('❌ Failed to add donor: ' + result.error)
      }
    } catch (error) {
      setDonorMessage('❌ Error adding donor: ' + error)
    }

    setDonorActionLoading(false)
    setTimeout(() => setDonorMessage(''), 3000)
  }

  const handleDonorInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setDonorFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const deleteDonor = async (donorId: string, donorName: string) => {
    if (!confirm(`Are you sure you want to delete donor "${donorName}"? This cannot be undone.`)) {
      return
    }

    setDonorActionLoading(true)
    setDonorMessage('')

    try {
      const response = await fetch(`http://localhost:5000/api/demo/donors/${donorId}`, {
        method: 'DELETE'
      })
      const result = await response.json()

      if (result.success) {
        setDonorMessage('✅ Donor deleted successfully!')
        fetchDonors()
      } else {
        setDonorMessage('❌ Failed to delete donor: ' + result.error)
      }
    } catch (error) {
      setDonorMessage('❌ Error deleting donor: ' + error)
    }

    setDonorActionLoading(false)
    setTimeout(() => setDonorMessage(''), 3000)
  }

  return (
    <div className="min-h-screen pt-20 md:pt-24 gradient-bg">
      <div className="max-container container-padding section-padding">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-2 bg-primary-50 text-primary-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span>Live Demo</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-secondary-900 mb-6">
              Experience HemoLink AI
              <span className="block text-gradient">In Real-Time</span>
            </h1>
            <p className="text-xl text-secondary-600 leading-relaxed">
              Connect to our live backend services and see the platform in action
            </p>
          </div>

          {/* Demo Content */}
          <div className="card p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <h3 className="text-xl font-semibold text-secondary-900">Backend Connection</h3>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-sm text-green-600 font-medium">Connected</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowForm(!showForm)}
                  disabled={actionLoading}
                  className="btn btn-primary btn-sm"
                >
                  <span>{showForm ? '✕ Cancel' : '+ Add Patient'}</span>
                </button>



                <button
                  onClick={fetchData}
                  disabled={loading}
                  className="btn btn-secondary btn-sm"
                >
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full" />
                      <span>Refreshing...</span>
                    </div>
                  ) : (
                    <>
                      <span>🔄 Refresh</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Status Message */}
            {message && (
              <div className={`mb-4 p-3 rounded-lg text-sm font-medium ${
                message.includes('✅')
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {message}
              </div>
            )}

            {/* Add Patient Form */}
            {showForm && (
              <div className="mb-6 p-6 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="text-lg font-semibold text-blue-900 mb-4">Add New Patient</h4>
                <form onSubmit={handleFormSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="e.g., John Doe"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Blood Type *
                      </label>
                      <select
                        name="bloodType"
                        value={formData.bloodType}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      >
                        <option value="A_POSITIVE">A+</option>
                        <option value="A_NEGATIVE">A-</option>
                        <option value="B_POSITIVE">B+</option>
                        <option value="B_NEGATIVE">B-</option>
                        <option value="AB_POSITIVE">AB+</option>
                        <option value="AB_NEGATIVE">AB-</option>
                        <option value="O_POSITIVE">O+</option>
                        <option value="O_NEGATIVE">O-</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Next Transfusion Date *
                      </label>
                      <input
                        type="date"
                        name="nextTransfusion"
                        value={formData.nextTransfusion}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Hemoglobin Level (g/dL) *
                      </label>
                      <input
                        type="number"
                        name="hemoglobin"
                        value={formData.hemoglobin}
                        onChange={handleInputChange}
                        placeholder="e.g., 8.5"
                        step="0.1"
                        min="0"
                        max="20"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Age *
                      </label>
                      <input
                        type="number"
                        name="age"
                        value={formData.age}
                        onChange={handleInputChange}
                        placeholder="e.g., 28"
                        min="1"
                        max="120"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Location *
                      </label>
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        placeholder="e.g., Mumbai, Maharashtra"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 pt-4">
                    <button
                      type="submit"
                      disabled={actionLoading}
                      className="btn btn-primary btn-md"
                    >
                      {actionLoading ? (
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                          <span>Adding Patient...</span>
                        </div>
                      ) : (
                        <span>Add Patient</span>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="btn btn-secondary btn-md"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Patient List */}
            {demoData && demoData.data && demoData.data.length > 0 && (
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-secondary-900 mb-4">Current Patients</h4>
                <div className="space-y-3">
                  {demoData.data.map((patient: any) => (
                    <div key={patient.id} className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4">
                          <div>
                            <h5 className="font-semibold text-gray-900">{patient.name}</h5>
                            <p className="text-sm text-gray-600">
                              {patient.bloodType.replace('_', '')} • Age {patient.age} • Hb: {patient.hemoglobin} g/dL
                            </p>
                          </div>
                          <div className="text-sm text-gray-500">
                            <p>📍 {patient.location}</p>
                            <p>📅 Next: {patient.nextTransfusion}</p>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => deletePatient(patient.id, patient.name)}
                        disabled={actionLoading}
                        className="btn btn-accent btn-sm ml-4"
                        title={`Delete ${patient.name}`}
                      >
                        {actionLoading ? (
                          <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                        ) : (
                          <span>🗑️ Delete</span>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Donors Section */}
          <div className="card p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <h3 className="text-xl font-semibold text-secondary-900">Available Donors</h3>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
                  <span className="text-sm text-blue-600 font-medium">Live Data</span>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <a
                  href="/donor-login"
                  className="btn btn-primary btn-sm"
                >
                  🔐 Donor Login
                </a>
              </div>

              {/* Donor Action Buttons */}
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowDonorForm(!showDonorForm)}
                  disabled={donorActionLoading}
                  className="btn btn-primary btn-sm"
                >
                  <span>{showDonorForm ? '✕ Cancel' : '+ Add Donor'}</span>
                </button>

                <button
                  onClick={fetchDonors}
                  disabled={donorsLoading}
                  className="btn btn-secondary btn-sm"
                >
                  {donorsLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full" />
                      <span>Refreshing...</span>
                    </div>
                  ) : (
                    <>
                      <span>🔄 Refresh</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Donor Status Message */}
            {donorMessage && (
              <div className={`mb-4 p-3 rounded-lg text-sm font-medium ${
                donorMessage.includes('✅')
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {donorMessage}
              </div>
            )}

            {/* Add Donor Form */}
            {showDonorForm && (
              <div className="mb-6 p-6 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="text-lg font-semibold text-green-900 mb-4">Add New Donor</h4>
                <form onSubmit={handleDonorFormSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={donorFormData.name}
                        onChange={handleDonorInputChange}
                        placeholder="e.g., Jane Smith"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Blood Type *
                      </label>
                      <select
                        name="bloodType"
                        value={donorFormData.bloodType}
                        onChange={handleDonorInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        required
                      >
                        <option value="A_POSITIVE">A+</option>
                        <option value="A_NEGATIVE">A-</option>
                        <option value="B_POSITIVE">B+</option>
                        <option value="B_NEGATIVE">B-</option>
                        <option value="AB_POSITIVE">AB+</option>
                        <option value="AB_NEGATIVE">AB-</option>
                        <option value="O_POSITIVE">O+</option>
                        <option value="O_NEGATIVE">O-</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Age *
                      </label>
                      <input
                        type="number"
                        name="age"
                        value={donorFormData.age}
                        onChange={handleDonorInputChange}
                        placeholder="e.g., 25"
                        min="18"
                        max="65"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Location *
                      </label>
                      <input
                        type="text"
                        name="location"
                        value={donorFormData.location}
                        onChange={handleDonorInputChange}
                        placeholder="e.g., Mumbai, Maharashtra"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={donorFormData.phone}
                        onChange={handleDonorInputChange}
                        placeholder="e.g., +91 98765 43210"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Last Donation (Optional)
                      </label>
                      <input
                        type="date"
                        name="lastDonation"
                        value={donorFormData.lastDonation}
                        onChange={handleDonorInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 pt-4">
                    <button
                      type="submit"
                      disabled={donorActionLoading}
                      className="btn btn-primary btn-md"
                    >
                      {donorActionLoading ? (
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                          <span>Adding Donor...</span>
                        </div>
                      ) : (
                        <span>Add Donor</span>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowDonorForm(false)}
                      className="btn btn-secondary btn-md"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Donor List */}
            {donorsData && donorsData.data && donorsData.data.length > 0 && (
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-secondary-900 mb-4">Current Donors</h4>
                <div className="space-y-3">
                  {donorsData.data.map((donor: any) => (
                    <div key={donor.id} className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4">
                          <div>
                            <h5 className="font-semibold text-gray-900">{donor.name}</h5>
                            <p className="text-sm text-gray-600">
                              {donor.bloodType.replace('_', '')} • Age {donor.age} • 📞 {donor.phone}
                            </p>
                          </div>
                          <div className="text-sm text-gray-500">
                            <p>📍 {donor.location}</p>
                            {donor.lastDonation && <p>🩸 Last: {donor.lastDonation}</p>}
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <a
                          href="/donor-login"
                          className="btn btn-primary btn-sm"
                          title={`Login as ${donor.name}`}
                        >
                          🔐 Login
                        </a>
                        <button
                          onClick={() => deleteDonor(donor.id, donor.name)}
                          disabled={donorActionLoading}
                          className="btn btn-accent btn-sm"
                          title={`Delete ${donor.name}`}
                        >
                          {donorActionLoading ? (
                            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                          ) : (
                            <span>🗑️ Delete</span>
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Navigation */}
          <div className="text-center">
            <a
              href="/"
              className="btn btn-secondary btn-md mr-4"
            >
              ← Back to Home
            </a>
            <a
              href="/dashboard"
              className="btn btn-primary btn-md"
            >
              View Dashboard →
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

const DashboardPage: React.FC = () => {
  const [stats, setStats] = React.useState<any>(null)
  const [patients, setPatients] = React.useState<any>(null)
  const [donors, setDonors] = React.useState<any>(null)

  React.useEffect(() => {
    // Fetch statistics
    fetch('http://localhost:5000/api/demo/statistics')
      .then(res => res.json())
      .then(data => setStats(data.data))
      .catch(err => console.error('Stats API error:', err))

    // Fetch patients
    fetch('http://localhost:5000/api/demo/patients')
      .then(res => res.json())
      .then(data => setPatients(data.data))
      .catch(err => console.error('Patients API error:', err))

    // Fetch donors
    fetch('http://localhost:5000/api/demo/donors')
      .then(res => res.json())
      .then(data => setDonors(data.data))
      .catch(err => console.error('Donors API error:', err))
  }, [])

  return (
    <div className="min-h-screen pt-20 md:pt-24 gradient-bg">
      <div className="max-container container-padding section-padding">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 bg-primary-50 text-primary-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            <span>Live Dashboard</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-secondary-900 mb-6">
            HemoLink AI
            <span className="block text-gradient">Dashboard</span>
          </h1>
          <p className="text-xl text-secondary-600 leading-relaxed max-w-2xl mx-auto">
            Real-time insights into blood donation patterns, patient needs, and system performance
          </p>
        </div>

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="card p-6 text-center bg-gradient-to-br from-blue-500 to-blue-600 text-white hover:shadow-2xl transition-all duration-300">
              <h3 className="text-3xl font-bold mb-2">{stats.totalPatients}</h3>
              <p className="text-blue-100">Total Patients</p>
            </div>
            <div className="card p-6 text-center bg-gradient-to-br from-purple-500 to-purple-600 text-white hover:shadow-2xl transition-all duration-300">
              <h3 className="text-3xl font-bold mb-2">{stats.activeDonors}</h3>
              <p className="text-purple-100">Active Donors</p>
            </div>
            <div className="card p-6 text-center bg-gradient-to-br from-green-500 to-green-600 text-white hover:shadow-2xl transition-all duration-300">
              <h3 className="text-3xl font-bold mb-2">{stats.successfulMatches}</h3>
              <p className="text-green-100">Successful Matches</p>
            </div>
            <div className="card p-6 text-center bg-gradient-to-br from-orange-500 to-orange-600 text-white hover:shadow-2xl transition-all duration-300">
              <h3 className="text-3xl font-bold mb-2">{stats.averageResponseTime}</h3>
              <p className="text-orange-100">Avg Response Time</p>
            </div>
          </div>
        )}

        {/* Patients and Donors */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Patients */}
          <div className="card p-6">
            <h3 className="text-xl font-semibold text-secondary-900 mb-6 flex items-center">
              <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center mr-3">
                🏥
              </div>
              Recent Patients
            </h3>
            {patients ? (
              <div className="space-y-4">
                {patients.map((patient: any) => (
                  <div key={patient.id} className="p-4 bg-secondary-50 rounded-lg border-l-4 border-primary-500 hover:shadow-md transition-shadow">
                    <div className="font-semibold text-secondary-900 mb-1">{patient.name}</div>
                    <div className="text-secondary-600 text-sm mb-1">
                      Blood Type: {patient.bloodType} | Hemoglobin: {patient.hemoglobin}g/dL
                    </div>
                    <div className="text-secondary-500 text-xs">
                      Next Transfusion: {patient.nextTransfusion}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-secondary-500 text-center py-8">Loading patients...</div>
            )}
          </div>

          {/* Donors */}
          <div className="card p-6">
            <h3 className="text-xl font-semibold text-secondary-900 mb-6 flex items-center">
              <div className="w-8 h-8 bg-accent-100 rounded-lg flex items-center justify-center mr-3">
                🩸
              </div>
              Available Donors
            </h3>
            {donors ? (
              <div className="space-y-4">
                {donors.map((donor: any) => (
                  <div key={donor.id} className={`p-4 bg-secondary-50 rounded-lg border-l-4 hover:shadow-md transition-shadow ${donor.available ? 'border-green-500' : 'border-red-500'}`}>
                    <div className="font-semibold text-secondary-900 mb-1">{donor.name}</div>
                    <div className="text-secondary-600 text-sm mb-1">
                      Blood Type: {donor.bloodType} | Donations: {donor.donationCount}
                    </div>
                    <div className={`text-xs font-medium ${donor.available ? 'text-green-600' : 'text-red-600'}`}>
                      {donor.available ? '✅ Available' : '❌ Not Available'}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-secondary-500 text-center py-8">Loading donors...</div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="text-center">
          <a
            href="/"
            className="btn btn-secondary btn-lg mr-4"
          >
            ← Back to Home
          </a>
          <a
            href="/ai-predictions"
            className="btn btn-accent btn-lg"
          >
            🤖 Try AI Predictions
          </a>
        </div>
      </div>
    </div>
  )
}

const AIPredictionsPage: React.FC = () => {
  const [prediction, setPrediction] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(false)
  const [donorsLoading, setDonorsLoading] = React.useState(true)
  const [bloodType, setBloodType] = React.useState('A_POSITIVE')
  const [urgencyLevel, setUrgencyLevel] = React.useState(3)
  const [availableDonors, setAvailableDonors] = React.useState<any[]>([])
  const [filteredDonors, setFilteredDonors] = React.useState<any[]>([])

  // Fetch available donors from demo
  React.useEffect(() => {
    setDonorsLoading(true)
    fetch('http://localhost:5000/api/demo/donors')
      .then(res => res.json())
      .then(data => {
        if (data.data) {
          setAvailableDonors(data.data)
        }
        setDonorsLoading(false)
      })
      .catch(err => {
        console.error('Donors API error:', err)
        setDonorsLoading(false)
      })
  }, [])

  // Filter donors by blood type when blood type changes
  React.useEffect(() => {
    const filtered = availableDonors.filter(donor => donor.bloodType === bloodType)
    setFilteredDonors(filtered)
  }, [bloodType, availableDonors])

  const makePrediction = async () => {
    setLoading(true)

    // Calculate prediction based on real donor data
    const compatibleDonors = filteredDonors.length
    const totalDonors = availableDonors.length

    // Calculate availability score based on real data
    let availabilityScore = 0
    if (totalDonors > 0) {
      const baseScore = compatibleDonors / Math.max(totalDonors, 1)
      const urgencyMultiplier = urgencyLevel / 5.0
      availabilityScore = Math.min(baseScore * (1 + urgencyMultiplier * 0.3), 1.0)
    }

    // Determine category based on score
    let category = 'LOW'
    if (availabilityScore > 0.7) category = 'HIGH'
    else if (availabilityScore > 0.4) category = 'MEDIUM'

    // Calculate estimated response time
    const baseHours = 24
    const responseHours = Math.max(2, Math.round(baseHours * (1 - availabilityScore)))

    // Generate recommendations based on real data
    const recommendations = []
    if (compatibleDonors === 0) {
      recommendations.push('No compatible donors found - expand search radius')
      recommendations.push('Consider contacting blood banks')
      recommendations.push('Alert emergency donor network')
    } else if (compatibleDonors < 3) {
      recommendations.push('Limited donors available - contact immediately')
      recommendations.push('Prepare backup options')
    } else {
      recommendations.push('Good donor availability - standard protocols apply')
      recommendations.push('Multiple compatible donors found')
    }

    const predictionResult = {
      result: {
        availability_score: availabilityScore,
        availability_category: category,
        compatible_donors_count: compatibleDonors,
        total_donors_count: totalDonors,
        estimated_response_time: {
          estimated_hours: responseHours,
          min_hours: 2,
          max_hours: 48
        },
        recommendations: recommendations,
        donor_details: filteredDonors.map(donor => ({
          name: donor.name,
          location: donor.location,
          phone: donor.phone,
          last_donation: donor.lastDonation || 'Never'
        }))
      },
      confidence: Math.min(0.95, 0.7 + (compatibleDonors * 0.05))
    }

    setPrediction(predictionResult)
    setLoading(false)
  }

  return (
    <div className="min-h-screen pt-20 md:pt-24 gradient-bg">
      <div className="max-container container-padding section-padding">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-2 bg-accent-50 text-accent-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <div className="w-2 h-2 bg-accent-500 rounded-full animate-pulse" />
              <span>AI Predictions</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-secondary-900 mb-6">
              Smart Donor
              <span className="block bg-gradient-to-r from-accent-500 to-accent-600 bg-clip-text text-transparent">
                Availability Forecasting
              </span>
            </h1>
            <p className="text-xl text-secondary-600 leading-relaxed max-w-2xl mx-auto">
              Leverage advanced machine learning to predict blood donor availability and optimize matching
            </p>
          </div>

          {/* Input Form */}
          <div className="card p-8 mb-8">
            <h3 className="text-xl font-semibold text-secondary-900 mb-6 flex items-center">
              <div className="w-8 h-8 bg-accent-100 rounded-lg flex items-center justify-center mr-3">
                🩸
              </div>
              Prediction Parameters
            </h3>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Blood Type
                </label>
                <select
                  value={bloodType}
                  onChange={(e) => setBloodType(e.target.value)}
                  className="w-full px-4 py-3 border border-secondary-200 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-colors"
                >
                  <option value="A_POSITIVE">A+</option>
                  <option value="A_NEGATIVE">A-</option>
                  <option value="B_POSITIVE">B+</option>
                  <option value="B_NEGATIVE">B-</option>
                  <option value="AB_POSITIVE">AB+</option>
                  <option value="AB_NEGATIVE">AB-</option>
                  <option value="O_POSITIVE">O+</option>
                  <option value="O_NEGATIVE">O-</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Urgency Level: {urgencyLevel}
                </label>
                <style>
                  {`
                    .urgency-slider::-webkit-slider-thumb {
                      appearance: none;
                      height: 20px;
                      width: 20px;
                      border-radius: 50%;
                      background: ${
                        urgencyLevel === 1 ? '#10b981' :  // green-500
                        urgencyLevel === 2 ? '#f59e0b' :  // yellow-500
                        urgencyLevel === 3 ? '#f97316' :  // orange-500
                        urgencyLevel === 4 ? '#ef4444' :  // red-500
                        '#dc2626'                         // red-600 for emergency
                      };
                      cursor: pointer;
                      border: 2px solid white;
                      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                    }
                    .urgency-slider::-moz-range-thumb {
                      height: 20px;
                      width: 20px;
                      border-radius: 50%;
                      background: ${
                        urgencyLevel === 1 ? '#10b981' :  // green-500
                        urgencyLevel === 2 ? '#f59e0b' :  // yellow-500
                        urgencyLevel === 3 ? '#f97316' :  // orange-500
                        urgencyLevel === 4 ? '#ef4444' :  // red-500
                        '#dc2626'                         // red-600 for emergency
                      };
                      cursor: pointer;
                      border: 2px solid white;
                      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                    }
                  `}
                </style>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={urgencyLevel}
                  onChange={(e) => setUrgencyLevel(parseInt(e.target.value))}
                  className="urgency-slider w-full h-2 bg-secondary-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs mt-2">
                  <span className={`px-2 py-1 rounded ${urgencyLevel === 1 ? 'bg-green-100 text-green-700 font-medium' : 'text-green-600'}`}>
                    Routine
                  </span>
                  <span className={`px-2 py-1 rounded ${urgencyLevel === 2 ? 'bg-yellow-100 text-yellow-700 font-medium' : 'text-yellow-600'}`}>
                    Moderate
                  </span>
                  <span className={`px-2 py-1 rounded ${urgencyLevel === 3 ? 'bg-orange-100 text-orange-700 font-medium' : 'text-orange-600'}`}>
                    Urgent
                  </span>
                  <span className={`px-2 py-1 rounded ${urgencyLevel === 4 ? 'bg-red-100 text-red-700 font-medium' : 'text-red-600'}`}>
                    Critical
                  </span>
                  <span className={`px-2 py-1 rounded ${urgencyLevel === 5 ? 'bg-red-200 text-red-800 font-medium' : 'text-red-700'}`}>
                    Emergency
                  </span>
                </div>
              </div>

              <button
                onClick={makePrediction}
                disabled={loading}
                className={`w-full py-4 px-6 rounded-lg font-medium text-white transition-all duration-200 ${
                  loading
                    ? 'bg-secondary-400 cursor-not-allowed'
                    : 'btn-accent hover:shadow-xl transform hover:-translate-y-0.5'
                }`}
              >
                {loading ? '🔄 Predicting...' : '🚀 Get AI Prediction'}
              </button>
            </div>
          </div>

          {/* Current Donor Data Overview */}
          <div className="card p-8 mb-8">
            <h3 className="text-xl font-semibold text-secondary-900 mb-6 flex items-center">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                🩸
              </div>
              Live Donor Database
            </h3>

            {donorsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mr-3" />
                <span className="text-secondary-600">Loading donor data...</span>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 text-center">
                    <div className="text-2xl font-bold text-blue-600 mb-1">
                      {availableDonors.length}
                    </div>
                    <div className="text-secondary-600 text-sm">Total Donors</div>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg border border-green-200 text-center">
                    <div className="text-2xl font-bold text-green-600 mb-1">
                      {filteredDonors.length}
                    </div>
                    <div className="text-secondary-600 text-sm">
                      {bloodType.replace('_', '')} Compatible
                    </div>
                  </div>

                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200 text-center">
                    <div className="text-2xl font-bold text-purple-600 mb-1">
                      {availableDonors.length > 0 ? Math.round((filteredDonors.length / availableDonors.length) * 100) : 0}%
                    </div>
                    <div className="text-secondary-600 text-sm">Match Rate</div>
                  </div>
                </div>

                {filteredDonors.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-medium text-secondary-900 mb-3">
                      Compatible Donors for {bloodType.replace('_', '')}:
                    </h4>
                    <div className="grid md:grid-cols-2 gap-3">
                      {filteredDonors.slice(0, 4).map((donor: any, index: number) => (
                        <div key={index} className="bg-white p-3 rounded-lg border border-secondary-200">
                          <div className="font-medium text-secondary-900">{donor.name}</div>
                          <div className="text-sm text-secondary-600">📍 {donor.location}</div>
                        </div>
                      ))}
                      {filteredDonors.length > 4 && (
                        <div className="bg-secondary-50 p-3 rounded-lg border border-secondary-200 flex items-center justify-center">
                          <span className="text-secondary-600 text-sm">
                            +{filteredDonors.length - 4} more donors
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {filteredDonors.length === 0 && availableDonors.length > 0 && (
                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <p className="text-yellow-800 text-sm">
                      ⚠️ No donors with blood type {bloodType.replace('_', '')} found in the current database.
                      Try selecting a different blood type or add more donors to the system.
                    </p>
                  </div>
                )}

                {availableDonors.length === 0 && (
                  <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                    <p className="text-red-800 text-sm">
                      ❌ No donors found in the database. Please add donors to the system first by visiting the
                      <a href="/demo" className="underline font-medium ml-1">Demo page</a>.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Prediction Results */}
          {prediction && (
            <div className="card p-8 mb-8">
              <h3 className="text-xl font-semibold text-secondary-900 mb-6 flex items-center">
                <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center mr-3">
                  📊
                </div>
                Prediction Results
              </h3>

              {prediction.error ? (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  <strong>Error:</strong> {prediction.error}
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Main Stats Grid */}
                  <div className="grid md:grid-cols-4 gap-4">
                    <div className="bg-green-50 p-6 rounded-xl text-center border border-green-200">
                      <div className="text-3xl font-bold text-green-600 mb-2">
                        {Math.round(prediction.result.availability_score * 100)}%
                      </div>
                      <div className="text-secondary-600">Availability Score</div>
                    </div>

                    <div className="bg-blue-50 p-6 rounded-xl text-center border border-blue-200">
                      <div className="text-xl font-bold text-blue-600 mb-2">
                        {prediction.result.availability_category}
                      </div>
                      <div className="text-secondary-600">Category</div>
                    </div>

                    <div className="bg-purple-50 p-6 rounded-xl text-center border border-purple-200">
                      <div className="text-2xl font-bold text-purple-600 mb-2">
                        {prediction.result.compatible_donors_count}
                      </div>
                      <div className="text-secondary-600">Compatible Donors</div>
                    </div>

                    <div className="bg-orange-50 p-6 rounded-xl text-center border border-orange-200">
                      <div className="text-xl font-bold text-orange-600 mb-2">
                        {prediction.result.estimated_response_time?.estimated_hours || 'N/A'}h
                      </div>
                      <div className="text-secondary-600">Est. Response Time</div>
                    </div>
                  </div>

                  {/* Compatible Donors List */}
                  {prediction.result.donor_details && prediction.result.donor_details.length > 0 && (
                    <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
                      <h4 className="font-semibold text-blue-900 mb-4 flex items-center">
                        🩸 Compatible Donors ({prediction.result.compatible_donors_count})
                      </h4>
                      <div className="grid md:grid-cols-2 gap-4">
                        {prediction.result.donor_details.map((donor: any, index: number) => (
                          <div key={index} className="bg-white p-4 rounded-lg border border-blue-200">
                            <div className="font-medium text-secondary-900">{donor.name}</div>
                            <div className="text-sm text-secondary-600 mt-1">
                              📍 {donor.location}
                            </div>
                            <div className="text-sm text-secondary-600">
                              📞 {donor.phone}
                            </div>
                            <div className="text-sm text-secondary-600">
                              🩸 Last donation: {donor.last_donation}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* No Compatible Donors Message */}
                  {prediction.result.compatible_donors_count === 0 && (
                    <div className="bg-red-50 p-6 rounded-xl border border-red-200">
                      <h4 className="font-semibold text-red-900 mb-2 flex items-center">
                        ⚠️ No Compatible Donors Found
                      </h4>
                      <p className="text-red-700">
                        No donors with blood type {bloodType.replace('_', '')} are currently available in the system.
                        Consider expanding search criteria or contacting blood banks.
                      </p>
                    </div>
                  )}

                  {/* Recommendations */}
                  <div className="bg-secondary-50 p-6 rounded-xl border border-secondary-200">
                    <h4 className="font-semibold text-secondary-900 mb-3 flex items-center">
                      🎯 AI Recommendations
                    </h4>
                    <ul className="text-secondary-600 space-y-2">
                      {prediction.result.recommendations?.map((rec: string, index: number) => (
                        <li key={index} className="flex items-start">
                          <span className="text-primary-500 mr-2">•</span>
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Data Source Info */}
                  <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
                    <h4 className="font-semibold text-yellow-900 mb-2 flex items-center">
                      📊 Live Data Analysis
                    </h4>
                    <p className="text-yellow-800 text-sm">
                      Predictions based on {prediction.result.total_donors_count} total donors currently in the system.
                      Data sourced from live demo database at localhost:5000/api/demo/donors
                    </p>
                  </div>

                  <div className="text-center text-sm text-secondary-400 pt-4 border-t border-secondary-200">
                    Model: {prediction.model_version} | Confidence: {Math.round(prediction.confidence * 100)}%
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Navigation */}
          <div className="text-center">
            <a
              href="/"
              className="btn btn-secondary btn-lg mr-4"
            >
              ← Back to Home
            </a>
            <a
              href="/dashboard"
              className="btn btn-primary btn-lg"
            >
              📊 View Dashboard
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
