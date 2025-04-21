import React from 'react';

const NoResults: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="flex flex-col items-center">
        <svg
          className="h-16 w-16 text-gray-400 animate-bounce mb-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 14l2-2l2 2m-2-2v4m-2 4h4a2 2 0 002-2v-4a2 2 0 012-2h4a2 2 0 012 2v4a2 2 0 01-2 2h-4m-2-2v-4m-2 4H9a2 2 0 01-2-2v-4a2 2 0 00-2-2H3a2 2 0 00-2 2v4a2 2 0 002 2h4m-2-2v4a2 2 0 002 2h4"
          />
        </svg>
        <p className="text-gray-500 text-lg">Nothing to show</p>
        <p className="text-gray-400 mt-2">We couldn't find any results for your search.</p>
      </div>
    </div>
  );
};

export default NoResults;
