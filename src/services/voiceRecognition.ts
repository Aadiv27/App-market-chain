export interface VoiceRecognitionResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
}

export interface VoiceSynthesisOptions {
  text: string;
  language?: 'hindi' | 'english' | 'hinglish';
  rate?: number;
  pitch?: number;
  volume?: number;
}

class VoiceRecognitionService {
  private recognition: any;  
  private synthesis: SpeechSynthesis;
  private isListening: boolean = false;
  private onResultCallback?: (result: VoiceRecognitionResult) => void;
  private onErrorCallback?: (error: string) => void;

  constructor() {
    this.synthesis = window.speechSynthesis;
    this.initializeRecognition();
  }

  private initializeRecognition() {
    // Check if browser supports speech recognition
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.warn('Speech recognition not supported in this browser');
      return;
    }

    // Initialize speech recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;  
    this.recognition = new SpeechRecognition();
    
    // Configure recognition settings
    this.recognition.continuous = false;
    this.recognition.interimResults = true;
    this.recognition.maxAlternatives = 1;
    this.recognition.lang = 'hi-IN'; // Default to Hindi

    // Set up event handlers
    this.recognition.onstart = () => {
      this.isListening = true;
      console.log('Voice recognition started');
    };

    this.recognition.onresult = (event: any) => {  
      const result = event.results[event.results.length - 1];
      const transcript = result[0].transcript;
      const confidence = result[0].confidence;
      const isFinal = result.isFinal;

      if (this.onResultCallback) {
        this.onResultCallback({
          transcript,
          confidence,
          isFinal
        });
      }
    };

    this.recognition.onerror = (event: any) => {  
      this.isListening = false;
      const error = event.error;
      console.error('Voice recognition error:', error);
      
      if (this.onErrorCallback) {
        this.onErrorCallback(error);
      }
    };

    this.recognition.onend = () => {
      this.isListening = false;
      console.log('Voice recognition ended');
    };
  }

  // Start listening for voice input
  startListening(language: 'hindi' | 'english' = 'hindi', onResult?: (result: VoiceRecognitionResult) => void, onError?: (error: string) => void) {
    if (!this.recognition) {
      console.error('Speech recognition not available');
      return false;
    }

    if (this.isListening) {
      this.stopListening();
    }

    // Set language
    this.recognition.lang = language === 'hindi' ? 'hi-IN' : 'en-IN';
    
    // Set callbacks
    this.onResultCallback = onResult;
    this.onErrorCallback = onError;

    try {
      this.recognition.start();
      return true;
    } catch (error) {
      console.error('Failed to start voice recognition:', error);
      return false;
    }
  }

  // Stop listening
  stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  // Check if currently listening
  getIsListening(): boolean {
    return this.isListening;
  }

  // Speak text using voice synthesis
  speak(options: VoiceSynthesisOptions) {
    if (!this.synthesis) {
      console.error('Speech synthesis not available');
      return;
    }

    // Cancel any ongoing speech
    this.synthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(options.text);
    
    // Set language
    switch (options.language) {
      case 'hindi':
        utterance.lang = 'hi-IN';
        break;
      case 'english':
        utterance.lang = 'en-IN';
        break;
      default:
        utterance.lang = 'en-IN';
    }

    // Set voice properties
    utterance.rate = options.rate || 0.9;
    utterance.pitch = options.pitch || 1;
    utterance.volume = options.volume || 1;

    // Get available voices and set a suitable one
    const voices = this.synthesis.getVoices();
    const preferredVoice = voices.find(voice => 
      voice.lang.includes('hi') || voice.lang.includes('en')
    );
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    this.synthesis.speak(utterance);
  }

  // Stop speaking
  stopSpeaking() {
    if (this.synthesis) {
      this.synthesis.cancel();
    }
  }

  // Check if speech synthesis is supported
  isSpeechSynthesisSupported(): boolean {
    return 'speechSynthesis' in window;
  }

  // Check if speech recognition is supported
  isSpeechRecognitionSupported(): boolean {
    return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
  }

  // Get available voices
  getAvailableVoices(): SpeechSynthesisVoice[] {
    return this.synthesis.getVoices();
  }

  // Set up voice recognition with Hindi/English support
  setupForMarketChain() {
    // Load voices when they become available
    if (this.synthesis.getVoices().length === 0) {
      this.synthesis.onvoiceschanged = () => {
        console.log('Voices loaded:', this.synthesis.getVoices());
      };
    }
  }
}

export const voiceRecognition = new VoiceRecognitionService();
export default voiceRecognition; 