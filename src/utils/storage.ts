import { Achievement, CatSkin, GameStats } from '../types';

export const CAT_SKINS: CatSkin[] = [
  {
    id: 'orange',
    nameTh: 'น้องส้มจอมตะกละ',
    nameEn: 'Orange Tabby',
    descriptionTh: 'แมวส้มตัวตึง วิ่งสมดุลและจับหนูเก่งที่สุด!',
    descriptionEn: 'The classic greedy orange cat. Balanced speed and stamina.',
    color: '#f97316', // orange-500
    earColor: '#ea580c',
    eyeColor: '#16a34a',
    unlocked: true,
    unlockCost: 0,
    speedMultiplier: 1.0,
    magnetRadius: 0,
    bonusLuck: 1.0,
    icon: '🐱',
  },
  {
    id: 'calico',
    nameTh: 'น้องสามสีโชคดี',
    nameEn: 'Lucky Calico',
    descriptionTh: 'แมวสามสีนำโชค เพิ่มโอกาสเจอหนูทองและเนยแข็งทองคำ 50%!',
    descriptionEn: 'Lucky tricolor cat. Increases Golden Mice & Cheese spawns by 50%!',
    color: '#eab308', // yellow/calico
    earColor: '#451a03',
    eyeColor: '#2563eb',
    unlocked: false,
    unlockCost: 50,
    speedMultiplier: 1.05,
    magnetRadius: 20,
    bonusLuck: 1.5,
    icon: '🐱‍👤',
  },
  {
    id: 'black_panther',
    nameTh: 'นินจาดำสายฟ้า',
    nameEn: 'Black Ninja Cat',
    descriptionTh: 'แมวดำนินจา ความเร็วสูงสุด พุ่งตัวจับหนูได้อย่างรวดเร็ว!',
    descriptionEn: 'Ninja black cat. High speed & fast dash maneuvers!',
    color: '#1f2937', // dark gray/black
    earColor: '#374151',
    eyeColor: '#facc15',
    unlocked: false,
    unlockCost: 120,
    speedMultiplier: 1.25,
    magnetRadius: 10,
    bonusLuck: 1.0,
    icon: '🐈‍⬛',
  },
  {
    id: 'siamese',
    nameTh: 'วิเชียรมาศพลังแม่เหล็ก',
    nameEn: 'Siamese Magnet Cat',
    descriptionTh: 'แมวไทยวิเชียรมาศ มีแรงดึงดูดแม่เหล็ก ดูดหนูและไอเทมเข้าหาตัว!',
    descriptionEn: 'Traditional Thai Siamese cat. Possesses a strong item magnet aura!',
    color: '#fef08a', // cream
    earColor: '#451a03', // dark points
    eyeColor: '#0284c7', // bright blue eyes
    unlocked: false,
    unlockCost: 200,
    speedMultiplier: 1.1,
    magnetRadius: 80,
    bonusLuck: 1.2,
    icon: '😼',
  },
  {
    id: 'cyber_bot',
    nameTh: 'แมวหุ่นยนต์อนาคต',
    nameEn: 'Cyber Mecha Cat',
    descriptionTh: 'แมวไซเบอร์สุดไฮเทค ความเร็วสูง + แรงดึงดูดสูงสุด + ไร้ขีดจำกัด!',
    descriptionEn: 'High-tech robotic cat with laser eyes, max magnet & ultra speed!',
    color: '#06b6d4', // cyan
    earColor: '#0891b2',
    eyeColor: '#ec4899',
    unlocked: false,
    unlockCost: 400,
    speedMultiplier: 1.35,
    magnetRadius: 120,
    bonusLuck: 1.8,
    icon: '🤖',
  },
];

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_catch',
    titleTh: 'พรานหนูมือใหม่',
    titleEn: 'Novice Hunter',
    descTh: 'จับหนูตัวแรกสำเร็จ',
    descEn: 'Catch your very first mouse',
    icon: '🐭',
    progress: 0,
    maxProgress: 1,
    completed: false,
    rewardCheese: 10,
  },
  {
    id: 'catch_50',
    titleTh: 'จอมล่าร้อยหนู',
    titleEn: 'Mouse Terminator',
    descTh: 'จับหนูรวมทั้งหมด 50 ตัว',
    descEn: 'Catch 50 mice in total',
    icon: '🏆',
    progress: 0,
    maxProgress: 50,
    completed: false,
    rewardCheese: 30,
  },
  {
    id: 'catnip_frenzy',
    titleTh: 'แมวเมาแคทนิป',
    titleEn: 'Catnip Overdose',
    descTh: 'เก็บแคทนิปใช้งานครบ 5 ครั้ง',
    descEn: 'Activate Catnip Frenzy 5 times',
    icon: '🌿',
    progress: 0,
    maxProgress: 5,
    completed: false,
    rewardCheese: 25,
  },
  {
    id: 'cheese_collector',
    titleTh: 'นักสะสมก้อนเนยแข็ง',
    titleEn: 'Cheese Tycoon',
    descTh: 'สะสมเนยแข็งรวมครบ 100 ก้อน',
    descEn: 'Collect 100 pieces of cheese',
    icon: '🧀',
    progress: 0,
    maxProgress: 100,
    completed: false,
    rewardCheese: 50,
  },
  {
    id: 'score_2000',
    titleTh: 'แมวเทวดา 2,000 คะแนน',
    titleEn: 'High Scorer',
    descTh: 'ทำคะแนนในโหมดใดก็ได้ถึง 2,000 คะแนน',
    descEn: 'Reach 2,000 score in any mode',
    icon: '⭐',
    progress: 0,
    maxProgress: 2000,
    completed: false,
    rewardCheese: 60,
  },
];

const STORAGE_KEY_STATS = 'cat_game_stats_v1';
const STORAGE_KEY_SKINS = 'cat_game_skins_v1';
const STORAGE_KEY_ACHIEVEMENTS = 'cat_game_achievements_v1';
const STORAGE_KEY_SELECTED_SKIN = 'cat_game_selected_skin_v1';

export function loadGameStats(): GameStats {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_STATS);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // fallback
  }
  return {
    totalMiceCaught: 0,
    totalCheeseCollected: 0,
    highScoreArcade: 0,
    highScoreMaze: 0,
    highScoreMouseEscape: 0,
    highScoreTimeAttack: 0,
    catnipUsed: 0,
    gamesPlayed: 0,
  };
}

export function saveGameStats(stats: GameStats) {
  try {
    localStorage.setItem(STORAGE_KEY_STATS, JSON.stringify(stats));
  } catch {
    // ignore
  }
}

export function loadUnlockedSkins(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SKINS);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // ignore
  }
  return ['orange'];
}

export function saveUnlockedSkins(skinIds: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY_SKINS, JSON.stringify(skinIds));
  } catch {
    // ignore
  }
}

export function loadSelectedSkin(): string {
  try {
    const id = localStorage.getItem(STORAGE_KEY_SELECTED_SKIN);
    if (id) return id;
  } catch {
    // ignore
  }
  return 'orange';
}

export function saveSelectedSkin(skinId: string) {
  try {
    localStorage.setItem(STORAGE_KEY_SELECTED_SKIN, skinId);
  } catch {
    // ignore
  }
}

export function loadAchievements(): Achievement[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ACHIEVEMENTS);
    if (raw) {
      const parsed: Achievement[] = JSON.parse(raw);
      // Merge with initial list in case new achievements were added
      return INITIAL_ACHIEVEMENTS.map(initial => {
        const found = parsed.find(p => p.id === initial.id);
        return found ? { ...initial, ...found } : initial;
      });
    }
  } catch {
    // ignore
  }
  return INITIAL_ACHIEVEMENTS;
}

export function saveAchievements(achievements: Achievement[]) {
  try {
    localStorage.setItem(STORAGE_KEY_ACHIEVEMENTS, JSON.stringify(achievements));
  } catch {
    // ignore
  }
}
