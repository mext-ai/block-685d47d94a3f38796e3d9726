import { useCallback } from 'react';
import { Position } from '../types';
import { Enemy, checkEnemyAttackHit, markEnemyDamageDealt } from '../systems/EnemySystem';

export const useEnemyAttack = () => {
  
  const checkAttacks = useCallback((
    enemies: Enemy[], 
    playerPosition: Position,
    onPlayerHit: (damage: number) => void
  ): Enemy[] => {
    return enemies.map(enemy => {
      // Vérifier si l'ennemi est en train d'attaquer, n'a pas encore infligé de dégâts, et est encore vivant
      if (enemy.isAttacking && !enemy.hasDamageBeenDealt && enemy.isAlive && !enemy.isDying) {
        // Déterminer à quelle frame les dégâts doivent être infligés (avant-dernière frame)
        let damageFrame = 0;
        let totalFrames = 0;
        
        switch (enemy.type) {
          case 'mushroom':
            totalFrames = 4;
            damageFrame = 3; // Avant-dernière frame
            break;
          case 'treant':
            totalFrames = 7;
            damageFrame = 6; // Avant-dernière frame
            break;
          case 'devil':
            totalFrames = 6;
            damageFrame = 5; // Avant-dernière frame
            break;
          case 'goblin':
            totalFrames = 5;
            damageFrame = 4; // Avant-dernière frame
            break;
          case 'golem':
            totalFrames = 9;
            damageFrame = 8; // Avant-dernière frame
            break;
        }
        
        // Vérifier si nous sommes à la frame de dégâts
        if (enemy.attackFrame >= damageFrame) {
          // Vérifier si cette attaque touche le joueur
          if (checkEnemyAttackHit(enemy, playerPosition)) {
            // Déterminer les dégâts selon le type d'ennemi
            let damage = 1;
            switch (enemy.type) {
              case 'mushroom':
                damage = 1;
                break;
              case 'treant':
                damage = 2;
                break;
              case 'devil':
                damage = 1;
                break;
              case 'goblin':
                damage = 1;
                break;
              case 'golem':
                damage = 3;
                break;
            }
            
            // Infliger les dégâts au joueur
            onPlayerHit(damage);
          }
          
          // Marquer que cet ennemi a infligé ses dégâts pour cette attaque (même s'il n'a pas touché)
          return markEnemyDamageDealt(enemy);
        }
      }
      
      return enemy;
    });
  }, []);

  return { checkAttacks };
};