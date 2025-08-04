import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Activity, Users, Brain, BarChart3, Stethoscope, MessageSquare } from 'lucide-react'
import { cn } from '../utils/cn'

interface NavigationProps {
  className?: string
}

const Navigation: React.FC<NavigationProps> = ({ className }) => {
  const [isOpen, setIsOpen] = useState(false)

  const navItems = [
    { name: 'Home', href: '/', icon: Activity },
    { name: 'Demo', href: '/demo', icon: Users },
    { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
    { name: 'Doctors', href: '/doctors', icon: Stethoscope },
    { name: 'AI Predictions', href: '/ai-predictions', icon: Brain },
  ]

  return (
    <nav className={cn('fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-secondary-100', className)}>
      <div className="max-container container-padding">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-3"
          >
            <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-accent-500 to-accent-600 rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl md:text-2xl font-bold text-secondary-900">
                HemoLink
              </span>
              <span className="text-xs text-secondary-500 -mt-1">AI Platform</span>
            </div>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item, index) => (
              <motion.a
                key={item.name}
                href={item.href}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center space-x-2 text-secondary-600 hover:text-primary-600 transition-colors duration-200 font-medium"
              >
                <item.icon className="w-4 h-4" />
                <span>{item.name}</span>
              </motion.a>
            ))}
          </div>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="hidden md:block"
          >
            <a
              href="/demo"
              className="btn btn-primary btn-md"
            >
              Get Started
            </a>
          </motion.div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-secondary-100 transition-colors"
          >
            {isOpen ? (
              <X className="w-6 h-6 text-secondary-600" />
            ) : (
              <Menu className="w-6 h-6 text-secondary-600" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-secondary-100"
          >
            <div className="container-padding py-4 space-y-4">
              {navItems.map((item, index) => (
                <motion.a
                  key={item.name}
                  href={item.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center space-x-3 text-secondary-600 hover:text-primary-600 transition-colors duration-200 font-medium py-2"
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </motion.a>
              ))}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: navItems.length * 0.1 }}
                className="pt-4 border-t border-secondary-100"
              >
                <a
                  href="/demo"
                  className="btn btn-primary btn-md w-full"
                  onClick={() => setIsOpen(false)}
                >
                  Get Started
                </a>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}

export default Navigation
