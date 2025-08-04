export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  phone?: string
  role: UserRole
  isVerified: boolean
  profilePicture?: string
  address?: Address
  emergencyContact?: EmergencyContact
  createdAt: string
  updatedAt: string
  patientProfile?: PatientProfile
  donorProfile?: DonorProfile
  providerProfile?: HealthcareProviderProfile
}

export type UserRole = 'PATIENT' | 'DONOR' | 'HEALTHCARE_PROVIDER' | 'ADMIN'

export type BloodType = 
  | 'A_POSITIVE' 
  | 'A_NEGATIVE' 
  | 'B_POSITIVE' 
  | 'B_NEGATIVE' 
  | 'AB_POSITIVE' 
  | 'AB_NEGATIVE' 
  | 'O_POSITIVE' 
  | 'O_NEGATIVE'

export interface Address {
  street: string
  city: string
  state: string
  zipCode: string
  country: string
  latitude?: number
  longitude?: number
}

export interface EmergencyContact {
  name: string
  relationship: string
  phone: string
  email?: string
}

export interface PatientProfile {
  id: string
  userId: string
  bloodType: BloodType
  thalassemiaType: string
  diagnosisDate?: string
  currentHemoglobin?: number
  transfusionFrequency?: number
  lastTransfusion?: string
  nextTransfusion?: string
  preferredHospital?: string
  medicalHistory?: any
  currentMedications?: any
  allergies?: any
  createdAt: string
  updatedAt: string
}

export interface DonorProfile {
  id: string
  userId: string
  bloodType: BloodType
  weight?: number
  height?: number
  lastDonation?: string
  donationCount: number
  isEligible: boolean
  medicalClearance?: string
  preferredLocations?: any
  availabilitySchedule?: any
  createdAt: string
  updatedAt: string
}

export interface HealthcareProviderProfile {
  id: string
  userId: string
  licenseNumber: string
  specialization: string
  hospitalAffiliation?: string
  yearsOfExperience?: number
  certifications?: any
  createdAt: string
  updatedAt: string
}
