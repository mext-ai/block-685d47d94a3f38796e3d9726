import React, { useEffect, useState } from 'react';

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

  // Limites de la zone de jeu - Réduction encore plus importante de la zone de déplacement depuis le haut
  const topLimit = 35; // Augmenté de 30% à 35% pour encore plus réduire la zone de déplacement
  const bottomLimit = 90; // 10% du bas bloqué (100% - 10% = 90%)
  const leftLimit = 5; // 5% des côtés pour éviter de sortir
  const rightLimit = 95; // 95% des côtés

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

    // Créer le premier ennemi mushroom au démarrage
    const initialMushroom: Enemy = {
      id: 1,
      type: 'mushroom',
      x: 20, // Position initiale différente du joueur
      y: 70, // Position verticale différente du joueur
      direction: 3, // Direction droite par défaut
      currentFrame: 0,
      isAlive: true
    };
    setEnemies([initialMushroom]);

    // Animation du sprite de marche
    const walkAnimationInterval = setInterval(() => {
      if (isWalking && !isAttacking) {
        setCurrentFrame(prev => (prev + 1) % 3); // 3 frames d'animation + 1 frame de repos
      }
    }, 150);

    return () => clearInterval(walkAnimationInterval);
  }, [isWalking, isAttacking]);

  // Animation des ennemis
  useEffect(() => {
    const enemyAnimationInterval = setInterval(() => {
      setEnemies(prev => prev.map(enemy => ({
        ...enemy,
        currentFrame: (enemy.currentFrame + 1) % 3 // Animation continue pour les ennemis
      })));
    }, 200); // Animation un peu plus lente pour les ennemis

    return () => clearInterval(enemyAnimationInterval);
  }, []);

  // Mouvement des ennemis - IA de poursuite
  useEffect(() => {
    const enemyMovementInterval = setInterval(() => {
      setEnemies(prev => prev.map(enemy => {
        if (!enemy.isAlive) return enemy;
        
        let newX = enemy.x;
        let newY = enemy.y;
        let newDirection = enemy.direction;
        const speed = 0.4; // Vitesse de poursuite
        
        if (enemy.type === 'mushroom') {
          // Calculer la distance vers le joueur
          const deltaX = position.x - enemy.x;
          const deltaY = position.y - enemy.y;
          const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
          
          // Seuil de distance pour éviter le tremblement quand très proche
          const minDistance = 3;
          
          if (distance > minDistance) {
            // Se déplacer vers le joueur
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
    }, 32); // ~30 FPS pour le mouvement des ennemis

    return () => clearInterval(enemyMovementInterval);
  }, [position, topLimit, bottomLimit, leftLimit, rightLimit]); // Dépendance sur la position du joueur

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
      }, 240);

      return () => {
        clearTimeout(step1);
        clearTimeout(step2);
      };
    }
  }, [isAttacking]);

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

  // Configuration du sprite
  const spriteWidth = 32;
  const spriteHeight = 32;
  const walkFramesPerRow = 4; // 4 frames pour la marche
  const attackFramesPerRow = 8; // 8 frames pour l'attaque
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

      {/* Ennemis */}
      {enemies.map(enemy => {
        if (!enemy.isAlive) return null;
        
        const enemySpriteX = enemy.currentFrame * spriteWidth;
        const enemySpriteY = enemy.direction * spriteHeight;
        
        return (
          <div
            key={enemy.id}
            style={{
              position: 'absolute',
              left: `${enemy.x}%`,
              top: `${enemy.y}%`,
              transform: 'translate(-50%, -50%)',
              width: `${spriteWidth * 3}px`, // Mushroom un peu plus petit
              height: `${spriteHeight * 3}px`,
              backgroundImage: `url(${mushroomSpriteSheetUrl})`,
              backgroundPosition: `-${enemySpriteX * 3}px -${enemySpriteY * 3}px`,
              backgroundSize: `${spriteWidth * walkFramesPerRow * 3}px auto`,
              imageRendering: 'pixelated',
              transition: 'none',
              zIndex: 9
            }}
          />
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
          Direction: {direction} - {isAttacking ? `⚔️ Attaque simple!` : isWalking ? '🚶 Marche' : '🧍 Repos'}
        </p>
        <p style={{ margin: '0', fontSize: '10px', opacity: 0.6 }}>
          🍄 Ennemis: {enemies.filter(e => e.isAlive).length} - IA Active
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