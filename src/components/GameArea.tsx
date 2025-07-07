import React from 'react';
import { 
  BACKGROUND_IMAGE_URL, 
  LEVEL2_BACKGROUND_URL, 
  LEVEL3_BACKGROUND_URL,
  LEVEL4_BACKGROUND_URL,
  LEVEL5_BACKGROUND_URL,
  LEVEL6_BACKGROUND_URL,
  LEVEL7_BACKGROUND_URL,
  LEVEL8_BACKGROUND_URL,
  LEVEL9_BACKGROUND_URL
} from '../constants';
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
  playerDeathFrame: number;
  playerHealth: number;
  enemies: EnemyType[];
  projectiles: ProjectileType[];
  remainingEnemies: number;
  spriteScale: number;
  treantSpriteScale: number;
  devilSpriteScale: number;
  observerSpriteScale: number;
  goblinSpriteScale: number;
  golemSpriteScale: number;
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
  playerDeathFrame,
  playerHealth,
  enemies,
  projectiles,
  remainingEnemies,
  spriteScale,
  treantSpriteScale,
  devilSpriteScale,
  observerSpriteScale,
  goblinSpriteScale,
  golemSpriteScale,
  isSoundEnabled,
  onToggleSound
}) => {
  const backgroundUrl = level === 1 ? BACKGROUND_IMAGE_URL : 
                       level === 2 ? LEVEL2_BACKGROUND_URL : 
                       level === 3 ? LEVEL3_BACKGROUND_URL :
                       level === 4 ? LEVEL4_BACKGROUND_URL :
                       level === 5 ? LEVEL5_BACKGROUND_URL :
                       level === 6 ? LEVEL6_BACKGROUND_URL :
                       level === 7 ? LEVEL7_BACKGROUND_URL :
                       level === 8 ? LEVEL8_BACKGROUND_URL :
                       level === 9 ? LEVEL9_BACKGROUND_URL :
                       BACKGROUND_IMAGE_URL; // fallback
  
  // Debug temporaire
  console.log('GameArea - Level:', level, 'Background URL:', backgroundUrl);

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
        deathFrame={playerDeathFrame}
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
          observerSpriteScale={observerSpriteScale}
          goblinSpriteScale={goblinSpriteScale}
          golemSpriteScale={golemSpriteScale}
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