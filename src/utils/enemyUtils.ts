import { Enemy } from '../types';

// Fonction pour créer les ennemis du niveau 1
export const createLevel1Enemies = (): Enemy[] => {
  const enemies: Enemy[] = [];
  
  // 15 ennemis avec des temps d'apparition, incluant des goblins rapides
  const enemySpawnTimes = [
    0,     // Ennemi 1 : goblin immédiat
    2000,  // Ennemi 2 : champignon après 2 secondes
    4000,  // Ennemi 3 : goblin après 4 secondes
    6000,  // Ennemi 4 : champignon après 6 secondes
    8000,  // Ennemi 5 : goblin après 8 secondes
    10000, // Ennemi 6 : champignon après 10 secondes
    12000, // Ennemi 7 : goblin après 12 secondes
    14000, // Ennemi 8 : champignon après 14 secondes
    16000, // Ennemi 9 : goblin après 16 secondes
    18000, // Ennemi 10 : champignon après 18 secondes
    20000, // Ennemi 11 : goblin après 20 secondes
    22000, // Ennemi 12 : champignon après 22 secondes
    24000, // Ennemi 13 : goblin après 24 secondes
    26000, // Ennemi 14 : champignon après 26 secondes
    28000  // Ennemi 15 : tréant après 28 secondes (boss final)
  ];

  for (let i = 0; i < 15; i++) {
    const fromLeft = i % 2 === 0;
    
    const startX = fromLeft ? 
      5 + Math.random() * 10 :   // Gauche : 5% à 15%
      85 + Math.random() * 10;   // Droite : 85% à 95%
    
    const startY = 40 + Math.random() * 45; // Entre 40% et 85% de hauteur (comme dans l'original)
    
    const initialDirection = fromLeft ? 3 : 2; // 3 = droite, 2 = gauche

    // Distribution des types d'ennemis pour le niveau 1
    let enemyType: 'mushroom' | 'treant' | 'devil' | 'goblin';
    let enemyHp: number;
    
    if (i === 14) {
      // 1 tréant en dernière position (boss final)
      enemyType = 'treant';
      enemyHp = 5;
    } else if (i % 2 === 0) {
      // Les positions paires sont des goblins (0, 2, 4, 6, 8, 10, 12)
      enemyType = 'goblin';
      enemyHp = 1; // Les goblins n'ont qu'un seul HP
    } else {
      // Les positions impaires sont des champignons (1, 3, 5, 7, 9, 11, 13)
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

// Fonction pour créer les ennemis du niveau 2 - 18 ennemis : 8 champignons, 2 tréants, 2 diables, 6 goblins
export const createLevel2Enemies = (): Enemy[] => {
  const enemies: Enemy[] = [];
  
  // Configuration avec apparitions incluant des goblins rapides
  const enemySpawnTimes = [
    0,     // Ennemi 1 : goblin immédiat
    1500,  // Ennemi 2 : champignon après 1.5 secondes
    3000,  // Ennemi 3 : goblin après 3 secondes
    4500,  // Ennemi 4 : champignon après 4.5 secondes
    6000,  // Ennemi 5 : goblin après 6 secondes
    7500,  // Ennemi 6 : champignon après 7.5 secondes
    9000,  // Ennemi 7 : tréant après 9 secondes
    9000,  // Ennemi 8 : goblin après 9 secondes (EN MÊME TEMPS que le tréant)
    11000, // Ennemi 9 : champignon après 11 secondes
    12500, // Ennemi 10 : goblin après 12.5 secondes
    14000, // Ennemi 11 : diable après 14 secondes
    14000, // Ennemi 12 : goblin après 14 secondes (EN MÊME TEMPS que le diable)
    16000, // Ennemi 13 : champignon après 16 secondes
    17500, // Ennemi 14 : goblin après 17.5 secondes
    19000, // Ennemi 15 : diable après 19 secondes
    20500, // Ennemi 16 : champignon après 20.5 secondes
    22000, // Ennemi 17 : goblin après 22 secondes
    25000  // Ennemi 18 : tréant après 25 secondes (DERNIER - 2ème tréant)
  ];

  for (let i = 0; i < 18; i++) {
    const fromLeft = i % 2 === 0;
    
    const startX = fromLeft ? 
      5 + Math.random() * 10 :   // Gauche : 5% à 15%
      85 + Math.random() * 10;   // Droite : 85% à 95%
    
    const startY = 40 + Math.random() * 45; // Entre 40% et 85% de hauteur
    
    const initialDirection = fromLeft ? 3 : 2; // 3 = droite, 2 = gauche

    // Distribution des types d'ennemis pour le niveau 2 :
    // - 8 champignons (positions 1,3,5,8,12,15)
    // - 2 tréants (positions 6,17 - le 2ème en dernière position)
    // - 2 diables (positions 10,14)
    // - 6 goblins (positions 0,2,4,7,9,11,13,16)
    let enemyType: 'mushroom' | 'treant' | 'devil' | 'goblin';
    let enemyHp: number;
    
    if (i === 6 || i === 17) {
      // 2 tréants : position 7 et position 18 (dernière)
      enemyType = 'treant';
      enemyHp = 5;
    } else if (i === 10 || i === 14) {
      // 2 diables : positions 11 et 15
      enemyType = 'devil';
      enemyHp = 4;
    } else if (i === 0 || i === 2 || i === 4 || i === 7 || i === 9 || i === 11 || i === 13 || i === 16) {
      // 8 goblins : positions 1,3,5,8,10,12,14,17
      enemyType = 'goblin';
      enemyHp = 1; // Les goblins n'ont qu'un seul HP
    } else {
      // 6 champignons (le reste)
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