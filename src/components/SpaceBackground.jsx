'use client';

import React, { useMemo } from 'react';

const keyframes = `
  @keyframes animateStars {
    from {
      transform: translateY(0px);
    }
    to {
      transform: translateY(-2000px);
    }
  }

  @keyframes animateNebula {
    0% {
      transform: translate(20px, -10px) scale(1);
      opacity: 0.6;
    }
    50% {
      transform: translate(-30px, 40px) scale(1.05);
      opacity: 0.8;
    }
    100% {
      transform: translate(20px, -10px) scale(1);
      opacity: 0.6;
    }
  }
`;

const Stars = ({ count = 100, size = 2, animationDuration = "50s" }) => {
  const stars = useMemo(() => {
    let boxShadow = "";
    const width = 4000;
    const height = 4000;

    for (let i = 0; i < count; i++) {
      boxShadow += `${Math.random() * width - width / 2}px ${Math.random() * height - height/2}px rgba(255, 255, 255, ${Math.random() * 0.5 + 0.5})`;
      if (i < count - 1) {
        boxShadow += ", ";
      }
    }
    return boxShadow;
  }, [count]);

  const starStyle = {
    width: `${size}px`,
    height: `${size}px`,
    backgroundColor: 'transparent',
    boxShadow: stars,
    animation: `animateStars ${animationDuration} linear infinite`,
  };

  return <div className="absolute top-1/2 left-1/2" style={starStyle} />;
};

const SpaceBackground = () => {
  return (
    <>
      <style>{keyframes}</style>
      
      <div className="fixed inset-0 z-0 bg-gradient-to-b from-[#000010] to-[#0a0014] overflow-hidden">
        <Stars count={700} size={1} animationDuration="150s" />
        
        <Stars count={200} size={2} animationDuration="100s" />
        
        <Stars count={100} size={3} animationDuration="50s" />
      </div>
    </>
  );
};

export default SpaceBackground;