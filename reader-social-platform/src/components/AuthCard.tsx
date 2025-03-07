import React from 'react';

interface AuthCardProps {
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export const AuthCard: React.FC<AuthCardProps> = ({ title, children, footer }) => {
  return (
    <div className="w-full max-w-md bg-discord-dark rounded-lg shadow-lg p-8">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-serif font-bold text-discord-text">{title}</h1>
      </div>
      
      {children}
      
      {footer && (
        <div className="mt-6 text-center text-discord-muted">
          {footer}
        </div>
      )}
    </div>
  );
}; 