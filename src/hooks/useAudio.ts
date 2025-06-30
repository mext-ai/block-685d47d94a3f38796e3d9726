import { useState, useEffect, useRef } from 'react';
import { BACKGROUND_MUSIC_URL, GAME_MUSIC_URL, PLAYER_HURT_SOUND_URL } from '../constants';

export const useAudio = () => {
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [backgroundMusic, setBackgroundMusic] = useState<HTMLAudioElement | null>(null);
  const [gameMusic, setGameMusic] = useState<HTMLAudioElement | null>(null);
  const [hurtSound, setHurtSound] = useState<HTMLAudioElement | null>(null);
  const isSoundEnabledRef = useRef(true);

  // Pré-charger le son de dégâts
  useEffect(() => {
    const audio = new Audio(PLAYER_HURT_SOUND_URL);
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
    const backgroundMusicUrl = BACKGROUND_MUSIC_URL;
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

  // Mettre à jour la référence du son
  useEffect(() => {
    isSoundEnabledRef.current = isSoundEnabled;
  }, [isSoundEnabled]);

  // Fonction pour activer/désactiver le son
  const toggleSound = () => {
    setIsSoundEnabled((prev: boolean) => !prev);
  };

  // Fonction pour jouer le son de dégâts
  const playHurtSound = () => {
    if (isSoundEnabledRef.current && hurtSound) {
      hurtSound.currentTime = 0;
      hurtSound.play().catch((error: Error) => {
        console.log('Erreur lecture son de dégâts:', error);
      });
    }
  };

  // Fonction pour forcer le démarrage de la musique
  const forceStartMusic = () => {
    if (backgroundMusic && isSoundEnabled) {
      backgroundMusic.play().catch((error: Error) => {
        console.log('Impossible de lancer la musique:', error);
      });
    }
  };

  return {
    isSoundEnabled,
    backgroundMusic,
    gameMusic,
    setGameMusic,
    toggleSound,
    playHurtSound,
    forceStartMusic
  };
}; 