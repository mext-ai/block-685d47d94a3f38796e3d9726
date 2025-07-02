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

  // Fonction pour réinitialiser toutes les touches
  const resetAllKeys = () => {
    setKeys({ up: false, down: false, left: false, right: false });
    setIsWalking(false);
  };

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

    // Gestionnaires pour détecter la perte de focus
    const handleWindowBlur = () => {
      resetAllKeys();
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        resetAllKeys();
      }
    };

    const handleMouseLeave = (event: MouseEvent) => {
      // Si la souris quitte complètement la fenêtre
      if (event.clientY <= 0 || event.clientX <= 0 || 
          event.clientX >= window.innerWidth || event.clientY >= window.innerHeight) {
        resetAllKeys();
      }
    };

    const handleClick = (event: MouseEvent) => {
      // Si l'utilisateur clique en dehors de la zone de jeu, réinitialiser les touches
      const target = event.target as HTMLElement;
      if (!target.closest('canvas') && !target.closest('[data-game-area]')) {
        resetAllKeys();
      }
    };

    // Gestionnaire pour détecter Alt+Tab ou Cmd+Tab
    const handleFocusOut = () => {
      resetAllKeys();
    };

    // Ajouter tous les gestionnaires d'événements
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleFocusOut); // Au retour de focus, s'assurer que tout est réinitialisé
    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('click', handleClick);

    // Gestionnaire spécial pour les touches Alt et Cmd (souvent utilisées pour Alt+Tab / Cmd+Tab)
    const handleSpecialKeys = (event: KeyboardEvent) => {
      if (event.altKey || event.metaKey) {
        resetAllKeys();
      }
    };
    window.addEventListener('keydown', handleSpecialKeys);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focus', handleFocusOut);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('click', handleClick);
      window.removeEventListener('keydown', handleSpecialKeys);
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