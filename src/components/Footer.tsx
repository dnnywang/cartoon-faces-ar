
import React from 'react';

const Footer = () => {
  return (
    <footer className="py-4 px-4 mt-8">
      <div className="container mx-auto text-center">
        <p className="text-sm text-gray-600">
          © {new Date().getFullYear()} Cartoon Face AR - Made with ❤️ and Comic Sans
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Your face data never leaves your device!
        </p>
      </div>
    </footer>
  );
};

export default Footer;
