
import React, { useRef, useEffect, useState } from 'react';

interface FaceOverlayProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  onFaceDetectionChange?: (isFaceDetected: boolean) => void;
}

declare global {
  interface Window {
    FaceMesh: any;
    Camera: any;
  }
}

const FaceOverlay: React.FC<FaceOverlayProps> = ({ videoRef, onFaceDetectionChange }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isMediaPipeLoaded, setIsMediaPipeLoaded] = useState<boolean>(false);
  const [lastDetectionTime, setLastDetectionTime] = useState<number>(0);
  const faceDetectionTimeout = 1000; // Consider no face after 1 second without detection
  const eyebrowImage = useRef<HTMLImageElement | null>(null);
  
  // Smoothing variables
  const smoothXRef = useRef<number>(0);
  const smoothYRef = useRef<number>(0);
  const smoothingFactor = 0.2;
  
  useEffect(() => {
    // Preload the eyebrow image
    const img = new Image();
    img.src = 'https://cdn.discordapp.com/attachments/1070225571541434431/1348154936839376896/eyebrow_mankus.png?ex=67ce6ea0&is=67cd1d20&hm=740d06006eeb610188444b0dfd97bc513691ad971f1bf05ee8f4072561e9da62&';
    img.onload = () => {
      eyebrowImage.current = img;
    };
    
    return () => {
      eyebrowImage.current = null;
    };
  }, []);
  
  // Function to smooth position and reduce jitter
  const smoothPosition = (newX: number, newY: number) => {
    smoothXRef.current = smoothXRef.current * (1 - smoothingFactor) + newX * smoothingFactor;
    smoothYRef.current = smoothYRef.current * (1 - smoothingFactor) + newY * smoothingFactor;
    return { x: smoothXRef.current, y: smoothYRef.current };
  };
  
  useEffect(() => {
    // Load MediaPipe Face Mesh
    const loadMediaPipe = async () => {
      try {
        // Add MediaPipe script dynamically
        const faceMeshScript = document.createElement('script');
        faceMeshScript.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js';
        
        const cameraUtilsScript = document.createElement('script');
        cameraUtilsScript.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js';
        
        document.head.appendChild(faceMeshScript);
        document.head.appendChild(cameraUtilsScript);
        
        // Wait for scripts to load
        await new Promise(resolve => {
          faceMeshScript.onload = () => {
            cameraUtilsScript.onload = resolve;
          };
        });
        
        console.log('MediaPipe scripts loaded successfully');
        setIsMediaPipeLoaded(true);
        
        // Initialize face detection after scripts are loaded
        if (videoRef.current) {
          initFaceMesh();
        }
      } catch (error) {
        console.error('Error loading MediaPipe:', error);
      }
    };
    
    loadMediaPipe();
    
    return () => {
      console.log('Cleaning up MediaPipe face mesh');
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
  
  const initFaceMesh = () => {
    if (!videoRef.current || !canvasRef.current || !isMediaPipeLoaded || !window.FaceMesh) {
      console.log('Cannot initialize face mesh yet, waiting...', {
        videoReady: !!videoRef.current,
        canvasReady: !!canvasRef.current,
        mediaPipeLoaded: isMediaPipeLoaded,
        faceMeshExists: !!window.FaceMesh
      });
      // Try again in a bit if scripts are still loading
      setTimeout(() => {
        if (videoRef.current && canvasRef.current) {
          initFaceMesh();
        }
      }, 500);
      return;
    }
    
    try {
      const videoElement = videoRef.current;
      const canvasElement = canvasRef.current;
      const canvasCtx = canvasElement.getContext('2d');
      
      if (!canvasCtx) {
        console.error('Could not get canvas context');
        return;
      }
      
      // Set canvas dimensions to match video
      const updateCanvasSize = () => {
        if (videoElement && canvasElement) {
          canvasElement.width = videoElement.clientWidth;
          canvasElement.height = videoElement.clientHeight;
        }
      };
      
      updateCanvasSize();
      window.addEventListener('resize', updateCanvasSize);
      
      // Initialize FaceMesh
      const faceMesh = new window.FaceMesh({
        locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
      });
      
      faceMesh.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      });
      
      // Handle results from FaceMesh
      faceMesh.onResults((results: any) => {
        if (!canvasCtx || !canvasElement) return;
        
        // Clear the canvas
        canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
        
        // Check if face landmarks are detected
        const isFaceDetected = results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0;
        
        if (isFaceDetected) {
          // Set last detection time
          setLastDetectionTime(Date.now());
          onFaceDetectionChange?.(true);
          
          // Get the landmarks
          const landmarks = results.multiFaceLandmarks[0];
          
          // Get eyebrow landmarks (left and right)
          const leftEyebrow = [landmarks[107], landmarks[105], landmarks[70]]; // Points along left eyebrow
          const rightEyebrow = [landmarks[336], landmarks[334], landmarks[300]]; // Points along right eyebrow
          
          // Calculate center and width of eyebrows for image placement
          const leftEyebrowCenter = {
            x: leftEyebrow[1].x * canvasElement.width,
            y: leftEyebrow[1].y * canvasElement.height
          };
          
          const rightEyebrowCenter = {
            x: rightEyebrow[1].x * canvasElement.width,
            y: rightEyebrow[1].y * canvasElement.height
          };
          
          const eyebrowDistance = Math.sqrt(
            Math.pow(rightEyebrowCenter.x - leftEyebrowCenter.x, 2) +
            Math.pow(rightEyebrowCenter.y - leftEyebrowCenter.y, 2)
          );
          
          // Apply eyebrow image if loaded
          if (eyebrowImage.current) {
            // Draw the eyebrow image for left eyebrow
            const leftSmoothPos = smoothPosition(leftEyebrowCenter.x, leftEyebrowCenter.y);
            const eyebrowWidth = eyebrowDistance * 0.6; // Adjust size as needed
            const eyebrowHeight = eyebrowWidth * 0.4; // Maintain aspect ratio
            
            // Draw left eyebrow
            canvasCtx.drawImage(
              eyebrowImage.current,
              leftSmoothPos.x - eyebrowWidth/2,
              leftSmoothPos.y - eyebrowHeight/2,
              eyebrowWidth,
              eyebrowHeight
            );
            
            // Draw right eyebrow (flipped horizontally)
            const rightSmoothPos = smoothPosition(rightEyebrowCenter.x, rightEyebrowCenter.y);
            canvasCtx.save();
            canvasCtx.translate(rightSmoothPos.x, 0);
            canvasCtx.scale(-1, 1); // Flip horizontally
            canvasCtx.translate(-rightSmoothPos.x, 0);
            
            canvasCtx.drawImage(
              eyebrowImage.current,
              rightSmoothPos.x - eyebrowWidth/2,
              rightSmoothPos.y - eyebrowHeight/2,
              eyebrowWidth,
              eyebrowHeight
            );
            canvasCtx.restore();
          }
        }
      });
      
      // Start camera with MediaPipe Camera Utils
      if (window.Camera) {
        const camera = new window.Camera(videoElement, {
          onFrame: async () => {
            if (faceMesh) {
              await faceMesh.send({ image: videoElement });
            }
          },
          width: 640,
          height: 480
        });
        
        camera.start()
          .then(() => console.log('Camera started successfully'))
          .catch((error: any) => console.error('Error starting camera:', error));
      } else {
        console.error('Camera Utils not available');
      }
      
      return () => {
        window.removeEventListener('resize', updateCanvasSize);
      };
    } catch (error) {
      console.error('Error initializing face mesh:', error);
    }
  };
  
  // Start face detection when the video is ready
  useEffect(() => {
    if (videoRef.current && isMediaPipeLoaded && window.FaceMesh) {
      initFaceMesh();
    }
  }, [videoRef.current, isMediaPipeLoaded]);
  
  return (
    <canvas
      ref={canvasRef}
      className="face-overlay-canvas absolute top-0 left-0"
    />
  );
};

export default FaceOverlay;
