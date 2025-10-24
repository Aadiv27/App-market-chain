import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Truck, BarChart3, LogOut, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const location = useLocation();
  const { user, isAuthenticated, logout, switchRole } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/', label: 'Home', icon: null },
    { path: '/about', label: 'About', icon: null },
    { path: '/contact', label: 'Contact', icon: null },
    { path: '/dashboard', label: 'Dashboard', icon: BarChart3 }
  ];

  return (
    <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="bg-gradient-to-r from-[#5DAE49] to-[#FFC947] p-2 rounded-lg">
              <Truck className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#0D1B2A]">MarketChain</h1>
              <p className="text-xs text-gray-600 leading-none">Aasani se order, bharoshe se delivery</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive(item.path)
                    ? 'text-[#5DAE49] bg-green-50'
                    : 'text-gray-700 hover:text-[#5DAE49] hover:bg-green-50'
                }`}
              >
                {item.icon && <item.icon className="h-4 w-4" />}
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* User Menu or CTA Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            {isAuthenticated && user ? (
              <div className="flex items-center space-x-4">
                {/* Role Switcher */}
                {user.roles.length > 1 && (
                  <div className="relative">
                    <button
                      onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                      className="flex items-center space-x-2 px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <span className="text-sm font-medium">Act as: {user.activeRole.type}</span>
                      <ChevronDown className="h-4 w-4" />
                    </button>
                    {showRoleDropdown && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                        {user.roles.map((role) => (
                          <button
                            key={role.type}
                            onClick={() => {
                              switchRole(role.type);
                              setShowRoleDropdown(false);
                            }}
                            className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${
                              user.activeRole.type === role.type ? 'bg-green-50 text-[#5DAE49]' : 'text-gray-700'
                            }`}
                          >
                            {role.type.charAt(0).toUpperCase() + role.type.slice(1).replace('_', ' ')}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                
                {/* User Profile */}
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-[#5DAE49] rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="text-sm">
                    <div className="font-medium text-gray-900">{user.name}</div>
                    <div className="text-gray-500 capitalize">{user.activeRole.type.replace('_', ' ')}</div>
                  </div>
                </div>
                
                {/* KYC Status */}
                {user.kycStatus === 'pending' && (
                  <div className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                    ⚠️ KYC Pending
                  </div>
                )}
                
                {/* Logout */}
                <button
                  onClick={logout}
                  className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                  title="Logout"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 border border-[#5DAE49] rounded-lg text-[#0D1B2A] font-semibold hover:bg-[#5DAE49] hover:text-white transition"
                >
                  Login
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-md text-gray-700 hover:text-[#5DAE49] hover:bg-green-50"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-gray-100"
          >
            <div className="px-4 py-2 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium ${
                    isActive(item.path)
                      ? 'text-[#5DAE49] bg-green-50'
                      : 'text-gray-700 hover:text-[#5DAE49] hover:bg-green-50'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.icon && <item.icon className="h-4 w-4" />}
                  <span>{item.label}</span>
                </Link>
              ))}
              <div className="pt-4 space-y-2">
                <Link
                  to="/join-retailer"
                  className="block w-full px-3 py-2 text-center text-sm font-medium text-[#5DAE49] border border-[#5DAE49] rounded-lg hover:bg-[#5DAE49] hover:text-white transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Join as Retailer
                </Link>
                <Link
                  to="/join-vehicle"
                  className="block w-full px-3 py-2 text-center text-sm font-medium text-white bg-[#5DAE49] rounded-lg hover:bg-green-600 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Vehicle Owner
                </Link>
                <Link
                  to="/join-wholesaler"
                  className="block w-full px-3 py-2 text-center text-sm font-medium text-[#FFC947] border border-[#FFC947] rounded-lg hover:bg-[#FFC947] hover:text-white transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Join as Wholesaler
                </Link>
                <Link
                  to="/join-admin"
                  className="block w-full px-3 py-2 text-center text-sm font-medium text-[#E74C3C] border border-[#E74C3C] rounded-lg hover:bg-[#E74C3C] hover:text-white transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Join as Admin
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;