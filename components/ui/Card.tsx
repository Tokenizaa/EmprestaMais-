import React from 'react';

export const Card: React.FC<{ children: React.ReactNode; className?: string; variant?: 'default' | 'glass' | 'elevated' }> = ({ children, className = '', variant = 'glass' }) => {
  const baseStyles = "rounded-xl transition-all duration-300";
  
  const variants = {
    default: "bg-card text-card-foreground border border-slate-800",
    glass: "glass-card text-card-foreground",
    elevated: "bg-slate-800/50 border border-slate-700 shadow-xl"
  };

  return (
    <div className={`${baseStyles} ${variants[variant]} ${className}`}>
      {children}
    </div>
  );
};

export const CardHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`p-6 pb-2 ${className}`}>
    {children}
  </div>
);

export const CardTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <h3 className={`text-lg font-semibold leading-none tracking-tight text-white ${className}`}>
    {children}
  </h3>
);

export const CardContent: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`p-6 pt-2 ${className}`}>
    {children}
  </div>
);