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
    
    const startY = 40 + Math.random() * 45; // Entre 40% et 85% de hauteur (comme dans l'original)
    
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

// Fonction pour créer les ennemis du niveau 2 - 15 ennemis variés
export const createLevel2Enemies = (): Enemy[] => {
  const enemies: Enemy[] = [];
  
  const enemySpawnTimes = [
    0,     // Ennemi 1 : immédiat
    2000,  // Ennemi 2 : après 2 secondes
    4000,  // Ennemi 3 : après 4 secondes
    6000,  // Ennemi 4 : après 6 secondes
    8000,  // Ennemi 5 : après 8 secondes
    10000, // Ennemi 6 : après 10 secondes
    12000, // Ennemi 7 : après 12 secondes
    14000, // Ennemi 8 : après 14 secondes
    16000, // Ennemi 9 : après 16 secondes
    18000, // Ennemi 10 : après 18 secondes
    20000, // Ennemi 11 : après 20 secondes
    22000, // Ennemi 12 : après 22 secondes
    24000, // Ennemi 13 : après 24 secondes
    26000, // Ennemi 14 : après 26 secondes
    28000  // Ennemi 15 : après 28 secondes
  ];

  for (let i = 0; i < 15; i++) {
    const fromLeft = i % 2 === 0;
    
    const startX = fromLeft ? 
      5 + Math.random() * 10 :   // Gauche : 5% à 15%
      85 + Math.random() * 10;   // Droite : 85% à 95%
    
    const startY = 40 + Math.random() * 45; // Entre 40% et 85% de hauteur
    
    const initialDirection = fromLeft ? 3 : 2; // 3 = droite, 2 = gauche

    // Distribution des types d'ennemis :
    // - 8 mushrooms (positions 0,1,2,3,8,9,10,11)
    // - 4 treants (positions 4,5,12,13) 
    // - 3 devils (positions 6,7,14)
    let enemyType: 'mushroom' | 'treant' | 'devil';
    let enemyHp: number;
    
    if (i === 6 || i === 7 || i === 14) {
      // 3 diables aux positions stratégiques
      enemyType = 'devil';
      enemyHp = 4;
    } else if (i === 4 || i === 5 || i === 12 || i === 13) {
      // 4 tréants
      enemyType = 'treant';
      enemyHp = 5;
    } else {
      // 8 champignons (le reste)
      enemyType = 'mushroom';
      enemyHp = 3;
    }
    
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

// Fonction pour créer les ennemis du niveau 3
export const createLevel3Enemies = (): Enemy[] => {
  const enemies: Enemy[] = [];
  
  // Créer 3 tréants pour le niveau 3
  for (let i = 0; i < 3; i++) {
    const fromLeft = i % 2 === 0;
    
    const startX = fromLeft ? 
      5 + Math.random() * 10 :   // Gauche : 5% à 15%
      85 + Math.random() * 10;   // Droite : 85% à 95%
    const startY = 40 + Math.random() * 45; // Entre 40% et 85% de hauteur
    
    const enemy: Enemy = {
      id: i + 1,
      type: 'treant',
      x: startX,
      y: startY,
      direction: fromLeft ? 3 : 2, // 3 = droite, 2 = gauche
      currentFrame: 0,
      isAlive: true,
      hp: 5,
      maxHp: 5,
      isDying: false,
      deathFrame: 0,
      isAttacking: false,
      attackFrame: 0,
      lastAttackTime: 0,
      spawnTime: i * 3000, // Spawn toutes les 3 secondes
      hasSpawned: i === 0 // Seul le premier apparaît immédiatement
    };
    
    enemies.push(enemy);
  }
  
  return enemies;
};

// Fonction pour créer les ennemis par défaut (autres niveaux)
export const createDefaultEnemies = (): Enemy[] => {
  const enemies: Enemy[] = [];
  
  // Créer quelques ennemis par défaut
  for (let i = 0; i < 5; i++) {
    const fromLeft = i % 2 === 0;
    
    const startX = fromLeft ? 
      5 + Math.random() * 10 :   // Gauche : 5% à 15%
      85 + Math.random() * 10;   // Droite : 85% à 95%
    const startY = 40 + Math.random() * 45; // Entre 40% et 85% de hauteur
    
    const enemy: Enemy = {
      id: i + 1,
      type: 'mushroom',
      x: startX,
      y: startY,
      direction: fromLeft ? 3 : 2, // 3 = droite, 2 = gauche
      currentFrame: 0,
      isAlive: true,
      hp: 3,
      maxHp: 3,
      isDying: false,
      deathFrame: 0,
      isAttacking: false,
      attackFrame: 0,
      lastAttackTime: 0,
      spawnTime: i * 1500, // Spawn toutes les 1.5 secondes
      hasSpawned: i === 0 // Seul le premier apparaît immédiatement
    };
    
    enemies.push(enemy);
  }
  
  return enemies;
};

// Fonction pour créer les ennemis selon le niveau
export const createEnemiesForLevel = (level: number): Enemy[] => {
  switch (level) {
    case 1:
      return createLevel1Enemies();
    case 2:
      return createLevel2Enemies();
    case 3:
      return createLevel3Enemies();
    default:
      return createDefaultEnemies();
  }
};