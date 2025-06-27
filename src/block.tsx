import React, { useEffect, useState, useRef } from 'react';

interface BlockProps {
}

interface Enemy {
  id: number;
  type: string;
  x: number;
  y: number;
  direction: number;
  currentFrame: number;
  isAlive: boolean;
  hp: number;
  maxHp: number;
  isDying: boolean;
  deathFrame: number;
  isAttacking: boolean;
  attackFrame: number;
  lastAttackTime: number;
}

const Block: React.FC<BlockProps> = () => {
  // État pour gérer le menu d'accueil et sélection de niveau
  const [gameState, setGameState] = useState<'menu' | 'levelSelect' | 'playing'>('menu');
  const [isPlayButtonHovered, setIsPlayButtonHovered] = useState(false);
  const [isLevel1ButtonHovered, setIsLevel1ButtonHovered] = useState(false);
  const [isLevel2ButtonHovered, setIsLevel2ButtonHovered] = useState(false);
  const [isLevel3ButtonHovered, setIsLevel3ButtonHovered] = useState(false);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [completedLevels, setCompletedLevels] = useState<number[]>([]); // Niveaux terminés
  
  const [currentFrame, setCurrentFrame] = useState(0);
  const [direction, setDirection] = useState(0); // Direction du sprite
  const [isWalking, setIsWalking] = useState(false);
  const [isAttacking, setIsAttacking] = useState(false);
  const [attackFrame, setAttackFrame] = useState(0);
  const [position, setPosition] = useState({ x: 50, y: 50 }); // Position en pourcentage
  const [keys, setKeys] = useState({ up: false, down: false, left: false, right: false, space: false });
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [playerHp, setPlayerHp] = useState(10); // HP du joueur
  const [maxPlayerHp] = useState(10); // HP max
  const [lastDamageTime, setLastDamageTime] = useState(0); // Pour éviter les dégâts répétés
  
  // Utiliser useRef pour avoir toujours la position actuelle du joueur
  const playerPositionRef = useRef({ x: 50, y: 50 });
  const playerDirectionRef = useRef(0); // Référence pour la direction du joueur
  const enemiesRef = useRef<Enemy[]>([]); // Référence pour les ennemis
  const enemiesInitialized = useRef(false); // Pour éviter la réinitialisation

  // Fonction pour aller au menu de sélection de niveau
  const goToLevelSelect = () => {
    setGameState('levelSelect');
  };

  // Fonction pour démarrer le jeu avec un niveau spécifique
  const startGame = (level: number = 1) => {
    setCurrentLevel(level);
    setGameState('playing');
    // Réinitialiser le jeu
    setPlayerHp(10);
    setPosition({ x: 50, y: 50 });
    setEnemies([]);
    enemiesInitialized.current = false;
    setLastDamageTime(0);
  };

  // Fonction pour retourner au menu
  const returnToMenu = () => {
    setGameState('menu');
    // Réinitialiser le jeu
    setPlayerHp(10);
    setPosition({ x: 50, y: 50 });
    setEnemies([]);
    enemiesInitialized.current = false;
    setLastDamageTime(0);
  };

  // Fonction pour retourner à la sélection de niveau
  const returnToLevelSelect = () => {
    setGameState('levelSelect');
    // Réinitialiser le jeu
    setPlayerHp(10);
    setPosition({ x: 50, y: 50 });
    setEnemies([]);
    enemiesInitialized.current = false;
    setLastDamageTime(0);
  };

  // Vérifier si un niveau est déverrouillé
  const isLevelUnlocked = (level: number) => {
    if (level === 1) return true; // Le niveau 1 est toujours déverrouillé
    return completedLevels.includes(level - 1); // Un niveau est déverrouillé si le précédent est terminé
  };

  // Vérifier la victoire (tous les ennemis morts)
  useEffect(() => {
    if (gameState === 'playing' && enemies.length > 0) {
      const aliveEnemies = enemies.filter(enemy => enemy.isAlive || enemy.isDying);
      if (aliveEnemies.length === 0) {
        // Niveau terminé !
        if (!completedLevels.includes(currentLevel)) {
          setCompletedLevels(prev => [...prev, currentLevel]);
        }
        // Retourner automatiquement au menu des niveaux après 2 secondes
        setTimeout(() => {
          returnToLevelSelect();
        }, 2000);
      }
    }
  }, [enemies, gameState, currentLevel, completedLevels]);

  // Mettre à jour la référence à chaque changement de position
  useEffect(() => {
    playerPositionRef.current = position;
  }, [position]);

  // Mettre à jour la référence à chaque changement de direction
  useEffect(() => {
    playerDirectionRef.current = direction;
  }, [direction]);

  // Mettre à jour la référence des ennemis
  useEffect(() => {
    enemiesRef.current = enemies;
  }, [enemies]);

  // Limites de la zone de jeu
  const topLimit = 35;
  const bottomLimit = 90;
  const leftLimit = 5;
  const rightLimit = 95;

  // Initialisation unique au chargement du composant
  useEffect(() => {
    // Envoyer l'événement de completion au chargement
    window.postMessage({ 
      type: 'BLOCK_COMPLETION', 
      blockId: 'image-background-block', 
      completed: true 
    }, '*');
    window.parent.postMessage({ 
      type: 'BLOCK_COMPLETION', 
      blockId: 'image-background-block', 
      completed: true 
    }, '*');
  }, []);

  // Initialisation des ennemis quand le jeu commence
  useEffect(() => {
    if (gameState === 'playing' && !enemiesInitialized.current) {
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
        lastAttackTime: 0
      };
      setEnemies([initialMushroom]);
      enemiesInitialized.current = true;
    }
  }, [gameState]);

  // Animation du sprite de marche du joueur
  useEffect(() => {
    if (gameState !== 'playing') return;
    
    const walkAnimationInterval = setInterval(() => {
      if (isWalking && !isAttacking) {
        setCurrentFrame(prev => (prev + 1) % 3);
      }
    }, 150);

    return () => clearInterval(walkAnimationInterval);
  }, [isWalking, isAttacking, gameState]);

  // Animation des ennemis (marche normale)
  useEffect(() => {
    if (gameState !== 'playing') return;
    
    const enemyAnimationInterval = setInterval(() => {
      setEnemies(prev => prev.map(enemy => {
        if (enemy.isDying || !enemy.isAlive || enemy.isAttacking) return enemy;
        
        return {
          ...enemy,
          currentFrame: (enemy.currentFrame + 1) % 3
        };
      }));
    }, 200);

    return () => clearInterval(enemyAnimationInterval);
  }, [gameState]);

  // Animation d'attaque des ennemis
  useEffect(() => {
    if (gameState !== 'playing') return;
    
    const enemyAttackAnimationInterval = setInterval(() => {
      setEnemies(prev => prev.map(enemy => {
        if (!enemy.isAttacking) return enemy;
        
        const nextFrame = enemy.attackFrame + 1;
        
        if (nextFrame >= 8) {
          return {
            ...enemy,
            isAttacking: false,
            attackFrame: 0,
            lastAttackTime: Date.now()
          };
        }
        
        if (nextFrame === 4) {
          checkEnemyAttackHit(enemy);
        }
        
        return {
          ...enemy,
          attackFrame: nextFrame
        };
      }));
    }, 100);

    return () => clearInterval(enemyAttackAnimationInterval);
  }, [gameState]);

  // Animation de mort des ennemis
  useEffect(() => {
    if (gameState !== 'playing') return;
    
    const deathAnimationInterval = setInterval(() => {
      setEnemies(prev => prev.map(enemy => {
        if (!enemy.isDying) return enemy;
        
        const nextFrame = enemy.deathFrame + 1;
        
        if (nextFrame >= 4) {
          return { ...enemy, isAlive: false, isDying: false };
        }
        
        return {
          ...enemy,
          deathFrame: nextFrame
        };
      }));
    }, 150);

    return () => clearInterval(deathAnimationInterval);
  }, [gameState]);

  // Nettoyer les ennemis morts après l'animation
  useEffect(() => {
    if (gameState !== 'playing') return;
    
    const cleanupInterval = setInterval(() => {
      setEnemies(prev => prev.filter(enemy => enemy.isAlive));
    }, 1000);

    return () => clearInterval(cleanupInterval);
  }, [gameState]);

  // Fonction de collision entre deux entités
  const checkCollision = (pos1: {x: number, y: number}, pos2: {x: number, y: number}, minDistance: number = 3) => {
    const deltaX = pos1.x - pos2.x;
    const deltaY = pos1.y - pos2.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    return distance < minDistance;
  };

  // Fonction pour vérifier les dégâts de l'ennemi au joueur
  const checkEnemyAttackHit = (enemy: Enemy) => {
    const currentPlayerPos = playerPositionRef.current;
    const currentTime = Date.now();
    
    if (currentTime - lastDamageTime < 1000) return;
    
    const deltaX = currentPlayerPos.x - enemy.x;
    const deltaY = currentPlayerPos.y - enemy.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    
    const attackRange = 6;
    if (distance <= attackRange) {
      setPlayerHp(prev => Math.max(0, prev - 1));
      setLastDamageTime(currentTime);
    }
  };

  // Fonction pour calculer l'état d'un cœur
  const getHeartState = (heartIndex: number, currentHp: number) => {
    const hpForThisHeart = currentHp - (heartIndex * 2);
    if (hpForThisHeart >= 2) return 0;
    if (hpForThisHeart === 1) return 1;
    return 2;
  };

  // Mouvement des ennemis avec collision et IA d'attaque
  useEffect(() => {
    if (gameState !== 'playing') return;
    
    const enemyMovementInterval = setInterval(() => {
      setEnemies(prev => prev.map(enemy => {
        if (!enemy.isAlive || enemy.isDying || enemy.isAttacking) return enemy;
        
        let newX = enemy.x;
        let newY = enemy.y;
        let newDirection = enemy.direction;
        let shouldAttack = false;
        const speed = 0.25;
        
        if (enemy.type === 'mushroom') {
          const currentPlayerPos = playerPositionRef.current;
          
          const deltaX = currentPlayerPos.x - enemy.x;
          const deltaY = currentPlayerPos.y - enemy.y;
          const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
          
          const attackDistance = 4;
          const collisionDistance = 3;
          const currentTime = Date.now();
          
          if (distance <= attackDistance && currentTime - enemy.lastAttackTime > 2000) {
            shouldAttack = true;
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
              newDirection = deltaX > 0 ? 3 : 2;
            } else {
              newDirection = deltaY > 0 ? 0 : 1;
            }
          } else if (distance > collisionDistance && !shouldAttack) {
            const moveX = (deltaX / distance) * speed;
            const moveY = (deltaY / distance) * speed;
            
            const potentialX = Math.max(leftLimit, Math.min(rightLimit, enemy.x + moveX));
            const potentialY = Math.max(topLimit, Math.min(bottomLimit, enemy.y + moveY));
            
            if (!checkCollision({x: potentialX, y: potentialY}, currentPlayerPos, collisionDistance)) {
              newX = potentialX;
              newY = potentialY;
              
              if (Math.abs(deltaX) > Math.abs(deltaY)) {
                newDirection = deltaX > 0 ? 3 : 2;
              } else {
                newDirection = deltaY > 0 ? 0 : 1;
              }
            }
          }
        }
        
        if (shouldAttack) {
          return {
            ...enemy,
            x: newX,
            y: newY,
            direction: newDirection,
            isAttacking: true,
            attackFrame: 0
          };
        }
        
        return {
          ...enemy,
          x: newX,
          y: newY,
          direction: newDirection
        };
      }));
    }, 16);

    return () => clearInterval(enemyMovementInterval);
  }, [gameState]);

  // Animation d'attaque simple
  useEffect(() => {
    if (gameState !== 'playing') return;
    
    if (isAttacking) {
      setAttackFrame(2);
      
      const step1 = setTimeout(() => {
        setAttackFrame(3);
      }, 120);
      
      const step2 = setTimeout(() => {
        setIsAttacking(false);
        setAttackFrame(0);
        checkAttackHit();
      }, 240);

      return () => {
        clearTimeout(step1);
        clearTimeout(step2);
      };
    }
  }, [isAttacking, gameState]);

  // Fonction pour vérifier si l'ennemi est dans l'arc d'attaque de 180°
  const isEnemyInAttackDirection = (playerX: number, playerY: number, enemyX: number, enemyY: number, playerDirection: number) => {
    const deltaX = enemyX - playerX;
    const deltaY = enemyY - playerY;
    
    const angleToEnemy = Math.atan2(deltaY, deltaX);
    
    let baseAngle;
    switch (playerDirection) {
      case 0: baseAngle = Math.PI / 2; break;
      case 1: baseAngle = -Math.PI / 2; break;
      case 2: baseAngle = Math.PI; break;
      case 3: baseAngle = 0; break;
      default: return false;
    }
    
    let angleDiff = angleToEnemy - baseAngle;
    
    while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
    while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;
    
    const halfArcAngle = Math.PI / 2;
    return Math.abs(angleDiff) <= halfArcAngle;
  };

  // Fonction pour vérifier si l'attaque touche un ennemi
  const checkAttackHit = () => {
    const attackRange = 8;
    const currentPlayerPos = playerPositionRef.current;
    const currentPlayerDirection = playerDirectionRef.current;
    
    setEnemies(prev => prev.map(enemy => {
      if (!enemy.isAlive || enemy.isDying) return enemy;
      
      const deltaX = currentPlayerPos.x - enemy.x;
      const deltaY = currentPlayerPos.y - enemy.y;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      
      if (distance <= attackRange && isEnemyInAttackDirection(currentPlayerPos.x, currentPlayerPos.y, enemy.x, enemy.y, currentPlayerDirection)) {
        const newHp = enemy.hp - 1;
        
        if (newHp <= 0) {
          return {
            ...enemy,
            hp: 0,
            isDying: true,
            deathFrame: 0
          };
        }
        
        return {
          ...enemy,
          hp: newHp
        };
      }
      
      return enemy;
    }));
  };

  // Gestion du mouvement avec limites et collision avec les ennemis
  useEffect(() => {
    if (gameState !== 'playing') return;
    
    const moveInterval = setInterval(() => {
      if (!isAttacking && (keys.up || keys.down || keys.left || keys.right)) {
        setIsWalking(true);
        setPosition(prev => {
          let newX = prev.x;
          let newY = prev.y;
          const speed = 0.5;

          if (keys.up) {
            newY = Math.max(topLimit, prev.y - speed);
            setDirection(1);
          }
          if (keys.down) {
            newY = Math.min(bottomLimit, prev.y + speed);
            setDirection(0);
          }
          if (keys.left) {
            newX = Math.max(leftLimit, prev.x - speed);
            setDirection(2);
          }
          if (keys.right) {
            newX = Math.min(rightLimit, prev.x + speed);
            setDirection(3);
          }

          const potentialPos = { x: newX, y: newY };
          const collisionDistance = 3;
          let hasCollision = false;
          
          enemiesRef.current.forEach(enemy => {
            if (enemy.isAlive && !enemy.isDying && checkCollision(potentialPos, { x: enemy.x, y: enemy.y }, collisionDistance)) {
              hasCollision = true;
            }
          });
          
          if (hasCollision) {
            return prev;
          }

          return { x: newX, y: newY };
        });
      } else {
        setIsWalking(false);
        setCurrentFrame(1);
      }
    }, 16);

    return () => clearInterval(moveInterval);
  }, [keys, topLimit, bottomLimit, leftLimit, rightLimit, isAttacking, gameState]);

  // Gestion des touches
  useEffect(() => {
    if (gameState !== 'playing') return;
    
    const handleKeyDown = (event: KeyboardEvent) => {
      event.preventDefault();
      const key = event.key.toLowerCase();
      
      if (key === ' ' && !isAttacking) {
        setIsAttacking(true);
        setIsWalking(false);
        return;
      }
      
      if (key === 'escape') {
        returnToLevelSelect();
        return;
      }
      
      setKeys(prev => ({
        ...prev,
        up: prev.up || key === 'arrowup' || key === 'z',
        down: prev.down || key === 'arrowdown' || key === 's',
        left: prev.left || key === 'arrowleft' || key === 'q',
        right: prev.right || key === 'arrowright' || key === 'd',
        space: prev.space || key === ' '
      }));
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      event.preventDefault();
      const key = event.key.toLowerCase();
      
      setKeys(prev => ({
        ...prev,
        up: prev.up && !(key === 'arrowup' || key === 'z'),
        down: prev.down && !(key === 'arrowdown' || key === 's'),
        left: prev.left && !(key === 'arrowleft' || key === 'q'),
        right: prev.right && !(key === 'arrowright' || key === 'd'),
        space: prev.space && key !== ' '
      }));
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isAttacking, gameState]);

  // URLs des images
  const backgroundImageUrl = 'https://drive.google.com/thumbnail?id=1dG0VYnt0-H52bUAgk2ggO5A9OQQHbYMR&sz=w2000';
  const walkSpriteSheetUrl = 'https://drive.google.com/thumbnail?id=1_Yp96n--W40rf5sQFA4L5MBpc0IBOYBW&sz=w1000';
  const attackSpriteSheetUrl = 'https://drive.google.com/thumbnail?id=1dAguM-5cKwpr6d7IwmL4RyHZNHtnl5To&sz=w1000';
  const mushroomSpriteSheetUrl = 'https://drive.google.com/thumbnail?id=1j2LelD-leMi_3y44PFuLCJOl_cmRRysA&sz=w1000';
  const mushroomDeathSpriteSheetUrl = 'https://drive.google.com/thumbnail?id=1Xf5RQQHzgCU2m39l3iCJ1wwBge-XCtZD&sz=w1000';
  const mushroomAttackSpriteSheetUrl = 'https://drive.google.com/thumbnail?id=15xo5LfJBU2kBCGx9bPdQO9sV7U8yvOx2&sz=w1000';
  const heartSpriteSheetUrl = 'https://drive.google.com/thumbnail?id=1XF9PerIam-SHkJWl877SiIUi9ZzyWEMu&sz=w1000';
  
  // URLs pour les menus
  const menuBackgroundUrl = 'https://drive.google.com/thumbnail?id=1RzUqegcgPQH2S-Rd5dVIgxRG59NHVjSi&sz=w2000';
  const playButtonUrl = 'https://drive.google.com/thumbnail?id=1kOu9XlhpCc1p7GPqdZuDosBc7OyH3t9k&sz=w500';
  
  // URLs pour le menu des niveaux - NOUVELLES IMAGES
  const levelMenuBackgroundUrl = 'https://drive.google.com/thumbnail?id=1WcBQAkpbUXuhwcTAzu-G2xKwU6pkotyc&sz=w1000';
  const level1ButtonUrl = 'https://drive.google.com/thumbnail?id=1W_Wi6_CQ3zo-5nI31qRIkm9ZsCPpNu3p&sz=w500';
  const level2ButtonUrl = 'https://drive.google.com/thumbnail?id=1gGMkrpQ7t10YxG16q0PNx7yyV7QEekyG&sz=w500'; // Niveau 2 grisé
  const level3ButtonUrl = 'https://drive.google.com/thumbnail?id=18oZ0B_hXP89joEFxUb0lDMu7K1oif2s3&sz=w500'; // Niveau 3 grisé

  // Configuration du sprite
  const spriteWidth = 32;
  const spriteHeight = 32;
  const walkFramesPerRow = 4;
  const attackFramesPerRow = 8;
  const deathFramesPerRow = 9;
  const spriteScale = 3.5;
  
  // Configuration des cœurs
  const heartSize = 32;
  const heartScale = 1.5;
  
  // Calcul de la position dans le sprite sheet
  let spriteX, spriteY, currentSpriteUrl, backgroundSizeX;
  
  if (gameState === 'playing') {
    if (isAttacking) {
      spriteX = attackFrame * spriteWidth;
      spriteY = direction * spriteHeight;
      currentSpriteUrl = attackSpriteSheetUrl;
      backgroundSizeX = spriteWidth * attackFramesPerRow * spriteScale;
    } else {
      spriteX = currentFrame * spriteWidth;
      spriteY = direction * spriteHeight;
      currentSpriteUrl = walkSpriteSheetUrl;
      backgroundSizeX = spriteWidth * walkFramesPerRow * spriteScale;
    }
  }

  // Fonction pour obtenir le nom de la direction
  const getDirectionName = (dir: number) => {
    switch (dir) {
      case 0: return 'Bas ↓';
      case 1: return 'Haut ↑';
      case 2: return 'Gauche ←';
      case 3: return 'Droite →';
      default: return 'Inconnu';
    }
  };

  // Fonctions pour gérer les clics sur les boutons
  const handlePlayButtonClick = (event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
    goToLevelSelect();
  };

  const handleLevel1ButtonClick = (event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
    startGame(1);
  };

  const handleLevel2ButtonClick = (event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
    if (isLevelUnlocked(2)) {
      startGame(2);
    }
  };

  const handleLevel3ButtonClick = (event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
    if (isLevelUnlocked(3)) {
      startGame(3);
    }
  };

  // Fonctions pour gérer le hover des boutons
  const handlePlayButtonMouseEnter = () => setIsPlayButtonHovered(true);
  const handlePlayButtonMouseLeave = () => setIsPlayButtonHovered(false);
  const handleLevel1ButtonMouseEnter = () => setIsLevel1ButtonHovered(true);
  const handleLevel1ButtonMouseLeave = () => setIsLevel1ButtonHovered(false);
  const handleLevel2ButtonMouseEnter = () => setIsLevel2ButtonHovered(true);
  const handleLevel2ButtonMouseLeave = () => setIsLevel2ButtonHovered(false);
  const handleLevel3ButtonMouseEnter = () => setIsLevel3ButtonHovered(true);
  const handleLevel3ButtonMouseLeave = () => setIsLevel3ButtonHovered(false);

  // Rendu du menu d'accueil
  if (gameState === 'menu') {
    return (
      <div 
        style={{
          height: '100vh',
          width: '100vw',
          margin: 0,
          backgroundImage: `url(${menuBackgroundUrl})`,
          backgroundSize: 'contain',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          position: 'relative',
          overflow: 'hidden',
          backgroundColor: '#1a1a1a'
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '60%',
            transform: `translate(-50%, -50%) scale(${isPlayButtonHovered ? 2.2 : 2})`,
            width: '180px',
            height: '90px',
            backgroundImage: `url(${playButtonUrl})`,
            backgroundSize: 'contain',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            cursor: 'pointer',
            zIndex: 10,
            transition: 'all 0.2s ease',
            filter: isPlayButtonHovered ? 
              'brightness(1.2) drop-shadow(0 0 15px rgba(255,255,255,0.6)) saturate(1.2)' : 
              'brightness(1) drop-shadow(0 0 5px rgba(0,0,0,0.3))',
            opacity: isPlayButtonHovered ? 1 : 0.95,
          }}
          onClick={handlePlayButtonClick}
          onMouseEnter={handlePlayButtonMouseEnter}
          onMouseLeave={handlePlayButtonMouseLeave}
        />
      </div>
    );
  }

  // Rendu du menu de sélection de niveau - MODIFIÉ SELON VOS DEMANDES
  if (gameState === 'levelSelect') {
    return (
      <div 
        style={{
          height: '100vh',
          width: '100vw',
          margin: 0,
          backgroundImage: `url(${menuBackgroundUrl})`,
          backgroundSize: 'contain',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          position: 'relative',
          overflow: 'hidden',
          backgroundColor: '#1a1a1a'
        }}
      >
        {/* Rectangle background du menu des niveaux - ENCORE PLUS ÉLARGI */}
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            width: '900px', // Élargi de 800px à 900px
            height: '360px',
            backgroundImage: `url(${levelMenuBackgroundUrl})`,
            backgroundSize: 'contain',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            zIndex: 5
          }}
        >
          {/* Bouton Niveau 1 - RAPPROCHÉ */}
          <div
            style={{
              position: 'absolute',
              left: '30%', // Rapproché de 20% à 30%
              top: '50%',
              transform: `translate(-50%, -50%) scale(${isLevel1ButtonHovered ? 2.2 : 2})`,
              width: '100px',
              height: '50px',
              backgroundImage: `url(${level1ButtonUrl})`,
              backgroundSize: 'contain',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              filter: isLevel1ButtonHovered ? 
                'brightness(1.2) drop-shadow(0 0 10px rgba(255,255,255,0.6))' : 
                'brightness(1) drop-shadow(0 0 3px rgba(0,0,0,0.3))',
              zIndex: 10
            }}
            onClick={handleLevel1ButtonClick}
            onMouseEnter={handleLevel1ButtonMouseEnter}
            onMouseLeave={handleLevel1ButtonMouseLeave}
          />

          {/* Bouton Niveau 2 - RAPPROCHÉ ET STYLES SUPPRIMÉS */}
          <div
            style={{
              position: 'absolute',
              left: '50%', // Position centrale inchangée
              top: '50%',
              transform: `translate(-50%, -50%) scale(${isLevel2ButtonHovered ? 2.2 : 2})`,
              width: '100px',
              height: '50px',
              backgroundImage: `url(${level2ButtonUrl})`,
              backgroundSize: 'contain',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              cursor: isLevelUnlocked(2) ? 'pointer' : 'default',
              transition: 'all 0.2s ease',
              zIndex: 10
            }}
            onClick={handleLevel2ButtonClick}
            onMouseEnter={handleLevel2ButtonMouseEnter}
            onMouseLeave={handleLevel2ButtonMouseLeave}
          />

          {/* Bouton Niveau 3 - RAPPROCHÉ ET STYLES SUPPRIMÉS */}
          <div
            style={{
              position: 'absolute',
              left: '70%', // Rapproché de 80% à 70%
              top: '50%',
              transform: `translate(-50%, -50%) scale(${isLevel3ButtonHovered ? 2.2 : 2})`,
              width: '100px',
              height: '50px',
              backgroundImage: `url(${level3ButtonUrl})`,
              backgroundSize: 'contain',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              cursor: isLevelUnlocked(3) ? 'pointer' : 'default',
              transition: 'all 0.2s ease',
              zIndex: 10
            }}
            onClick={handleLevel3ButtonClick}
            onMouseEnter={handleLevel3ButtonMouseEnter}
            onMouseLeave={handleLevel3ButtonMouseLeave}
          />

          {/* Bouton Retour */}
          <div
            style={{
              position: 'absolute',
              right: '20px',
              bottom: '20px',
              padding: '10px 20px',
              backgroundColor: '#f44336',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold',
              fontFamily: 'Arial, sans-serif',
              transition: 'all 0.2s ease'
            }}
            onClick={returnToMenu}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#d32f2f';
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#f44336';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            ← RETOUR
          </div>
        </div>
      </div>
    );
  }

  // Rendu du jeu
  return (
    <div 
      style={{
        height: '100vh',
        margin: 0,
        backgroundImage: `url(${backgroundImageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        position: 'relative',
        overflow: 'hidden'
      }}
      tabIndex={0}
    >
      {/* Personnage sprite qui se déplace */}
      <div style={{
        position: 'absolute',
        left: `${position.x}%`,
        top: `${position.y}%`,
        transform: 'translate(-50%, -50%)',
        width: `${spriteWidth * spriteScale}px`,
        height: `${spriteHeight * spriteScale}px`,
        backgroundImage: `url(${currentSpriteUrl})`,
        backgroundPosition: `-${spriteX * spriteScale}px -${spriteY * spriteScale}px`,
        backgroundSize: `${backgroundSizeX}px auto`,
        imageRendering: 'pixelated',
        transition: 'none',
        zIndex: 10
      }} />

      {/* Système de cœurs */}
      <div style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        display: 'flex',
        gap: '6px',
        zIndex: 20
      }}>
        {[0, 1, 2, 3, 4].map(heartIndex => {
          const heartState = getHeartState(heartIndex, playerHp);
          
          return (
            <div
              key={heartIndex}
              style={{
                width: `${heartSize * heartScale}px`,
                height: `${heartSize * heartScale}px`,
                backgroundImage: `url(${heartSpriteSheetUrl})`,
                backgroundPosition: `-${heartState * heartSize * heartScale}px 0px`,
                backgroundSize: `${heartSize * 3 * heartScale}px ${heartSize * heartScale}px`,
                imageRendering: 'pixelated'
              }}
            />
          );
        })}
      </div>

      {/* Ennemis avec barres de HP et animations */}
      {enemies.map(enemy => {
        if (!enemy.isAlive && !enemy.isDying) return null;
        
        let enemySpriteX, enemySpriteY, enemySpriteUrl, enemyBackgroundSizeX;
        
        if (enemy.isDying) {
          const deathImageIndex = enemy.deathFrame + 2;
          enemySpriteX = deathImageIndex * spriteWidth;
          enemySpriteY = enemy.direction * spriteHeight;
          enemySpriteUrl = mushroomDeathSpriteSheetUrl;
          enemyBackgroundSizeX = spriteWidth * deathFramesPerRow * 3;
        } else if (enemy.isAttacking) {
          enemySpriteX = enemy.attackFrame * spriteWidth;
          enemySpriteY = enemy.direction * spriteHeight;
          enemySpriteUrl = mushroomAttackSpriteSheetUrl;
          enemyBackgroundSizeX = spriteWidth * attackFramesPerRow * 3;
        } else {
          enemySpriteX = enemy.currentFrame * spriteWidth;
          enemySpriteY = enemy.direction * spriteHeight;
          enemySpriteUrl = mushroomSpriteSheetUrl;
          enemyBackgroundSizeX = spriteWidth * walkFramesPerRow * 3;
        }
        
        return (
          <div key={enemy.id}>
            <div
              style={{
                position: 'absolute',
                left: `${enemy.x}%`,
                top: `${enemy.y}%`,
                transform: 'translate(-50%, -50%)',
                width: `${spriteWidth * 3}px`,
                height: `${spriteHeight * 3}px`,
                backgroundImage: `url(${enemySpriteUrl})`,
                backgroundPosition: `-${enemySpriteX * 3}px -${enemySpriteY * 3}px`,
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
                    top: `${enemy.y - 8}%`,
                    transform: 'translateX(-50%)',
                    width: '60px',
                    height: '8px',
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
                
                <div
                  style={{
                    position: 'absolute',
                    left: `${enemy.x}%`,
                    top: `${enemy.y - 12}%`,
                    transform: 'translateX(-50%)',
                    color: 'white',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
                    zIndex: 12,
                    textAlign: 'center'
                  }}
                >
                  {enemy.isAttacking ? '⚔️ ATTAQUE' : `${enemy.hp}/${enemy.maxHp}`}
                </div>
              </>
            )}
          </div>
        );
      })}

      {/* Message de victoire */}
      {gameState === 'playing' && enemies.length > 0 && enemies.filter(e => e.isAlive || e.isDying).length === 0 && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'rgba(0, 255, 0, 0.9)',
          color: 'white',
          padding: '30px',
          borderRadius: '15px',
          textAlign: 'center',
          fontSize: '24px',
          fontWeight: 'bold',
          zIndex: 100
        }}>
          🎉 NIVEAU {currentLevel} TERMINÉ ! 🎉
          <br />
          <span style={{ fontSize: '16px' }}>
            Retour au menu des niveaux...
          </span>
        </div>
      )}

      {/* Instructions de contrôle */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        color: 'white',
        padding: '15px',
        borderRadius: '8px',
        fontFamily: 'Arial, sans-serif',
        fontSize: '14px',
        zIndex: 20
      }}>
        <p style={{ margin: '0 0 8px 0', fontWeight: 'bold' }}>🎮 Contrôles :</p>
        <p style={{ margin: '0 0 5px 0' }}>↑ ↓ ← → ou ZQSD pour se déplacer</p>
        <p style={{ margin: '0 0 5px 0' }}>ESPACE pour attaquer</p>
        <p style={{ margin: '0 0 5px 0' }}>ECHAP pour retourner aux niveaux</p>
        <p style={{ margin: '0', fontSize: '12px', opacity: 0.8 }}>
          Niveau {currentLevel} - Position: ({Math.round(position.x)}, {Math.round(position.y)})
        </p>
        <p style={{ margin: '0', fontSize: '12px', opacity: 0.8 }}>
          Direction: {getDirectionName(direction)} - {isAttacking ? `⚔️ Attaque 180° !` : isWalking ? '🚶 Marche' : '🧍 Repos'}
        </p>
        <p style={{ margin: '0', fontSize: '10px', opacity: 0.6 }}>
          🍄 Ennemis vivants: {enemies.filter(e => e.isAlive && !e.isDying).length} | 
          💀 En train de mourir: {enemies.filter(e => e.isDying).length} |
          ⚔️ En attaque: {enemies.filter(e => e.isAttacking).length}
        </p>
      </div>

      {/* Game Over */}
      {playerHp <= 0 && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          color: 'red',
          padding: '30px',
          borderRadius: '15px',
          textAlign: 'center',
          fontSize: '24px',
          fontWeight: 'bold',
          zIndex: 100
        }}>
          💀 GAME OVER 💀
          <br />
          <span style={{ fontSize: '16px', color: 'white' }}>
            Le champignon vous a vaincu !
          </span>
          <br />
          <button
            onClick={returnToLevelSelect}
            style={{
              marginTop: '20px',
              padding: '10px 20px',
              fontSize: '16px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Retour aux niveaux
          </button>
        </div>
      )}

      {/* Indicateur de focus */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        right: '20px',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        color: 'white',
        padding: '10px',
        borderRadius: '8px',
        fontFamily: 'Arial, sans-serif',
        fontSize: '12px',
        zIndex: 20
      }}>
        💡 Cliquez ici pour activer les contrôles
      </div>
    </div>
  );
};

export default Block;