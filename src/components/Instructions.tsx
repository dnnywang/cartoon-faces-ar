
import React from 'react';
import { Info } from 'lucide-react';

const Instructions = () => {
  return (
    <div className="bg-cartoon-soft-yellow rounded-xl p-4 shadow-md mb-6 max-w-md mx-auto">
      <div className="flex items-start gap-3">
        <Info className="w-6 h-6 text-cartoon-orange flex-shrink-0 mt-1" />
        <div>
          <h3 className="font-bold text-gray-800 mb-2">How to Use:</h3>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>Allow camera access when prompted</li>
            <li>Position your face in the frame</li>
            <li>Watch as the cartoon overlay is applied!</li>
            <li>Take a screenshot to save your cartoonified look</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default Instructions;
