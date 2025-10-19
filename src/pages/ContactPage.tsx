import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Clock, MessageCircle, Send } from 'lucide-react';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    role: 'retailer',
    message: '',
    region: '',
    language: 'english'
  });

  const [showTooltip, setShowTooltip] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Form submitted:', formData);
    alert('Message sent successfully! We will respond within 24 hours.');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const tooltips = {
    name: {
      english: "Enter your full name",
      hindi: "Apna pura naam yahan likhiye",
      bengali: "Apnar puro nam likhun",
      tamil: "Ungal muzhuvimaiaana peyarai eluthungal"
    },
    region: {
      english: "Your city or district",
      hindi: "Apna sheher ya zila batayiye",
      bengali: "Apnar shahar ba jela bolan",
      tamil: "Ungal nagaram athava mathilam"
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAF3E0] to-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-[#0D1B2A] mb-6">
            Contact Us
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Get in touch with our team. We're here to help you succeed in rural commerce.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white rounded-2xl shadow-lg p-8"
          >
            <h2 className="text-2xl font-bold text-[#0D1B2A] mb-8">Get in Touch</h2>
            
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-[#5DAE49] rounded-lg flex items-center justify-center flex-shrink-0">
                  <MapPin className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#0D1B2A] mb-1">Address</h3>
                  <p className="text-gray-600">Ranchi, Jharkhand</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-[#FFC947] rounded-lg flex items-center justify-center flex-shrink-0">
                  <Phone className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#0D1B2A] mb-1">Phone / WhatsApp</h3>
                  <p className="text-gray-600">7480891950</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-[#5DAE49] rounded-lg flex items-center justify-center flex-shrink-0">
                  <Mail className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#0D1B2A] mb-1">Email</h3>
                  <p className="text-gray-600">support@marketchain.in</p>
                </div>
              </div>
            </div>

            {/* Response Time */}
            <div className="mt-8 p-4 bg-gradient-to-r from-[#5DAE49]/10 to-[#FFC947]/10 rounded-xl">
              <div className="flex items-center space-x-2 text-[#0D1B2A]">
                <Clock className="h-5 w-5" />
                <span className="font-semibold">Response Time</span>
              </div>
              <p className="text-gray-600 mt-1">We usually respond within 24 hours.</p>
            </div>

            {/* WhatsApp Quick Contact */}
            <div className="mt-6">
              <a
                href="https://wa.me/917480891950"
                className="flex items-center justify-center space-x-2 w-full bg-green-600 text-white py-3 px-4 rounded-xl hover:bg-green-700 transition-colors"
              >
                <MessageCircle className="h-5 w-5" />
                <span>Quick WhatsApp</span>
              </a>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-8"
          >
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-[#0D1B2A]">Send us a Message</h2>
              
              {/* Language Toggle */}
              <select
                value={formData.language}
                onChange={handleInputChange}
                name="language"
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#5DAE49] focus:border-transparent"
              >
                <option value="english">English</option>
                <option value="hindi">हिंदी</option>
                <option value="bengali">বাংলা</option>
                <option value="tamil">தமிழ்</option>
              </select>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Full Name */}
              <div className="relative">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  onFocus={() => setShowTooltip('name')}
                  onBlur={() => setShowTooltip('')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5DAE49] focus:border-transparent transition-colors"
                  placeholder="Enter your full name"
                  required
                />
                {showTooltip === 'name' && (
                  <div className="absolute z-10 mt-1 p-2 bg-[#0D1B2A] text-white text-xs rounded-lg shadow-lg">
                    {tooltips.name[formData.language as keyof typeof tooltips.name]}
                  </div>
                )}
              </div>

              {/* Role */}
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                  Role
                </label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5DAE49] focus:border-transparent transition-colors"
                >
                  <option value="retailer">Retailer</option>
                  <option value="wholesaler">Wholesaler</option>
                  <option value="vehicle_owner">Vehicle Owner</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Region */}
              <div className="relative">
                <label htmlFor="region" className="block text-sm font-medium text-gray-700 mb-2">
                  Region
                </label>
                <input
                  type="text"
                  id="region"
                  name="region"
                  value={formData.region}
                  onChange={handleInputChange}
                  onFocus={() => setShowTooltip('region')}
                  onBlur={() => setShowTooltip('')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5DAE49] focus:border-transparent transition-colors"
                  placeholder="Your city or district"
                  required
                />
                {showTooltip === 'region' && (
                  <div className="absolute z-10 mt-1 p-2 bg-[#0D1B2A] text-white text-xs rounded-lg shadow-lg">
                    {tooltips.region[formData.language as keyof typeof tooltips.region]}
                  </div>
                )}
              </div>

              {/* Message */}
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5DAE49] focus:border-transparent transition-colors resize-none"
                  placeholder="Tell us how we can help you..."
                  required
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-[#5DAE49] to-[#FFC947] text-white py-4 px-6 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <Send className="h-5 w-5" />
                <span>Send Message</span>
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;