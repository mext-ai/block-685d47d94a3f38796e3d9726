import { useState, useEffect } from 'react';

interface UsePlayerAnimationProps {
  gameState: string;
  isWalking: boolean;
  isDead: boolean;
}

export const usePlayerAnimation = ({
  gameState,
  isWalking,
  isDead
}: UsePlayerAnimationProps) => {
  const [currentFrame, setCurrentFrame] = useState(0);
  const [deathFrame, setDeathFrame] = useState(0);

  // Animation du sprite de marche du joueur
  useEffect(() => {
    if (gameState !== 'playing') return;
    
    const walkAnimationInterval = setInterval(() => {
      if (isWalking && !isDead) {
        setCurrentFrame(prev => (prev + 1) % 3);
      }
    }, 150);

    return () => clearInterval(walkAnimationInterval);
  }, [isWalking, gameState, isDead]);

  // Animation de mort du joueur
  useEffect(() => {
    if (gameState !== 'playing' || !isDead) return;
    
    const deathAnimationInterval = setInterval(() => {
      setDeathFrame(prev => {
        if (prev < 7) { // 8 frames d'animation de mort (0-7)
          return prev + 1;
        }
        return prev;
      });
    }, 200);

    return () => clearInterval(deathAnimationInterval);
  }, [isDead, gameState]);

  return {
    currentFrame,
    deathFrame
  };
}; 