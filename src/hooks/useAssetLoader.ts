import { useState, useEffect } from 'react';
import {
  // Backgrounds
  BACKGROUND_IMAGE_URL,
  LEVEL2_BACKGROUND_URL,
  LEVEL3_BACKGROUND_URL,
  LEVEL4_BACKGROUND_URL,
  LEVEL5_BACKGROUND_URL,
  LEVEL6_BACKGROUND_URL,
  LEVEL7_BACKGROUND_URL,
  LEVEL8_BACKGROUND_URL,
  LEVEL9_BACKGROUND_URL,
  
  // Player sprites
  WALK_SPRITE_SHEET_URL,
  ATTACK_SPRITE_SHEET_URL,
  PLAYER_DEATH_SPRITE_SHEET_URL,
  
  // Enemy sprites
  MUSHROOM_SPRITE_SHEET_URL,
  MUSHROOM_DEATH_SPRITE_SHEET_URL,
  MUSHROOM_ATTACK_SPRITE_SHEET_URL,
  TREANT_WALK_SPRITE_SHEET_URL,
  TREANT_IDLE_SPRITE_SHEET_URL,
  TREANT_DEATH_SPRITE_SHEET_URL,
  TREANT_ATTACK_SPRITE_SHEET_URL,
  DEVIL_WALK_SPRITE_SHEET_URL,
  DEVIL_ATTACK_SPRITE_SHEET_URL,
  DEVIL_DEATH_SPRITE_SHEET_URL,
  DEVIL_PROJECTILE_URL,
  OBSERVER_WALK_SPRITE_SHEET_URL,
  OBSERVER_ATTACK_SPRITE_SHEET_URL,
  OBSERVER_DEATH_SPRITE_SHEET_URL,
  OBSERVER_PROJECTILE_URL,
  GOBLIN_WALK_SPRITE_SHEET_URL,
  GOBLIN_ATTACK_SPRITE_SHEET_URL,
  GOBLIN_DEATH_SPRITE_SHEET_URL,
  GOLEM_WALK_SPRITE_SHEET_URL,
  GOLEM_ATTACK_SPRITE_SHEET_URL,
  GOLEM_DEATH_SPRITE_SHEET_URL,
  GNOLL_WALK_SPRITE_SHEET_URL,
  GNOLL_ATTACK_SPRITE_SHEET_URL,
  GNOLL_DEATH_SPRITE_SHEET_URL,
  
  // UI sprites
  HEART_SPRITE_SHEET_URL,
  SKULL_IMAGE_URL,
  WOOD_FRAME_IMAGE_URL,
  
  // Menu sprites
  MENU_BACKGROUND_URL,
  PLAY_BUTTON_URL,
  LEVEL_MENU_BACKGROUND_URL,
  LEVEL1_BUTTON_URL,
  LEVEL2_BUTTON_LOCKED_URL,
  LEVEL2_BUTTON_UNLOCKED_URL,
  LEVEL3_BUTTON_LOCKED_URL,
  LEVEL3_BUTTON_UNLOCKED_URL,
  LEVEL4_BUTTON_LOCKED_URL,
  LEVEL4_BUTTON_UNLOCKED_URL,
  LEVEL5_BUTTON_LOCKED_URL,
  LEVEL5_BUTTON_UNLOCKED_URL,
  LEVEL6_BUTTON_LOCKED_URL,
  LEVEL6_BUTTON_UNLOCKED_URL,
  LEVEL7_BUTTON_LOCKED_URL,
  LEVEL7_BUTTON_UNLOCKED_URL,
  LEVEL8_BUTTON_LOCKED_URL,
  LEVEL8_BUTTON_UNLOCKED_URL,
  LEVEL9_BUTTON_LOCKED_URL,
  LEVEL9_BUTTON_UNLOCKED_URL,
  
  // Control sprites
  SPACE_KEY_IMAGE_URL,
  ARROW_KEYS_IMAGE_URL,
  
  // End game sprites
  RESTART_BUTTON_URL,
  BACK_TO_LEVELS_BUTTON_URL,
  NEXT_LEVEL_BUTTON_URL,
  GAME_OVER_BACKGROUND_URL,
  VICTORY_BACKGROUND_URL,
  
  // Sound sprites
  SOUND_ON_BUTTON_URL,
  SOUND_OFF_BUTTON_URL,
  
  // Music and sounds
  BACKGROUND_MUSIC_URL,
  GAME_MUSIC_URL,
  PLAYER_HURT_SOUND_URL,
  
  // Theme backgrounds
  FOREST_THEME_BACKGROUND_URL,
  MOUNTAIN_THEME_BACKGROUND_URL,
  VOLCANO_THEME_BACKGROUND_URL,
  
  // Navigation arrows
  PREVIOUS_ARROW_URL,
  NEXT_ARROW_URL
} from '../constants';

interface AssetLoaderState {
  isLoading: boolean;
  progress: number;
  totalAssets: number;
  loadedAssets: number;
  error: string | null;
}

export const useAssetLoader = () => {
  const [state, setState] = useState<AssetLoaderState>({
    isLoading: true,
    progress: 0,
    totalAssets: 0,
    loadedAssets: 0,
    error: null
  });

  useEffect(() => {
    const loadAssets = async () => {
      // Liste de tous les assets à charger
      const imageAssets = [
        // Backgrounds
        BACKGROUND_IMAGE_URL,
        LEVEL2_BACKGROUND_URL,
        LEVEL3_BACKGROUND_URL,
        LEVEL4_BACKGROUND_URL,
        LEVEL5_BACKGROUND_URL,
        LEVEL6_BACKGROUND_URL,
        LEVEL7_BACKGROUND_URL,
        LEVEL8_BACKGROUND_URL,
        LEVEL9_BACKGROUND_URL,
        
        // Player sprites
        WALK_SPRITE_SHEET_URL,
        ATTACK_SPRITE_SHEET_URL,
        PLAYER_DEATH_SPRITE_SHEET_URL,
        
        // Enemy sprites
        MUSHROOM_SPRITE_SHEET_URL,
        MUSHROOM_DEATH_SPRITE_SHEET_URL,
        MUSHROOM_ATTACK_SPRITE_SHEET_URL,
        TREANT_WALK_SPRITE_SHEET_URL,
        TREANT_IDLE_SPRITE_SHEET_URL,
        TREANT_DEATH_SPRITE_SHEET_URL,
        TREANT_ATTACK_SPRITE_SHEET_URL,
        DEVIL_WALK_SPRITE_SHEET_URL,
        DEVIL_ATTACK_SPRITE_SHEET_URL,
        DEVIL_DEATH_SPRITE_SHEET_URL,
        DEVIL_PROJECTILE_URL,
        OBSERVER_WALK_SPRITE_SHEET_URL,
        OBSERVER_ATTACK_SPRITE_SHEET_URL,
        OBSERVER_DEATH_SPRITE_SHEET_URL,
        OBSERVER_PROJECTILE_URL,
        GOBLIN_WALK_SPRITE_SHEET_URL,
        GOBLIN_ATTACK_SPRITE_SHEET_URL,
        GOBLIN_DEATH_SPRITE_SHEET_URL,
        GOLEM_WALK_SPRITE_SHEET_URL,
        GOLEM_ATTACK_SPRITE_SHEET_URL,
        GOLEM_DEATH_SPRITE_SHEET_URL,
        GNOLL_WALK_SPRITE_SHEET_URL,
        GNOLL_ATTACK_SPRITE_SHEET_URL,
        GNOLL_DEATH_SPRITE_SHEET_URL,
        
        // UI sprites
        HEART_SPRITE_SHEET_URL,
        SKULL_IMAGE_URL,
        WOOD_FRAME_IMAGE_URL,
        
        // Menu sprites
        MENU_BACKGROUND_URL,
        PLAY_BUTTON_URL,
        LEVEL_MENU_BACKGROUND_URL,
        LEVEL1_BUTTON_URL,
        LEVEL2_BUTTON_LOCKED_URL,
        LEVEL2_BUTTON_UNLOCKED_URL,
        LEVEL3_BUTTON_LOCKED_URL,
        LEVEL3_BUTTON_UNLOCKED_URL,
        LEVEL4_BUTTON_LOCKED_URL,
        LEVEL4_BUTTON_UNLOCKED_URL,
        LEVEL5_BUTTON_LOCKED_URL,
        LEVEL5_BUTTON_UNLOCKED_URL,
        LEVEL6_BUTTON_LOCKED_URL,
        LEVEL6_BUTTON_UNLOCKED_URL,
        LEVEL7_BUTTON_LOCKED_URL,
        LEVEL7_BUTTON_UNLOCKED_URL,
        LEVEL8_BUTTON_LOCKED_URL,
        LEVEL8_BUTTON_UNLOCKED_URL,
        LEVEL9_BUTTON_LOCKED_URL,
        LEVEL9_BUTTON_UNLOCKED_URL,
        
        // Control sprites
        SPACE_KEY_IMAGE_URL,
        ARROW_KEYS_IMAGE_URL,
        
        // End game sprites
        RESTART_BUTTON_URL,
        BACK_TO_LEVELS_BUTTON_URL,
        NEXT_LEVEL_BUTTON_URL,
        GAME_OVER_BACKGROUND_URL,
        VICTORY_BACKGROUND_URL,
        
        // Sound sprites
        SOUND_ON_BUTTON_URL,
        SOUND_OFF_BUTTON_URL,
        
        // Theme backgrounds
        FOREST_THEME_BACKGROUND_URL,
        MOUNTAIN_THEME_BACKGROUND_URL,
        VOLCANO_THEME_BACKGROUND_URL,
        
        // Navigation arrows
        PREVIOUS_ARROW_URL,
        NEXT_ARROW_URL
      ];

      const audioAssets = [
        BACKGROUND_MUSIC_URL,
        GAME_MUSIC_URL,
        PLAYER_HURT_SOUND_URL
      ];

      const totalAssets = imageAssets.length + audioAssets.length;
      let loadedAssets = 0;

      setState(prev => ({
        ...prev,
        totalAssets,
        loadedAssets: 0,
        progress: 0
      }));

      // Fonction pour charger une image
      const loadImage = (url: string): Promise<void> => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => {
            loadedAssets++;
            const progress = Math.round((loadedAssets / totalAssets) * 100);
            setState(prev => ({
              ...prev,
              loadedAssets,
              progress
            }));
            resolve();
          };
          img.onerror = () => {
            console.warn(`Failed to load image: ${url}`);
            loadedAssets++;
            const progress = Math.round((loadedAssets / totalAssets) * 100);
            setState(prev => ({
              ...prev,
              loadedAssets,
              progress
            }));
            resolve(); // Continue même si une image échoue
          };
          img.src = url;
        });
      };

      // Fonction pour charger un audio
      const loadAudio = (url: string): Promise<void> => {
        return new Promise((resolve) => {
          const audio = new Audio();
          audio.oncanplaythrough = () => {
            loadedAssets++;
            const progress = Math.round((loadedAssets / totalAssets) * 100);
            setState(prev => ({
              ...prev,
              loadedAssets,
              progress
            }));
            resolve();
          };
          audio.onerror = () => {
            console.warn(`Failed to load audio: ${url}`);
            loadedAssets++;
            const progress = Math.round((loadedAssets / totalAssets) * 100);
            setState(prev => ({
              ...prev,
              loadedAssets,
              progress
            }));
            resolve(); // Continue même si un audio échoue
          };
          audio.src = url;
          audio.load();
        });
      };

      try {
        // Charger toutes les images en parallèle
        const imagePromises = imageAssets.map(loadImage);
        
        // Charger tous les audios en parallèle
        const audioPromises = audioAssets.map(loadAudio);
        
        // Attendre que tout soit chargé
        await Promise.all([...imagePromises, ...audioPromises]);
        
        // Petit délai pour montrer 100% avant de finir
        setTimeout(() => {
          setState(prev => ({
            ...prev,
            isLoading: false,
            progress: 100
          }));
        }, 500);
        
      } catch (error) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Erreur de chargement'
        }));
      }
    };

    loadAssets();
  }, []);

  return state;
}; 