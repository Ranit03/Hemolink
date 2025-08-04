import React from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Play, Users, Brain, Activity, Zap, MessageSquare } from 'lucide-react'
import { cn } from '../utils/cn'

interface HeroProps {
  className?: string
}

const Hero: React.FC<HeroProps> = ({ className }) => {
  const stats = [
    { label: 'Patients Connected', value: '10,000+', icon: Users },
    { label: 'AI Predictions', value: '50,000+', icon: Brain },
    { label: 'Success Rate', value: '95%', icon: Activity },
    { label: 'Response Time', value: '<2min', icon: Zap },
  ]

  return (
    <section className={cn('relative overflow-hidden pt-20 md:pt-24', className)}>
      {/* Background Elements */}
      <div className="absolute inset-0 hero-gradient opacity-5" />
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" />
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-accent-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float animation-delay-400" />
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-secondary-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float animation-delay-800" />
      </div>

      <div className="relative max-container container-padding section-padding">
        <div className="text-center max-w-5xl mx-auto">


          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl lg:text-7xl font-bold text-secondary-900 mb-6 leading-tight"
          >
            Connecting Lives Through
            <span className="block text-gradient">AI-Powered Blood Donation</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl md:text-2xl text-secondary-600 mb-12 max-w-3xl mx-auto leading-relaxed"
          >
            Revolutionary platform connecting Thalassemia patients with compatible blood donors in real-time, 
            powered by advanced AI predictions and seamless healthcare integration.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          >
            <a
              href="/demo"
              className="btn btn-primary btn-lg group"
            >
              <span>Start Demo</span>
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </a>

          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="text-center group"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-100 rounded-xl mb-3 group-hover:bg-primary-200 transition-colors">
                  <stat.icon className="w-6 h-6 text-primary-600" />
                </div>
                <div className="text-2xl md:text-3xl font-bold text-secondary-900 mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-secondary-600">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          className="w-full h-20 text-white"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path
            d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z"
            opacity=".25"
            fill="currentColor"
          />
          <path
            d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z"
            opacity=".5"
            fill="currentColor"
          />
          <path
            d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z"
            fill="currentColor"
          />
        </svg>
      </div>
    </section>
  )
}

export default Hero
