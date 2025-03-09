
import React, { useState, useEffect } from 'react';
import CameraFeed from '@/components/CameraFeed';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Instructions from '@/components/Instructions';
import SketchfabEmbed from '@/components/SketchfabEmbed';
import { Loader } from 'lucide-react';

const Index = () => {
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Simulate loading time for models and resources
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64">
            <Loader id="loading-spinner" className="w-12 h-12 text-cartoon-orange mb-4" />
            <p className="text-lg font-medium text-gray-700">Loading Cartoon Face AR...</p>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            <Instructions />
            <CameraFeed />
            <SketchfabEmbed />
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
