
import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
}

const GlassCard: React.FC<GlassCardProps> = ({ children, className = "" }) => {
  return (
    <div className={`glass p-8 md:p-12 rounded-3xl shadow-2xl transition-all duration-700 ${className}`}>
      {children}
    </div>
  );
};

export default GlassCard;
