import React from 'react'
import { motion } from 'framer-motion'
import { 
  Brain, 
  Users, 
  MessageSquare, 
  Hospital, 
  Bell, 
  BarChart3,
  Shield,
  Zap,
  Globe,
  Heart,
  Clock,
  Target
} from 'lucide-react'
import { cn } from '../utils/cn'

interface FeaturesProps {
  className?: string
}

const Features: React.FC<FeaturesProps> = ({ className }) => {
  const mainFeatures = [
    {
      icon: Brain,
      title: 'AI-Powered Matching',
      description: 'Advanced machine learning algorithms match patients with the most compatible donors based on blood type, location, and availability.',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: BarChart3,
      title: 'Predictive Analytics',
      description: 'Smart forecasting of blood availability and demand patterns to ensure optimal resource allocation and emergency preparedness.',
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: MessageSquare,
      title: 'Secure Communication',
      description: 'HIPAA-compliant messaging system enabling secure communication between patients, donors, and healthcare providers.',
      color: 'from-green-500 to-green-600'
    },
    {
      icon: Hospital,
      title: 'Healthcare Integration',
      description: 'Seamless integration with hospital systems and blood banks for real-time inventory management and coordination.',
      color: 'from-red-500 to-red-600'
    },
    {
      icon: Bell,
      title: 'Real-time Notifications',
      description: 'Instant alerts for urgent blood requests, donation opportunities, and appointment reminders via multiple channels.',
      color: 'from-yellow-500 to-yellow-600'
    },
    {
      icon: Shield,
      title: 'Privacy & Security',
      description: 'Enterprise-grade security with end-to-end encryption, ensuring patient data privacy and regulatory compliance.',
      color: 'from-indigo-500 to-indigo-600'
    }
  ]

  const additionalFeatures = [
    { icon: Zap, title: 'Lightning Fast', description: 'Sub-second response times' },
    { icon: Globe, title: 'Global Reach', description: 'Available worldwide' },
    { icon: Heart, title: 'Life Saving', description: 'Proven impact on patient outcomes' },
    { icon: Clock, title: '24/7 Support', description: 'Round-the-clock assistance' },
    { icon: Target, title: 'Precision Matching', description: '99.7% accuracy rate' },
    { icon: Users, title: 'Community Driven', description: 'Built for healthcare heroes' }
  ]

  return (
    <section className={cn('section-padding bg-white', className)}>
      <div className="max-container container-padding">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center space-x-2 bg-primary-50 text-primary-700 px-4 py-2 rounded-full text-sm font-medium mb-6"
          >
            <Zap className="w-4 h-4" />
            <span>Powerful Features</span>
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl font-bold text-secondary-900 mb-6"
          >
            Everything You Need to
            <span className="block text-gradient">Save Lives</span>
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-xl text-secondary-600 leading-relaxed"
          >
            Our comprehensive platform combines cutting-edge AI technology with intuitive design 
            to revolutionize blood donation and patient care.
          </motion.p>
        </div>

        {/* Main Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {mainFeatures.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="card p-8 group hover:shadow-2xl hover:-translate-y-2 transition-all duration-300"
            >
              <div className={`inline-flex items-center justify-center w-14 h-14 bg-gradient-to-r ${feature.color} rounded-xl mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="w-7 h-7 text-white" />
              </div>
              
              <h3 className="text-xl font-semibold text-secondary-900 mb-4">
                {feature.title}
              </h3>
              
              <p className="text-secondary-600 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Additional Features */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-br from-secondary-50 to-primary-50 rounded-2xl p-8 md:p-12"
        >
          <div className="text-center mb-12">
            <h3 className="text-2xl md:text-3xl font-bold text-secondary-900 mb-4">
              Why Choose HemoLink AI?
            </h3>
            <p className="text-lg text-secondary-600 max-w-2xl mx-auto">
              Built by healthcare professionals, for healthcare professionals. 
              Experience the difference that thoughtful design makes.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {additionalFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center group"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 bg-white rounded-xl shadow-sm mb-4 group-hover:shadow-md group-hover:scale-110 transition-all duration-300">
                  <feature.icon className="w-6 h-6 text-primary-600" />
                </div>
                <h4 className="font-semibold text-secondary-900 mb-2 text-sm">
                  {feature.title}
                </h4>
                <p className="text-xs text-secondary-600">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default Features
