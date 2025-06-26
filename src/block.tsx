import React, { useEffect, useState } from 'react';

interface BlockProps {
}

const Block: React.FC<BlockProps> = () => {
  const [currentFrame, setCurrentFrame] = useState(0);
  const [direction, setDirection] = useState(0); // 0: bas, 1: gauche, 2: droite, 3: haut
  const [isWalking, setIsWalking] = useState(false);

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

    // Animation du sprite
    const animationInterval = setInterval(() => {
      if (isWalking) {
        setCurrentFrame(prev => (prev + 1) % 4); // Assumant 4 frames par direction
      }
    }, 200); // 200ms entre chaque frame

    // Gestion des touches du clavier
    const handleKeyPress = (event: KeyboardEvent) => {
      setIsWalking(true);
      switch(event.key.toLowerCase()) {
        case 'arrowup':
        case 'z':
          setDirection(3); // Haut
          break;
        case 'arrowdown':
        case 's':
          setDirection(0); // Bas
          break;
        case 'arrowleft':
        case 'q':
          setDirection(1); // Gauche
          break;
        case 'arrowright':
        case 'd':
          setDirection(2); // Droite
          break;
      }
    };

    const handleKeyUp = () => {
      setIsWalking(false);
      setCurrentFrame(0); // Frame de repos
    };

    window.addEventListener('keydown', handleKeyPress);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      clearInterval(animationInterval);
      window.removeEventListener('keydown', handleKeyPress);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isWalking]);

  // URL de votre image de fond
  const backgroundImageUrl = 'https://drive.google.com/thumbnail?id=1dG0VYnt0-H52bUAgk2ggO5A9OQQHbYMR&sz=w2000';
  
  // URL de votre sprite sheet
  const spriteSheetUrl = 'https://drive.google.com/thumbnail?id=1_Yp96n--W40rf5sQFA4L5MBpc0IBOYBW&sz=w1000';

  // Calcul de la position du sprite (assumant une grille 4x4)
  const spriteWidth = 32; // Largeur d'un sprite en pixels (à ajuster selon votre image)
  const spriteHeight = 32; // Hauteur d'un sprite en pixels (à ajuster selon votre image)
  const spriteX = currentFrame * spriteWidth;
  const spriteY = direction * spriteHeight;

  return (
    <div style={{
      height: '100vh',
      margin: 0,
      backgroundImage: `url(${backgroundImageUrl})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Personnage sprite */}
      <div style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
        width: `${spriteWidth * 3}px`, // Agrandir le sprite
        height: `${spriteHeight * 3}px`,
        backgroundImage: `url(${spriteSheetUrl})`,
        backgroundPosition: `-${spriteX * 3}px -${spriteY * 3}px`,
        backgroundSize: `${spriteWidth * 4 * 3}px ${spriteHeight * 4 * 3}px`, // Assumant 4x4 grid
        imageRendering: 'pixelated', // Pour garder l'aspect pixel art
      }} />

      {/* Instructions */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        color: 'white',
        padding: '10px',
        borderRadius: '8px',
        fontFamily: 'Arial, sans-serif',
        fontSize: '14px'
      }}>
        <p style={{ margin: '0 0 5px 0' }}>🎮 Contrôles :</p>
        <p style={{ margin: '0' }}>Flèches directionnelles ou ZQSD</p>
      </div>
    </div>
  );
};

export default Block;