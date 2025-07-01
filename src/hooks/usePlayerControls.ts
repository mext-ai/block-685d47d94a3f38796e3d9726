import { useState, useEffect, useRef } from 'react';
import { Keys, Position } from '../types';
import { TOP_LIMIT, BOTTOM_LIMIT, LEFT_LIMIT, RIGHT_LIMIT } from '../constants';
import { checkCollision } from '../utils/gameUtils';

interface UsePlayerControlsProps {
  gameState: string;
  playerHealth: number;
  isAttacking: boolean;
  triggerAttack: () => void;
  backToMenu: () => void;
}

export const usePlayerControls = ({
  gameState,
  playerHealth,
  isAttacking,
  triggerAttack,
  backToMenu
}: UsePlayerControlsProps) => {
  const [keys, setKeys] = useState({ up: false, down: false, left: false, right: false });
  const [isWalking, setIsWalking] = useState(false);
  const [direction, setDirection] = useState(0);

  // Gestion des touches pour l'attaque et les contrôles
  useEffect(() => {
    if (gameState !== 'playing' || playerHealth <= 0) return;
    
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      
      if (key === ' ' && !isAttacking) {
        event.preventDefault();
        triggerAttack();
        setIsWalking(false);
        return;
      }
      
      if (key === 'escape') {
        event.preventDefault();
        backToMenu();
        return;
      }

      // Mettre à jour l'état des touches (sans preventDefault pour les touches de mouvement)
      setKeys(prev => {
        const newKeys = { ...prev };
        if (key === 'w' || key === 'arrowup') newKeys.up = true;
        if (key === 's' || key === 'arrowdown') newKeys.down = true;
        if (key === 'a' || key === 'arrowleft') newKeys.left = true;
        if (key === 'd' || key === 'arrowright') newKeys.right = true;
        return newKeys;
      });
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      
      setKeys(prev => {
        const newKeys = { ...prev };
        if (key === 'w' || key === 'arrowup') newKeys.up = false;
        if (key === 's' || key === 'arrowdown') newKeys.down = false;
        if (key === 'a' || key === 'arrowleft') newKeys.left = false;
        if (key === 'd' || key === 'arrowright') newKeys.right = false;
        return newKeys;
      });
    };

    const handleWindowBlur = () => {
      setKeys({ up: false, down: false, left: false, right: false });
      setIsWalking(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleWindowBlur);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, [gameState, playerHealth, isAttacking, triggerAttack, backToMenu]);

  // Déterminer la direction et l'état de marche
  useEffect(() => {
    const isMoving = keys.up || keys.down || keys.left || keys.right;
    setIsWalking(isMoving);

    if (isMoving) {
      if (keys.up && !keys.down) {
        setDirection(1); // Haut
      } else if (keys.down && !keys.up) {
        setDirection(0); // Bas
      } else if (keys.left && !keys.right) {
        setDirection(2); // Gauche
      } else if (keys.right && !keys.left) {
        setDirection(3); // Droite
      }
    }
  }, [keys]);

  return {
    keys,
    isWalking,
    direction
  };
};