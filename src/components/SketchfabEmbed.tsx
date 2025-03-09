
import React from 'react';

const SketchfabEmbed = () => {
  return (
    <div className="sketchfab-embed-wrapper w-full max-w-3xl mx-auto my-6 rounded-lg overflow-hidden shadow-lg">
      <iframe 
        title="balenciaga sunglasses"
        className="w-full aspect-video"
        frameBorder="0"
        allow="autoplay; fullscreen; xr-spatial-tracking"
        allowFullScreen
        mozallowfullscreen="true"
        webkitallowfullscreen="true"
        xr-spatial-tracking="true"
        execution-while-out-of-viewport="true"
        execution-while-not-rendered="true"
        web-share="true"
        src="https://sketchfab.com/models/a2d931773ff043deb0514034fc460db9/embed"
      />
      <p className="text-sm font-normal m-2 p-3 bg-white text-gray-600 rounded-b-lg">
        <a 
          href="https://sketchfab.com/3d-models/balenciaga-sunglasses-a2d931773ff043deb0514034fc460db9?utm_medium=embed&utm_campaign=share-popup&utm_content=a2d931773ff043deb0514034fc460db9" 
          target="_blank" 
          rel="nofollow" 
          className="font-bold text-blue-500 hover:underline"
        >
          balenciaga sunglasses
        </a> by <a 
          href="https://sketchfab.com/ahmadriazi?utm_medium=embed&utm_campaign=share-popup&utm_content=a2d931773ff043deb0514034fc460db9" 
          target="_blank" 
          rel="nofollow" 
          className="font-bold text-blue-500 hover:underline"
        >
          Ahmad Riazi
        </a> on <a 
          href="https://sketchfab.com?utm_medium=embed&utm_campaign=share-popup&utm_content=a2d931773ff043deb0514034fc460db9" 
          target="_blank" 
          rel="nofollow" 
          className="font-bold text-blue-500 hover:underline"
        >
          Sketchfab
        </a>
      </p>
    </div>
  );
};

export default SketchfabEmbed;
