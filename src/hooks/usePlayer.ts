import { useState, useRef, useEffect } from 'react';
import { Position, Keys, WindowSize } from '../types';
import { GAME_LIMITS } from '../constants';

export const usePlayer = (gameState: string, isVictory: boolean, playerHp: number) => {
  const [currentFrame, setCurrentFrame] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isWalking, setIsWalking] = useState(false);
  const [isAttacking, setIsAttacking] = useState(false);
  const [attackFrame, setAttackFrame] = useState(0);
  const [position, setPosition] = useState<Position>({ x: 50, y: 50 });
  const [keys, setKeys] = useState<Keys>({ up: false, down: false, left: false, right: false, space: false });
  const [isPlayerDying, setIsPlayerDying] = useState(false);
  const [playerDeathFrame, setPlayerDeathFrame] = useState(0);
  const [isPlayerDisappeared, setIsPlayerDisappeared] = useState(false);

  const playerPositionRef = useRef<Position>({ x: 50, y: 50 });
  const playerDirectionRef = useRef(0);
  const isPlayerDisappearedRef = useRef(false);

  // Mettre à jour les références
  useEffect(() => {
    playerPositionRef.current = position;
  }, [position]);

  useEffect(() => {
    playerDirectionRef.current = direction;
  }, [direction]);

  useEffect(() => {
    isPlayerDisappearedRef.current = isPlayerDisappeared;
  }, [isPlayerDisappeared]);

  // Animation du sprite de marche du joueur
  useEffect(() => {
    if (gameState !== 'playing') return;
    
    const walkAnimationInterval = setInterval(() => {
      if (isWalking && !isAttacking) {
        setCurrentFrame(prev => (prev + 1) % 3);
      }
    }, 150);

    return () => clearInterval(walkAnimationInterval);
  }, [isWalking, isAttacking, gameState]);

  // Animation de mort du joueur
  useEffect(() => {
    if (gameState !== 'playing' || !isPlayerDying) return;
    
    const playerDeathAnimationInterval = setInterval(() => {
      setPlayerDeathFrame(prev => {
        const nextFrame = prev + 1;
        
        if (nextFrame >= 7) {
          clearInterval(playerDeathAnimationInterval);
          return 7;
        }
        
        return nextFrame;
      });
    }, 150);

    return () => clearInterval(playerDeathAnimationInterval);
  }, [gameState, isPlayerDying]);

  // Timer pour faire disparaître le joueur
  useEffect(() => {
    if (gameState !== 'playing' || !isPlayerDying || isPlayerDisappeared) return;
    
    const disappearTimer = setTimeout(() => {
      setIsPlayerDisappeared(true);
    }, 1000);

    return () => clearTimeout(disappearTimer);
  }, [gameState, isPlayerDying, isPlayerDisappeared]);

  // Animation d'attaque
  useEffect(() => {
    if (gameState !== 'playing' || isVictory || playerHp <= 0) return;
    
    if (isAttacking) {
      setAttackFrame(2);
      
      const step1 = setTimeout(() => {
        setAttackFrame(3);
      }, 120);
      
      const step2 = setTimeout(() => {
        setIsAttacking(false);
        setAttackFrame(0);
      }, 240);

      return () => {
        clearTimeout(step1);
        clearTimeout(step2);
      };
    }
  }, [isAttacking, gameState, isVictory, playerHp]);

  // Gestion des touches
  useEffect(() => {
    if (gameState !== 'playing' || isVictory || playerHp <= 0) return;
    
    const handleKeyDown = (event: KeyboardEvent) => {
      event.preventDefault();
      const key = event.key.toLowerCase();
      
      if (key === ' ' && !isAttacking) {
        setIsAttacking(true);
        setIsWalking(false);
        return;
      }
      
      if (key === 'escape') {
        return;
      }
      
      setKeys(prev => ({
        ...prev,
        up: prev.up || key === 'arrowup' || key === 'z',
        down: prev.down || key === 'arrowdown' || key === 's',
        left: prev.left || key === 'arrowleft' || key === 'q',
        right: prev.right || key === 'arrowright' || key === 'd',
        space: prev.space || key === ' '
      }));
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      event.preventDefault();
      const key = event.key.toLowerCase();
      
      setKeys(prev => ({
        ...prev,
        up: prev.up && !(key === 'arrowup' || key === 'z'),
        down: prev.down && !(key === 'arrowdown' || key === 's'),
        left: prev.left && !(key === 'arrowleft' || key === 'q'),
        right: prev.right && !(key === 'arrowright' || key === 'd'),
        space: prev.space && key !== ' '
      }));
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isAttacking, gameState, isVictory, playerHp]);

  const resetPlayer = () => {
    setPosition({ x: 50, y: 50 });
    setIsWalking(false);
    setIsAttacking(false);
    setIsPlayerDying(false);
    setPlayerDeathFrame(0);
    setIsPlayerDisappeared(false);
  };

  const triggerPlayerDeath = () => {
    setIsPlayerDying(true);
    setPlayerDeathFrame(0);
  };

  return {
    currentFrame,
    direction,
    setDirection,
    isWalking,
    setIsWalking,
    isAttacking,
    setIsAttacking,
    attackFrame,
    setAttackFrame,
    position,
    setPosition,
    keys,
    isPlayerDying,
    playerDeathFrame,
    isPlayerDisappeared,
    playerPositionRef,
    playerDirectionRef,
    isPlayerDisappearedRef,
    resetPlayer,
    triggerPlayerDeath
  };
}; 