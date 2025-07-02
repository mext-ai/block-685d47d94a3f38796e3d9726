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
        }
        
        // Infliger les dégâts au joueur
        onPlayerHit(damage);
        
        // Marquer que cet ennemi a infligé ses dégâts pour cette attaque
        return markEnemyDamageDealt(enemy);
      }
      
      return enemy;
    });
  }, []);

  return { checkAttacks };
};