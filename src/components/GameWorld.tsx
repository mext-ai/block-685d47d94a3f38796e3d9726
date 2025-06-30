import React, { useEffect } from 'react';
import { 
  walkSpriteSheetUrl, 
  attackSpriteSheetUrl, 
  playerDeathSpriteSheetUrl,
  mushroomSpriteSheetUrl,
  mushroomDeathSpriteSheetUrl,
  mushroomAttackSpriteSheetUrl,
  treantWalkSpriteSheetUrl,
  treantDeathSpriteSheetUrl,
  treantAttackSpriteSheetUrl,
  backToLevelsButtonUrl,
  nextLevelButtonUrl,
  spriteWidth,
  spriteHeight,
  walkFramesPerRow,
  attackFramesPerRow,
  deathFramesPerRow,
  treantWalkFramesPerRow,
  treantAttackFramesPerRow,
  treantDeathFramesPerRow
} from '../constants';
import { isEnemyInAttackDirection } from '../gameLogic/collisionDetection';
import { updatePlayerPosition, getPlayerDirection, isPlayerWalking } from '../gameLogic/playerMovement';

interface GameWorldProps {
  player: any;
  enemies: any;
  responsive: any;
  gameState: any;
  audio: any;
  gameStartTime: number;
  setGameStartTime: (time: number) => void;
  gameLoopRef: React.MutableRefObject<number | undefined>;
  startGame: (level: number) => void;
}

export const GameWorld: React.FC<GameWorldProps> = ({
  player,
  enemies,
  responsive,
  gameState,
  audio,
  gameStartTime,
  setGameStartTime,
  gameLoopRef,
  startGame
}) => {
  // Logique de jeu principale
  useEffect(() => {
    if (gameState.gameState !== 'playing') return;

    const gameLoop = () => {
      const currentTime = Date.now();
      const gameTime = currentTime - gameStartTime;

      // Mise à jour de la position du joueur
      const newPosition = updatePlayerPosition(player.position, player.keys);
      player.setPosition(newPosition);
      player.playerPositionRef.current = newPosition;

      // Mise à jour de la direction et de l'état de marche
      const newDirection = getPlayerDirection(player.keys);
      player.setDirection(newDirection);
      player.playerDirectionRef.current = newDirection;

      const walking = isPlayerWalking(player.keys);
      player.setIsWalking(walking);

      // Animation du joueur
      if (walking && !player.isAttacking) {
        player.setCurrentFrame((prev: number) => (prev + 1) % walkFramesPerRow);
      }

      // Gestion de l'attaque du joueur
      if (player.keys.space && !player.isAttacking) {
        player.setIsAttacking(true);
        player.setAttackFrame(0);
        
        // Vérifier les hits d'attaque
        enemies.enemies.forEach((enemy: any) => {
          if (enemy.isAlive && enemy.hasSpawned && !enemy.isDying) {
            if (isEnemyInAttackDirection(player.position.x, player.position.y, enemy.x, enemy.y, player.direction)) {
              const newHp = Math.max(0, enemy.hp - 1);
              enemies.setEnemies((prev: any[]) => prev.map(e => 
                e.id === enemy.id ? { ...e, hp: newHp } : e
              ));
              
              if (newHp <= 0) {
                enemies.setEnemies((prev: any[]) => prev.map(e => 
                  e.id === enemy.id ? { ...e, isDying: true, deathFrame: 0 } : e
                ));
              }
            }
          }
        });
      }

      // Animation d'attaque
      if (player.isAttacking) {
        if (player.attackFrame < attackFramesPerRow - 1) {
          player.setAttackFrame((prev: number) => prev + 1);
        } else {
          player.setIsAttacking(false);
        }
      }

      // Gestion des ennemis
      enemies.enemies.forEach((enemy: any) => {
        // Apparition des ennemis
        if (!enemy.hasSpawned && gameTime >= enemy.spawnTime) {
          enemies.setEnemies((prev: any[]) => prev.map(e => 
            e.id === enemy.id ? { ...e, hasSpawned: true } : e
          ));
        }

        // Animation des ennemis
        if (enemy.hasSpawned && enemy.isAlive && !enemy.isDying && !enemy.isAttacking) {
          enemies.setEnemies((prev: any[]) => prev.map(e => 
            e.id === enemy.id ? { ...e, currentFrame: (e.currentFrame + 1) % walkFramesPerRow } : e
          ));
        }

        // Attaque des ennemis
        if (enemy.hasSpawned && enemy.isAlive && !enemy.isDying) {
          const shouldAttack = checkEnemyAttackHit(enemy, player.position);
          
          if (shouldAttack && !enemy.isAttacking && currentTime - enemy.lastAttackTime > 2000) {
            enemies.setEnemies((prev: any[]) => prev.map(e => 
              e.id === enemy.id ? { ...e, isAttacking: true, attackFrame: 0, lastAttackTime: currentTime } : e
            ));
            
            // Dégâts au joueur
            if (!player.isPlayerDying) {
              player.takeDamage(1);
              audio.playHurtSound();
            }
          }
        }

        // Animation d'attaque des ennemis
        if (enemy.isAttacking) {
          if (enemy.attackFrame < attackFramesPerRow - 1) {
            enemies.setEnemies((prev: any[]) => prev.map(e => 
              e.id === enemy.id ? { ...e, attackFrame: e.attackFrame + 1 } : e
            ));
          } else {
            enemies.setEnemies((prev: any[]) => prev.map(e => 
              e.id === enemy.id ? { ...e, isAttacking: false } : e
            ));
          }
        }

        // Animation de mort des ennemis
        if (enemy.isDying) {
          if (enemy.deathFrame < deathFramesPerRow - 1) {
            enemies.setEnemies((prev: any[]) => prev.map(e => 
              e.id === enemy.id ? { ...e, deathFrame: e.deathFrame + 1 } : e
            ));
          } else {
            enemies.setEnemies((prev: any[]) => prev.map(e => 
              e.id === enemy.id ? { ...e, isAlive: false } : e
            ));
          }
        }
      });

      // Vérifier la victoire
      const remainingEnemies = enemies.enemies.filter((e: any) => e.isAlive && e.hasSpawned).length;
      if (remainingEnemies === 0 && !gameState.isVictory) {
        gameState.completeLevel(gameState.currentLevel);
      }

      // Vérifier la défaite
      if (player.playerHp <= 0 && !player.isPlayerDying) {
        player.setIsPlayerDying(true);
        player.setPlayerDeathFrame(0);
      }

      // Animation de mort du joueur
      if (player.isPlayerDying) {
        if (player.playerDeathFrame < deathFramesPerRow - 1) {
          player.setPlayerDeathFrame((prev: number) => prev + 1);
        } else {
          player.setIsPlayerDisappeared(true);
          player.isPlayerDisappearedRef.current = true;
        }
      }

      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoopRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameState.gameState, gameStartTime, player, enemies, audio, gameState, gameLoopRef]);

  // Calcul des sprites du joueur
  const getCurrentSpriteUrl = () => {
    if (player.isPlayerDying) return playerDeathSpriteSheetUrl;
    if (player.isAttacking) return attackSpriteSheetUrl;
    return walkSpriteSheetUrl;
  };

  const getCurrentSpriteX = () => {
    if (player.isPlayerDying) return player.playerDeathFrame * spriteWidth;
    if (player.isAttacking) return player.attackFrame * spriteWidth;
    return player.currentFrame * spriteWidth;
  };

  const getCurrentSpriteY = () => {
    return player.direction * spriteHeight;
  };

  const getCurrentBackgroundSizeX = () => {
    if (player.isPlayerDying) return spriteWidth * deathFramesPerRow * responsive.spriteScale;
    if (player.isAttacking) return spriteWidth * attackFramesPerRow * responsive.spriteScale;
    return spriteWidth * walkFramesPerRow * responsive.spriteScale;
  };

  return (
    <>
      {/* Personnage sprite */}
      {!player.isPlayerDisappeared && (
        <div style={{
          position: 'absolute',
          left: `${player.position.x}%`,
          top: `${player.position.y}%`,
          transform: 'translate(-50%, -50%)',
          width: `${spriteWidth * responsive.spriteScale}px`,
          height: `${spriteHeight * responsive.spriteScale}px`,
          backgroundImage: `url(${getCurrentSpriteUrl()})`,
          backgroundPosition: `-${getCurrentSpriteX() * responsive.spriteScale}px -${getCurrentSpriteY() * responsive.spriteScale}px`,
          backgroundSize: `${getCurrentBackgroundSizeX()}px auto`,
          imageRendering: 'pixelated',
          transition: 'none',
          zIndex: 10
        }} />
      )}

      {/* Ennemis */}
      {enemies.enemies.map((enemy: any) => {
        if (!enemy.hasSpawned || (!enemy.isAlive && !enemy.isDying)) return null;
        
        let enemySpriteX, enemySpriteY, enemySpriteUrl, enemyBackgroundSizeX;

        if (enemy.isDying) {
          if (enemy.type === 'treant') {
            enemySpriteX = enemy.deathFrame * spriteWidth;
            enemySpriteY = enemy.direction * spriteHeight;
            enemySpriteUrl = treantDeathSpriteSheetUrl;
            enemyBackgroundSizeX = spriteWidth * treantDeathFramesPerRow * responsive.treantSpriteScale;
          } else {
            const deathImageIndex = enemy.deathFrame + 2;
            enemySpriteX = deathImageIndex * spriteWidth;
            enemySpriteY = enemy.direction * spriteHeight;
            enemySpriteUrl = mushroomDeathSpriteSheetUrl;
            enemyBackgroundSizeX = spriteWidth * deathFramesPerRow * responsive.enemySpriteScale;
          }
        } else if (enemy.isAttacking) {
          if (enemy.type === 'treant') {
            enemySpriteX = enemy.attackFrame * spriteWidth;
            enemySpriteY = enemy.direction * spriteHeight;
            enemySpriteUrl = treantAttackSpriteSheetUrl;
            enemyBackgroundSizeX = spriteWidth * treantAttackFramesPerRow * responsive.treantSpriteScale;
          } else {
            enemySpriteX = enemy.attackFrame * spriteWidth;
            enemySpriteY = enemy.direction * spriteHeight;
            enemySpriteUrl = mushroomAttackSpriteSheetUrl;
            enemyBackgroundSizeX = spriteWidth * attackFramesPerRow * responsive.enemySpriteScale;
          }
        } else {
          if (enemy.type === 'treant') {
            enemySpriteX = enemy.currentFrame * spriteWidth;
            enemySpriteY = enemy.direction * spriteHeight;
            enemySpriteUrl = treantWalkSpriteSheetUrl;
            enemyBackgroundSizeX = spriteWidth * treantWalkFramesPerRow * responsive.treantSpriteScale;
          } else {
            enemySpriteX = enemy.currentFrame * spriteWidth;
            enemySpriteY = enemy.direction * spriteHeight;
            enemySpriteUrl = mushroomSpriteSheetUrl;
            enemyBackgroundSizeX = spriteWidth * walkFramesPerRow * responsive.enemySpriteScale;
          }
        }
              
        return (
          <div key={enemy.id}>
            <div
              style={{
                position: 'absolute',
                left: `${enemy.x}%`,
                top: `${enemy.y}%`,
                transform: 'translate(-50%, -50%)',
                width: `${spriteWidth * (enemy.type === 'treant' ? responsive.treantSpriteScale : responsive.enemySpriteScale)}px`,
                height: `${spriteHeight * (enemy.type === 'treant' ? responsive.treantSpriteScale : responsive.enemySpriteScale)}px`,
                backgroundImage: `url(${enemySpriteUrl})`,
                backgroundPosition: `-${enemySpriteX * (enemy.type === 'treant' ? responsive.treantSpriteScale : responsive.enemySpriteScale)}px -${enemySpriteY * (enemy.type === 'treant' ? responsive.treantSpriteScale : responsive.enemySpriteScale)}px`,
                backgroundSize: `${enemyBackgroundSizeX}px auto`,
                imageRendering: 'pixelated',
                transition: 'none',
                zIndex: 9,
                opacity: enemy.isDying ? 0.8 : 1
              }}
            />
            
            {!enemy.isDying && (
              <>
                <div
                  style={{
                    position: 'absolute',
                    left: `${enemy.x}%`,
                    top: `${enemy.y - (enemy.type === 'treant' ? 
                      Math.max(7, 4 + (responsive.treantSpriteScale / 2)) : 
                      Math.max(5, 3 + (responsive.enemySpriteScale / 2)))}%`,
                    transform: 'translateX(-50%)',
                    width: `${(enemy.type === 'treant' ? 40 : 60) * ((enemy.type === 'treant' ? responsive.treantSpriteScale : responsive.enemySpriteScale) / 3)}px`,
                    height: `${Math.max(8, (enemy.type === 'treant' ? 10 : 12) * ((enemy.type === 'treant' ? responsive.treantSpriteScale : responsive.enemySpriteScale) / 5))}px`,
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
              </>
            )}
          </div>
        );
      })}

      {/* Message de victoire */}
      {gameState.isVictory && gameState.gameState === 'playing' && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: `${Math.max(500, responsive.windowSize.width * 0.5)}px`,
          height: `${Math.max(400, responsive.windowSize.height * 0.4)}px`,
          backgroundImage: `url(https://drive.google.com/thumbnail?id=1cMdqOupNWB-eIM1VFCVvvNfUsJkvinS7&sz=w1000)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          color: 'gold',
          padding: '30px',
          borderRadius: '15px',
          textAlign: 'center',
          fontSize: `${Math.max(24, responsive.windowSize.width * 0.02)}px`,
          fontWeight: 'bold',
          zIndex: 100,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <div style={{ 
            display: 'flex', 
            gap: '30px', 
            marginTop: "25%",
            flexWrap: 'wrap',
            justifyContent: 'center'
          }}>
            {/* Bouton Retour aux niveaux */}
            <div
              onClick={gameState.returnToLevelSelect}
              style={{
                width: `${Math.max(80, responsive.windowSize.width * 0.06)}px`,
                height: `${Math.max(80, responsive.windowSize.width * 0.06)}px`,
                backgroundImage: `url(${backToLevelsButtonUrl})`,
                backgroundSize: 'contain',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                filter: 'brightness(1) drop-shadow(0 0 5px rgba(0,0,0,0.3))',
                transform: 'scale(1)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.1)';
                e.currentTarget.style.filter = 'brightness(1.2) drop-shadow(0 0 15px rgba(255,255,255,0.6))';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.filter = 'brightness(1) drop-shadow(0 0 5px rgba(0,0,0,0.3))';
              }}
            />
            {/* Bouton Next Level */}
            <div
              onClick={() => {
                if (gameState.currentLevel === 1) {
                  startGame(2);
                }
              }}
              style={{
                width: `${Math.max(80, responsive.windowSize.width * 0.06)}px`,
                height: `${Math.max(80, responsive.windowSize.width * 0.06)}px`,
                backgroundImage: `url(${nextLevelButtonUrl})`,
                backgroundSize: 'contain',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                cursor: gameState.currentLevel === 1 ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s ease',
                filter: gameState.currentLevel === 1 ? 
                  'brightness(1) drop-shadow(0 0 5px rgba(0,0,0,0.3))' : 
                  'brightness(0.7) drop-shadow(0 0 5px rgba(0,0,0,0.3))',
                transform: 'scale(1)',
                opacity: gameState.currentLevel === 1 ? 1 : 0.7
              }}
              onMouseEnter={(e) => {
                if (gameState.currentLevel === 1) {
                  e.currentTarget.style.transform = 'scale(1.1)';
                  e.currentTarget.style.filter = 'brightness(1.2) drop-shadow(0 0 15px rgba(255,255,255,0.6))';
                }
              }}
              onMouseLeave={(e) => {
                if (gameState.currentLevel === 1) {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.filter = 'brightness(1) drop-shadow(0 0 5px rgba(0,0,0,0.3))';
                }
              }}
            />
          </div>
        </div>
      )}

      {/* Game Over */}
      {player.playerHp <= 0 && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: `${Math.max(500, responsive.windowSize.width * 0.5)}px`,
          height: `${Math.max(400, responsive.windowSize.height * 0.4)}px`,
          backgroundImage: `url(https://drive.google.com/thumbnail?id=1zCeociu3-dvf4F4krvf1qMUrRzyqOW56&sz=w1000)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          color: 'red',
          padding: '30px',
          borderRadius: '15px',
          textAlign: 'center',
          fontSize: `${Math.max(24, responsive.windowSize.width * 0.02)}px`,
          fontWeight: 'bold',
          zIndex: 100,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <div style={{ 
            display: 'flex', 
            gap: '30px', 
            marginTop: "25%",
            flexWrap: 'wrap',
            justifyContent: 'center'
          }}>          
            {/* Bouton Retour aux niveaux */}
            <div
              onClick={gameState.returnToLevelSelect}
              style={{
                width: `${Math.max(80, responsive.windowSize.width * 0.06)}px`,
                height: `${Math.max(80, responsive.windowSize.width * 0.06)}px`,
                backgroundImage: `url(${backToLevelsButtonUrl})`,
                backgroundSize: 'contain',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                filter: 'brightness(1) drop-shadow(0 0 5px rgba(0,0,0,0.3))',
                transform: 'scale(1)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.1)';
                e.currentTarget.style.filter = 'brightness(1.2) drop-shadow(0 0 15px rgba(255,255,255,0.6))';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.filter = 'brightness(1) drop-shadow(0 0 5px rgba(0,0,0,0.3))';
              }}
            />
          </div>
        </div>
      )}
    </>
  );
}; 