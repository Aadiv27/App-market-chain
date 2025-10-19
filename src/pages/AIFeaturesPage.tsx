import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bot, Mic, Volume2, Sparkles, Search, Brain, Languages, TestTube } from 'lucide-react';
import AISearchComponent from '../components/AISearchComponent';
import AITestComponent from '../components/AITestComponent';

const AIFeaturesPage = () => {
  const [activeTab, setActiveTab] = useState<'demo' | 'test'>('demo');
  
  const features = [
    {
      icon: Search,
      title: 'Natural Language Product Discovery',
      description: 'Search in Hindi/English with AI-powered results. Try "Show me cheapest 10kg flour" or "sabse sasta chawal dikhao"',
      example: '"Show me cheapest 10kg flour"'
    },
    {
      icon: Brain,
      title: 'Predictive Inventory Suggestions',
      description: 'AI alerts for restocking based on demand patterns and seasonal trends',
      example: 'AI suggests: "Restock rice - 15 retailers searched this week"'
    },
    {
      icon: Mic,
      title: 'Voice Input Support',
      description: 'Speak your orders in local languages. Perfect for busy shopkeepers',
      example: '"sabse sasta chawal" or "thanda cold drink"'
    }
  ];

  const demoQueries = [
    'sabse sasta chawal',
    'cheapest 10kg flour',
    'thanda cold drink',
    'fresh milk',
    'good quality oil',
    'bada packet sugar'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAF3E0] to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="bg-gradient-to-r from-[#5DAE49] to-[#FFC947] p-3 rounded-xl">
              <Bot className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-[#0D1B2A]">AI-Powered Features</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Experience the future of rural commerce with intelligent automation. 
            Our AI understands your language and helps you find the best products.
          </p>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-white rounded-2xl shadow-lg mb-12"
        >
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('demo')}
              className={`flex items-center space-x-2 px-6 py-4 font-medium transition-all duration-300 ${
                activeTab === 'demo'
                  ? 'text-[#5DAE49] border-b-2 border-[#5DAE49] bg-green-50'
                  : 'text-gray-600 hover:text-[#5DAE49]'
              }`}
            >
              <Search className="h-5 w-5" />
              <span>Try AI Search</span>
            </button>
            <button
              onClick={() => setActiveTab('test')}
              className={`flex items-center space-x-2 px-6 py-4 font-medium transition-all duration-300 ${
                activeTab === 'test'
                  ? 'text-[#5DAE49] border-b-2 border-[#5DAE49] bg-green-50'
                  : 'text-gray-600 hover:text-[#5DAE49]'
              }`}
            >
              <TestTube className="h-5 w-5" />
              <span>Test AI Functions</span>
            </button>
          </div>

          <div className="p-8">
            {activeTab === 'demo' && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-2xl font-bold text-[#0D1B2A] mb-6 flex items-center">
                  <Search className="h-6 w-6 mr-2 text-[#5DAE49]" />
                  Try Natural Language Search
                </h2>
                <AISearchComponent 
                  placeholder="Type: 'Show me cheapest 10kg flour' or speak in Hindi"
                  className="mb-6"
                />
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {demoQueries.map((query, index) => (
                    <motion.button
                      key={index}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-[#5DAE49] hover:text-white transition-all duration-300"
                    >
                      "{query}"
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'test' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <AITestComponent />
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-[#5DAE49] to-[#FFC947] rounded-xl flex items-center justify-center mb-4">
                <feature.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-[#0D1B2A] mb-3">{feature.title}</h3>
              <p className="text-gray-600 mb-4">{feature.description}</p>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-gray-700 font-medium">Example:</p>
                <p className="text-sm text-[#5DAE49] font-mono">{feature.example}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Voice Capabilities */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-gradient-to-r from-[#5DAE49] to-[#FFC947] rounded-2xl p-8 text-white"
        >
          <div className="flex items-center space-x-3 mb-6">
            <Mic className="h-8 w-8" />
            <h2 className="text-2xl font-bold">Voice Assistant</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Volume2 className="h-5 w-5 mr-2" />
                Voice Input
              </h3>
              <ul className="space-y-2 text-sm">
                <li>• Speak in Hindi, Hinglish, or English</li>
                <li>• Natural language processing</li>
                <li>• Regional dialect support</li>
                <li>• Real-time transcription</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Languages className="h-5 w-5 mr-2" />
                Voice Output
              </h3>
              <ul className="space-y-2 text-sm">
                <li>• Audio product descriptions</li>
                <li>• Price and availability announcements</li>
                <li>• Multi-language voice responses</li>
                <li>• Accessibility for all users</li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* How It Works */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="bg-white rounded-2xl shadow-lg p-8 mt-12"
        >
          <h2 className="text-2xl font-bold text-[#0D1B2A] mb-6 flex items-center">
            <Sparkles className="h-6 w-6 mr-2 text-[#5DAE49]" />
            How AI Works
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-[#5DAE49] rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-white font-bold">1</span>
              </div>
              <h3 className="font-semibold text-[#0D1B2A] mb-2">Input</h3>
              <p className="text-sm text-gray-600">Type or speak your query in any language</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-[#FFC947] rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-[#0D1B2A] font-bold">2</span>
              </div>
              <h3 className="font-semibold text-[#0D1B2A] mb-2">Process</h3>
              <p className="text-sm text-gray-600">AI understands intent and regional terms</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-[#0D1B2A] rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-white font-bold">3</span>
              </div>
              <h3 className="font-semibold text-[#0D1B2A] mb-2">Match</h3>
              <p className="text-sm text-gray-600">Finds relevant products with synonyms</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-[#5DAE49] rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-white font-bold">4</span>
              </div>
              <h3 className="font-semibold text-[#0D1B2A] mb-2">Results</h3>
              <p className="text-sm text-gray-600">Shows products with prices and details</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AIFeaturesPage; 