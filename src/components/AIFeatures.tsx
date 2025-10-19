import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Brain, Mic, Bell, ShoppingCart, MessageCircle } from 'lucide-react';

const AIFeatures = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isListening, setIsListening] = useState(false);

  const features = [
    {
      icon: Search,
      title: "Natural Language Product Discovery",
      description: "Search in Hindi/English with AI-powered results",
      color: "bg-[#5DAE49]",
      demo: "Show me cheapest 10kg flour"
    },
    {
      icon: Brain,
      title: "Predictive Inventory Suggestions",
      description: "AI alerts for restocking based on demand patterns",
      color: "bg-[#FFC947]",
      demo: "Low stock: Wheat 5kg – high demand nearby"
    },
    {
      icon: Mic,
      title: "Voice Input Support",
      description: "Speak your orders in local languages",
      color: "bg-[#5DAE49]",
      demo: "मुझे सरसों का तेल चाहिए"
    },
    {
      icon: Bell,
      title: "Smart Notifications",
      description: "Multi-channel alerts via WhatsApp, SMS, in-app",
      color: "bg-[#FFC947]",
      demo: "Driver will arrive in 15 minutes"
    },
    {
      icon: ShoppingCart,
      title: "Cart Abandonment Logic",
      description: "AI suggests alternatives for incomplete orders",
      color: "bg-[#5DAE49]",
      demo: "Need help completing your order?"
    }
  ];

  const simulateVoiceSearch = () => {
    setIsListening(true);
    setTimeout(() => {
      setSearchQuery("sabse accha mustard oil");
      setIsListening(false);
    }, 2000);
  };

  return (
    <section className="py-20 bg-gradient-to-br from-white to-[#FAF3E0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-[#0D1B2A] mb-4">
            AI-Powered Features
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Experience the future of rural commerce with intelligent automation
          </p>
        </motion.div>

        {/* Interactive Demo */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="bg-white rounded-2xl shadow-lg p-8 mb-12"
        >
          <h3 className="text-xl font-bold text-[#0D1B2A] mb-4 text-center">
            Try Natural Language Search
          </h3>
          <div className="flex items-center space-x-4 max-w-2xl mx-auto">
            <div className="flex-1 relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Type: 'Show me cheapest 10kg flour' or speak in Hindi"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5DAE49] focus:border-transparent"
              />
              <Search className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
            </div>
            <button
              onClick={simulateVoiceSearch}
              className={`p-3 rounded-lg transition-all duration-300 ${
                isListening 
                  ? 'bg-red-500 text-white animate-pulse' 
                  : 'bg-[#5DAE49] text-white hover:bg-green-600'
              }`}
            >
              <Mic className="h-5 w-5" />
            </button>
          </div>
          
          {searchQuery && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-4 bg-green-50 rounded-lg text-center"
            >
              <p className="text-[#5DAE49] font-medium">
                ✨ AI found 12 results for "{searchQuery}" in your area
              </p>
            </motion.div>
          )}
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300"
            >
              <div className={`w-12 h-12 ${feature.color} rounded-lg flex items-center justify-center mb-6`}>
                <feature.icon className="h-6 w-6 text-white" />
              </div>
              
              <h3 className="text-lg font-bold text-[#0D1B2A] mb-3">
                {feature.title}
              </h3>
              
              <p className="text-gray-600 mb-4">
                {feature.description}
              </p>
              
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-700 italic">
                  "{feature.demo}"
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Notification Channels */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          viewport={{ once: true }}
          className="mt-16 bg-[#0D1B2A] text-white rounded-2xl p-8"
        >
          <h3 className="text-2xl font-bold text-center mb-8">
            Multi-Channel Notifications
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="h-8 w-8" />
              </div>
              <h4 className="font-semibold mb-2">WhatsApp Business</h4>
              <p className="text-gray-300 text-sm">Order updates and customer support</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="h-8 w-8" />
              </div>
              <h4 className="font-semibold mb-2">SMS Alerts</h4>
              <p className="text-gray-300 text-sm">Critical delivery notifications</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-[#FFC947] rounded-full flex items-center justify-center mx-auto mb-4">
                <Bell className="h-8 w-8" />
              </div>
              <h4 className="font-semibold mb-2">In-App Notifications</h4>
              <p className="text-gray-300 text-sm">Real-time status updates</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default AIFeatures;