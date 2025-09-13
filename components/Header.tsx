import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="text-center my-8 md:my-12">
      <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-500">
        Recipe Calorie Estimator
      </h1>
      <p className="mt-4 text-lg text-slate-400">
        Upload a picture of your meal and let AI do the counting!
      </p>
    </header>
  );
};
