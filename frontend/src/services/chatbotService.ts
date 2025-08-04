import { Message } from '../components/Chatbot'

export interface ChatbotResponse {
  text: string
  type?: 'text' | 'options' | 'appointment' | 'donor'
  options?: string[]
  metadata?: any
}

export class ChatbotService {
  private static instance: ChatbotService
  private conversationContext: Map<string, any> = new Map()

  static getInstance(): ChatbotService {
    if (!ChatbotService.instance) {
      ChatbotService.instance = new ChatbotService()
    }
    return ChatbotService.instance
  }

  generateResponse(userInput: string, conversationId: string = 'default'): ChatbotResponse {
    const input = userInput.toLowerCase().trim()
    const context = this.conversationContext.get(conversationId) || {}

    // Emergency keywords - highest priority
    if (this.isEmergency(input)) {
      return this.handleEmergency(input)
    }

    // Main categories
    if (this.isThalassemiaFAQ(input)) {
      return this.handleThalassemiaFAQ(input, context)
    }

    if (this.isDietAndCare(input)) {
      return this.handleDietAndCare(input, context)
    }

    if (this.isAppointmentBooking(input)) {
      return this.handleAppointmentBooking(input, context)
    }

    if (this.isDonorSupport(input)) {
      return this.handleDonorSupport(input, context)
    }

    // Specific detailed responses
    if (this.isSpecificQuery(input)) {
      return this.handleSpecificQuery(input, context)
    }

    // Default fallback
    return this.getDefaultResponse()
  }

  private isEmergency(input: string): boolean {
    const emergencyKeywords = ['emergency', 'urgent', 'help', 'crisis', 'immediate', 'now', 'asap']
    return emergencyKeywords.some(keyword => input.includes(keyword))
  }

  private isThalassemiaFAQ(input: string): boolean {
    const faqKeywords = ['thalassemia', 'faq', 'what is', 'types', 'symptoms', 'diagnosis', 'treatment']
    return faqKeywords.some(keyword => input.includes(keyword)) || input === 'thalassemia faqs'
  }

  private isDietAndCare(input: string): boolean {
    const dietKeywords = ['diet', 'care', 'food', 'nutrition', 'meal', 'eat', 'avoid', 'vitamin']
    return dietKeywords.some(keyword => input.includes(keyword)) || input === 'diet & care'
  }

  private isAppointmentBooking(input: string): boolean {
    const appointmentKeywords = ['appointment', 'book', 'schedule', 'transfusion', 'doctor', 'consultation']
    return appointmentKeywords.some(keyword => input.includes(keyword)) || input === 'book appointment'
  }

  private isDonorSupport(input: string): boolean {
    const donorKeywords = ['donor', 'support', 'blood', 'find', 'compatible', 'availability']
    return donorKeywords.some(keyword => input.includes(keyword)) || input === 'donor support'
  }

  private isSpecificQuery(input: string): boolean {
    const specificQueries = [
      'what is thalassemia', 'types of thalassemia', 'symptoms', 'treatment options',
      'meal plans', 'medication reminders', 'exercise guidelines',
      'regular transfusion', 'doctor consultation', 'lab tests',
      'find compatible donors', 'emergency blood request'
    ]
    return specificQueries.some(query => input.includes(query))
  }

  private handleEmergency(input: string): ChatbotResponse {
    return {
      text: "🚨 **EMERGENCY BLOOD REQUEST ACTIVATED**\n\n📍 Locating nearest blood banks...\n🩸 Checking compatible donors...\n📞 Alerting emergency network...\n\n**Immediate Actions:**\n1. Contact: +91-1234-567890 (24/7 Helpline)\n2. Nearest Hospital: City General Hospital (2.3 km)\n3. Blood Bank: Available O- units: 12\n\n🚑 Emergency services have been notified. Help is on the way!\n\nStay calm and follow medical guidance.",
      type: 'text'
    }
  }

  private handleThalassemiaFAQ(input: string, context: any): ChatbotResponse {
    if (input.includes('what is thalassemia')) {
      return {
        text: "🩸 **Thalassemia** is an inherited blood disorder that affects the body's ability to produce hemoglobin and red blood cells.\n\n**Key Points:**\n• Genetic condition passed from parents\n• Causes anemia (low red blood cell count)\n• Requires regular blood transfusions\n• More common in Mediterranean, Middle Eastern, and Asian populations\n\n**Types:** Alpha and Beta Thalassemia, with varying severity levels.\n\nWould you like to know about treatment options or symptoms?",
        type: 'options',
        options: ['Treatment Options', 'Symptoms & Diagnosis', 'Diet & Care']
      }
    }

    if (input.includes('types of thalassemia')) {
      return {
        text: "🔬 **Types of Thalassemia:**\n\n**Alpha Thalassemia:**\n• Silent carrier (1 gene affected)\n• Alpha thalassemia trait (2 genes)\n• Hemoglobin H disease (3 genes)\n• Alpha thalassemia major (4 genes)\n\n**Beta Thalassemia:**\n• Beta thalassemia minor (trait)\n• Beta thalassemia intermedia\n• Beta thalassemia major (Cooley's anemia)\n\n**Severity varies** from no symptoms to life-threatening anemia requiring regular transfusions.",
        type: 'options',
        options: ['Symptoms & Diagnosis', 'Treatment Options', 'Living with Thalassemia']
      }
    }

    if (input.includes('symptoms') || input.includes('diagnosis')) {
      return {
        text: "🔍 **Thalassemia Symptoms & Diagnosis:**\n\n**Common Symptoms:**\n• Fatigue and weakness\n• Pale skin and yellowing (jaundice)\n• Slow growth in children\n• Bone deformities\n• Enlarged spleen\n\n**Diagnosis Methods:**\n• Complete blood count (CBC)\n• Hemoglobin electrophoresis\n• Genetic testing\n• Family history review\n\n**Early diagnosis** is crucial for proper management.",
        type: 'options',
        options: ['Treatment Options', 'Diet & Care', 'Living with Thalassemia']
      }
    }

    if (input.includes('treatment')) {
      return {
        text: "💊 **Thalassemia Treatment Options:**\n\n**Regular Treatments:**\n• Blood transfusions (every 2-4 weeks)\n• Iron chelation therapy\n• Folic acid supplements\n• Bone marrow transplant (curative)\n\n**Supportive Care:**\n• Regular monitoring\n• Vaccination against infections\n• Dental and cardiac care\n• Psychological support\n\n**Gene therapy** is an emerging treatment option.",
        type: 'options',
        options: ['Diet & Care', 'Book Appointment', 'Living with Thalassemia']
      }
    }

    // Default FAQ response
    return {
      text: "Here are some common Thalassemia questions:\n\n❓ What is Thalassemia?\n❓ Types of Thalassemia\n❓ Symptoms & Diagnosis\n❓ Treatment Options\n❓ Living with Thalassemia\n\nWhich topic would you like to know more about?",
      type: 'options',
      options: ['What is Thalassemia?', 'Types of Thalassemia', 'Symptoms & Diagnosis', 'Treatment Options', 'Living with Thalassemia']
    }
  }

  private handleDietAndCare(input: string, context: any): ChatbotResponse {
    if (input.includes('meal plans') || input.includes('meal')) {
      return {
        text: "🍽️ **Sample Meal Plans for Thalassemia:**\n\n**Breakfast:**\n• Oatmeal with berries and nuts\n• Whole grain toast with avocado\n• Green tea or herbal tea\n\n**Lunch:**\n• Grilled chicken with quinoa\n• Mixed vegetable salad\n• Citrus fruit for Vitamin C\n\n**Dinner:**\n• Baked fish with sweet potato\n• Steamed broccoli\n• Low-iron leafy greens\n\n**Snacks:** Nuts, yogurt, fruits (avoid iron-fortified foods)",
        type: 'options',
        options: ['Medication Reminders', 'Exercise Guidelines', 'Foods to Avoid']
      }
    }

    if (input.includes('medication') || input.includes('reminder')) {
      return {
        text: "💊 **Medication Reminders & Tips:**\n\n**Iron Chelation Therapy:**\n• Take Deferasirox with food\n• Monitor kidney function regularly\n• Report side effects immediately\n\n**Folic Acid:**\n• Take daily as prescribed\n• Helps with red blood cell production\n\n**Reminders:**\n• Set phone alarms\n• Use pill organizers\n• Keep medication diary\n• Never skip doses",
        type: 'options',
        options: ['Exercise Guidelines', 'Emergency Care', 'Book Appointment']
      }
    }

    if (input.includes('exercise') || input.includes('activity')) {
      return {
        text: "🏃‍♂️ **Exercise Guidelines for Thalassemia:**\n\n**Recommended Activities:**\n• Light walking (30 min daily)\n• Swimming (low impact)\n• Yoga and stretching\n• Breathing exercises\n\n**Precautions:**\n• Avoid high-intensity sports\n• Monitor heart rate\n• Stay hydrated\n• Rest when tired\n\n**Benefits:** Improves circulation, reduces fatigue, strengthens bones.",
        type: 'options',
        options: ['Meal Plans', 'Emergency Care', 'Book Appointment']
      }
    }

    // Default diet and care response
    return {
      text: "🥗 **Diet & Care Guidelines for Thalassemia:**\n\n**Dietary Recommendations:**\n• Avoid iron-rich foods (red meat, spinach)\n• Increase Vitamin C (citrus fruits, tomatoes)\n• Calcium-rich foods (dairy, leafy greens)\n• Stay hydrated\n\n**Care Tips:**\n• Take prescribed medications regularly\n• Attend all medical appointments\n• Monitor for infections\n• Get adequate rest\n\nWould you like specific meal plans or medication reminders?",
      type: 'options',
      options: ['Meal Plans', 'Medication Reminders', 'Exercise Guidelines', 'Emergency Care']
    }
  }

  private handleAppointmentBooking(input: string, context: any): ChatbotResponse {
    if (input.includes('regular transfusion') || input.includes('transfusion')) {
      return {
        text: "🩸 **Regular Transfusion Appointment**\n\n📅 Available slots this week:\n• Monday 10:00 AM - Blood Bank A\n• Wednesday 2:00 PM - Blood Bank B\n• Friday 9:00 AM - Blood Bank A\n\n⚠️ Please bring:\n• ID and insurance card\n• Previous transfusion records\n• Current medication list\n\nWould you like me to book one of these slots?",
        type: 'options',
        options: ['Monday 10:00 AM', 'Wednesday 2:00 PM', 'Friday 9:00 AM', 'See More Slots']
      }
    }

    if (input.includes('doctor consultation') || input.includes('doctor')) {
      return {
        text: "👨‍⚕️ **Doctor Consultation Booking**\n\n📅 Available appointments:\n• Dr. Smith (Hematologist) - Tomorrow 3:00 PM\n• Dr. Patel (Pediatric Hematologist) - Thursday 11:00 AM\n• Dr. Johnson (Thalassemia Specialist) - Friday 4:00 PM\n\n💡 **Consultation includes:**\n• Health assessment\n• Treatment plan review\n• Lab result discussion\n• Medication adjustments",
        type: 'options',
        options: ['Dr. Smith - Tomorrow 3:00 PM', 'Dr. Patel - Thursday 11:00 AM', 'Dr. Johnson - Friday 4:00 PM', 'See All Doctors']
      }
    }

    if (input.includes('lab tests') || input.includes('tests')) {
      return {
        text: "🧪 **Lab Tests Scheduling**\n\n📋 **Required Tests:**\n• Complete Blood Count (CBC)\n• Iron studies (Ferritin, TIBC)\n• Liver function tests\n• Heart function (Echo)\n\n📅 **Available slots:**\n• Tomorrow 8:00 AM (Fasting required)\n• Thursday 10:00 AM\n• Friday 2:00 PM\n\n⏰ **Preparation:** Fast for 12 hours before iron studies",
        type: 'options',
        options: ['Tomorrow 8:00 AM', 'Thursday 10:00 AM', 'Friday 2:00 PM', 'Test Information']
      }
    }

    // Default appointment booking response
    return {
      text: "📅 **Book Your Appointment**\n\nI can help you schedule:\n\n🏥 Regular Transfusion\n👨‍⚕️ Doctor Consultation\n🧪 Lab Tests\n💉 Iron Chelation Therapy\n\nWhich type of appointment would you like to book?",
      type: 'appointment',
      options: ['Regular Transfusion', 'Doctor Consultation', 'Lab Tests', 'Iron Chelation Therapy']
    }
  }

  private handleDonorSupport(input: string, context: any): ChatbotResponse {
    if (input.includes('find compatible donors') || input.includes('compatible')) {
      return {
        text: "🔍 **Finding Compatible Donors**\n\n🩸 **Your Blood Type:** A+ (from profile)\n\n**Compatible Donors Found:**\n• 23 A+ donors within 10km\n• 8 O+ donors within 15km\n• 3 O- universal donors within 20km\n\n**Next Steps:**\n1. Contact nearest donors\n2. Schedule compatibility tests\n3. Arrange donation appointment\n\n📞 **Emergency Contact:** Available 24/7",
        type: 'options',
        options: ['Contact Nearest Donors', 'Schedule Tests', 'Emergency Request', 'Donor Requirements']
      }
    }

    if (input.includes('emergency blood request') || input.includes('emergency request')) {
      return this.handleEmergency(input)
    }

    if (input.includes('donor availability') || input.includes('availability')) {
      return {
        text: "📊 **Current Donor Availability Status**\n\n🟢 **High Availability:**\n• O+ donors: 45 available\n• A+ donors: 32 available\n\n🟡 **Medium Availability:**\n• B+ donors: 18 available\n• AB+ donors: 12 available\n\n🔴 **Low Availability:**\n• O- donors: 8 available\n• AB- donors: 3 available\n\n📈 **Trend:** Availability increases on weekends",
        type: 'options',
        options: ['Find Compatible Donors', 'Register as Donor', 'Emergency Request', 'Donor Alerts']
      }
    }

    // Default donor support response
    return {
      text: "🤝 **Live Donor Support**\n\nI can help you with:\n\n🔍 Find Compatible Donors\n📞 Contact Donor Network\n🚨 Emergency Blood Request\n📊 Donor Availability Status\n\nWhat do you need assistance with?",
      type: 'donor',
      options: ['Find Compatible Donors', 'Emergency Blood Request', 'Donor Availability', 'Contact Donor Network']
    }
  }

  private handleSpecificQuery(input: string, context: any): ChatbotResponse {
    // Handle specific appointment time selections
    if (input.includes('monday 10:00 am') || input.includes('wednesday 2:00 pm') || input.includes('friday 9:00 am')) {
      return {
        text: "✅ **Appointment Confirmed!**\n\n📅 **Details:**\n• Date & Time: " + input.charAt(0).toUpperCase() + input.slice(1) + "\n• Location: Blood Bank A\n• Duration: 3-4 hours\n\n📧 **Confirmation sent to your email**\n📱 **SMS reminder 24 hours before**\n\n⚠️ **Important reminders:**\n• Eat well before coming\n• Bring all required documents\n• Arrive 15 minutes early",
        type: 'options',
        options: ['Add to Calendar', 'Set Reminder', 'View Directions', 'Cancel Appointment']
      }
    }

    return this.getDefaultResponse()
  }

  private getDefaultResponse(): ChatbotResponse {
    return {
      text: "I'm here to help with:\n🩸 Thalassemia information\n🥗 Diet and care guidance\n📅 Appointment scheduling\n🤝 Donor support\n\nCould you please choose one of these topics or ask a more specific question?",
      type: 'options',
      options: ['Thalassemia FAQs', 'Diet & Care', 'Book Appointment', 'Donor Support']
    }
  }

  setContext(conversationId: string, key: string, value: any): void {
    const context = this.conversationContext.get(conversationId) || {}
    context[key] = value
    this.conversationContext.set(conversationId, context)
  }

  getContext(conversationId: string, key: string): any {
    const context = this.conversationContext.get(conversationId) || {}
    return context[key]
  }
}

export default ChatbotService.getInstance()
