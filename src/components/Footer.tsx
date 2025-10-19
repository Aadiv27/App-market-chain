import React from 'react';
import { Link } from 'react-router-dom';
import { Truck, Phone, Mail, MapPin, MessageCircle } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-[#0D1B2A] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="bg-gradient-to-r from-[#5DAE49] to-[#FFC947] p-2 rounded-lg">
                <Truck className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold">MarketChain</h2>
                <p className="text-sm text-gray-300">Aasani se order, bharoshe se delivery</p>
              </div>
            </div>
            <p className="text-gray-300 mb-4 max-w-md">
              India's rural-first logistics network, enabling seamless commerce between 
              local retailers, wholesalers, and transporters across tier-3 cities.
            </p>
            <div className="flex items-center space-x-2 text-sm text-gray-300">
              <MapPin className="h-4 w-4" />
              <span>Ranchi, Jharkhand</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/about" className="text-gray-300 hover:text-[#5DAE49] transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="text-gray-300 hover:text-[#5DAE49] transition-colors">Contact</Link></li>
              <li><Link to="/privacy" className="text-gray-300 hover:text-[#5DAE49] transition-colors">Privacy Policy</Link></li>
              <li><Link to="/faq" className="text-gray-300 hover:text-[#5DAE49] transition-colors">FAQ</Link></li>
              <li><Link to="/terms" className="text-gray-300 hover:text-[#5DAE49] transition-colors">Terms of Service</Link></li>
            </ul>
          </div>

          {/* Contact & Social */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Get in Touch</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-sm text-gray-300">
                <Phone className="h-4 w-4" />
                <span>7480891950</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-300">
                <Mail className="h-4 w-4" />
                <span>aadivrajpandey123@gmail.com</span>
              </div>
            </div>
            
            <div className="mt-6">
              <h4 className="text-sm font-semibold mb-3">Follow Us</h4>
              <div className="flex space-x-3">
                <a href="#" className="bg-green-600 p-2 rounded-lg hover:bg-green-700 transition-colors">
                  <MessageCircle className="h-4 w-4" />
                </a>
                <a href="#" className="bg-blue-600 p-2 rounded-lg hover:bg-blue-700 transition-colors">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>&copy; 2025 MarketChain. All rights reserved. Made with ❤️ for Rural India.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;