import React, { useEffect } from 'react';

interface BlockProps {
  title?: string;
}

const Block: React.FC<BlockProps> = ({ 
  title = 'Votre contenu ici' 
}) => {
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

  // Votre image PNG en format Base64 intégrée
  const backgroundImageBase64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";

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
      backgroundImage: `url(${backgroundImageBase64})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      // Fallback en cas de problème avec l'image
      backgroundColor: '#2c3e50',
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
            🖼️ Image Base64 intégrée
          </p>
          <p style={{ 
            margin: '0.5rem 0 0 0', 
            fontSize: '1rem',
            opacity: 0.9
          }}>
            Prêt à recevoir votre image personnalisée !
          </p>
        </div>
      </div>
    </div>
  );
};

export default Block;