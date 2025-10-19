import React from 'react';
import { motion } from 'framer-motion';
import { Truck, Store, BarChart3 } from 'lucide-react';
import { teamMembers } from '../data/mockData';

const AboutPage = () => {
  const visionCards = [
    {
      icon: Truck,
      title: "Efficient Rural Delivery",
      description: "AI-powered route optimization reducing delivery time by 40%"
    },
    {
      icon: Store,
      title: "Localized Product Access",
      description: "Connect rural retailers with verified wholesalers in their region"
    },
    {
      icon: BarChart3,
      title: "Data-driven Transparency",
      description: "Real-time tracking and analytics for informed business decisions"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#FAF3E0] to-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl md:text-6xl font-bold text-[#0D1B2A] mb-6">
              Empowering Rural Commerce
            </h1>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              MarketChain is India's rural-first logistics network, enabling seamless commerce 
              between local retailers, wholesalers, and transporters. We bridge the gap between 
              urban supply chains and rural demand with technology-driven solutions.
            </p>
          </motion.div>

          {/* Vision Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            {visionCards.map((card, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="bg-white rounded-2xl shadow-lg p-8 text-center hover:shadow-xl transition-all duration-300"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-[#FFC947] to-[#5DAE49] rounded-xl flex items-center justify-center mx-auto mb-6">
                  <card.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-[#0D1B2A] mb-4">{card.title}</h3>
                <p className="text-gray-600">{card.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-[#0D1B2A] mb-4">
              Meet Our Team
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Experienced professionals dedicated to transforming rural commerce
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="bg-gradient-to-br from-[#FAF3E0] to-white rounded-2xl p-8 text-center shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <img
                  src={member.avatar}
                  alt={member.name}
                  className="w-24 h-24 rounded-full mx-auto mb-6 object-cover border-4 border-white shadow-lg"
                />
                <h3 className="text-xl font-bold text-[#0D1B2A] mb-2">{member.name}</h3>
                <p className="text-[#5DAE49] font-semibold mb-4">{member.role}</p>
                <p className="text-gray-600 text-sm">{member.bio}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Rural Section */}
      <section className="py-20 bg-[#0D1B2A] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Why Focus on Rural India?
              </h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-[#FFC947] mb-2">Underserved Markets</h3>
                  <p className="text-gray-300">
                    Tier-3 cities and rural areas represent 70% of India's population but lack 
                    efficient supply chain infrastructure.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-[#5DAE49] mb-2">Technology Gap</h3>
                  <p className="text-gray-300">
                    Limited access to digital platforms, language barriers, and poor connectivity 
                    create unique challenges requiring specialized solutions.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-[#FFC947] mb-2">Trust Building</h3>
                  <p className="text-gray-300">
                    KYC verification, multilingual support, and offline-first design build 
                    the trust needed for successful rural commerce.
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="grid grid-cols-2 gap-6"
            >
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
                <div className="text-3xl font-bold text-[#FFC947] mb-2">70%</div>
                <div className="text-sm text-gray-300">Rural Population</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
                <div className="text-3xl font-bold text-[#5DAE49] mb-2">50+</div>
                <div className="text-sm text-gray-300">Cities Covered</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
                <div className="text-3xl font-bold text-[#FFC947] mb-2">10+</div>
                <div className="text-sm text-gray-300">Languages</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
                <div className="text-3xl font-bold text-[#5DAE49] mb-2">24/7</div>
                <div className="text-sm text-gray-300">Support</div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="py-20 bg-gradient-to-br from-[#5DAE49] to-[#FFC947] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Our Mission</h2>
            <p className="text-xl leading-relaxed opacity-90">
              To democratize rural commerce by providing technology-enabled logistics solutions 
              that connect every village store to the global supply chain, ensuring prosperity 
              reaches every corner of India.
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;