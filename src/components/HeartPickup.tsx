import React, { useState, useEffect } from 'react';
import { HeartPickup as HeartPickupType } from '../types';

interface HeartPickupProps {
  heart: HeartPickupType;
}

const HeartPickup: React.FC<HeartPickupProps> = ({ heart }) => {
  const [animationFrame, setAnimationFrame] = useState(0);

  // Animation de pulsation du coeur
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationFrame(prev => (prev + 1) % 30); // 30 frames pour un cycle complet
    }, 100); // 100ms par frame

    return () => clearInterval(interval);
  }, []);

  // Calculer l'échelle basée sur l'animation (pulsation)
  const scale = 1 + Math.sin(animationFrame * 0.2) * 0.2; // Varie entre 0.8 et 1.2

  return (
    <div
      style={{
        position: 'absolute',
        left: `${heart.x}%`,
        top: `${heart.y}%`,
        transform: `translate(-50%, -50%) scale(${scale})`,
        zIndex: 10,
        fontSize: '24px',
        color: '#ff4757',
        textShadow: '0 0 10px rgba(255, 71, 87, 0.8)',
        pointerEvents: 'none',
        userSelect: 'none'
      }}
    >
      ❤️
    </div>
  );
};

export default HeartPickup;