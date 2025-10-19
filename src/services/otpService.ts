// src/services/otpService.ts
import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import twilio from 'twilio';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Twilio client
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// TypeScript interfaces
interface OTPData {
  otp: string;
  expiresAt: number;
}

interface SendOTPRequest {
  phoneNumber: string;
}

interface VerifyOTPRequest {
  phoneNumber: string;
  otp: string;
}

// Store OTPs temporarily (in production, use Redis or database)
const otpStore = new Map<string, OTPData>();

// Generate random 6-digit OTP
const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP endpoint
app.post('/api/send-otp', async (req: Request<{}, {}, SendOTPRequest>, res: Response) => {
  try {
    const { phoneNumber } = req.body;

    // Validate phone number format (must include country code)
    if (!phoneNumber || phoneNumber.length < 10) {
      return res.status(400).json({ 
        success: false, 
        message: 'Valid phone number required (include country code, e.g., +1234567890)' 
      });
    }

    // Generate OTP
    const otp = generateOTP();
    
    // Store OTP with expiry (5 minutes)
    otpStore.set(phoneNumber, {
      otp: otp,
      expiresAt: Date.now() + 5 * 60 * 1000 // 5 minutes
    });

    // Send SMS via Twilio
    const message = await client.messages.create({
      body: `Your MarketChain verification code is: ${otp}. Valid for 5 minutes.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber
    });

    console.log(`✅ OTP sent to ${phoneNumber}: ${message.sid}`);

    res.json({ 
      success: true, 
      message: 'OTP sent successfully',
      messageId: message.sid 
    });

  } catch (error: any) {
    console.error('❌ Error sending OTP:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send OTP',
      error: error.message 
    });
  }
});

// Verify OTP endpoint
app.post('/api/verify-otp', (req: Request<{}, {}, VerifyOTPRequest>, res: Response) => {
  try {
    const { phoneNumber, otp } = req.body;

    if (!phoneNumber || !otp) {
      return res.status(400).json({ 
        success: false, 
        message: 'Phone number and OTP required' 
      });
    }

    // Get stored OTP
    const storedData = otpStore.get(phoneNumber);

    // Check if OTP exists
    if (!storedData) {
      return res.status(400).json({ 
        success: false, 
        message: 'No OTP found. Please request a new one.' 
      });
    }

    // Check if OTP expired
    if (Date.now() > storedData.expiresAt) {
      otpStore.delete(phoneNumber);
      return res.status(400).json({ 
        success: false, 
        message: 'OTP expired. Please request a new one.' 
      });
    }

    // Verify OTP
    if (storedData.otp === otp) {
      otpStore.delete(phoneNumber); // Remove used OTP
      return res.json({ 
        success: true, 
        message: 'OTP verified successfully' 
      });
    } else {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid OTP' 
      });
    }

  } catch (error: any) {
    console.error('❌ Error verifying OTP:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to verify OTP',
      error: error.message 
    });
  }
});

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'ok', 
    message: 'OTP Service is running',
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 OTP Server running on http://localhost:${PORT}`);
  console.log(`📱 Twilio configured: ${process.env.TWILIO_PHONE_NUMBER}`);
});

export default app;