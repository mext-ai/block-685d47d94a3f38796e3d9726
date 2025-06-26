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
  }, []);

  // Pour l'instant, utilisons une image d'exemple qui fonctionne
  // Vous pourrez remplacer cette URL par votre image une fois qu'elle sera accessible
  const backgroundImageUrl = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80';

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
      backgroundImage: `url(${backgroundImageUrl})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
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
          <p style={{ 
            margin: 0, 
            fontSize: '1.3rem',
            fontWeight: '300'
          }}>
            🖼️ Image de fond active !
          </p>
          <p style={{ 
            margin: '0.5rem 0 0 0', 
            fontSize: '1rem',
            opacity: 0.9
          }}>
            Remplacez l'URL dans le code pour utiliser votre image
          </p>
        </div>
      </div>
    </div>
  );
};

export default Block;