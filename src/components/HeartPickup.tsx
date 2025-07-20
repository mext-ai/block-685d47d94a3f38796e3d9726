import React, { useState, useEffect } from 'react';
import { HeartPickup as HeartPickupType } from '../types';
import { HEART_SPRITE_SHEET_URL } from '../constants';

interface HeartPickupProps {
  heart: HeartPickupType;
}

const HeartPickup: React.FC<HeartPickupProps> = ({ heart }) => {
  const [animationFrame, setAnimationFrame] = useState(0);

  // Animation de pulsation du coeur
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationFrame(prev => (prev + 1) % 40); // 40 frames pour un cycle complet
    }, 80); // 80ms par frame pour une animation plus fluide

    return () => clearInterval(interval);
  }, []);

  // Calculer l'échelle basée sur l'animation (pulsation)
  const basePulse = 1 + Math.sin(animationFrame * 0.15) * 0.2; // Varie entre 0.8 et 1.2
  const heartSize = 32;
  // Réduction de la taille : diviser par 2 le scale de base
  const heartScale = Math.max(0.8, Math.min(2.0, 1.2 * (window.innerWidth / 1920))) * basePulse;

  return (
    <div
      style={{
        position: 'absolute',
        left: `${heart.x}%`,
        top: `${heart.y}%`,
        transform: 'translate(-50%, -50%)',
        zIndex: 15,
        pointerEvents: 'none',
        userSelect: 'none',
        filter: 'drop-shadow(0 0 8px rgba(255, 0, 0, 0.8)) brightness(1.2)'
      }}
    >
      <div
        style={{
          width: `${heartSize * heartScale}px`,
          height: `${heartSize * heartScale}px`,
          backgroundImage: `url(${HEART_SPRITE_SHEET_URL})`,
          backgroundPosition: `0px 0px`, // Utiliser le coeur plein (première frame)
          backgroundSize: `${heartSize * 3 * heartScale}px ${heartSize * heartScale}px`,
          imageRendering: 'pixelated'
        }}
      />
    </div>
  );
};

export default HeartPickup;