import { useState, useEffect } from 'react';

interface UsePlayerAnimationProps {
  gameState: string;
  isWalking: boolean;
}

export const usePlayerAnimation = ({
  gameState,
  isWalking
}: UsePlayerAnimationProps) => {
  const [currentFrame, setCurrentFrame] = useState(0);

  // Animation du sprite de marche du joueur
  useEffect(() => {
    if (gameState !== 'playing') return;
    
    const walkAnimationInterval = setInterval(() => {
      if (isWalking) {
        setCurrentFrame(prev => (prev + 1) % 3);
      }
    }, 150);

    return () => clearInterval(walkAnimationInterval);
  }, [isWalking, gameState]);

  return {
    currentFrame
  };
}; 