import React from 'react';

const variants = {
  accent: 'bg-cyber-accent/10 text-cyber-accent border-cyber-accent/15',
  primary: 'bg-cyber-primary/10 text-cyber-primary border-cyber-primary/15',
  secondary: 'bg-cyber-secondary/10 text-cyber-secondary border-cyber-secondary/15',
};

const SkillTag = ({ skill, variant = 'accent' }) => (
  <span className={`inline-block text-xs px-3.5 py-1.5 rounded-lg font-semibold border ${variants[variant]} transition-all duration-200 hover:scale-105`}>
    {skill}
  </span>
);

export default SkillTag;
