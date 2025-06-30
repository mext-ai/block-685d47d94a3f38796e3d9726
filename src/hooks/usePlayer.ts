import { useState, useRef } from 'react';
import { Position, Keys } from '../types';
import { PLAYER_MAX_HP, PLAYER_START_X, PLAYER_START_Y } from '../constants';

export const usePlayer = () => {
  const [currentFrame, setCurrentFrame] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isWalking, setIsWalking] = useState(false);
  const [isAttacking, setIsAttacking] = useState(false);
  const [attackFrame, setAttackFrame] = useState(0);
  const [position, setPosition] = useState<Position>({ x: PLAYER_START_X, y: PLAYER_START_Y });
  const [keys, setKeys] = useState<Keys>({ up: false, down: false, left: false, right: false, space: false });
  const [playerHp, setPlayerHp] = useState(PLAYER_MAX_HP);
  const [isPlayerDying, setIsPlayerDying] = useState(false);
  const [playerDeathFrame, setPlayerDeathFrame] = useState(0);
  const [isPlayerDisappeared, setIsPlayerDisappeared] = useState(false);

  // Références pour avoir toujours la position actuelle
  const playerPositionRef = useRef<Position>({ x: PLAYER_START_X, y: PLAYER_START_Y });
  const playerDirectionRef = useRef(0);
  const isPlayerDisappearedRef = useRef(false);

  const resetPlayer = () => {
    setCurrentFrame(0);
    setDirection(0);
    setIsWalking(false);
    setIsAttacking(false);
    setAttackFrame(0);
    setPosition({ x: PLAYER_START_X, y: PLAYER_START_Y });
    setKeys({ up: false, down: false, left: false, right: false, space: false });
    setPlayerHp(PLAYER_MAX_HP);
    setIsPlayerDying(false);
    setPlayerDeathFrame(0);
    setIsPlayerDisappeared(false);
    
    playerPositionRef.current = { x: PLAYER_START_X, y: PLAYER_START_Y };
    playerDirectionRef.current = 0;
    isPlayerDisappearedRef.current = false;
  };

  const takeDamage = (damage: number) => {
    setPlayerHp((prev: number) => Math.max(0, prev - damage));
  };

  const heal = (amount: number) => {
    setPlayerHp((prev: number) => Math.min(PLAYER_MAX_HP, prev + amount));
  };

  return {
    // États
    currentFrame,
    direction,
    isWalking,
    isAttacking,
    attackFrame,
    position,
    keys,
    playerHp,
    isPlayerDying,
    playerDeathFrame,
    isPlayerDisappeared,
    
    // Références
    playerPositionRef,
    playerDirectionRef,
    isPlayerDisappearedRef,
    
    // Setters
    setCurrentFrame,
    setDirection,
    setIsWalking,
    setIsAttacking,
    setAttackFrame,
    setPosition,
    setKeys,
    setPlayerHp,
    setIsPlayerDying,
    setPlayerDeathFrame,
    setIsPlayerDisappeared,
    
    // Actions
    resetPlayer,
    takeDamage,
    heal
  };
}; 