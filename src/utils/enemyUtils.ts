import { Enemy } from '../types';

// Fonction pour créer les ennemis du niveau 1
export const createLevel1Enemies = (): Enemy[] => {
  const enemies: Enemy[] = [];
  
  const enemySpawnTimes = [
    0,    // Ennemi 1 : immédiat
    3000, // Ennemi 2 : après 3 secondes
    5000, // Ennemi 3 : après 5 secondes
    8000, // Ennemi 4 : après 8 secondes
    12000, // Ennemi 5 : après 12 secondes
    15000, // Ennemi 6 : après 15 secondes
    18000, // Ennemi 7 : après 18 secondes
    22000, // Ennemi 8 : après 22 secondes
    25000, // Ennemi 9 : après 25 secondes
    30000  // Ennemi 10 : après 30 secondes
  ];

  for (let i = 0; i < 10; i++) {
    const fromLeft = i % 2 === 0;
    
    const startX = fromLeft ? 
      5 + Math.random() * 10 :   // Gauche : 5% à 15%
      85 + Math.random() * 10;   // Droite : 85% à 95%
    
    const startY = 40 + Math.random() * 45; // Entre 40% et 85% de hauteur
    
    const initialDirection = fromLeft ? 3 : 2; // 3 = droite, 2 = gauche

    const isTreant = i === 4 || i === 9;
    const enemyType = isTreant ? 'treant' : 'mushroom';
    const enemyHp = isTreant ? 5 : 3;
    
    const enemy: Enemy = {
      id: i + 1,
      type: enemyType,
      x: startX,
      y: startY,
      direction: initialDirection,
      currentFrame: 0,
      isAlive: true,
      hp: enemyHp,
      maxHp: enemyHp,
      isDying: false,
      deathFrame: 0,
      isAttacking: false,
      attackFrame: 0,
      lastAttackTime: 0,
      spawnTime: enemySpawnTimes[i],
      hasSpawned: enemySpawnTimes[i] === 0
    };
    
    enemies.push(enemy);
  }
  
  return enemies;
};

// Fonction pour créer les ennemis du niveau 2
export const createLevel2Enemies = (): Enemy[] => {
  const enemies: Enemy[] = [];
  
  const enemy: Enemy = {
    id: 1,
    type: 'mushroom',
    x: 75,
    y: 60,
    direction: 2,
    currentFrame: 0,
    isAlive: true,
    hp: 3,
    maxHp: 3,
    isDying: false,
    deathFrame: 0,
    isAttacking: false,
    attackFrame: 0,
    lastAttackTime: 0,
    spawnTime: 0,
    hasSpawned: true
  };
  
  enemies.push(enemy);
  return enemies;
};

// Fonction pour créer les ennemis par défaut (autres niveaux)
export const createDefaultEnemies = (): Enemy[] => {
  const initialMushroom: Enemy = {
    id: 1,
    type: 'mushroom',
    x: 20,
    y: 70,
    direction: 3,
    currentFrame: 0,
    isAlive: true,
    hp: 3,
    maxHp: 3,
    isDying: false,
    deathFrame: 0,
    isAttacking: false,
    attackFrame: 0,
    lastAttackTime: 0,
    spawnTime: 0,
    hasSpawned: true
  };
  return [initialMushroom];
};

// Fonction pour créer les ennemis selon le niveau
export const createEnemiesForLevel = (level: number): Enemy[] => {
  switch (level) {
    case 1:
      return createLevel1Enemies();
    case 2:
      return createLevel2Enemies();
    default:
      return createDefaultEnemies();
  }
}; 