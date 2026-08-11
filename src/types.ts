export type GameMode = 'arcade' | 'maze' | 'mouse_escape' | 'time_attack';

export type Language = 'th' | 'en';

export interface CatSkin {
  id: string;
  nameTh: string;
  nameEn: string;
  descriptionTh: string;
  descriptionEn: string;
  color: string;
  earColor: string;
  eyeColor: string;
  unlocked: boolean;
  unlockCost: number; // cost in total cheese
  speedMultiplier: number;
  magnetRadius: number;
  bonusLuck: number; // increases golden mice rate
  icon: string;
}

export interface MouseEntity {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  type: 'standard' | 'golden' | 'giant' | 'decoy';
  points: number;
  cheeseReward: number;
  angle: number;
  animFrame: number;
  hp?: number; // for giant mouse
  maxHp?: number;
  fleeDistance?: number;
}

export interface PowerUpEntity {
  id: string;
  x: number;
  y: number;
  type: 'catnip' | 'golden_cheese' | 'clock_freeze' | 'fish_snack';
  radius: number;
  duration: number; // in seconds or frames
  pulseAngle: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
  decay: number;
  text?: string;
}

export interface GameStats {
  totalMiceCaught: number;
  totalCheeseCollected: number;
  highScoreArcade: number;
  highScoreMaze: number;
  highScoreMouseEscape: number;
  highScoreTimeAttack: number;
  catnipUsed: number;
  gamesPlayed: number;
}

export interface Achievement {
  id: string;
  titleTh: string;
  titleEn: string;
  descTh: string;
  descEn: string;
  icon: string;
  progress: number;
  maxProgress: number;
  completed: boolean;
  rewardCheese: number;
}

export type ControlMethod = 'mouse_touch' | 'keyboard' | 'virtual_joystick';
