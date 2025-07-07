import React from 'react';
import { Enemy as EnemyType } from '../types';
import {
  MUSHROOM_SPRITE_SHEET_URL,
  MUSHROOM_DEATH_SPRITE_SHEET_URL,
  MUSHROOM_ATTACK_SPRITE_SHEET_URL,
  TREANT_WALK_SPRITE_SHEET_URL,
  TREANT_DEATH_SPRITE_SHEET_URL,
  TREANT_ATTACK_SPRITE_SHEET_URL,
  DEVIL_WALK_SPRITE_SHEET_URL,
  DEVIL_ATTACK_SPRITE_SHEET_URL,
  DEVIL_DEATH_SPRITE_SHEET_URL,
  GOBLIN_WALK_SPRITE_SHEET_URL,
  GOBLIN_ATTACK_SPRITE_SHEET_URL,
  GOBLIN_DEATH_SPRITE_SHEET_URL,
  SPRITE_WIDTH,
  SPRITE_HEIGHT,
  WALK_FRAMES_PER_ROW,
  ATTACK_FRAMES_PER_ROW,
  DEATH_FRAMES_PER_ROW,
  TREANT_WALK_FRAMES_PER_ROW,
  TREANT_ATTACK_FRAMES_PER_ROW,
  TREANT_DEATH_FRAMES_PER_ROW,
  DEVIL_WALK_FRAMES_PER_ROW,
  DEVIL_ATTACK_FRAMES_PER_ROW,
  DEVIL_DEATH_FRAMES_PER_ROW,
  GOBLIN_WALK_FRAMES_PER_ROW,
  GOBLIN_ATTACK_FRAMES_PER_ROW,
  GOBLIN_DEATH_FRAMES_PER_ROW
} from '../constants';

interface EnemyProps {
  enemy: EnemyType;
  spriteScale: number;
  treantSpriteScale: number;
  devilSpriteScale: number;
  goblinSpriteScale: number;
}

const Enemy: React.FC<EnemyProps> = ({
  enemy,
  spriteScale,
  treantSpriteScale,
  devilSpriteScale,
  goblinSpriteScale
}) => {
  if (!enemy.hasSpawned) return null;

  const isTreant = enemy.type === 'treant';
  const isDevil = enemy.type === 'devil';
  const isGoblin = enemy.type === 'goblin';
  let spriteUrl, framesPerRow, currentFrame;
  
  if (enemy.isDying) {
    if (isTreant) {
      spriteUrl = TREANT_DEATH_SPRITE_SHEET_URL;
      framesPerRow = TREANT_DEATH_FRAMES_PER_ROW;
    } else if (isDevil) {
      spriteUrl = DEVIL_DEATH_SPRITE_SHEET_URL;
      framesPerRow = DEVIL_DEATH_FRAMES_PER_ROW;
    } else if (isGoblin) {
      spriteUrl = GOBLIN_DEATH_SPRITE_SHEET_URL;
      framesPerRow = GOBLIN_DEATH_FRAMES_PER_ROW;
    } else {
      spriteUrl = MUSHROOM_DEATH_SPRITE_SHEET_URL;
      framesPerRow = DEATH_FRAMES_PER_ROW;
    }
    currentFrame = enemy.deathFrame;
  } else if (enemy.isAttacking) {
    if (isTreant) {
      spriteUrl = TREANT_ATTACK_SPRITE_SHEET_URL;
      framesPerRow = TREANT_ATTACK_FRAMES_PER_ROW;
    } else if (isDevil) {
      spriteUrl = DEVIL_ATTACK_SPRITE_SHEET_URL;
      framesPerRow = DEVIL_ATTACK_FRAMES_PER_ROW;
    } else if (isGoblin) {
      spriteUrl = GOBLIN_ATTACK_SPRITE_SHEET_URL;
      framesPerRow = GOBLIN_ATTACK_FRAMES_PER_ROW;
    } else {
      spriteUrl = MUSHROOM_ATTACK_SPRITE_SHEET_URL;
      framesPerRow = ATTACK_FRAMES_PER_ROW;
    }
    currentFrame = enemy.attackFrame;
  } else {
    if (isTreant) {
      spriteUrl = TREANT_WALK_SPRITE_SHEET_URL;
      framesPerRow = TREANT_WALK_FRAMES_PER_ROW;
    } else if (isDevil) {
      spriteUrl = DEVIL_WALK_SPRITE_SHEET_URL;
      framesPerRow = DEVIL_WALK_FRAMES_PER_ROW;
    } else if (isGoblin) {
      spriteUrl = GOBLIN_WALK_SPRITE_SHEET_URL;
      framesPerRow = GOBLIN_WALK_FRAMES_PER_ROW;
    } else {
      spriteUrl = MUSHROOM_SPRITE_SHEET_URL;
      framesPerRow = WALK_FRAMES_PER_ROW;
    }
    currentFrame = enemy.currentFrame;
  }
  
  const currentSpriteScale = isTreant ? treantSpriteScale : isDevil ? devilSpriteScale : isGoblin ? goblinSpriteScale : spriteScale;

  return (
    <div key={enemy.id}>
      <div
        style={{
          position: 'absolute',
          left: `${enemy.x}%`,
          top: `${enemy.y}%`,
          transform: 'translate(-50%, -50%)',
          width: `${SPRITE_WIDTH * currentSpriteScale}px`,
          height: `${SPRITE_HEIGHT * currentSpriteScale}px`,
          backgroundImage: `url(${spriteUrl})`,
          backgroundPosition: `-${currentFrame * SPRITE_WIDTH * currentSpriteScale}px -${enemy.direction * SPRITE_HEIGHT * currentSpriteScale}px`,
          backgroundSize: `${SPRITE_WIDTH * framesPerRow * currentSpriteScale}px auto`,
          imageRendering: 'pixelated',
          transition: 'none',
          zIndex: 5,
          opacity: enemy.isAlive ? 1 : 0.5,
          filter: enemy.isDying ? 'grayscale(100%)' : 'none'
        }}
      />
      
      {/* Barre de vie de l'ennemi */}
      {!enemy.isDying && (
        <div
          style={{
            position: 'absolute',
            left: `${enemy.x}%`,
            top: `${enemy.y - (isTreant ? 
              Math.max(7, 4 + (treantSpriteScale / 2)) : 
              isDevil ? Math.max(6, 3.5 + (devilSpriteScale / 2)) :
              isGoblin ? Math.max(5, 3 + (goblinSpriteScale / 2)) :
              Math.max(5, 3 + (spriteScale / 2)))}%`,
            transform: 'translateX(-50%)',
            width: `${(isTreant ? 40 : isDevil ? 50 : isGoblin ? 45 : 60) * ((isTreant ? treantSpriteScale : isDevil ? devilSpriteScale : isGoblin ? goblinSpriteScale : spriteScale) / 3)}px`,
            height: `${Math.max(8, (isTreant ? 10 : isDevil ? 11 : isGoblin ? 10 : 12) * ((isTreant ? treantSpriteScale : isDevil ? devilSpriteScale : isGoblin ? goblinSpriteScale : spriteScale) / 5))}px`,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            border: '1px solid #333',
            borderRadius: '3px',
            zIndex: 11
          }}
        >
          <div
            style={{
              width: `${(enemy.hp / enemy.maxHp) * 100}%`,
              height: '100%',
              backgroundColor: enemy.hp > enemy.maxHp * 0.6 ? '#4CAF50' : 
                             enemy.hp > enemy.maxHp * 0.3 ? '#FF9800' : '#F44336',
              borderRadius: '2px',
              transition: 'width 0.3s ease, background-color 0.3s ease'
            }}
          />
        </div>
      )}
    </div>
  );
};

export default Enemy; 