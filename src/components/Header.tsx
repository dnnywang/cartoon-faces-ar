
import React from 'react';

const Header = () => {
  return (
    <header className="py-4 px-4">
      <div className="container mx-auto text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2 animate-bounce-light">
          Cartoon Face AR
        </h1>
        <p className="text-lg text-gray-700 max-w-md mx-auto">
          Apply cartoon overlays to your face in real-time!
        </p>
      </div>
    </header>
  );
};

export default Header;
