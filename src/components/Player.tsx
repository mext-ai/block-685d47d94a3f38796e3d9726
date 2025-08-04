import React from 'react';
import { Position } from '../types';
import {
  WALK_SPRITE_SHEET_URL,
  ATTACK_SPRITE_SHEET_URL,
  PLAYER_DEATH_SPRITE_SHEET_URL,
  SPRITE_WIDTH,
  SPRITE_HEIGHT,
  WALK_FRAMES_PER_ROW,
  ATTACK_FRAMES_PER_ROW,
  PLAYER_DEATH_FRAMES_PER_ROW
} from '../constants';

interface PlayerProps {
  position: Position;
  direction: number;
  currentFrame: number;
  isWalking: boolean;
  isAttacking: boolean;
  attackFrame: number;
  isDead: boolean;
  deathFrame: number;
  spriteScale: number;
  isInvincible?: boolean;
}

const Player: React.FC<PlayerProps> = ({
  position,
  direction,
  currentFrame,
  isWalking,
  isAttacking,
  attackFrame,
  isDead,
  deathFrame,
  spriteScale,
  isInvincible = false
}) => {
  let spriteUrl, framesPerRow, frame;
  
  if (isDead) {
    spriteUrl = PLAYER_DEATH_SPRITE_SHEET_URL;
    framesPerRow = PLAYER_DEATH_FRAMES_PER_ROW;
    frame = deathFrame; // Utiliser la frame d'animation de mort
  } else if (isAttacking) {
    spriteUrl = ATTACK_SPRITE_SHEET_URL;
    framesPerRow = ATTACK_FRAMES_PER_ROW;
    frame = attackFrame;
  } else {
    spriteUrl = WALK_SPRITE_SHEET_URL;
    framesPerRow = WALK_FRAMES_PER_ROW;
    frame = isWalking ? currentFrame : 0;
  }

  return (
    <div
      style={{
        position: 'absolute',
        left: `${position.x}%`,
        top: `${position.y}%`,
        transform: 'translate(-50%, -50%)',
        width: `${SPRITE_WIDTH * spriteScale}px`,
        height: `${SPRITE_HEIGHT * spriteScale}px`,
        backgroundImage: `url(${spriteUrl})`,
        backgroundPosition: `-${frame * SPRITE_WIDTH * spriteScale}px -${direction * SPRITE_HEIGHT * spriteScale}px`,
        backgroundSize: `${SPRITE_WIDTH * framesPerRow * spriteScale}px auto`,
        imageRendering: 'pixelated',
        transition: 'none',
        zIndex: 10,
        filter: isInvincible ? 'drop-shadow(0 0 10px rgba(0, 150, 255, 0.8)) brightness(1.3)' : 'none',
        animation: isInvincible ? 'invinciblePulse 0.5s ease-in-out infinite alternate' : 'none',
      }}
    />
  );
};

// Styles CSS pour l'animation d'invincibilité
const style = document.createElement('style');
style.textContent = `
  @keyframes invinciblePulse {
    0% {
      opacity: 1;
      filter: drop-shadow(0 0 10px rgba(0, 150, 255, 0.8)) brightness(1.3);
    }
    100% {
      opacity: 0.7;
      filter: drop-shadow(0 0 15px rgba(0, 150, 255, 1)) brightness(1.5);
    }
  }
`;
document.head.appendChild(style);

export default Player; 