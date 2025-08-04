import React from 'react'
import { motion } from 'framer-motion'
import { 
  Activity, 
  Mail, 
  Phone, 
  MapPin, 
  Github, 
  Twitter, 
  Linkedin,
  Heart,
  ExternalLink
} from 'lucide-react'
import { cn } from '../utils/cn'

interface FooterProps {
  className?: string
}

const Footer: React.FC<FooterProps> = ({ className }) => {
  const footerLinks = {
    product: [
      { name: 'Features', href: '#features' },
      { name: 'Demo', href: '/demo' },
      { name: 'Dashboard', href: '/dashboard' },
      { name: 'AI Predictions', href: '/ai-predictions' },
      { name: 'API Documentation', href: '#api' },
    ],
    company: [
      { name: 'About Us', href: '#about' },
      { name: 'Team', href: '#team' },
      { name: 'Careers', href: '#careers' },
      { name: 'Press', href: '#press' },
      { name: 'Contact', href: '#contact' },
    ],
    resources: [
      { name: 'Blog', href: '#blog' },
      { name: 'Help Center', href: '#help' },
      { name: 'Privacy Policy', href: '#privacy' },
      { name: 'Terms of Service', href: '#terms' },
      { name: 'Security', href: '#security' },
    ],
    community: [
      { name: 'Blood Warriors', href: '#warriors', external: true },
      { name: 'Healthcare Partners', href: '#partners' },
      { name: 'Developer Community', href: '#developers' },
      { name: 'Research Papers', href: '#research' },
      { name: 'Open Source', href: '#opensource' },
    ]
  }

  const socialLinks = [
    { name: 'GitHub', icon: Github, href: '#github' },
    { name: 'Twitter', icon: Twitter, href: '#twitter' },
    { name: 'LinkedIn', icon: Linkedin, href: '#linkedin' },
  ]

  return (
    <footer className={cn('bg-secondary-900 text-white', className)}>
      <div className="max-container container-padding">
        {/* Main Footer Content */}
        <div className="py-16 md:py-20">
          <div className="grid lg:grid-cols-5 gap-12">
            {/* Brand Section */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="flex items-center space-x-3 mb-6"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-accent-500 to-accent-600 rounded-lg flex items-center justify-center">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="text-2xl font-bold">HemoLink AI</span>
                  <span className="text-sm text-secondary-400">Saving Lives Through Technology</span>
                </div>
              </motion.div>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-secondary-300 leading-relaxed mb-8 max-w-md"
              >
                Revolutionizing blood donation through AI-powered matching, connecting Thalassemia patients 
                with compatible donors worldwide. Built for the AI for Good Hackathon 2025.
              </motion.p>

              {/* Contact Info */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="space-y-3"
              >
                <div className="flex items-center space-x-3 text-secondary-300">
                  <Mail className="w-5 h-5 text-accent-400" />
                  <span>contact@hemolink.ai</span>
                </div>
                <div className="flex items-center space-x-3 text-secondary-300">
                  <Phone className="w-5 h-5 text-accent-400" />
                  <span>+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center space-x-3 text-secondary-300">
                  <MapPin className="w-5 h-5 text-accent-400" />
                  <span>Global Healthcare Initiative</span>
                </div>
              </motion.div>
            </div>

            {/* Links Sections */}
            <div className="lg:col-span-3 grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {Object.entries(footerLinks).map(([category, links], categoryIndex) => (
                <motion.div
                  key={category}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: categoryIndex * 0.1 }}
                >
                  <h3 className="font-semibold text-white mb-4 capitalize">
                    {category}
                  </h3>
                  <ul className="space-y-3">
                    {links.map((link) => (
                      <li key={link.name}>
                        <a
                          href={link.href}
                          className="text-secondary-300 hover:text-accent-400 transition-colors duration-200 flex items-center space-x-1 group"
                        >
                          <span>{link.name}</span>
                          {'external' in link && link.external && (
                            <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                          )}
                        </a>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-secondary-800 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            {/* Copyright */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="flex items-center space-x-2 text-secondary-400"
            >
              <span>© 2025 HemoLink AI. Made with</span>
              <Heart className="w-4 h-4 text-accent-400 fill-current" />
              <span>for humanity.</span>
            </motion.div>

            {/* Social Links */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="flex items-center space-x-4"
            >
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  className="w-10 h-10 bg-secondary-800 rounded-lg flex items-center justify-center text-secondary-400 hover:text-accent-400 hover:bg-secondary-700 transition-all duration-200 group"
                  aria-label={social.name}
                >
                  <social.icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </a>
              ))}
            </motion.div>

            {/* Hackathon Badge */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="flex items-center space-x-2 bg-primary-900/50 px-4 py-2 rounded-full"
            >
              <div className="w-2 h-2 bg-accent-400 rounded-full animate-pulse" />
              <span className="text-sm text-secondary-300">AI for Good 2025</span>
            </motion.div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
