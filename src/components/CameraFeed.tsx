
import React, { useRef, useEffect, useState } from 'react';
import { toast } from '@/components/ui/sonner';
import { Camera, CameraOff } from 'lucide-react';
import FaceOverlay from './FaceOverlay';

const CameraFeed = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasCamera, setHasCamera] = useState<boolean>(false);
  const [isPermissionGranted, setIsPermissionGranted] = useState<boolean | null>(null);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  
  useEffect(() => {
    // Check if the device has a camera
    const checkCamera = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const hasVideoDevice = devices.some(device => device.kind === 'videoinput');
        setHasCamera(hasVideoDevice);
        
        if (!hasVideoDevice) {
          toast.error('No camera detected on your device');
        } else {
          requestCameraAccess();
        }
      } catch (error) {
        console.error('Error checking camera:', error);
        toast.error('Failed to detect camera on your device');
        setHasCamera(false);
      }
    };
    
    checkCamera();
    
    return () => {
      // Stop camera stream on component unmount
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const requestCameraAccess = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 }
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsPermissionGranted(true);
        setIsCameraActive(true);
        toast.success('Camera access granted!');
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setIsPermissionGranted(false);
      toast.error('Camera access denied. Please allow camera access to use this app.');
    }
  };

  const toggleCamera = async () => {
    if (isCameraActive) {
      // Stop the camera
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
        setIsCameraActive(false);
      }
    } else {
      // Restart the camera
      await requestCameraAccess();
    }
  };
  
  return (
    <div className="flex flex-col items-center gap-6">
      <div className="camera-container relative rounded-xl bg-white p-2">
        {!hasCamera && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
            <CameraOff className="text-gray-400 w-16 h-16 mb-4" />
            <h3 className="text-xl font-bold mb-2">No Camera Available</h3>
            <p>This app requires a camera to apply cartoon face filters.</p>
          </div>
        )}
        
        {isPermissionGranted === false && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
            <CameraOff className="text-gray-400 w-16 h-16 mb-4" />
            <h3 className="text-xl font-bold mb-2">Camera Access Denied</h3>
            <p className="mb-4">Please allow camera access to use this app.</p>
            <button 
              className="comic-button"
              onClick={requestCameraAccess}
            >
              Try Again
            </button>
          </div>
        )}
        
        <video 
          ref={videoRef}
          className={`camera-feed ${!isCameraActive ? 'hidden' : ''}`}
          autoPlay
          playsInline
          muted
        />
        
        {isCameraActive && <FaceOverlay videoRef={videoRef} />}
      </div>
      
      {hasCamera && isPermissionGranted !== false && (
        <button 
          className="comic-button flex items-center gap-2"
          onClick={toggleCamera}
        >
          {isCameraActive ? (
            <>
              <CameraOff className="w-5 h-5" />
              Turn Camera Off
            </>
          ) : (
            <>
              <Camera className="w-5 h-5" />
              Turn Camera On
            </>
          )}
        </button>
      )}
    </div>
  );
};

export default CameraFeed;
