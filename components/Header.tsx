
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="flex items-center justify-center p-6 bg-brand-secondary/50 backdrop-blur-sm sticky top-0 z-20 border-b border-brand-accent/20">
      <div className="flex items-center space-x-3">
        <h1 className="text-4xl font-bold text-brand-light tracking-wider">Formula Viewer</h1>
      </div>
    </header>
  );
};

export default Header;
