import { Enemy } from '../types';

// Fonction pour créer les ennemis du niveau 1
export const createLevel1Enemies = (): Enemy[] => {
  const enemies: Enemy[] = [];
  
  // 12 ennemis avec des temps d'apparition, incluant 2 moments où 2 champignons apparaissent simultanément
  const enemySpawnTimes = [
    0,     // Ennemi 1 : immédiat
    3000,  // Ennemi 2 : après 3 secondes
    5000,  // Ennemi 3 : après 5 secondes
    5000,  // Ennemi 4 : après 5 secondes (EN MÊME TEMPS que l'ennemi 3)
    8000,  // Ennemi 5 : après 8 secondes
    12000, // Ennemi 6 : après 12 secondes
    15000, // Ennemi 7 : après 15 secondes
    18000, // Ennemi 8 : après 18 secondes
    18000, // Ennemi 9 : après 18 secondes (EN MÊME TEMPS que l'ennemi 8)
    22000, // Ennemi 10 : après 22 secondes
    25000, // Ennemi 11 : après 25 secondes
    30000  // Ennemi 12 : après 30 secondes
  ];

  for (let i = 0; i < 12; i++) {
    const fromLeft = i % 2 === 0;
    
    const startX = fromLeft ? 
      5 + Math.random() * 10 :   // Gauche : 5% à 15%
      85 + Math.random() * 10;   // Droite : 85% à 95%
    
    const startY = 40 + Math.random() * 45; // Entre 40% et 85% de hauteur (comme dans l'original)
    
    const initialDirection = fromLeft ? 3 : 2; // 3 = droite, 2 = gauche

    // Distribution des types d'ennemis pour le niveau 1
    let enemyType: 'mushroom' | 'treant' | 'devil' | 'goblin' | 'golem';
    let enemyHp: number;
    
    if (i === 11) {
      // 1 tréant en dernière position (boss final)
      enemyType = 'treant';
      enemyHp = 5;
    } else if (i % 2 === 0) {
      // Les positions paires sont des goblins (0, 2, 4, 6, 8, 10)
      enemyType = 'goblin';
      enemyHp = 1; // Les goblins n'ont qu'un seul HP
    } else {
      // Les positions impaires sont des champignons (1, 3, 5, 7, 9)
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

// Fonction pour créer les ennemis du niveau 2 - 14 ennemis : 7 champignons, 5 goblins, 1 tréant, 1 observateur
export const createLevel2Enemies = (): Enemy[] => {
  const enemies: Enemy[] = [];
  
  // Configuration avec apparitions progressives
  const enemySpawnTimes = [
    0,     // Ennemi 1 : goblin immédiat
    2000,  // Ennemi 2 : champignon après 2 secondes
    4000,  // Ennemi 3 : goblin après 4 secondes
    6000,  // Ennemi 4 : champignon après 6 secondes
    6000,  // Ennemi 5 : goblin après 6 secondes (EN MÊME TEMPS que le champignon)
    8000,  // Ennemi 6 : tréant après 8 secondes (boss)
    10000, // Ennemi 7 : champignon après 10 secondes
    12000, // Ennemi 8 : goblin après 12 secondes
    14000, // Ennemi 9 : champignon après 14 secondes
    16000, // Ennemi 10 : observateur après 16 secondes
    18000, // Ennemi 11 : champignon après 18 secondes
    18000, // Ennemi 12 : goblin après 18 secondes (EN MÊME TEMPS que le champignon)
    20000, // Ennemi 13 : champignon après 20 secondes
    22000  // Ennemi 14 : champignon après 22 secondes (dernier)
  ];

  for (let i = 0; i < 14; i++) {
    const fromLeft = i % 2 === 0;
    
    const startX = fromLeft ? 
      5 + Math.random() * 10 :   // Gauche : 5% à 15%
      85 + Math.random() * 10;   // Droite : 85% à 95%
    
    const startY = 40 + Math.random() * 45; // Entre 40% et 85% de hauteur
    
    const initialDirection = fromLeft ? 3 : 2; // 3 = droite, 2 = gauche

    // Distribution des types d'ennemis :
    // - 7 champignons (positions 1,3,6,8,10,12,13)
    // - 5 goblins (positions 0,2,4,7,11)
    // - 1 tréant (position 5 - boss)
    // - 1 observateur (position 9)
    let enemyType: 'mushroom' | 'treant' | 'devil' | 'goblin' | 'golem' | 'observer';
    let enemyHp: number;
    
    if (i === 5) {
      // 1 tréant : position 6 (boss)
      enemyType = 'treant';
      enemyHp = 5;
    } else if (i === 9) {
      // 1 observateur : position 10
      enemyType = 'observer';
      enemyHp = 4;
    } else if (i === 0 || i === 2 || i === 4 || i === 7 || i === 11) {
      // 5 goblins : positions 1, 3, 5, 8, 12
      enemyType = 'goblin';
      enemyHp = 2;
    } else {
      // 7 champignons (le reste)
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

// Fonction pour créer les ennemis du niveau 3 - 16 ennemis : 6 champignons, 4 goblins, 3 tréants, 3 observateurs
export const createLevel3Enemies = (): Enemy[] => {
  const enemies: Enemy[] = [];
  
  // Configuration avec apparitions progressives et vagues simultanées
  const enemySpawnTimes = [
    0,     // Ennemi 1 : goblin immédiat
    2000,  // Ennemi 2 : champignon après 2 secondes
    4000,  // Ennemi 3 : goblin après 4 secondes
    6000,  // Ennemi 4 : champignon après 6 secondes
    8000,  // Ennemi 5 : tréant après 8 secondes (premier boss)
    10000, // Ennemi 6 : observateur après 10 secondes
    12000, // Ennemi 7 : goblin après 12 secondes
    14000, // Ennemi 8 : champignon après 14 secondes
    16000, // Ennemi 9 : tréant après 16 secondes (deuxième boss)
    16000, // Ennemi 10 : observateur après 16 secondes (EN MÊME TEMPS que le tréant)
    18000, // Ennemi 11 : goblin après 18 secondes
    20000, // Ennemi 12 : champignon après 20 secondes
    22000, // Ennemi 13 : observateur après 22 secondes
    24000, // Ennemi 14 : champignon après 24 secondes
    26000, // Ennemi 15 : tréant après 26 secondes (boss final)
    28000  // Ennemi 16 : champignon après 28 secondes (dernier)
  ];

  for (let i = 0; i < 16; i++) {
    const fromLeft = i % 2 === 0;
    
    const startX = fromLeft ? 
      5 + Math.random() * 10 :   // Gauche : 5% à 15%
      85 + Math.random() * 10;   // Droite : 85% à 95%
    
    const startY = 40 + Math.random() * 45; // Entre 40% et 85% de hauteur
    
    const initialDirection = fromLeft ? 3 : 2; // 3 = droite, 2 = gauche

    // Distribution des types d'ennemis :
    // - 6 champignons (positions 1,3,7,11,13,15)
    // - 4 goblins (positions 0,2,6,10)
    // - 3 tréants (positions 4,8,14 - bosses)
    // - 3 observateurs (positions 5,9,12)
    let enemyType: 'mushroom' | 'treant' | 'devil' | 'goblin' | 'golem' | 'observer';
    let enemyHp: number;
    
    if (i === 4 || i === 8 || i === 14) {
      // 3 tréants : positions 5, 9, 15 (bosses)
      enemyType = 'treant';
      enemyHp = 5;
    } else if (i === 5 || i === 9 || i === 12) {
      // 3 observateurs : positions 6, 10, 13
      enemyType = 'observer';
      enemyHp = 4;
    } else if (i === 0 || i === 2 || i === 6 || i === 10) {
      // 4 goblins : positions 1, 3, 7, 11
      enemyType = 'goblin';
      enemyHp = 2;
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

// Fonction pour créer les ennemis du niveau 4
export const createLevel4Enemies = (): Enemy[] => {
  const enemies: Enemy[] = [];
  
  // Créer 4 ennemis de montagne + 1 golem final
  for (let i = 0; i < 5; i++) {
    const fromLeft = i % 2 === 0;
    
    const startX = fromLeft ? 
      5 + Math.random() * 10 :   // Gauche : 5% à 15%
      85 + Math.random() * 10;   // Droite : 85% à 95%
    const startY = 40 + Math.random() * 45; // Entre 40% et 85% de hauteur
    
    let enemyType: 'mushroom' | 'treant' | 'devil' | 'goblin' | 'golem';
    let enemyHp: number;
    
    if (i === 4) {
      // Le dernier ennemi est un golem (boss final)
      enemyType = 'golem';
      enemyHp = 8;
    } else {
      // Les 4 premiers sont des ennemis de montagne (mélange de types)
      if (i === 0) {
        enemyType = 'treant';
        enemyHp = 5;
      } else if (i === 1) {
        enemyType = 'devil';
        enemyHp = 4;
      } else if (i === 2) {
        enemyType = 'treant';
        enemyHp = 5;
      } else {
        enemyType = 'devil';
        enemyHp = 4;
      }
    }
    
    const enemy: Enemy = {
      id: i + 1,
      type: enemyType,
      x: startX,
      y: startY,
      direction: fromLeft ? 3 : 2, // 3 = droite, 2 = gauche
      currentFrame: 0,
      isAlive: true,
      hp: enemyHp,
      maxHp: enemyHp,
      isDying: false,
      deathFrame: 0,
      isAttacking: false,
      attackFrame: 0,
      lastAttackTime: 0,
      spawnTime: i * 2000, // Spawn toutes les 2 secondes
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
    case 4:
      return createLevel4Enemies();
    default:
      return createDefaultEnemies();
  }
};