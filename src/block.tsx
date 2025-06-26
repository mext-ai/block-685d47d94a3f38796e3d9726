import React, { useEffect, useState } from 'react';

interface BlockProps {
  title?: string;
}

const Block: React.FC<BlockProps> = ({ 
  title = 'Votre contenu ici' 
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

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

    // Précharger l'image pour vérifier qu'elle se charge
    const img = new Image();
    img.onload = () => {
      console.log('Image Google Drive chargée avec succès');
      setImageLoaded(true);
    };
    img.onerror = () => {
      console.error('Erreur de chargement de l\'image Google Drive');
      setImageError(true);
    };
    // Conversion du lien Google Drive en URL d'affichage direct
    img.src = 'https://drive.google.com/uc?export=view&id=1dG0VYnt0-H52bUAgk2ggO5A9OQQHbYMR';
  }, []);

  // URL directe de votre image Google Drive
  const backgroundImageUrl = 'https://drive.google.com/uc?export=view&id=1dG0VYnt0-H52bUAgk2ggO5A9OQQHbYMR';

  const backgroundStyle = imageLoaded ? {
    backgroundImage: `url(${backgroundImageUrl})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
  } : {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      fontFamily: 'Arial, sans-serif',
      margin: 0,
      color: 'white',
      position: 'relative',
      ...backgroundStyle
    }}>
      {/* Overlay pour améliorer la lisibilité du texte */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        zIndex: 1
      }} />
      
      {/* Contenu principal */}
      <div style={{
        position: 'relative',
        zIndex: 2,
        textAlign: 'center',
        padding: '2rem'
      }}>
        <h1 style={{
          fontSize: '3rem',
          textShadow: '2px 2px 4px rgba(0,0,0,0.7)',
          margin: 0,
          marginBottom: '1rem'
        }}>
          {title}
        </h1>
        
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.15)',
          padding: '1.5rem',
          borderRadius: '12px',
          marginTop: '2rem',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.3)'
        }}>
          {imageLoaded ? (
            <p style={{ 
              margin: 0, 
              fontSize: '1.3rem',
              fontWeight: '300'
            }}>
              ✨ Votre image Google Drive est chargée !
            </p>
          ) : imageError ? (
            <p style={{ 
              margin: 0, 
              fontSize: '1.3rem',
              fontWeight: '300',
              color: '#ff6b6b'
            }}>
              ❌ Erreur de chargement de l'image
            </p>
          ) : (
            <p style={{ 
              margin: 0, 
              fontSize: '1.3rem',
              fontWeight: '300'
            }}>
              ⏳ Chargement de votre image...
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Block;