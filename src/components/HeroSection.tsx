import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Truck, Store, Package } from 'lucide-react';

const HeroSection = () => {
  return (
    <section className="relative bg-gradient-to-br from-[#FAF3E0] to-white overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-20 h-20 rounded-full bg-[#5DAE49]"></div>
        <div className="absolute top-32 right-20 w-16 h-16 rounded-full bg-[#FFC947]"></div>
        <div className="absolute bottom-20 left-1/4 w-12 h-12 rounded-full bg-[#5DAE49]"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <div>
              <h1 className="text-4xl md:text-6xl font-bold text-[#0D1B2A] leading-tight">
                Smart Supply Chains
                <span className="text-[#5DAE49]"> for Rural India</span>
              </h1>
              <p className="text-xl text-gray-600 mt-6 max-w-lg">
                Connecting local retailers, wholesalers, and transporters with ease. 
                Experience seamless commerce with AI-powered logistics.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/join-retailer"
                className="group inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-[#5DAE49] rounded-xl hover:bg-green-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                Join as Retailer
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to="/join-vehicle"
                className="group inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-[#5DAE49] border-2 border-[#5DAE49] rounded-xl hover:bg-[#5DAE49] hover:text-white transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                Join as Vehicle Owner
                <Truck className="ml-2 h-5 w-5" />
              </Link>
            </div>
            
            {/* Additional Join Options */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link
                to="/join-wholesaler"
                className="group inline-flex items-center justify-center px-6 py-3 text-base font-semibold text-[#FFC947] border-2 border-[#FFC947] rounded-xl hover:bg-[#FFC947] hover:text-white transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                Join as Wholesaler
                <Package className="ml-2 h-4 w-4" />
              </Link>
              <Link
                to="/join-admin"
                className="group inline-flex items-center justify-center px-6 py-3 text-base font-semibold text-[#E74C3C] border-2 border-[#E74C3C] rounded-xl hover:bg-[#E74C3C] hover:text-white transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                Join as Admin
                <Store className="ml-2 h-4 w-4" />
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="flex items-center space-x-8 pt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-[#0D1B2A]">1000+</div>
                <div className="text-sm text-gray-600">Retailers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-[#0D1B2A]">200+</div>
                <div className="text-sm text-gray-600">Vehicles</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-[#0D1B2A]">50+</div>
                <div className="text-sm text-gray-600">Cities</div>
              </div>
            </div>
          </motion.div>

          {/* Right Visual */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="relative bg-white rounded-2xl shadow-2xl p-8">
              {/* Hero Image Placeholder */}
              <div className="aspect-video bg-gradient-to-br from-[#5DAE49] to-[#FFC947] rounded-xl flex items-center justify-center">
                <div className="grid grid-cols-3 gap-4 items-center">
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 text-center">
                    <Store className="h-8 w-8 text-white mx-auto mb-2" />
                    <div className="text-white text-sm font-medium">Rural Shop</div>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 text-center">
                    <Truck className="h-8 w-8 text-white mx-auto mb-2" />
                    <div className="text-white text-sm font-medium">Delivery Van</div>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 text-center">
                    <Package className="h-8 w-8 text-white mx-auto mb-2" />
                    <div className="text-white text-sm font-medium">Warehouse</div>
                  </div>
                </div>
              </div>
              
              {/* Floating Cards */}
              <motion.div
                animate={{ y: [-10, 10, -10] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-4 -right-4 bg-[#FFC947] text-[#0D1B2A] px-4 py-2 rounded-xl shadow-lg font-semibold text-sm"
              >
                24/7 Support
              </motion.div>
              <motion.div
                animate={{ y: [10, -10, 10] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                className="absolute -bottom-4 -left-4 bg-[#5DAE49] text-white px-4 py-2 rounded-xl shadow-lg font-semibold text-sm"
              >
                AI-Powered
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;