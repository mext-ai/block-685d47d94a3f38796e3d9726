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

    // Tester le chargement de l'image
    const img = new Image();
    img.onload = () => {
      console.log('Image chargée avec succès');
      setImageLoaded(true);
    };
    img.onerror = () => {
      console.error('Erreur de chargement de l\'image');
      setImageError(true);
    };
    img.src = 'https://mext-content-library.s3.eu-west-3.amazonaws.com/uploads/44905eb6-acf6-406e-bdb8-0659cb46a6bc.png';
  }, []);

  // URL de votre image PNG uploadée
  const backgroundImageUrl = 'https://mext-content-library.s3.eu-west-3.amazonaws.com/uploads/44905eb6-acf6-406e-bdb8-0659cb46a6bc.png';

  const backgroundStyle = imageLoaded ? {
    backgroundImage: `url(${backgroundImageUrl})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
  } : {
    background: 'linear-gradient(135deg, #ff6b6b 0%, #4ecdc4 100%)',
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
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
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
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          padding: '1.5rem',
          borderRadius: '12px',
          marginTop: '2rem',
          backdropFilter: 'blur(5px)',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          {imageLoaded ? (
            <p style={{ 
              margin: 0, 
              fontSize: '1.3rem',
              fontWeight: '300'
            }}>
              ✨ Votre image PNG est chargée !
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
              ⏳ Chargement de l'image...
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Block;