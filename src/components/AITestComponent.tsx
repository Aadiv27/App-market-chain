import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bot, TestTube, CheckCircle, XCircle, AlertTriangle, Play } from 'lucide-react';
import aiAssistant, { AISearchResult } from '../services/aiAssistant';

const AITestComponent: React.FC = () => {
  const [testResults, setTestResults] = useState<Array<{
    test: string;
    status: 'pending' | 'running' | 'success' | 'error';
    message: string;
    result?: any;
  }>>([]);
  const [isRunning, setIsRunning] = useState(false);

  const testQueries = [
    { query: 'sugar', language: 'english' as const, description: 'Simple English search' },
    { query: 'sabse sasta chawal', language: 'hinglish' as const, description: 'Hindi/Hinglish search' },
    { query: 'cheapest 10kg flour', language: 'english' as const, description: 'Complex English query' },
    { query: 'fresh milk', language: 'english' as const, description: 'Quality-based search' },
    { query: 'tel', language: 'hindi' as const, description: 'Hindi product name' }
  ];

  const runAllTests = async () => {
    setIsRunning(true);
    setTestResults([]);
    
    // Test 1: API Status
    const apiTest = { test: 'API Status Check', status: 'running' as const, message: 'Checking API status...' };
    setTestResults([apiTest]);
    
    try {
      const apiStatus = aiAssistant.getApiStatus();
      const updatedApiTest = {
        ...apiTest,
        status: apiStatus.isValid ? 'success' as const : 'error' as const,
        message: apiStatus.message,
        result: apiStatus
      };
      setTestResults([updatedApiTest]);
      
      // Test 2: API Connection Test
      if (apiStatus.isValid) {
        const connectionTest = { test: 'API Connection Test', status: 'running' as const, message: 'Testing API connection...' };
        setTestResults(prev => [...prev, connectionTest]);
        
        const connectionResult = await aiAssistant.testApiKey();
        const updatedConnectionTest = {
          ...connectionTest,
          status: connectionResult.success ? 'success' as const : 'error' as const,
          message: connectionResult.message,
          result: connectionResult
        };
        setTestResults(prev => [...prev.slice(0, -1), updatedConnectionTest]);
      }
      
      // Test 3: Query Processing Tests
      for (let i = 0; i < testQueries.length; i++) {
        const testQuery = testQueries[i];
        const queryTest = { 
          test: `Query Test ${i + 1}: ${testQuery.description}`, 
          status: 'running' as const, 
          message: `Testing: "${testQuery.query}"...` 
        };
        setTestResults(prev => [...prev, queryTest]);
        
        try {
          const searchResult = await aiAssistant.processQuery(testQuery.query, testQuery.language);
          const updatedQueryTest = {
            ...queryTest,
            status: searchResult.products.length > 0 ? 'success' as const : 'error' as const,
            message: `Found ${searchResult.products.length} products`,
            result: searchResult
          };
          setTestResults(prev => [...prev.slice(0, -1), updatedQueryTest]);
        } catch (error) {
          const updatedQueryTest = {
            ...queryTest,
            status: 'error' as const,
            message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
            result: null
          };
          setTestResults(prev => [...prev.slice(0, -1), updatedQueryTest]);
        }
        
        // Small delay between tests
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    } catch (error) {
      console.error('Test suite error:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'border-blue-200 bg-blue-50';
      case 'success':
        return 'border-green-200 bg-green-50';
      case 'error':
        return 'border-red-200 bg-red-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="flex items-center space-x-3 mb-6">
          <div className="bg-gradient-to-r from-[#5DAE49] to-[#FFC947] p-3 rounded-xl">
            <TestTube className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[#0D1B2A]">AI Functionality Test Suite</h2>
            <p className="text-gray-600">Comprehensive testing of all AI features</p>
          </div>
        </div>

        <div className="mb-6">
          <button
            onClick={runAllTests}
            disabled={isRunning}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
              isRunning
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-[#5DAE49] text-white hover:bg-green-600 hover:shadow-lg'
            }`}
          >
            <Play className="h-5 w-5" />
            <span>{isRunning ? 'Running Tests...' : 'Run All Tests'}</span>
          </button>
        </div>

        <div className="space-y-4">
          {testResults.map((result, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-4 rounded-lg border ${getStatusColor(result.status)}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(result.status)}
                  <div>
                    <h3 className="font-semibold text-gray-800">{result.test}</h3>
                    <p className="text-sm text-gray-600">{result.message}</p>
                  </div>
                </div>
                
                {result.result && (
                  <div className="text-right">
                    {result.result.products && (
                      <span className="text-sm text-gray-500">
                        {result.result.products.length} products found
                      </span>
                    )}
                  </div>
                )}
              </div>
              
              {result.result && result.result.products && result.result.products.length > 0 && (
                <div className="mt-3 pl-7">
                  <div className="bg-white rounded-lg p-3 border">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Sample Results:</h4>
                    <div className="space-y-1">
                      {result.result.products.slice(0, 2).map((product: any, idx: number) => (
                        <div key={idx} className="text-xs text-gray-600">
                          • {product.name} - {product.price} ({product.category})
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {testResults.length === 0 && !isRunning && (
          <div className="text-center py-12">
            <Bot className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Click "Run All Tests" to start testing AI functionality</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AITestComponent;