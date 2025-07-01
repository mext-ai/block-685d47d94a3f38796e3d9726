import React from 'react';
import { BACKGROUND_IMAGE_URL, LEVEL2_BACKGROUND_URL } from '../constants';
import Player from './Player';
import Enemy from './Enemy';
import Projectile from './Projectile';
import GameUI from './GameUI';
import { Position, Enemy as EnemyType, Projectile as ProjectileType } from '../types';

interface GameAreaProps {
  level: number;
  playerPosition: Position;
  playerDirection: number;
  playerCurrentFrame: number;
  playerIsWalking: boolean;
  playerIsAttacking: boolean;
  playerAttackFrame: number;
  playerIsDead: boolean;
  playerHealth: number;
  enemies: EnemyType[];
  projectiles: ProjectileType[];
  remainingEnemies: number;
  spriteScale: number;
  treantSpriteScale: number;
  devilSpriteScale: number;
  isSoundEnabled: boolean;
  onToggleSound: () => void;
}

const GameArea: React.FC<GameAreaProps> = ({
  level,
  playerPosition,
  playerDirection,
  playerCurrentFrame,
  playerIsWalking,
  playerIsAttacking,
  playerAttackFrame,
  playerIsDead,
  playerHealth,
  enemies,
  projectiles,
  remainingEnemies,
  spriteScale,
  treantSpriteScale,
  devilSpriteScale,
  isSoundEnabled,
  onToggleSound
}) => {
  const backgroundUrl = level === 1 ? BACKGROUND_IMAGE_URL : LEVEL2_BACKGROUND_URL;

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: '100vh',
      backgroundImage: `url(${backgroundUrl})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      overflow: 'hidden'
    }}>
      {/* Joueur */}
      <Player
        position={playerPosition}
        direction={playerDirection}
        currentFrame={playerCurrentFrame}
        isWalking={playerIsWalking}
        isAttacking={playerIsAttacking}
        attackFrame={playerAttackFrame}
        isDead={playerIsDead}
        spriteScale={spriteScale}
      />

      {/* Ennemis */}
      {enemies.map(enemy => (
        <Enemy
          key={enemy.id}
          enemy={enemy}
          spriteScale={spriteScale}
          treantSpriteScale={treantSpriteScale}
          devilSpriteScale={devilSpriteScale}
        />
      ))}

      {/* Projectiles */}
      {projectiles.map(projectile => (
        <Projectile
          key={projectile.id}
          projectile={projectile}
        />
      ))}

      {/* Interface de jeu */}
      <GameUI
        playerHealth={playerHealth}
        remainingEnemies={remainingEnemies}
        isSoundEnabled={isSoundEnabled}
        onToggleSound={onToggleSound}
      />
    </div>
  );
};

export default GameArea; 