import React, { useState, useEffect, useCallback } from 'react';
import { GameMode, Language, GameStats, Achievement, ControlMethod } from './types';
import {
  loadGameStats,
  saveGameStats,
  loadUnlockedSkins,
  saveUnlockedSkins,
  loadSelectedSkin,
  saveSelectedSkin,
  loadAchievements,
  saveAchievements,
  CAT_SKINS,
} from './utils/storage';
import { soundEngine } from './utils/sound';
import { Navbar } from './components/Navbar';
import { ArcadeCanvas } from './components/ArcadeCanvas';
import { CatSelector } from './components/CatSelector';
import { AchievementsModal } from './components/AchievementsModal';
import { LeaderboardModal } from './components/LeaderboardModal';
import { HelpModal } from './components/HelpModal';
import { GameOverModal } from './components/GameOverModal';

export default function App() {
  // Game Setup & Persistent State
  const [mode, setMode] = useState<GameMode>('arcade');
  const [language, setLanguage] = useState<Language>('th');
  const [controlMethod, setControlMethod] = useState<ControlMethod>('mouse_touch');
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Storage synced states
  const [stats, setStats] = useState<GameStats>(loadGameStats());
  const [unlockedSkinIds, setUnlockedSkinIds] = useState<string[]>(loadUnlockedSkins());
  const [selectedSkinId, setSelectedSkinId] = useState<string>(loadSelectedSkin());
  const [achievements, setAchievements] = useState<Achievement[]>(loadAchievements());

  // Modal Visibility
  const [isSkinsOpen, setIsSkinsOpen] = useState<boolean>(false);
  const [isAchievementsOpen, setIsAchievementsOpen] = useState<boolean>(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState<boolean>(false);
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);

  // Game Over Modal State
  const [gameOverData, setGameOverData] = useState<{
    isOpen: boolean;
    score: number;
    miceCaught: number;
    cheeseCollected: number;
    isNewHighScore: boolean;
  }>({
    isOpen: false,
    score: 0,
    miceCaught: 0,
    cheeseCollected: 0,
    isNewHighScore: false,
  });

  // Key trigger to force restart ArcadeCanvas
  const [canvasKey, setCanvasKey] = useState<number>(0);

  // Toggle Mute
  const handleToggleMute = useCallback(() => {
    setIsMuted(prev => {
      const next = !prev;
      soundEngine.isMuted = next;
      return next;
    });
  }, []);

  // Language Toggle
  const handleToggleLanguage = useCallback(() => {
    setLanguage(prev => (prev === 'th' ? 'en' : 'th'));
  }, []);

  // Unlock Skin Handler
  const handleUnlockSkin = useCallback((skinId: string, cost: number): boolean => {
    if (stats.totalCheeseCollected < cost) return false;

    // Deduct cheese & save
    const updatedStats = {
      ...stats,
      totalCheeseCollected: stats.totalCheeseCollected - cost,
    };
    setStats(updatedStats);
    saveGameStats(updatedStats);

    const updatedUnlocked = [...unlockedSkinIds, skinId];
    setUnlockedSkinIds(updatedUnlocked);
    saveUnlockedSkins(updatedUnlocked);

    setSelectedSkinId(skinId);
    saveSelectedSkin(skinId);

    return true;
  }, [stats, unlockedSkinIds]);

  // Select Skin Handler
  const handleSelectSkin = useCallback((skinId: string) => {
    setSelectedSkinId(skinId);
    saveSelectedSkin(skinId);
  }, []);

  // Claim Achievement Reward
  const handleClaimReward = useCallback((achievementId: string, rewardCheese: number) => {
    const updatedStats = {
      ...stats,
      totalCheeseCollected: stats.totalCheeseCollected + rewardCheese,
    };
    setStats(updatedStats);
    saveGameStats(updatedStats);

    const updatedAch = achievements.map(a =>
      a.id === achievementId ? { ...a, completed: true } : a
    );
    setAchievements(updatedAch);
    saveAchievements(updatedAch);
  }, [stats, achievements]);

  // Update achievements progress
  const updateAchievementsProgress = useCallback((miceCaught: number, cheeseGained: number, currentScore: number) => {
    setAchievements(prevAchievements => {
      const updated = prevAchievements.map(ach => {
        let newProgress = ach.progress;
        if (ach.id === 'first_catch') newProgress += miceCaught;
        else if (ach.id === 'catch_50') newProgress += miceCaught;
        else if (ach.id === 'cheese_collector') newProgress += cheeseGained;
        else if (ach.id === 'score_2000') newProgress = Math.max(newProgress, currentScore);

        return {
          ...ach,
          progress: Math.min(ach.maxProgress, newProgress),
        };
      });
      saveAchievements(updated);
      return updated;
    });
  }, []);

  // Game Over Callback
  const handleGameOver = useCallback(
    (finalScore: number, miceCaught: number, cheeseCollected: number, isWin: boolean = true) => {
      // Calculate high score per mode
      let isNewHigh = false;
      const updatedStats = { ...stats };

      if (mode === 'arcade') {
        if (finalScore > updatedStats.highScoreArcade) {
          updatedStats.highScoreArcade = finalScore;
          isNewHigh = true;
        }
      } else if (mode === 'maze') {
        if (finalScore > updatedStats.highScoreMaze) {
          updatedStats.highScoreMaze = finalScore;
          isNewHigh = true;
        }
      } else if (mode === 'mouse_escape') {
        if (finalScore > updatedStats.highScoreMouseEscape) {
          updatedStats.highScoreMouseEscape = finalScore;
          isNewHigh = true;
        }
      } else if (mode === 'time_attack') {
        if (finalScore > updatedStats.highScoreTimeAttack) {
          updatedStats.highScoreTimeAttack = finalScore;
          isNewHigh = true;
        }
      }

      updatedStats.totalMiceCaught += miceCaught;
      updatedStats.totalCheeseCollected += cheeseCollected;
      updatedStats.gamesPlayed += 1;

      setStats(updatedStats);
      saveGameStats(updatedStats);

      updateAchievementsProgress(miceCaught, cheeseCollected, finalScore);

      setGameOverData({
        isOpen: true,
        score: finalScore,
        miceCaught,
        cheeseCollected,
        isNewHighScore: isNewHigh,
      });
    },
    [mode, stats, updateAchievementsProgress]
  );

  // Restart Canvas
  const handleRestartGame = useCallback(() => {
    setGameOverData(prev => ({ ...prev, isOpen: false }));
    setCanvasKey(prev => prev + 1);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-950 via-amber-900 to-yellow-950 text-amber-50 font-sans selection:bg-amber-500 selection:text-amber-950 flex flex-col justify-between">
      <div>
        {/* Navigation Bar */}
        <Navbar
          currentMode={mode}
          onSelectMode={m => {
            setMode(m);
            setCanvasKey(prev => prev + 1);
          }}
          selectedSkinId={selectedSkinId}
          onOpenSkinsModal={() => setIsSkinsOpen(true)}
          onOpenAchievementsModal={() => setIsAchievementsOpen(true)}
          onOpenLeaderboardModal={() => setIsLeaderboardOpen(true)}
          onOpenHelpModal={() => setIsHelpOpen(true)}
          cheeseCount={stats.totalCheeseCollected}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          language={language}
          onToggleLanguage={handleToggleLanguage}
        />

        {/* Main Game Stage */}
        <main className="py-4 px-2">
          <ArcadeCanvas
            key={`${mode}-${canvasKey}`}
            mode={mode}
            selectedSkinId={selectedSkinId}
            language={language}
            onGameOver={handleGameOver}
            controlMethod={controlMethod}
            onChangeControlMethod={setControlMethod}
          />
        </main>
      </div>

      {/* Footer */}
      <footer className="py-3 px-4 text-center text-xs text-amber-400/80 border-t border-amber-900/60 bg-amber-950/80">
        <p className="font-medium">
          {language === 'th'
            ? '🐾 เกมแมวกินหนู (Cat & Mouse Chase) - สนุกสดใส เล่นง่าย ได้ทุกอุปกรณ์!'
            : '🐾 Cat & Mouse Chase Arcade Game - Playable on all devices!'}
        </p>
      </footer>

      {/* Modals */}
      <CatSelector
        isOpen={isSkinsOpen}
        onClose={() => setIsSkinsOpen(false)}
        selectedSkinId={selectedSkinId}
        onSelectSkin={handleSelectSkin}
        unlockedSkinIds={unlockedSkinIds}
        onUnlockSkin={handleUnlockSkin}
        cheeseCount={stats.totalCheeseCollected}
        language={language}
      />

      <AchievementsModal
        isOpen={isAchievementsOpen}
        onClose={() => setIsAchievementsOpen(false)}
        achievements={achievements}
        onClaimReward={handleClaimReward}
        language={language}
      />

      <LeaderboardModal
        isOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
        stats={stats}
        language={language}
      />

      <HelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
        language={language}
      />

      <GameOverModal
        isOpen={gameOverData.isOpen}
        score={gameOverData.score}
        miceCaught={gameOverData.miceCaught}
        cheeseCollected={gameOverData.cheeseCollected}
        isNewHighScore={gameOverData.isNewHighScore}
        mode={mode}
        language={language}
        onRestart={handleRestartGame}
        onClose={() => setGameOverData(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
