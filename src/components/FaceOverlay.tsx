
import React, { useRef, useEffect, useState } from 'react';
import * as faceapi from 'face-api.js';

interface FaceOverlayProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  onFaceDetectionChange?: (isFaceDetected: boolean) => void;
}

const FaceOverlay: React.FC<FaceOverlayProps> = ({ videoRef, onFaceDetectionChange }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isModelLoaded = useRef<boolean>(false);
  const [lastDetectionTime, setLastDetectionTime] = useState<number>(0);
  const faceDetectionTimeout = 1000; // Consider no face after 1 second without detection
  
  useEffect(() => {
    const loadModels = async () => {
      try {
        // Load face detection models
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
          faceapi.nets.faceLandmark68Net.loadFromUri('/models')
        ]);
        
        isModelLoaded.current = true;
        console.log('Face detection models loaded successfully');
        
        // Start face detection once models are loaded
        if (videoRef.current) {
          startFaceDetection();
        }
      } catch (error) {
        console.error('Error loading models:', error);
      }
    };
    
    // Create models directory dynamically
    const createModelsDir = async () => {
      // We'll use a basic structure for the models
      // In a production app, you would serve these files properly
      const modelsDir = '/models';
      
      // Since we can't create directories on the client side,
      // we'll just log a message for now
      console.log('Models directory would be created at:', modelsDir);
      
      // For a real implementation, these model files would be included in your public directory
      loadModels();
    };
    
    createModelsDir();
    
    // Clean up on unmount
    return () => {
      console.log('Cleaning up face detection');
    };
  }, []);
  
  useEffect(() => {
    // Check for face detection timeout
    const checkFaceDetectionTimeout = setInterval(() => {
      const currentTime = Date.now();
      if (currentTime - lastDetectionTime > faceDetectionTimeout && lastDetectionTime !== 0) {
        // No face detected for more than the timeout period
        onFaceDetectionChange?.(false);
      }
    }, 300);

    return () => clearInterval(checkFaceDetectionTimeout);
  }, [lastDetectionTime, onFaceDetectionChange]);
  
  const startFaceDetection = () => {
    if (!videoRef.current || !canvasRef.current || !isModelLoaded.current) {
      return;
    }
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    const displaySize = {
      width: video.clientWidth,
      height: video.clientHeight
    };
    
    faceapi.matchDimensions(canvas, displaySize);
    
    // Set up the detection loop
    const interval = setInterval(async () => {
      if (!isModelLoaded.current || !videoRef.current || !canvasRef.current) {
        clearInterval(interval);
        return;
      }
      
      // Only run detection if the video is playing
      if (videoRef.current.paused || videoRef.current.ended) {
        return;
      }
      
      try {
        // Detect faces
        const detections = await faceapi.detectAllFaces(
          videoRef.current, 
          new faceapi.TinyFaceDetectorOptions()
        ).withFaceLandmarks();
        
        // Resize detections to match display size
        const resizedDetections = faceapi.resizeResults(detections, displaySize);
        
        // Update face detection status
        const isFaceDetected = resizedDetections.length > 0;
        if (isFaceDetected) {
          setLastDetectionTime(Date.now());
          onFaceDetectionChange?.(true);
        }
        
        // Clear the canvas
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          
          // Draw red square overlays as placeholders
          resizedDetections.forEach(detection => {
            const { box } = detection.detection;
            
            // Draw a red square over each detected face
            ctx.strokeStyle = 'red';
            ctx.lineWidth = 3;
            ctx.fillStyle = 'rgba(255, 0, 0, 0.2)';
            ctx.fillRect(box.x, box.y, box.width, box.height);
            ctx.strokeRect(box.x, box.y, box.width, box.height);
            
            // Add a fun label
            ctx.font = '16px "Comic Sans MS"';
            ctx.fillStyle = 'white';
            ctx.fillText('Face Detected!', box.x, box.y - 5);
          });
        }
      } catch (error) {
        console.error('Error during face detection:', error);
      }
    }, 100);
    
    return () => clearInterval(interval);
  };
  
  // Start face detection when the video starts playing
  useEffect(() => {
    const handleVideoPlay = () => {
      startFaceDetection();
    };
    
    const video = videoRef.current;
    if (video) {
      video.addEventListener('play', handleVideoPlay);
      
      return () => {
        video.removeEventListener('play', handleVideoPlay);
      };
    }
  }, [videoRef.current]);
  
  return (
    <canvas
      ref={canvasRef}
      className="face-overlay-canvas absolute top-0 left-0"
    />
  );
};

export default FaceOverlay;
