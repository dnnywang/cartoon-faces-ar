
import React from 'react';
import { User, UserX } from 'lucide-react';

interface FaceDetectionIndicatorProps {
  isFaceDetected: boolean;
}

const FaceDetectionIndicator: React.FC<FaceDetectionIndicatorProps> = ({ isFaceDetected }) => {
  return (
    <div className="flex items-center justify-center gap-2 p-3 rounded-lg font-comic transition-colors duration-300 mb-4"
      style={{ 
        backgroundColor: isFaceDetected ? 'rgba(22, 163, 74, 0.2)' : 'rgba(220, 38, 38, 0.2)',
        borderColor: isFaceDetected ? 'rgb(22, 163, 74)' : 'rgb(220, 38, 38)',
        borderWidth: '2px'
      }}
    >
      {isFaceDetected ? (
        <>
          <User className="w-5 h-5 text-green-600" />
          <span className="text-green-600 font-bold">Face Detected</span>
        </>
      ) : (
        <>
          <UserX className="w-5 h-5 text-red-600" />
          <span className="text-red-600 font-bold">No Face Detected</span>
        </>
      )}
    </div>
  );
};

export default FaceDetectionIndicator;
