import React from 'react';
import { motion } from 'framer-motion';
import { UserCheck, Search, Truck } from 'lucide-react';

const HowItWorks = () => {
  const steps = [
    {
      icon: UserCheck,
      title: "Sign up & Complete KYC",
      description: "Quick verification with Aadhaar, PAN, or GST. Get your trust badge in minutes.",
      color: "bg-[#5DAE49]"
    },
    {
      icon: Search,
      title: "Browse & Order from Trusted Wholesalers",
      description: "AI-powered search in Hindi/English. Compare prices, read reviews, place bulk orders.",
      color: "bg-[#FFC947]"
    },
    {
      icon: Truck,
      title: "Track Delivery or Manage Routes",
      description: "Real-time tracking, route optimization, and milestone-based payments for drivers.",
      color: "bg-[#5DAE49]"
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-[#0D1B2A] mb-4">
            How MarketChain Works
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Simple 3-step process to transform your rural commerce experience
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              viewport={{ once: true }}
              className="relative"
            >
              {/* Connection Line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-gray-300 to-transparent z-0 transform translate-x-4"></div>
              )}
              
              <div className="relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 z-10">
                {/* Step Number */}
                <div className="absolute -top-4 -left-4 w-8 h-8 bg-[#0D1B2A] text-white rounded-full flex items-center justify-center font-bold text-sm">
                  {index + 1}
                </div>

                {/* Icon */}
                <div className={`w-16 h-16 ${step.color} rounded-xl flex items-center justify-center mb-6`}>
                  <step.icon className="h-8 w-8 text-white" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-[#0D1B2A] mb-4">
                  {step.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <div className="inline-flex items-center space-x-2 bg-[#FAF3E0] px-6 py-3 rounded-full">
            <span className="text-[#0D1B2A] font-medium">Ready to get started?</span>
            <button className="bg-[#5DAE49] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-600 transition-colors">
              Join Now
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorks;