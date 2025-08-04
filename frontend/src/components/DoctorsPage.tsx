import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Phone, 
  MessageCircle, 
  MapPin, 
  Star, 
  Clock, 
  Award, 
  Users, 
  Calendar,
  Search,
  Filter,
  Heart,
  Stethoscope,
  UserCheck
} from 'lucide-react'
import { cn } from '../utils/cn'

interface Doctor {
  id: number
  name: string
  specialty: string
  experience: number
  rating: number
  reviews: number
  location: string
  phone: string
  availability: string
  image: string
  bio: string
  languages: string[]
  education: string
  certifications: string[]
  consultationFee: number
  isAvailable: boolean
}

const DoctorsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSpecialty, setSelectedSpecialty] = useState('All')
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null)

  const specialties = [
    'All',
    'Hematology',
    'Pediatric Hematology',
    'Transfusion Medicine',
    'Internal Medicine',
    'Cardiology',
    'Endocrinology'
  ]

  const doctors: Doctor[] = [
    {
      id: 1,
      name: 'Dr. Priya Sharma',
      specialty: 'Hematology',
      experience: 15,
      rating: 4.9,
      reviews: 234,
      location: 'Tata Memorial Hospital, Mumbai, Maharashtra',
      phone: '+91 98765 43210',
      availability: 'Available Today',
      image: '/api/placeholder/150/150',
      bio: 'Specialized in Thalassemia treatment with over 15 years of experience. Leading researcher in blood disorders.',
      languages: ['English', 'Hindi', 'Marathi'],
      education: 'MBBS, MD from AIIMS Delhi',
      certifications: ['Board Certified Hematologist', 'Transfusion Medicine Specialist'],
      consultationFee: 1500,
      isAvailable: true
    },
    {
      id: 2,
      name: 'Dr. Rajesh Kumar',
      specialty: 'Pediatric Hematology',
      experience: 12,
      rating: 4.8,
      reviews: 189,
      location: 'AIIMS, Delhi, Delhi',
      phone: '+91 98765 43211',
      availability: 'Available Tomorrow',
      image: '/api/placeholder/150/150',
      bio: 'Pediatric specialist focusing on childhood blood disorders and Thalassemia management.',
      languages: ['English', 'Hindi', 'Punjabi'],
      education: 'MBBS, MD from AIIMS Delhi',
      certifications: ['Pediatric Hematology Board Certified', 'Child Care Specialist'],
      consultationFee: 1200,
      isAvailable: false
    },
    {
      id: 3,
      name: 'Dr. Meera Nair',
      specialty: 'Transfusion Medicine',
      experience: 18,
      rating: 4.9,
      reviews: 312,
      location: 'Narayana Health, Bangalore, Karnataka',
      phone: '+91 98765 43212',
      availability: 'Available Now',
      image: '/api/placeholder/150/150',
      bio: 'Expert in blood transfusion protocols and safety. Specializes in complex Thalassemia cases.',
      languages: ['English', 'Hindi', 'Kannada', 'Tamil'],
      education: 'MBBS, MD from CMC Vellore',
      certifications: ['Transfusion Medicine Director', 'Blood Banking Specialist'],
      consultationFee: 1800,
      isAvailable: true
    },
    {
      id: 4,
      name: 'Dr. Amit Ghosh',
      specialty: 'Internal Medicine',
      experience: 10,
      rating: 4.7,
      reviews: 156,
      location: 'SSKM Hospital, Kolkata, West Bengal',
      phone: '+91 98765 43213',
      availability: 'Available This Week',
      image: '/api/placeholder/150/150',
      bio: 'Internal medicine physician with focus on chronic disease management including Thalassemia.',
      languages: ['English', 'Hindi', 'Bengali'],
      education: 'MBBS, MD from Medical College Kolkata',
      certifications: ['Internal Medicine Board Certified', 'Chronic Care Management'],
      consultationFee: 1000,
      isAvailable: true
    },
    {
      id: 5,
      name: 'Dr. Sunita Reddy',
      specialty: 'Cardiology',
      experience: 14,
      rating: 4.8,
      reviews: 278,
      location: 'Apollo Hospital, Bangalore, Karnataka',
      phone: '+91 98765 43214',
      availability: 'Available Next Week',
      image: '/api/placeholder/150/150',
      bio: 'Cardiologist specializing in heart complications related to Thalassemia and iron overload.',
      languages: ['English', 'Hindi', 'Telugu', 'Kannada'],
      education: 'MBBS, MD from NIMS Hyderabad',
      certifications: ['Cardiology Board Certified', 'Heart Failure Specialist'],
      consultationFee: 2000,
      isAvailable: false
    },
    {
      id: 6,
      name: 'Dr. Vikram Singh',
      specialty: 'Endocrinology',
      experience: 11,
      rating: 4.6,
      reviews: 143,
      location: 'Fortis Hospital, Delhi, Delhi',
      phone: '+91 98765 43215',
      availability: 'Available Today',
      image: '/api/placeholder/150/150',
      bio: 'Endocrinologist focusing on hormonal complications in Thalassemia patients.',
      languages: ['English', 'Hindi', 'Punjabi'],
      education: 'MBBS, MD from PGIMER Chandigarh',
      certifications: ['Endocrinology Board Certified', 'Diabetes Management Specialist'],
      consultationFee: 1400,
      isAvailable: true
    }
  ]

  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doctor.location.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSpecialty = selectedSpecialty === 'All' || doctor.specialty === selectedSpecialty
    return matchesSearch && matchesSpecialty
  })

  const handleCall = (phone: string) => {
    window.open(`tel:${phone}`, '_self')
  }

  const handleMessage = (doctor: Doctor) => {
    // In a real app, this would open a messaging interface
    alert(`Opening message interface for ${doctor.name}`)
  }

  const handleLocation = (location: string) => {
    // In a real app, this would open maps
    const encodedLocation = encodeURIComponent(location)
    window.open(`https://maps.google.com?q=${encodedLocation}`, '_blank')
  }

  const handleBookAppointment = (doctor: Doctor) => {
    // In a real app, this would open booking interface
    alert(`Booking appointment with ${doctor.name}`)
  }

  return (
    <div className="min-h-screen pt-20 md:pt-24 gradient-bg">
      <div className="max-container container-padding section-padding">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 bg-green-50 text-green-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span>Find Specialists</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-secondary-900 mb-6">
            Expert Thalassemia
            <span className="block text-gradient">Specialists</span>
          </h1>
          <p className="text-xl text-secondary-600 leading-relaxed max-w-2xl mx-auto">
            Connect with experienced doctors specializing in Thalassemia care and blood disorders
          </p>
        </div>

        {/* Search and Filter */}
        <div className="card p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search doctors by name, specialty, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-secondary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-5 h-5" />
              <select
                value={selectedSpecialty}
                onChange={(e) => setSelectedSpecialty(e.target.value)}
                className="pl-10 pr-8 py-3 border border-secondary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none bg-white min-w-[200px]"
              >
                {specialties.map(specialty => (
                  <option key={specialty} value={specialty}>{specialty}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Doctors Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredDoctors.map((doctor, index) => (
            <motion.div
              key={doctor.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="card p-6 hover:shadow-2xl transition-all duration-300"
            >
              {/* Doctor Header */}
              <div className="flex items-start space-x-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center">
                  <Stethoscope className="w-8 h-8 text-primary-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-secondary-900 mb-1">{doctor.name}</h3>
                  <p className="text-primary-600 font-medium mb-2">{doctor.specialty}</p>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.floor(doctor.rating) ? 'text-yellow-400 fill-current' : 'text-secondary-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-secondary-600">
                      {doctor.rating} ({doctor.reviews} reviews)
                    </span>
                  </div>
                </div>
              </div>

              {/* Doctor Info */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center space-x-2 text-secondary-600">
                  <Award className="w-4 h-4" />
                  <span className="text-sm">{doctor.experience} years experience</span>
                </div>
                <div className="flex items-center space-x-2 text-secondary-600">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">{doctor.location}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span className={`text-sm ${doctor.isAvailable ? 'text-green-600' : 'text-orange-600'}`}>
                    {doctor.availability}
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-secondary-600">
                  <span className="text-sm font-medium">${doctor.consultationFee} consultation fee</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleCall(doctor.phone)}
                  className="flex items-center justify-center space-x-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                >
                  <Phone className="w-4 h-4" />
                  <span className="text-sm font-medium">Call</span>
                </button>
                <button
                  onClick={() => handleMessage(doctor)}
                  className="flex items-center justify-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">Message</span>
                </button>
                <button
                  onClick={() => handleLocation(doctor.location)}
                  className="flex items-center justify-center space-x-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                >
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm font-medium">Location</span>
                </button>
                <button
                  onClick={() => handleBookAppointment(doctor)}
                  className="flex items-center justify-center space-x-2 bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                >
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm font-medium">Book</span>
                </button>
              </div>

              {/* View Details Button */}
              <button
                onClick={() => setSelectedDoctor(doctor)}
                className="w-full mt-4 text-primary-600 hover:text-primary-700 font-medium text-sm border border-primary-200 hover:border-primary-300 py-2 rounded-lg transition-colors duration-200"
              >
                View Full Profile
              </button>
            </motion.div>
          ))}
        </div>

        {/* No Results */}
        {filteredDoctors.length === 0 && (
          <div className="text-center py-12">
            <UserCheck className="w-16 h-16 text-secondary-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-secondary-900 mb-2">No doctors found</h3>
            <p className="text-secondary-600">Try adjusting your search criteria or filters</p>
          </div>
        )}
      </div>

      {/* Doctor Detail Modal */}
      {selectedDoctor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center">
                    <Stethoscope className="w-10 h-10 text-primary-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-secondary-900">{selectedDoctor.name}</h2>
                    <p className="text-primary-600 font-medium text-lg">{selectedDoctor.specialty}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.floor(selectedDoctor.rating) ? 'text-yellow-400 fill-current' : 'text-secondary-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-secondary-600">
                        {selectedDoctor.rating} ({selectedDoctor.reviews} reviews)
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedDoctor(null)}
                  className="text-secondary-400 hover:text-secondary-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-secondary-900 mb-2">About</h3>
                  <p className="text-secondary-600">{selectedDoctor.bio}</p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-secondary-900 mb-3">Details</h3>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Award className="w-4 h-4 text-secondary-500" />
                        <span className="text-sm">{selectedDoctor.experience} years experience</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-secondary-500" />
                        <span className="text-sm">{selectedDoctor.location}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-secondary-500" />
                        <span className="text-sm">{selectedDoctor.phone}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-secondary-500" />
                        <span className="text-sm">{selectedDoctor.availability}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-secondary-900 mb-3">Qualifications</h3>
                    <div className="space-y-2">
                      <p className="text-sm text-secondary-600">{selectedDoctor.education}</p>
                      <div>
                        <p className="text-sm font-medium text-secondary-700 mb-1">Certifications:</p>
                        <ul className="text-sm text-secondary-600 space-y-1">
                          {selectedDoctor.certifications.map((cert, index) => (
                            <li key={index}>• {cert}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-secondary-700 mb-1">Languages:</p>
                        <p className="text-sm text-secondary-600">{selectedDoctor.languages.join(', ')}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <button
                    onClick={() => handleCall(selectedDoctor.phone)}
                    className="flex items-center justify-center space-x-2 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg transition-colors duration-200"
                  >
                    <Phone className="w-5 h-5" />
                    <span>Call Now</span>
                  </button>
                  <button
                    onClick={() => handleBookAppointment(selectedDoctor)}
                    className="flex items-center justify-center space-x-2 bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-lg transition-colors duration-200"
                  >
                    <Calendar className="w-5 h-5" />
                    <span>Book Appointment</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default DoctorsPage
