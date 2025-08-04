import React, { useState, useEffect } from 'react';
import { HeartPickup as PickupType } from '../types';
import { SHIELD_SPRITE_URL } from '../constants';

interface ShieldPickupProps {
  shield: PickupType;
}

const ShieldPickup: React.FC<ShieldPickupProps> = ({ shield }) => {
  const [animationFrame, setAnimationFrame] = useState(0);

  // Animation de pulsation du bouclier
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationFrame(prev => (prev + 1) % 40); // 40 frames pour un cycle complet
    }, 80); // 80ms par frame pour une animation plus fluide

    return () => clearInterval(interval);
  }, []);

  // Calculer l'échelle basée sur l'animation (pulsation)
  const basePulse = 1 + Math.sin(animationFrame * 0.15) * 0.2; // Varie entre 0.8 et 1.2
  const shieldSize = 32;
  // Réduction de la taille : diviser par 2 le scale de base
  const shieldScale = Math.max(0.8, Math.min(2.0, 1.2 * (window.innerWidth / 1920))) * basePulse;

  return (
    <div
      style={{
        position: 'absolute',
        left: `${shield.x}%`,
        top: `${shield.y}%`,
        transform: 'translate(-50%, -50%)',
        zIndex: 15,
        pointerEvents: 'none',
        userSelect: 'none',
        filter: 'drop-shadow(0 0 8px rgba(0, 150, 255, 0.8)) brightness(1.2)'
      }}
    >
      <div
        style={{
          width: `${shieldSize * shieldScale}px`,
          height: `${shieldSize * shieldScale}px`,
          backgroundImage: `url(${SHIELD_SPRITE_URL})`,
          backgroundPosition: `0px 0px`,
          backgroundSize: `${shieldSize * shieldScale}px ${shieldSize * shieldScale}px`,
          imageRendering: 'pixelated'
        }}
      />
    </div>
  );
};

export default ShieldPickup; 