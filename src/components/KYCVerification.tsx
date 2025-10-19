import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, Camera, FileText, Shield, CheckCircle } from 'lucide-react';

interface KYCVerificationProps {
  userType: 'retailer' | 'wholesaler' | 'vehicle_owner';
}

const KYCVerification: React.FC<KYCVerificationProps> = ({ userType }) => {


  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);

  const handleFileUpload = (docType: string) => {
    // Simulate file upload
    setUploadedFiles([...uploadedFiles, docType]);
    alert(`${docType} uploaded successfully!`);
  };

  const getRequiredDocuments = () => {
    switch (userType) {
      case 'retailer':
        return [
          { key: 'aadhaar', label: 'Aadhaar Card', description: 'Government ID proof', icon: FileText },
          { key: 'pan', label: 'PAN Card', description: 'Income tax identification', icon: FileText }
        ];
      case 'wholesaler':
        return [
          { key: 'gstin', label: 'GSTIN Certificate', description: 'GST registration proof', icon: FileText },
          { key: 'pan', label: 'PAN Card', description: 'Income tax identification', icon: FileText },
          { key: 'businessAddress', label: 'Business Address Proof', description: 'Shop/warehouse address', icon: FileText }
        ];
      case 'vehicle_owner':
        return [
          { key: 'license', label: 'Driving License', description: 'Valid driving license', icon: FileText },
          { key: 'rc', label: 'RC (Registration Certificate)', description: 'Vehicle registration', icon: FileText },
          { key: 'insurance', label: 'Vehicle Insurance', description: 'Current insurance policy', icon: FileText },
          { key: 'aadhaar', label: 'Aadhaar Card', description: 'Government ID proof', icon: FileText }
        ];
      default:
        return [];
    }
  };

  const requiredDocs = getRequiredDocuments();
  const isComplete = requiredDocs.every(doc => uploadedFiles.includes(doc.key));

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center space-x-3 mb-6">
        <Shield className="h-8 w-8 text-[#5DAE49]" />
        <div>
          <h2 className="text-2xl font-bold text-[#0D1B2A]">KYC Verification</h2>
          <p className="text-gray-600">Upload required documents for verification</p>
        </div>
      </div>

      <div className="space-y-6">
        {requiredDocs.map((doc, index) => (
          <motion.div
            key={doc.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className={`border-2 border-dashed rounded-lg p-6 transition-all duration-300 ${
              uploadedFiles.includes(doc.key)
                ? 'border-[#5DAE49] bg-green-50'
                : 'border-gray-300 hover:border-[#5DAE49]'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  uploadedFiles.includes(doc.key)
                    ? 'bg-[#5DAE49] text-white'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {uploadedFiles.includes(doc.key) ? (
                    <CheckCircle className="h-6 w-6" />
                  ) : (
                    <doc.icon className="h-6 w-6" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-[#0D1B2A]">{doc.label}</h3>
                  <p className="text-sm text-gray-600">{doc.description}</p>
                </div>
              </div>

              {!uploadedFiles.includes(doc.key) && (
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleFileUpload(doc.key)}
                    className="flex items-center space-x-2 px-4 py-2 bg-[#5DAE49] text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    <Upload className="h-4 w-4" />
                    <span>Upload</span>
                  </button>
                  <button
                    onClick={() => handleFileUpload(doc.key)}
                    className="flex items-center space-x-2 px-4 py-2 border border-[#5DAE49] text-[#5DAE49] rounded-lg hover:bg-green-50 transition-colors"
                  >
                    <Camera className="h-4 w-4" />
                    <span>Camera</span>
                  </button>
                </div>
              )}

              {uploadedFiles.includes(doc.key) && (
                <div className="text-[#5DAE49] font-semibold">
                  ✓ Uploaded
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* OTP Verification */}
      <div className="mt-8 p-6 bg-blue-50 rounded-lg">
        <h3 className="font-semibold text-[#0D1B2A] mb-4">Phone Verification</h3>
        <div className="flex items-center space-x-4">
          <input
            type="text"
            placeholder="Enter OTP sent to your phone"
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5DAE49] focus:border-transparent"
          />
          <button className="px-6 py-3 bg-[#5DAE49] text-white rounded-lg hover:bg-green-600 transition-colors">
            Verify OTP
          </button>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          Didn't receive OTP? <button className="text-[#5DAE49] hover:underline">Resend</button>
        </p>
      </div>

      {/* Trust Badge Preview */}
      {isComplete && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="mt-8 p-6 bg-gradient-to-r from-[#5DAE49] to-[#FFC947] rounded-lg text-white text-center"
        >
          <CheckCircle className="h-12 w-12 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">KYC Complete!</h3>
          <p className="opacity-90">You'll receive a verified trust badge on your profile</p>
        </motion.div>
      )}
    </motion.div>
  );
};

export default KYCVerification;