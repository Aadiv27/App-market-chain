import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Globe, Wifi, Star, Users, Clock } from 'lucide-react';

const WhyMarketChain = () => {
  const benefits = [
    {
      icon: Shield,
      title: "Trust Layer",
      description: "KYC-verified users, reviews, and ratings ensure safe transactions",
      color: "bg-[#5DAE49]"
    },
    {
      icon: Globe,
      title: "Regional Support",
      description: "10+ Indian languages with voice input for easy ordering",
      color: "bg-[#FFC947]"
    },
    {
      icon: Wifi,
      title: "Offline Support",
      description: "Sync orders even in low-network zones across rural areas",
      color: "bg-[#5DAE49]"
    }
  ];

  const stats = [
    { value: "94.2%", label: "Delivery Success Rate", icon: Clock },
    { value: "4.8/5", label: "Average Rating", icon: Star },
    { value: "24/7", label: "Customer Support", icon: Users }
  ];

  return (
    <section className="py-20 bg-[#0D1B2A] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Why Choose MarketChain?
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Built specifically for rural India's unique challenges and opportunities
          </p>
        </div>

        {/* Main Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className={`w-20 h-20 ${benefit.color} rounded-2xl flex items-center justify-center mx-auto mb-6`}>
                <benefit.icon className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-4">{benefit.title}</h3>
              <p className="text-gray-300 leading-relaxed">{benefit.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          viewport={{ once: true }}
          className="bg-white/10 backdrop-blur-sm rounded-2xl p-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex items-center justify-center mb-4">
                  <stat.icon className="h-6 w-6 text-[#FFC947] mr-2" />
                  <div className="text-3xl font-bold text-[#FFC947]">{stat.value}</div>
                </div>
                <div className="text-gray-300">{stat.label}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Additional Features */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/5 rounded-lg p-4">
              <div className="text-lg font-bold text-[#5DAE49]">AI-Powered</div>
              <div className="text-sm text-gray-300">Smart Routing</div>
            </div>
            <div className="bg-white/5 rounded-lg p-4">
              <div className="text-lg font-bold text-[#FFC947]">Voice Input</div>
              <div className="text-sm text-gray-300">Hindi/English</div>
            </div>
            <div className="bg-white/5 rounded-lg p-4">
              <div className="text-lg font-bold text-[#5DAE49]">COD Available</div>
              <div className="text-sm text-gray-300">No Prepayment</div>
            </div>
            <div className="bg-white/5 rounded-lg p-4">
              <div className="text-lg font-bold text-[#FFC947]">Real-time</div>
              <div className="text-sm text-gray-300">Order Tracking</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default WhyMarketChain;