import React from 'react';
import { MENU_BACKGROUND_URL } from '../constants';

interface LoadingScreenProps {
  progress: number;
  totalAssets: number;
  loadedAssets: number;
  error: string | null;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({
  progress,
  totalAssets,
  loadedAssets,
  error
}) => {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      margin: 0,
      backgroundImage: `url(${MENU_BACKGROUND_URL})`,
      backgroundSize: 'contain',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      backgroundColor: '#1a1a1a',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 9999,
      fontFamily: 'Arial, sans-serif',
      color: 'white',
      overflow: 'hidden'
    }}>
      {/* Overlay semi-transparent pour améliorer la lisibilité */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        zIndex: 1
      }} />
      
      {/* Contenu centré avec z-index plus élevé */}
      <div style={{
        position: 'relative',
        zIndex: 2,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
        marginTop: '10vh'
      }}>
        {/* Barre de progression */}
        <div style={{
          width: '80%',
          maxWidth: '500px',
          marginBottom: '1rem'
        }}>
          <div style={{
            width: '100%',
            height: '20px',
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            borderRadius: '10px',
            overflow: 'hidden',
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3), 0 2px 8px rgba(0,0,0,0.3)',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <div style={{
              width: `${progress}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #4ecdc4, #45b7d1, #96ceb4)',
              borderRadius: '10px',
              transition: 'width 0.3s ease',
              boxShadow: '0 0 10px rgba(78, 205, 196, 0.5)',
              position: 'relative'
            }}>
              {/* Effet de brillance */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '50%',
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                borderRadius: '10px'
              }} />
            </div>
          </div>
        </div>

        {/* Texte de progression */}
        <div style={{
          fontSize: '1rem',
          marginBottom: '2rem',
          textAlign: 'center',
          textShadow: '1px 1px 2px rgba(0,0,0,0.8)'
        }}>
          {error ? (
            <div style={{ color: '#ff6b6b' }}>
              Erreur: {error}
            </div>
          ) : (
            <>
              <div style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                {progress}%
              </div>
              <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>
                {loadedAssets} / {totalAssets} assets chargés
              </div>
            </>
          )}
        </div>

        {/* Animation de chargement */}
        <div style={{
          display: 'flex',
          gap: '8px'
        }}>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: '#4ecdc4',
                boxShadow: '0 0 8px rgba(78, 205, 196, 0.6)',
                animation: `bounce 1.4s ease-in-out infinite both`,
                animationDelay: `${i * 0.16}s`
              }}
            />
          ))}
        </div>
      </div>

      {/* Styles CSS pour les animations */}
      <style>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        @keyframes bounce {
          0%, 80%, 100% {
            transform: scale(0);
            opacity: 0.5;
          }
          40% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default LoadingScreen; 