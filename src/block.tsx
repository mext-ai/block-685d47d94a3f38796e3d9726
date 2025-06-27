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
}

const Block: React.FC<BlockProps> = () => {
  const [currentFrame, setCurrentFrame] = useState(0);
  const [direction, setDirection] = useState(0); // Direction du sprite
  const [isWalking, setIsWalking] = useState(false);
  const [isAttacking, setIsAttacking] = useState(false);
  const [attackFrame, setAttackFrame] = useState(0);
  const [position, setPosition] = useState({ x: 50, y: 50 }); // Position en pourcentage
  const [keys, setKeys] = useState({ up: false, down: false, left: false, right: false, space: false });
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  
  // Utiliser useRef pour avoir toujours la position actuelle du joueur
  const playerPositionRef = useRef({ x: 50, y: 50 });
  const playerDirectionRef = useRef(0); // Référence pour la direction du joueur
  const enemiesInitialized = useRef(false); // Pour éviter la réinitialisation

  // Mettre à jour la référence à chaque changement de position
  useEffect(() => {
    playerPositionRef.current = position;
  }, [position]);

  // Mettre à jour la référence à chaque changement de direction
  useEffect(() => {
    playerDirectionRef.current = direction;
  }, [direction]);

  // Limites de la zone de jeu - Réduction encore plus importante de la zone de déplacement depuis le haut
  const topLimit = 35; // Augmenté de 30% à 35% pour encore plus réduire la zone de déplacement
  const bottomLimit = 90; // 10% du bas bloqué (100% - 10% = 90%)
  const leftLimit = 5; // 5% des côtés pour éviter de sortir
  const rightLimit = 95; // 95% des côtés

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

    // Créer le premier ennemi mushroom au démarrage - UNE SEULE FOIS
    if (!enemiesInitialized.current) {
      const initialMushroom: Enemy = {
        id: 1,
        type: 'mushroom',
        x: 20, // Position initiale différente du joueur
        y: 70, // Position verticale différente du joueur
        direction: 3, // Direction droite par défaut
        currentFrame: 0,
        isAlive: true,
        hp: 3, // 3 points de vie
        maxHp: 3,
        isDying: false,
        deathFrame: 0
      };
      setEnemies([initialMushroom]);
      enemiesInitialized.current = true;
    }
  }, []); // AUCUNE dépendance - exécution unique

  // Animation du sprite de marche du joueur
  useEffect(() => {
    const walkAnimationInterval = setInterval(() => {
      if (isWalking && !isAttacking) {
        setCurrentFrame(prev => (prev + 1) % 3); // 3 frames d'animation + 1 frame de repos
      }
    }, 150);

    return () => clearInterval(walkAnimationInterval);
  }, [isWalking, isAttacking]);

  // Animation des ennemis (marche normale)
  useEffect(() => {
    const enemyAnimationInterval = setInterval(() => {
      setEnemies(prev => prev.map(enemy => {
        if (enemy.isDying || !enemy.isAlive) return enemy;
        
        return {
          ...enemy,
          currentFrame: (enemy.currentFrame + 1) % 3 // Animation continue pour les ennemis vivants
        };
      }));
    }, 200); // Animation un peu plus lente pour les ennemis

    return () => clearInterval(enemyAnimationInterval);
  }, []);

  // Animation de mort des ennemis
  useEffect(() => {
    const deathAnimationInterval = setInterval(() => {
      setEnemies(prev => prev.map(enemy => {
        if (!enemy.isDying) return enemy;
        
        const nextFrame = enemy.deathFrame + 1;
        
        if (nextFrame >= 8) {
          // Animation terminée, supprimer l'ennemi
          return { ...enemy, isAlive: false, isDying: false };
        }
        
        return {
          ...enemy,
          deathFrame: nextFrame
        };
      }));
    }, 100); // Animation de mort plus rapide (100ms par frame)

    return () => clearInterval(deathAnimationInterval);
  }, []);

  // Nettoyer les ennemis morts après l'animation
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      setEnemies(prev => prev.filter(enemy => enemy.isAlive));
    }, 1000); // Nettoyer toutes les secondes

    return () => clearInterval(cleanupInterval);
  }, []);

  // Mouvement des ennemis - IA de poursuite en temps réel avec distance d'arrêt augmentée
  useEffect(() => {
    const enemyMovementInterval = setInterval(() => {
      setEnemies(prev => prev.map(enemy => {
        if (!enemy.isAlive || enemy.isDying) return enemy;
        
        let newX = enemy.x;
        let newY = enemy.y;
        let newDirection = enemy.direction;
        const speed = 0.5; // Vitesse de poursuite légèrement augmentée
        
        if (enemy.type === 'mushroom') {
          // Utiliser la position actuelle du joueur via la ref
          const currentPlayerPos = playerPositionRef.current;
          
          // Calculer la distance vers le joueur
          const deltaX = currentPlayerPos.x - enemy.x;
          const deltaY = currentPlayerPos.y - enemy.y;
          const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
          
          // Seuil de distance augmenté pour s'arrêter plus loin du joueur
          const minDistance = 6; // Augmenté de 2 à 6 pour plus de distance
          
          if (distance > minDistance) {
            // Se déplacer vers le joueur en normalisant le vecteur
            const moveX = (deltaX / distance) * speed;
            const moveY = (deltaY / distance) * speed;
            
            newX = Math.max(leftLimit, Math.min(rightLimit, enemy.x + moveX));
            newY = Math.max(topLimit, Math.min(bottomLimit, enemy.y + moveY));
            
            // Déterminer la direction du sprite basée sur le mouvement principal
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
              // Mouvement horizontal dominant
              newDirection = deltaX > 0 ? 3 : 2; // Droite ou gauche
            } else {
              // Mouvement vertical dominant
              newDirection = deltaY > 0 ? 0 : 1; // Bas ou haut
            }
          }
        }
        
        return {
          ...enemy,
          x: newX,
          y: newY,
          direction: newDirection
        };
      }));
    }, 16); // Augmenter la fréquence à ~60 FPS pour une poursuite plus fluide

    return () => clearInterval(enemyMovementInterval);
  }, []); // Pas de dépendances - utilise la ref pour la position du joueur

  // Animation d'attaque simple : image 3 → image 4 → fin
  useEffect(() => {
    if (isAttacking) {
      // Commencer par l'image 3 (index 2)
      setAttackFrame(2);
      
      // Passer à l'image 4 (index 3) après 120ms
      const step1 = setTimeout(() => {
        setAttackFrame(3);
      }, 120);
      
      // Terminer l'attaque après 240ms total
      const step2 = setTimeout(() => {
        setIsAttacking(false);
        setAttackFrame(0);
        
        // Vérifier les ennemis touchés par l'attaque
        checkAttackHit();
      }, 240);

      return () => {
        clearTimeout(step1);
        clearTimeout(step2);
      };
    }
  }, [isAttacking]);

  // Fonction pour vérifier si l'ennemi est dans la direction d'attaque
  const isEnemyInAttackDirection = (playerX: number, playerY: number, enemyX: number, enemyY: number, playerDirection: number) => {
    const deltaX = enemyX - playerX;
    const deltaY = enemyY - playerY;
    const attackAngle = 45; // Angle d'attaque en degrés (cône de 90° total)
    
    switch (playerDirection) {
      case 0: // Bas
        return deltaY > 0 && Math.abs(deltaX) <= Math.abs(deltaY) * Math.tan(attackAngle * Math.PI / 180);
      case 1: // Haut
        return deltaY < 0 && Math.abs(deltaX) <= Math.abs(deltaY) * Math.tan(attackAngle * Math.PI / 180);
      case 2: // Gauche
        return deltaX < 0 && Math.abs(deltaY) <= Math.abs(deltaX) * Math.tan(attackAngle * Math.PI / 180);
      case 3: // Droite
        return deltaX > 0 && Math.abs(deltaY) <= Math.abs(deltaX) * Math.tan(attackAngle * Math.PI / 180);
      default:
        return false;
    }
  };

  // Fonction pour vérifier si l'attaque touche un ennemi (CORRIGÉE avec direction)
  const checkAttackHit = () => {
    const attackRange = 8; // Portée de l'attaque
    const currentPlayerPos = playerPositionRef.current;
    const currentPlayerDirection = playerDirectionRef.current;
    
    setEnemies(prev => prev.map(enemy => {
      if (!enemy.isAlive || enemy.isDying) return enemy;
      
      // Calculer la distance entre le joueur et l'ennemi
      const deltaX = currentPlayerPos.x - enemy.x;
      const deltaY = currentPlayerPos.y - enemy.y;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      
      // Vérifier si l'ennemi est dans la portée ET dans la direction d'attaque
      if (distance <= attackRange && isEnemyInAttackDirection(currentPlayerPos.x, currentPlayerPos.y, enemy.x, enemy.y, currentPlayerDirection)) {
        const newHp = enemy.hp - 1; // Infliger 1 point de dégât
        
        if (newHp <= 0) {
          // Déclencher l'animation de mort
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

  // Gestion du mouvement avec limites
  useEffect(() => {
    const moveInterval = setInterval(() => {
      if (!isAttacking && (keys.up || keys.down || keys.left || keys.right)) {
        setIsWalking(true);
        setPosition(prev => {
          let newX = prev.x;
          let newY = prev.y;
          const speed = 1; // Vitesse de déplacement en %

          if (keys.up) {
            newY = Math.max(topLimit, prev.y - speed); // Limite haute à 35%
            setDirection(1); // Direction haut dans votre sprite
          }
          if (keys.down) {
            newY = Math.min(bottomLimit, prev.y + speed); // Limite basse à 90%
            setDirection(0); // Direction bas (première ligne)
          }
          if (keys.left) {
            newX = Math.max(leftLimit, prev.x - speed); // Limite gauche à 5%
            setDirection(2); // Direction gauche dans votre sprite
          }
          if (keys.right) {
            newX = Math.min(rightLimit, prev.x + speed); // Limite droite à 95%
            setDirection(3); // Direction droite dans votre sprite
          }

          return { x: newX, y: newY };
        });
      } else {
        setIsWalking(false);
        setCurrentFrame(1); // Frame de repos (milieu)
      }
    }, 16); // ~60 FPS

    return () => clearInterval(moveInterval);
  }, [keys, topLimit, bottomLimit, leftLimit, rightLimit, isAttacking]);

  // Gestion des touches
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      event.preventDefault();
      const key = event.key.toLowerCase();
      
      // Gestion de l'attaque
      if (key === ' ' && !isAttacking) {
        setIsAttacking(true);
        setIsWalking(false);
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
  }, [isAttacking]);

  // URL de votre image de fond
  const backgroundImageUrl = 'https://drive.google.com/thumbnail?id=1dG0VYnt0-H52bUAgk2ggO5A9OQQHbYMR&sz=w2000';
  
  // URL de votre sprite sheet de marche
  const walkSpriteSheetUrl = 'https://drive.google.com/thumbnail?id=1_Yp96n--W40rf5sQFA4L5MBpc0IBOYBW&sz=w1000';
  
  // URL de votre sprite sheet d'attaque
  const attackSpriteSheetUrl = 'https://drive.google.com/thumbnail?id=1dAguM-5cKwpr6d7IwmL4RyHZNHtnl5To&sz=w1000';
  
  // URL du sprite sheet du mushroom
  const mushroomSpriteSheetUrl = 'https://drive.google.com/thumbnail?id=1j2LelD-leMi_3y44PFuLCJOl_cmRRysA&sz=w1000';
  
  // URL du sprite sheet de mort du mushroom (4 lignes de 8 images)
  const mushroomDeathSpriteSheetUrl = 'https://drive.google.com/thumbnail?id=1Xf5RQQHzgCU2m39l3iCJ1wwBge-XCtZD&sz=w1000';

  // Configuration du sprite
  const spriteWidth = 32;
  const spriteHeight = 32;
  const walkFramesPerRow = 4; // 4 frames pour la marche
  const attackFramesPerRow = 8; // 8 frames pour l'attaque
  const deathFramesPerRow = 8; // 8 frames pour l'animation de mort
  const spriteScale = 3.5; // Taille ajustée à 3.5
  
  // Calcul de la position dans le sprite sheet
  let spriteX, spriteY, currentSpriteUrl, backgroundSizeX;
  
  if (isAttacking) {
    // Utiliser les images 3 et 4 (index 2 et 3) pour l'animation d'attaque
    spriteX = attackFrame * spriteWidth;
    spriteY = direction * spriteHeight;
    currentSpriteUrl = attackSpriteSheetUrl;
    backgroundSizeX = spriteWidth * attackFramesPerRow * spriteScale; // 8 images par ligne
  } else {
    // Utiliser le sprite de marche
    spriteX = currentFrame * spriteWidth;
    spriteY = direction * spriteHeight;
    currentSpriteUrl = walkSpriteSheetUrl;
    backgroundSizeX = spriteWidth * walkFramesPerRow * spriteScale; // 4 images par ligne
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
      tabIndex={0} // Permet la capture des événements clavier
    >
      {/* Personnage sprite qui se déplace - Ajusté à 3.5 */}
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

      {/* Ennemis avec barres de HP et animation de mort */}
      {enemies.map(enemy => {
        if (!enemy.isAlive && !enemy.isDying) return null;
        
        let enemySpriteX, enemySpriteY, enemySpriteUrl, enemyBackgroundSizeX;
        
        if (enemy.isDying) {
          // Animation de mort - utiliser la direction du champignon pour choisir la ligne
          enemySpriteX = enemy.deathFrame * spriteWidth;
          enemySpriteY = enemy.direction * spriteHeight; // CORRECTION : utiliser la direction du champignon
          enemySpriteUrl = mushroomDeathSpriteSheetUrl;
          enemyBackgroundSizeX = spriteWidth * deathFramesPerRow * 3; // 8 images par ligne
        } else {
          // Animation normale
          enemySpriteX = enemy.currentFrame * spriteWidth;
          enemySpriteY = enemy.direction * spriteHeight;
          enemySpriteUrl = mushroomSpriteSheetUrl;
          enemyBackgroundSizeX = spriteWidth * walkFramesPerRow * 3; // 4 images par ligne
        }
        
        return (
          <div key={enemy.id}>
            {/* Sprite de l'ennemi */}
            <div
              style={{
                position: 'absolute',
                left: `${enemy.x}%`,
                top: `${enemy.y}%`,
                transform: 'translate(-50%, -50%)',
                width: `${spriteWidth * 3}px`, // Mushroom un peu plus petit
                height: `${spriteHeight * 3}px`,
                backgroundImage: `url(${enemySpriteUrl})`,
                backgroundPosition: `-${enemySpriteX * 3}px -${enemySpriteY * 3}px`,
                backgroundSize: `${enemyBackgroundSizeX}px auto`,
                imageRendering: 'pixelated',
                transition: 'none',
                zIndex: 9,
                opacity: enemy.isDying ? 0.8 : 1 // Légère transparence pendant la mort
              }}
            />
            
            {/* Barre de HP au-dessus de l'ennemi (cachée pendant la mort) */}
            {!enemy.isDying && (
              <>
                <div
                  style={{
                    position: 'absolute',
                    left: `${enemy.x}%`,
                    top: `${enemy.y - 8}%`, // Placée au-dessus de l'ennemi
                    transform: 'translateX(-50%)',
                    width: '60px',
                    height: '8px',
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    border: '1px solid #333',
                    borderRadius: '3px',
                    zIndex: 11
                  }}
                >
                  {/* Barre de HP colorée */}
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
                
                {/* Texte HP */}
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
                  {enemy.hp}/{enemy.maxHp}
                </div>
              </>
            )}
          </div>
        );
      })}

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
        <p style={{ margin: '0', fontSize: '12px', opacity: 0.8 }}>
          Position: ({Math.round(position.x)}, {Math.round(position.y)})
        </p>
        <p style={{ margin: '0', fontSize: '12px', opacity: 0.8 }}>
          Direction: {getDirectionName(direction)} - {isAttacking ? `⚔️ Attaque directionnelle!` : isWalking ? '🚶 Marche' : '🧍 Repos'}
        </p>
        <p style={{ margin: '0', fontSize: '10px', opacity: 0.6 }}>
          🍄 Ennemis vivants: {enemies.filter(e => e.isAlive && !e.isDying).length} | 
          💀 En train de mourir: {enemies.filter(e => e.isDying).length} |
          ⚡ Portée: 8 | 🛡️ Distance d'arrêt: 6
        </p>
      </div>

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