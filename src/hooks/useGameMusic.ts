import { useEffect } from 'react';

interface UseGameMusicProps {
  gameState: string;
  level: number;
  isSoundEnabled: boolean;
  backgroundMusic: HTMLAudioElement | null;
  gameMusic: HTMLAudioElement | null;
  setGameMusic: (music: HTMLAudioElement) => void;
}

export const useGameMusic = ({
  gameState,
  level,
  isSoundEnabled,
  backgroundMusic,
  gameMusic,
  setGameMusic
}: UseGameMusicProps) => {
  // Contrôler la musique selon l'état du jeu
  useEffect(() => {
    if (!backgroundMusic) return;

    const playMusic = async () => {
      if ((gameState === 'menu' || gameState === 'levelSelect') && isSoundEnabled) {
        try {
          if (backgroundMusic) {
            backgroundMusic.currentTime = 0;
            await backgroundMusic.play();
          }
        } catch (error) {
          // Gestion silencieuse des erreurs audio
        }
      } else {
        if (backgroundMusic) {
          backgroundMusic.pause();
        }
      }
    };

    playMusic();
  }, [gameState, isSoundEnabled, backgroundMusic]);

  // Gestion de la musique de jeu pour le niveau 1
  useEffect(() => {
    if (gameState === 'playing' && level === 1) {
      if (!gameMusic) {
        const gameMusicUrl = 'https://www.dropbox.com/scl/fi/xwqj85vyt90g4mp7o1hif/flute-rain-flute-loop-ambient-short-loop-340800.mp3?rlkey=819wk666fxdt68uawl1pjbwud&st=4r8oib11&dl=1';
        const audioElement = new Audio(gameMusicUrl);
        audioElement.loop = true;
        audioElement.volume = 0.4;
        audioElement.preload = 'auto';
        setGameMusic(audioElement);
        
        if (isSoundEnabled) {
          setTimeout(() => {
            audioElement.play().catch(() => {
              // Gestion silencieuse des erreurs audio
            });
          }, 500);
        }
      }
    }
    
    return () => {
      if (gameMusic && (gameState !== 'playing' || level !== 1)) {
        gameMusic.pause();
        gameMusic.currentTime = 0;
      }
    };
  }, [gameState, level, isSoundEnabled, gameMusic, setGameMusic]);

  // Contrôler la musique de jeu selon l'état du son
  useEffect(() => {
    if (!gameMusic) return;
    
    if (gameState === 'playing' && level === 1 && isSoundEnabled) {
      gameMusic.play().catch(() => {
        // Gestion silencieuse des erreurs audio
      });
    } else {
      gameMusic.pause();
    }
  }, [gameState, level, isSoundEnabled, gameMusic]);
}; 