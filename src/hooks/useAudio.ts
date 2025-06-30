import { useState, useEffect, useRef } from 'react';
import { backgroundMusicUrl, gameMusicUrl, playerHurtSoundUrl } from '../constants';

export const useAudio = () => {
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [backgroundMusic, setBackgroundMusic] = useState<HTMLAudioElement | null>(null);
  const [gameMusic, setGameMusic] = useState<HTMLAudioElement | null>(null);
  const [hurtSound, setHurtSound] = useState<HTMLAudioElement | null>(null);
  
  const isSoundEnabledRef = useRef(true);

  // Pré-charger le son de dégâts
  useEffect(() => {
    const audio = new Audio(playerHurtSoundUrl);
    audio.volume = 0.6;
    audio.preload = 'auto';
    setHurtSound(audio);

    return () => {
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    };
  }, []);

  // Gestion de la musique de fond
  useEffect(() => {
    const audio = new Audio(backgroundMusicUrl);
    audio.loop = true;
    audio.volume = 0.3;
    audio.preload = 'auto';
    setBackgroundMusic(audio);

    return () => {
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    };
  }, []);

  // Gestion de la musique de jeu pour le niveau 1
  useEffect(() => {
    if (!gameMusic) {
      const audio = new Audio(gameMusicUrl);
      audio.loop = true;
      audio.volume = 0.4;
      audio.preload = 'auto';
      setGameMusic(audio);
    }

    return () => {
      if (gameMusic) {
        gameMusic.pause();
        gameMusic.currentTime = 0;
      }
    };
  }, [gameMusic]);

  const toggleSound = () => {
    setIsSoundEnabled((prev: boolean) => !prev);
    isSoundEnabledRef.current = !isSoundEnabledRef.current;
  };

  const playHurtSound = () => {
    if (hurtSound && isSoundEnabledRef.current) {
      hurtSound.currentTime = 0;
      hurtSound.play().catch((error: any) => {
        console.log('Erreur lecture son de dégâts:', error);
      });
    }
  };

  const forceStartMusic = () => {
    if (backgroundMusic && isSoundEnabledRef.current) {
      backgroundMusic.currentTime = 0;
      backgroundMusic.play().catch((error: any) => {
        console.log('Erreur lecture musique:', error);
      });
    }
  };

  return {
    isSoundEnabled,
    backgroundMusic,
    gameMusic,
    hurtSound,
    isSoundEnabledRef,
    toggleSound,
    playHurtSound,
    forceStartMusic
  };
}; 