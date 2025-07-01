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
  spriteScale: number;
}

const Player: React.FC<PlayerProps> = ({
  position,
  direction,
  currentFrame,
  isWalking,
  isAttacking,
  attackFrame,
  isDead,
  spriteScale
}) => {
  let spriteUrl, framesPerRow, frame;
  
  if (isDead) {
    spriteUrl = PLAYER_DEATH_SPRITE_SHEET_URL;
    framesPerRow = PLAYER_DEATH_FRAMES_PER_ROW;
    frame = 0; // Frame de mort fixe
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
      }}
    />
  );
};

export default Player; 