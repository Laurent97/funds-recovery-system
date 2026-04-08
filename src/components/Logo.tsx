import React from 'react';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ size = 'medium', className = '' }) => {
  const sizeClasses = {
    small: 'w-32 h-10',
    medium: 'w-48 h-14',
    large: 'w-64 h-20'
  };

  return (
    <div className={`${sizeClasses[size]} ${className}`}>
      <svg 
        width="100%" 
        height="100%" 
        viewBox="0 0 200 60" 
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <defs>
          <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#1e40af" stopOpacity="1" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="1" />
          </linearGradient>
        </defs>
        
        {/* K Letter */}
        <path d="M10 15 L10 45 L15 45 L15 32 L25 45 L31 45 L20 30 L30 15 L24 15 L15 28 L15 15 Z" fill="url(#logoGradient)"/>
        
        {/* Shield/Security Icon */}
        <g transform="translate(35, 15)">
          <path d="M10 2 L10 2 C10 2 2 5 2 10 C2 20 10 25 10 25 C10 25 18 20 18 10 C18 5 10 2 10 2 Z" 
                fill="none" stroke="url(#logoGradient)" strokeWidth="2"/>
          <path d="M7 12 L9 14 L13 10" fill="none" stroke="url(#logoGradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </g>
        
        {/* KRYVEX Text */}
        <text x="60" y="35" fontFamily="Arial, sans-serif" fontSize="18" fontWeight="bold" fill="#1e40af">KRYVEX</text>
        
        {/* TRADING Text */}
        <text x="60" y="48" fontFamily="Arial, sans-serif" fontSize="10" fill="#64748b">TRADING</text>
        
        {/* Funds Recovery System */}
        <text x="130" y="35" fontFamily="Arial, sans-serif" fontSize="8" fill="#94a3b8">Funds Recovery</text>
        <text x="130" y="44" fontFamily="Arial, sans-serif" fontSize="8" fill="#94a3b8">System</text>
      </svg>
    </div>
  );
};

export default Logo;
