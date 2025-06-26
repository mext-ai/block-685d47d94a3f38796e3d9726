import React, { useEffect, useState } from 'react';

interface BlockProps {
}

const Block: React.FC<BlockProps> = () => {
  const [currentFrame, setCurrentFrame] = useState(0);
  const [direction, setDirection] = useState(0); // Direction du sprite
  const [isWalking, setIsWalking] = useState(false);
  const [isAttacking, setIsAttacking] = useState(false);
  const [attackFrame, setAttackFrame] = useState(0);
  const [position, setPosition] = useState({ x: 50, y: 50 }); // Position en pourcentage
  const [keys, setKeys] = useState({ up: false, down: false, left: false, right: false, space: false });

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

    // Animation du sprite de marche
    const walkAnimationInterval = setInterval(() => {
      if (isWalking && !isAttacking) {
        setCurrentFrame(prev => (prev + 1) % 3); // 3 frames d'animation + 1 frame de repos
      }
    }, 150);

    return () => clearInterval(walkAnimationInterval);
  }, [isWalking, isAttacking]);

  // Animation d'attaque
  useEffect(() => {
    if (isAttacking) {
      const attackAnimationInterval = setInterval(() => {
        setAttackFrame(prev => {
          if (prev >= 2) { // 3 frames d'attaque (0, 1, 2)
            setIsAttacking(false);
            return 0;
          }
          return prev + 1;
        });
      }, 100); // Animation d'attaque plus rapide

      return () => clearInterval(attackAnimationInterval);
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
        setAttackFrame(0);
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

  // Configuration du sprite
  const spriteWidth = 32;
  const spriteHeight = 32;
  const framesPerRow = 4; // Nombre de frames par ligne/direction
  
  // Calcul de la position dans le sprite sheet
  let spriteX, spriteY, currentSpriteUrl;
  
  if (isAttacking) {
    // Utiliser seulement la 4ème image (index 3) de chaque ligne pour l'attaque
    spriteX = 3 * spriteWidth; // Toujours la 4ème image (index 3)
    spriteY = direction * spriteHeight;
    currentSpriteUrl = attackSpriteSheetUrl;
  } else {
    // Utiliser le sprite de marche
    spriteX = currentFrame * spriteWidth;
    spriteY = direction * spriteHeight;
    currentSpriteUrl = walkSpriteSheetUrl;
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
      {/* Personnage sprite qui se déplace */}
      <div style={{
        position: 'absolute',
        left: `${position.x}%`,
        top: `${position.y}%`,
        transform: 'translate(-50%, -50%)',
        width: `${spriteWidth * 3}px`,
        height: `${spriteHeight * 3}px`,
        backgroundImage: `url(${currentSpriteUrl})`,
        backgroundPosition: `-${spriteX * 3}px -${spriteY * 3}px`,
        backgroundSize: `${spriteWidth * framesPerRow * 3}px auto`,
        imageRendering: 'pixelated',
        transition: 'none',
        zIndex: 10
      }} />

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
          {isAttacking ? '⚔️ Attaque!' : isWalking ? '🚶 Marche' : '🧍 Repos'}
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