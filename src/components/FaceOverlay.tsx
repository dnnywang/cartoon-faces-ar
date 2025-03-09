
import React, { useRef, useEffect, useState } from 'react';

interface FaceOverlayProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  onFaceDetectionChange?: (isFaceDetected: boolean) => void;
}

const FaceOverlay: React.FC<FaceOverlayProps> = ({ videoRef, onFaceDetectionChange }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isMediaPipeLoaded, setIsMediaPipeLoaded] = useState<boolean>(false);
  const [lastDetectionTime, setLastDetectionTime] = useState<number>(0);
  const faceDetectionTimeout = 1000; // Consider no face after 1 second without detection
  
  // Smoothing variables
  const smoothXRef = useRef<number>(0);
  const smoothYRef = useRef<number>(0);
  const smoothingFactor = 0.2;
  
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
        faceMeshExists: !!(window as any).FaceMesh
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
      const FaceMesh = (window as any).FaceMesh;
      const faceMesh = new FaceMesh({
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
          
          // Get the nose tip landmark (index 1)
          const landmarks = results.multiFaceLandmarks[0];
          const noseTip = landmarks[1];
          
          // Calculate smooth position
          const x = noseTip.x * canvasElement.width;
          const y = noseTip.y * canvasElement.height;
          const smoothedPosition = smoothPosition(x, y);
          
          // Calculate the face bounding box size based on landmarks
          // Distance between ears is a good approximation
          const leftEar = landmarks[234];  // Left ear landmark
          const rightEar = landmarks[454]; // Right ear landmark
          const faceWidth = Math.abs(
            (rightEar.x - leftEar.x) * canvasElement.width
          );
          
          // Draw a red square over the detected face
          const boxSize = faceWidth * 1.5; // Adjust as needed
          
          canvasCtx.strokeStyle = 'red';
          canvasCtx.lineWidth = 3;
          canvasCtx.fillStyle = 'rgba(255, 0, 0, 0.2)';
          canvasCtx.fillRect(
            smoothedPosition.x - boxSize / 2, 
            smoothedPosition.y - boxSize / 2, 
            boxSize, 
            boxSize
          );
          canvasCtx.strokeRect(
            smoothedPosition.x - boxSize / 2, 
            smoothedPosition.y - boxSize / 2, 
            boxSize, 
            boxSize
          );
          
          // Add a fun label
          canvasCtx.font = '16px "Comic Sans MS"';
          canvasCtx.fillStyle = 'white';
          canvasCtx.fillText(
            'Face Detected!', 
            smoothedPosition.x - boxSize / 4, 
            smoothedPosition.y - boxSize / 2 - 5
          );
        }
      });
      
      // Start camera with MediaPipe Camera Utils
      if ((window as any).Camera) {
        const Camera = (window as any).Camera;
        const camera = new Camera(videoElement, {
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
    if (videoRef.current && isMediaPipeLoaded && (window as any).FaceMesh) {
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
