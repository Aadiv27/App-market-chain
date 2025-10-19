import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Mic, MicOff, Volume2, VolumeX, Bot, X } from 'lucide-react';
import aiAssistant, { AISearchResult } from '../services/aiAssistant';
import voiceRecognition, { VoiceRecognitionResult } from '../services/voiceRecognition';
import AIStatus from './AIStatus';

interface AISearchComponentProps {
  onSearchResult?: (result: AISearchResult) => void;
  placeholder?: string;
  className?: string;
}

const AISearchComponent: React.FC<AISearchComponentProps> = ({
  onSearchResult,
  placeholder = "Type: 'Show me cheapest 10kg flour' or speak in Hindi",
  className = ""
}) => {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [searchResults, setSearchResults] = useState<AISearchResult | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [language, setLanguage] = useState<'hindi' | 'hinglish' | 'english'>('hinglish');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    voiceRecognition.setupForMarketChain();
  }, []);

  useEffect(() => {
    if (query.trim()) {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      
      searchTimeoutRef.current = setTimeout(() => {
        performSearch(query);
      }, 500);
    } else {
      setSearchResults(null);
      setShowResults(false);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [query]);

  const performSearch = async (searchQuery: string) => {
    setIsSearching(true);
    try {
      const result = await aiAssistant.processQuery(searchQuery, language);
      setSearchResults(result);
      setShowResults(true);
      
      if (onSearchResult) {
        onSearchResult(result);
      }

      if (isSpeaking && result.products.length > 0) {
        const responseText = `Found ${result.products.length} products for ${searchQuery}`;
        voiceRecognition.speak({
          text: responseText,
          language: language === 'hindi' ? 'hindi' : 'english'
        });
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleVoiceInput = () => {
    if (isListening) {
      voiceRecognition.stopListening();
      setIsListening(false);
      setVoiceTranscript('');
    } else {
      setIsListening(true);
      setVoiceTranscript('Listening...');
      
      voiceRecognition.startListening(
        language === 'hindi' ? 'hindi' : 'english',
        (result: VoiceRecognitionResult) => {
          setVoiceTranscript(result.transcript);
          
          if (result.isFinal) {
            setQuery(result.transcript);
            setIsListening(false);
            setVoiceTranscript('');
          }
        },
        (error: string) => {
          console.error('Voice recognition error:', error);
          setIsListening(false);
          setVoiceTranscript('');
        }
      );
    }
  };

  const clearSearch = () => {
    setQuery('');
    setSearchResults(null);
    setShowResults(false);
    voiceRecognition.stopSpeaking();
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <div className="flex items-center bg-white rounded-2xl shadow-lg border-2 border-gray-100 focus-within:border-[#5DAE49] transition-all duration-300">
          <div className="pl-4 pr-3">
            <Search className="h-5 w-5 text-gray-400" />
          </div>

          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            className="flex-1 py-4 px-2 text-gray-700 placeholder-gray-500 focus:outline-none"
          />

          <button
            onClick={handleVoiceInput}
            className={`p-3 mx-2 rounded-full transition-all duration-300 ${
              isListening 
                ? 'bg-red-500 text-white animate-pulse' 
                : 'bg-gray-100 text-gray-600 hover:bg-[#5DAE49] hover:text-white'
            }`}
            title={isListening ? 'Stop listening' : 'Use voice input'}
          >
            {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </button>

          {query && (
            <button
              onClick={clearSearch}
              className="p-3 mr-2 rounded-full bg-gray-100 text-gray-600 hover:bg-red-500 hover:text-white transition-all duration-300"
              title="Clear search"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {voiceTranscript && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-full left-0 right-0 mt-2 bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700"
          >
            <div className="flex items-center space-x-2">
              <Mic className="h-4 w-4" />
              <span>{voiceTranscript}</span>
            </div>
          </motion.div>
        )}
      </div>

      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Language:</span>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as 'hindi' | 'hinglish' | 'english')}
              className="text-sm border border-gray-300 rounded-lg px-2 py-1 focus:ring-2 focus:ring-[#5DAE49] focus:border-transparent"
            >
              <option value="hinglish">Hinglish</option>
              <option value="hindi">Hindi</option>
              <option value="english">English</option>
            </select>
          </div>
          
          <AIStatus />
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsSpeaking(!isSpeaking)}
            className={`p-2 rounded-full transition-all duration-300 ${
              isSpeaking 
                ? 'bg-[#5DAE49] text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-[#5DAE49] hover:text-white'
            }`}
            title={isSpeaking ? 'Disable voice responses' : 'Enable voice responses'}
          >
            {isSpeaking ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showResults && searchResults && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 right-0 mt-4 bg-white rounded-2xl shadow-xl border border-gray-200 z-50 max-h-96 overflow-y-auto"
          >
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center space-x-2">
                <Bot className="h-5 w-5 text-[#5DAE49]" />
                <span className="font-semibold text-gray-800">
                  AI found {searchResults.products.length} results for "{query}"
                </span>
              </div>
              
              {searchResults.clarification && (
                <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-700">{searchResults.clarification}</p>
                </div>
              )}
            </div>

            {searchResults.products.length > 0 ? (
              <div className="p-4 space-y-3">
                {searchResults.products.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 border border-gray-200 rounded-lg hover:border-[#5DAE49] hover:shadow-md transition-all duration-300 cursor-pointer"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800 mb-1">{product.name}</h3>
                        <p className="text-sm text-gray-600 mb-2">{product.description}</p>
                        
                        <div className="flex items-center space-x-4 text-sm">
                          <span className="text-[#5DAE49] font-medium">{product.price}</span>
                          <span className="text-gray-500">⭐ {product.rating}/5</span>
                          <span className="text-gray-500 capitalize">{product.category}</span>
                        </div>

                        <div className="mt-2 flex flex-wrap gap-1">
                          {product.brands.slice(0, 3).map((brand) => (
                            <span key={brand} className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                              {brand}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div className="ml-4 text-right">
                        <div className="text-xs text-gray-500 mb-1">Available in:</div>
                        <div className="space-y-1">
                          {product.units.slice(0, 2).map((unit) => (
                            <div key={unit} className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded">
                              {unit}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <Bot className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-2">No products found</p>
                <p className="text-sm text-gray-400">Try different keywords or check spelling</p>
              </div>
            )}

            {searchResults.suggestions.length > 0 && (
              <div className="p-4 border-t border-gray-100 bg-gray-50">
                <h4 className="font-medium text-gray-700 mb-2">Suggestions:</h4>
                <div className="space-y-1">
                  {searchResults.suggestions.map((suggestion, index) => (
                    <p key={index} className="text-sm text-gray-600">{suggestion}</p>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {isSearching && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute top-full left-0 right-0 mt-4 bg-white rounded-2xl shadow-xl border border-gray-200 p-6 text-center"
        >
          <div className="flex items-center justify-center space-x-3">
            <div className="w-6 h-6 border-2 border-[#5DAE49] border-t-transparent rounded-full animate-spin" />
            <span className="text-gray-600">AI is searching...</span>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default AISearchComponent; 