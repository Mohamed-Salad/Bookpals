import React from 'react';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => {
  return (
    <div className="bg-discord-dark p-6 rounded-lg border border-discord-gold/20 shadow-md hover:shadow-lg transition-shadow">
      <div className="text-discord-gold mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-serif font-semibold text-discord-text mb-2">
        {title}
      </h3>
      <p className="text-discord-muted">
        {description}
      </p>
    </div>
  );
}; 