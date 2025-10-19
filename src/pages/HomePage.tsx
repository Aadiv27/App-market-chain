import React from 'react';
import HeroSection from '../components/HeroSection';

const HomePage = () => {
  return (
    <div>
      <HeroSection />
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-[#0D1B2A] text-center mb-8">
            MarketChain - Rural Commerce Platform
          </h2>
          <p className="text-xl text-gray-600 text-center max-w-2xl mx-auto">
            Connecting local retailers, wholesalers, and transporters with AI-powered logistics.
          </p>
          <div className="mt-8 text-center">
            <a 
              href="/ai-features" 
              className="inline-block bg-[#5DAE49] text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors"
            >
              Try AI Features
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;