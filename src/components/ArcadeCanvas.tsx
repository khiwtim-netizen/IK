import React, { useRef, useEffect, useState, useCallback } from 'react';
import { GameMode, Language, MouseEntity, Particle, PowerUpEntity, CatSkin, ControlMethod } from '../types';
import { CAT_SKINS } from '../utils/storage';
import { soundEngine } from '../utils/sound';
import { Play, Pause, RotateCcw, Zap, Sparkles, Shield, Heart, Trophy, Flame, Clock } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ArcadeCanvasProps {
  mode: GameMode;
  selectedSkinId: string;
  language: Language;
  onGameOver: (finalScore: number, miceCaught: number, cheeseCollected: number, isWin?: boolean) => void;
  onScoreUpdate?: (score: number, combo: number) => void;
  controlMethod: ControlMethod;
  onChangeControlMethod: (method: ControlMethod) => void;
}

interface DogEntity {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  angle: number;
  patrolTarget: { x: number; y: number };
}

interface MazeWall {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const ArcadeCanvas: React.FC<ArcadeCanvasProps> = ({
  mode,
  selectedSkinId,
  language,
  onGameOver,
  onScoreUpdate,
  controlMethod,
  onChangeControlMethod,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Selected Cat Skin
  const currentSkin = CAT_SKINS.find(s => s.id === selectedSkinId) || CAT_SKINS[0];

  // Game Loop & State Refs
  const requestRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

  // Core Game State Variables
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [combo, setCombo] = useState<number>(0);
  const [comboTimer, setComboTimer] = useState<number>(0);
  const [miceCaughtCount, setMiceCaughtCount] = useState<number>(0);
  const [cheeseCollectedCount, setCheeseCollectedCount] = useState<number>(0);
  const [lives, setLives] = useState<number>(3);
  const [timeLeft, setTimeLeft] = useState<number>(mode === 'time_attack' ? 60 : 90);

  // Powerup Buff active timers
  const [catnipTime, setCatnipTime] = useState<number>(0);
  const [freezeTime, setFreezeTime] = useState<number>(0);
  const [dashCooldown, setDashCooldown] = useState<number>(0);

  // Canvas Entities Ref
  const catRef = useRef({
    x: 300,
    y: 300,
    vx: 0,
    vy: 0,
    targetX: 300,
    targetY: 300,
    radius: 26,
    angle: 0,
    baseSpeed: 5.5 * currentSkin.speedMultiplier,
    isDashing: false,
    dashTimer: 0,
  });

  const miceRef = useRef<MouseEntity[]>([]);
  const powerUpsRef = useRef<PowerUpEntity[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const dogsRef = useRef<DogEntity[]>([]);
  const mazeWallsRef = useRef<MazeWall[]>([]);

  // Key state for Keyboard control
  const keysPressed = useRef<{ [key: string]: boolean }>({});

  // Touch joystick ref
  const touchJoystick = useRef<{ active: boolean; startX: number; startY: number; currentX: number; currentY: number }>({
    active: false,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
  });

  // Maze Generator Helper
  const generateMazeWalls = useCallback((width: number, height: number) => {
    const walls: MazeWall[] = [];
    const wallThick = 20;

    // Boundary walls
    walls.push({ x: 0, y: 0, width, height: wallThick });
    walls.push({ x: 0, y: height - wallThick, width, height: wallThick });
    walls.push({ x: 0, y: 0, width: wallThick, height });
    walls.push({ x: width - wallThick, y: 0, width: wallThick, height });

    // Inner kitchen furniture/countertop maze blocks
    const cols = 4;
    const rows = 3;
    const cellW = width / cols;
    const cellH = height / rows;

    for (let c = 1; c < cols; c++) {
      for (let r = 1; r < rows; r++) {
        if ((c + r) % 2 === 0) {
          walls.push({
            x: c * cellW - 40,
            y: r * cellH - 10,
            width: 120,
            height: wallThick,
          });
        } else {
          walls.push({
            x: c * cellW - 10,
            y: r * cellH - 40,
            width: wallThick,
            height: 120,
          });
        }
      }
    }
    return walls;
  }, []);

  // Spawn Mouse
  const spawnMouse = useCallback((canvasWidth: number, canvasHeight: number) => {
    const margin = 50;
    const x = margin + Math.random() * (canvasWidth - margin * 2);
    const y = margin + Math.random() * (canvasHeight - margin * 2);

    const rand = Math.random();
    let type: MouseEntity['type'] = 'standard';
    let points = 100;
    let cheeseReward = 1;
    let radius = 14;
    let speed = 2.0 + Math.random() * 1.5;

    // Luck multiplier from cat skin
    const luck = currentSkin.bonusLuck || 1.0;

    if (rand < 0.15 * luck) {
      type = 'golden';
      points = 300;
      cheeseReward = 3;
      radius = 12;
      speed = 3.8;
    } else if (rand < 0.25) {
      type = 'giant';
      points = 500;
      cheeseReward = 5;
      radius = 24;
      speed = 1.2;
    } else if (rand < 0.35) {
      type = 'decoy';
      points = 50;
      cheeseReward = 0;
      radius = 15;
      speed = 2.5;
    }

    const angle = Math.random() * Math.PI * 2;
    miceRef.current.push({
      id: Math.random().toString(),
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      radius,
      type,
      points,
      cheeseReward,
      angle,
      animFrame: 0,
      hp: type === 'giant' ? 2 : 1,
      maxHp: type === 'giant' ? 2 : 1,
    });
  }, [currentSkin.bonusLuck]);

  // Spawn Power-Up
  const spawnPowerUp = useCallback((canvasWidth: number, canvasHeight: number) => {
    const margin = 60;
    const x = margin + Math.random() * (canvasWidth - margin * 2);
    const y = margin + Math.random() * (canvasHeight - margin * 2);

    const types: PowerUpEntity['type'][] = ['catnip', 'golden_cheese', 'clock_freeze', 'fish_snack'];
    const pType = types[Math.floor(Math.random() * types.length)];

    powerUpsRef.current.push({
      id: Math.random().toString(),
      x,
      y,
      type: pType,
      radius: 18,
      duration: 10, // seconds on map
      pulseAngle: 0,
    });
  }, []);

  // Spawn Dog Guard for Maze mode
  const spawnDog = useCallback((canvasWidth: number, canvasHeight: number) => {
    dogsRef.current.push({
      x: canvasWidth - 100,
      y: 100,
      vx: -2,
      vy: 1.5,
      radius: 28,
      angle: 0,
      patrolTarget: { x: 100, y: canvasHeight - 100 },
    });
  }, []);

  // Particle Effect Generator
  const createExplosion = (x: number, y: number, color: string, text?: string, count: number = 12) => {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random() * 4;
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 3 + Math.random() * 4,
        color,
        alpha: 1.0,
        decay: 0.02 + Math.random() * 0.02,
      });
    }

    if (text) {
      particlesRef.current.push({
        x,
        y: y - 10,
        vx: 0,
        vy: -1.2,
        radius: 0,
        color,
        alpha: 1.0,
        decay: 0.015,
        text,
      });
    }
  };

  // Start / Reset Game
  const startGame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setScore(0);
    setCombo(0);
    setComboTimer(0);
    setMiceCaughtCount(0);
    setCheeseCollectedCount(0);
    setLives(3);
    setTimeLeft(mode === 'time_attack' ? 60 : 90);
    setCatnipTime(0);
    setFreezeTime(0);

    // Reset Cat Position
    catRef.current.x = canvas.width / 2;
    catRef.current.y = canvas.height / 2;
    catRef.current.targetX = canvas.width / 2;
    catRef.current.targetY = canvas.height / 2;
    catRef.current.vx = 0;
    catRef.current.vy = 0;
    catRef.current.baseSpeed = 5.5 * currentSkin.speedMultiplier;

    // Reset Entities
    miceRef.current = [];
    powerUpsRef.current = [];
    particlesRef.current = [];
    dogsRef.current = [];

    // Maze setup
    if (mode === 'maze') {
      mazeWallsRef.current = generateMazeWalls(canvas.width, canvas.height);
      spawnDog(canvas.width, canvas.height);
    } else {
      mazeWallsRef.current = [];
    }

    // Initial Mice Spawns
    const initialMiceCount = mode === 'time_attack' ? 8 : 5;
    for (let i = 0; i < initialMiceCount; i++) {
      spawnMouse(canvas.width, canvas.height);
    }

    // Initial PowerUp
    spawnPowerUp(canvas.width, canvas.height);

    setIsPlaying(true);
    setIsPaused(false);
    soundEngine.playMeow();
    soundEngine.startBGM();
  }, [mode, currentSkin.speedMultiplier, generateMazeWalls, spawnDog, spawnMouse, spawnPowerUp]);

  // Handle Dash Skill Trigger
  const handleDash = useCallback(() => {
    if (dashCooldown > 0 || !isPlaying || isPaused) return;

    const cat = catRef.current;
    const dashDist = 120;
    const dx = Math.cos(cat.angle) * dashDist;
    const dy = Math.sin(cat.angle) * dashDist;

    cat.x += dx;
    cat.y += dy;
    cat.isDashing = true;
    cat.dashTimer = 10;

    setDashCooldown(180); // ~3 seconds cooldown
    soundEngine.playDash();
    createExplosion(cat.x, cat.y, currentSkin.color, '💨 DASH!', 16);
  }, [dashCooldown, isPlaying, isPaused, currentSkin.color]);

  // Main Physics & Update Loop
  const updateGame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !isPlaying || isPaused) return;

    const cat = catRef.current;

    // Decrement timers
    if (catnipTime > 0) setCatnipTime(prev => prev - 1);
    if (freezeTime > 0) setFreezeTime(prev => prev - 1);
    if (dashCooldown > 0) setDashCooldown(prev => prev - 1);
    if (comboTimer > 0) {
      setComboTimer(prev => {
        if (prev <= 1) setCombo(0);
        return prev - 1;
      });
    }

    // Cat Speed calculation
    const speedBonus = catnipTime > 0 ? 1.8 : 1.0;
    const currentSpeed = cat.baseSpeed * speedBonus;

    // Controls Handling
    if (controlMethod === 'keyboard') {
      let dx = 0;
      let dy = 0;
      if (keysPressed.current['ArrowUp'] || keysPressed.current['w'] || keysPressed.current['W']) dy -= 1;
      if (keysPressed.current['ArrowDown'] || keysPressed.current['s'] || keysPressed.current['S']) dy += 1;
      if (keysPressed.current['ArrowLeft'] || keysPressed.current['a'] || keysPressed.current['A']) dx -= 1;
      if (keysPressed.current['ArrowRight'] || keysPressed.current['d'] || keysPressed.current['D']) dx += 1;

      if (dx !== 0 || dy !== 0) {
        const len = Math.hypot(dx, dy);
        dx /= len;
        dy /= len;

        cat.x += dx * currentSpeed;
        cat.y += dy * currentSpeed;
        cat.angle = Math.atan2(dy, dx);
      }
    } else if (controlMethod === 'virtual_joystick' && touchJoystick.current.active) {
      const joy = touchJoystick.current;
      const dx = joy.currentX - joy.startX;
      const dy = joy.currentY - joy.startY;
      const dist = Math.hypot(dx, dy);

      if (dist > 5) {
        const normX = dx / dist;
        const normY = dy / dist;
        const moveSpeed = Math.min(dist / 20, 1) * currentSpeed;

        cat.x += normX * moveSpeed;
        cat.y += normY * moveSpeed;
        cat.angle = Math.atan2(dy, dx);
      }
    } else {
      // Mouse / Direct Touch Follow Damping
      const dx = cat.targetX - cat.x;
      const dy = cat.targetY - cat.y;
      const dist = Math.hypot(dx, dy);

      if (dist > 5) {
        cat.angle = Math.atan2(dy, dx);
        const move = Math.min(dist * 0.12, currentSpeed);
        cat.x += Math.cos(cat.angle) * move;
        cat.y += Math.sin(cat.angle) * move;
      }
    }

    // Keep cat inside canvas boundaries
    cat.x = Math.max(cat.radius, Math.min(canvas.width - cat.radius, cat.x));
    cat.y = Math.max(cat.radius, Math.min(canvas.height - cat.radius, cat.y));

    // Maze Wall Collisions for Cat
    if (mode === 'maze') {
      mazeWallsRef.current.forEach(wall => {
        if (
          cat.x + cat.radius > wall.x &&
          cat.x - cat.radius < wall.x + wall.width &&
          cat.y + cat.radius > wall.y &&
          cat.y - cat.radius < wall.y + wall.height
        ) {
          // Push back
          cat.x -= Math.cos(cat.angle) * 4;
          cat.y -= Math.sin(cat.angle) * 4;
        }
      });
    }

    // Magnet Effect (Skin Passive)
    const magnetRange = currentSkin.magnetRadius + (catnipTime > 0 ? 100 : 0);

    // Update Mice
    const isFrozen = freezeTime > 0;
    miceRef.current.forEach(mouse => {
      if (!isFrozen) {
        // AI Flee from Cat or Wandering
        const dx = cat.x - mouse.x;
        const dy = cat.y - mouse.y;
        const distToCat = Math.hypot(dx, dy);

        // Flee if cat is close
        if (distToCat < 180 && mode !== 'mouse_escape') {
          mouse.vx = -(dx / distToCat) * 3.2;
          mouse.vy = -(dy / distToCat) * 3.2;
          mouse.angle = Math.atan2(mouse.vy, mouse.vx);
        } else {
          // Bounce off walls
          if (mouse.x - mouse.radius < 0 || mouse.x + mouse.radius > canvas.width) {
            mouse.vx *= -1;
            mouse.angle = Math.atan2(mouse.vy, mouse.vx);
          }
          if (mouse.y - mouse.radius < 0 || mouse.y + mouse.radius > canvas.height) {
            mouse.vy *= -1;
            mouse.angle = Math.atan2(mouse.vy, mouse.vx);
          }
        }

        // Magnet pulls mouse toward cat if within radius
        if (magnetRange > 0 && distToCat < magnetRange && mode !== 'mouse_escape') {
          mouse.x += (dx / distToCat) * 3.5;
          mouse.y += (dy / distToCat) * 3.5;
        } else {
          mouse.x += mouse.vx;
          mouse.y += mouse.vy;
        }

        mouse.animFrame += 0.2;
      }

      // Check Collision with Cat
      const dxCat = cat.x - mouse.x;
      const dyCat = cat.y - mouse.y;
      const distCat = Math.hypot(dxCat, dyCat);

      if (distCat < cat.radius + mouse.radius) {
        // Handle Mouse Caught
        if (mouse.type === 'decoy') {
          // Stun Cat or Loss
          soundEngine.playSqueak();
          createExplosion(mouse.x, mouse.y, '#f43f5e', '💥 STUNNED!', 15);
          setScore(prev => Math.max(0, prev - 50));
          mouse.hp = 0; // Destroy decoy
        } else {
          mouse.hp = (mouse.hp || 1) - 1;
          if (mouse.hp! <= 0) {
            // Mouse Caught!
            soundEngine.playEat();
            soundEngine.playSqueak();

            const comboMultiplier = 1 + Math.floor(combo / 3) * 0.5;
            const pointsGained = Math.round(mouse.points * comboMultiplier * (catnipTime > 0 ? 2 : 1));

            setScore(prev => {
              const newScore = prev + pointsGained;
              if (onScoreUpdate) onScoreUpdate(newScore, combo + 1);
              return newScore;
            });
            setCombo(prev => prev + 1);
            setComboTimer(120); // 2 seconds to chain combo
            setMiceCaughtCount(prev => prev + 1);
            setCheeseCollectedCount(prev => prev + mouse.cheeseReward);

            const textPop = `+${pointsGained}${combo > 1 ? ` (${combo}x)` : ''}`;
            createExplosion(mouse.x, mouse.y, mouse.type === 'golden' ? '#f59e0b' : '#3b82f6', textPop, 18);
          }
        }
      }
    });

    // Remove caught mice & spawn replacements
    miceRef.current = miceRef.current.filter(m => (m.hp || 0) > 0);
    while (miceRef.current.length < (mode === 'time_attack' ? 8 : 5)) {
      spawnMouse(canvas.width, canvas.height);
    }

    // Update PowerUps
    powerUpsRef.current.forEach(pu => {
      pu.pulseAngle += 0.05;

      const dx = cat.x - pu.x;
      const dy = cat.y - pu.y;
      const dist = Math.hypot(dx, dy);

      if (dist < cat.radius + pu.radius) {
        soundEngine.playPowerUp();
        if (pu.type === 'catnip') {
          setCatnipTime(300); // 5 seconds frenzied speed
          createExplosion(pu.x, pu.y, '#10b981', '🌿 CATNIP FRENZY!', 20);
        } else if (pu.type === 'golden_cheese') {
          setCheeseCollectedCount(prev => prev + 5);
          setScore(prev => prev + 300);
          createExplosion(pu.x, pu.y, '#f59e0b', '🧀 +5 CHEESE!', 20);
        } else if (pu.type === 'clock_freeze') {
          soundEngine.playClockFreeze();
          setFreezeTime(240); // 4 seconds freeze
          createExplosion(pu.x, pu.y, '#06b6d4', '⏱️ TIME FREEZE!', 20);
        } else if (pu.type === 'fish_snack') {
          setLives(prev => Math.min(5, prev + 1));
          createExplosion(pu.x, pu.y, '#ec4899', '🐟 EXTRA LIFE!', 20);
        }
        pu.duration = 0; // Mark collected
      }
    });

    powerUpsRef.current = powerUpsRef.current.filter(pu => pu.duration > 0);

    // Periodically spawn powerups
    if (Math.random() < 0.003 && powerUpsRef.current.length < 3) {
      spawnPowerUp(canvas.width, canvas.height);
    }

    // Update Dogs in Maze Mode
    if (mode === 'maze') {
      dogsRef.current.forEach(dog => {
        const dx = dog.patrolTarget.x - dog.x;
        const dy = dog.patrolTarget.y - dog.y;
        const dist = Math.hypot(dx, dy);

        if (dist < 20) {
          dog.patrolTarget = {
            x: 50 + Math.random() * (canvas.width - 100),
            y: 50 + Math.random() * (canvas.height - 100),
          };
        }

        dog.x += (dx / dist) * 1.8;
        dog.y += (dy / dist) * 1.8;
        dog.angle = Math.atan2(dy, dx);

        // Dog collision with Cat
        const dxCat = cat.x - dog.x;
        const dyCat = cat.y - dog.y;
        if (Math.hypot(dxCat, dyCat) < cat.radius + dog.radius) {
          // Bitten by Dog!
          soundEngine.playSqueak();
          setLives(prev => {
            const nextLives = prev - 1;
            if (nextLives <= 0) {
              soundEngine.stopBGM();
              soundEngine.playGameOver();
              setIsPlaying(false);
              onGameOver(score, miceCaughtCount, cheeseCollectedCount, false);
            }
            return nextLives;
          });
          // Push Cat back
          cat.x = canvas.width / 2;
          cat.y = canvas.height / 2;
          createExplosion(dog.x, dog.y, '#ef4444', '🐶 BARK! -1 LIFE', 20);
        }
      });
    }

    // Update Particles
    particlesRef.current.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= p.decay;
    });
    particlesRef.current = particlesRef.current.filter(p => p.alpha > 0);

  }, [isPlaying, isPaused, mode, catnipTime, freezeTime, dashCooldown, combo, comboTimer, controlMethod, currentSkin, spawnMouse, spawnPowerUp, onScoreUpdate, miceCaughtCount, cheeseCollectedCount, score, onGameOver]);

  // Main Render Loop
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear Canvas with Cozy Kitchen Tile Pattern
    ctx.fillStyle = '#fef3c7'; // warm amber 100
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw Floor Tiles Grid
    ctx.strokeStyle = '#fde68a'; // amber 200
    ctx.lineWidth = 2;
    const tileSize = 60;
    for (let x = 0; x < canvas.width; x += tileSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += tileSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Draw Maze Walls
    if (mode === 'maze') {
      ctx.fillStyle = '#78350f'; // mahogany wood counter
      ctx.strokeStyle = '#451a03';
      ctx.lineWidth = 3;
      mazeWallsRef.current.forEach(wall => {
        ctx.fillRect(wall.x, wall.y, wall.width, wall.height);
        ctx.strokeRect(wall.x, wall.y, wall.width, wall.height);
      });
    }

    // Draw PowerUps
    powerUpsRef.current.forEach(pu => {
      ctx.save();
      ctx.translate(pu.x, pu.y);

      // Glowing aura
      const glowScale = 1 + Math.sin(pu.pulseAngle) * 0.15;
      ctx.beginPath();
      ctx.arc(0, 0, pu.radius * glowScale * 1.3, 0, Math.PI * 2);
      ctx.fillStyle =
        pu.type === 'catnip'
          ? 'rgba(16, 185, 129, 0.3)'
          : pu.type === 'golden_cheese'
          ? 'rgba(245, 158, 11, 0.3)'
          : pu.type === 'clock_freeze'
          ? 'rgba(6, 182, 212, 0.3)'
          : 'rgba(236, 72, 153, 0.3)';
      ctx.fill();

      // Icon
      ctx.font = '22px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const iconMap = {
        catnip: '🌿',
        golden_cheese: '🧀',
        clock_freeze: '⏱️',
        fish_snack: '🐟',
      };
      ctx.fillText(iconMap[pu.type], 0, 0);

      ctx.restore();
    });

    // Draw Mice
    miceRef.current.forEach(mouse => {
      ctx.save();
      ctx.translate(mouse.x, mouse.y);
      ctx.rotate(mouse.angle);

      // Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
      ctx.beginPath();
      ctx.ellipse(0, 6, mouse.radius, mouse.radius * 0.6, 0, 0, Math.PI * 2);
      ctx.fill();

      // Body
      ctx.fillStyle =
        mouse.type === 'golden'
          ? '#f59e0b'
          : mouse.type === 'giant'
          ? '#6b7280'
          : mouse.type === 'decoy'
          ? '#94a3b8'
          : '#a1a1aa';
      ctx.beginPath();
      ctx.ellipse(0, 0, mouse.radius * 1.2, mouse.radius * 0.9, 0, 0, Math.PI * 2);
      ctx.fill();

      // Ears
      ctx.fillStyle = '#f472b6';
      ctx.beginPath();
      ctx.arc(-mouse.radius * 0.5, -mouse.radius * 0.7, mouse.radius * 0.4, 0, Math.PI * 2);
      ctx.arc(-mouse.radius * 0.5, mouse.radius * 0.7, mouse.radius * 0.4, 0, Math.PI * 2);
      ctx.fill();

      // Eyes
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.arc(mouse.radius * 0.6, -mouse.radius * 0.3, 2, 0, Math.PI * 2);
      ctx.arc(mouse.radius * 0.6, mouse.radius * 0.3, 2, 0, Math.PI * 2);
      ctx.fill();

      // Tail
      ctx.strokeStyle = '#f472b6';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-mouse.radius * 1.2, 0);
      ctx.quadraticCurveTo(-mouse.radius * 1.8, Math.sin(mouse.animFrame) * 8, -mouse.radius * 2.2, 0);
      ctx.stroke();

      // HP bar for giant mouse
      if (mouse.type === 'giant' && mouse.hp! < mouse.maxHp!) {
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(-15, -mouse.radius - 8, 30, 4);
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(-15, -mouse.radius - 8, 30 * (mouse.hp! / mouse.maxHp!), 4);
      }

      ctx.restore();
    });

    // Draw Dog Guards (Maze Mode)
    if (mode === 'maze') {
      dogsRef.current.forEach(dog => {
        ctx.save();
        ctx.translate(dog.x, dog.y);
        ctx.rotate(dog.angle);

        // Dog Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.beginPath();
        ctx.ellipse(0, 8, dog.radius, dog.radius * 0.7, 0, 0, Math.PI * 2);
        ctx.fill();

        // Dog Body
        ctx.fillStyle = '#78350f'; // brown bulldog
        ctx.beginPath();
        ctx.arc(0, 0, dog.radius, 0, Math.PI * 2);
        ctx.fill();

        // Dog Ears
        ctx.fillStyle = '#451a03';
        ctx.beginPath();
        ctx.arc(-dog.radius * 0.6, -dog.radius * 0.6, 10, 0, Math.PI * 2);
        ctx.arc(-dog.radius * 0.6, dog.radius * 0.6, 10, 0, Math.PI * 2);
        ctx.fill();

        // Dog Snout
        ctx.fillStyle = '#fef3c7';
        ctx.beginPath();
        ctx.arc(dog.radius * 0.4, 0, 12, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(dog.radius * 0.7, 0, 4, 0, Math.PI * 2); // nose
        ctx.fill();

        ctx.restore();
      });
    }

    // Draw Cat Player
    const cat = catRef.current;
    ctx.save();
    ctx.translate(cat.x, cat.y);
    ctx.rotate(cat.angle);

    // Catnip Frenzy Aura
    if (catnipTime > 0) {
      ctx.beginPath();
      ctx.arc(0, 0, cat.radius * 1.6, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(16, 185, 129, 0.35)';
      ctx.fill();

      // Rainbow ring
      ctx.strokeStyle = `hsl(${(Date.now() / 5) % 360}, 100%, 50%)`;
      ctx.lineWidth = 4;
      ctx.stroke();
    }

    // Cat Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath();
    ctx.ellipse(0, 8, cat.radius, cat.radius * 0.7, 0, 0, Math.PI * 2);
    ctx.fill();

    // Cat Body
    ctx.fillStyle = currentSkin.color;
    ctx.beginPath();
    ctx.arc(0, 0, cat.radius, 0, Math.PI * 2);
    ctx.fill();

    // Cat Ears
    ctx.fillStyle = currentSkin.earColor;
    ctx.beginPath();
    // Left ear
    ctx.moveTo(cat.radius * 0.2, -cat.radius * 0.8);
    ctx.lineTo(cat.radius * 0.8, -cat.radius * 1.2);
    ctx.lineTo(-cat.radius * 0.3, -cat.radius * 0.6);
    ctx.fill();
    // Right ear
    ctx.beginPath();
    ctx.moveTo(cat.radius * 0.2, cat.radius * 0.8);
    ctx.lineTo(cat.radius * 0.8, cat.radius * 1.2);
    ctx.lineTo(-cat.radius * 0.3, cat.radius * 0.6);
    ctx.fill();

    // Cat Eyes
    ctx.fillStyle = currentSkin.eyeColor;
    ctx.beginPath();
    ctx.arc(cat.radius * 0.4, -cat.radius * 0.3, 4.5, 0, Math.PI * 2);
    ctx.arc(cat.radius * 0.4, cat.radius * 0.3, 4.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#000'; // Pupil
    ctx.beginPath();
    ctx.arc(cat.radius * 0.45, -cat.radius * 0.3, 2, 0, Math.PI * 2);
    ctx.arc(cat.radius * 0.45, cat.radius * 0.3, 2, 0, Math.PI * 2);
    ctx.fill();

    // Cat Nose & Mouth
    ctx.fillStyle = '#f472b6';
    ctx.beginPath();
    ctx.arc(cat.radius * 0.75, 0, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Whiskers
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cat.radius * 0.6, -2);
    ctx.lineTo(cat.radius * 1.3, -10);
    ctx.moveTo(cat.radius * 0.6, 2);
    ctx.lineTo(cat.radius * 1.3, 10);
    ctx.stroke();

    ctx.restore();

    // Draw Particles
    particlesRef.current.forEach(p => {
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.alpha);

      if (p.text) {
        ctx.font = 'bold 16px sans-serif';
        ctx.fillStyle = p.color;
        ctx.textAlign = 'center';
        ctx.fillText(p.text, p.x, p.y);
      } else {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
      }
      ctx.restore();
    });

  }, [mode, catnipTime, currentSkin]);

  // Main Loop Tick
  useEffect(() => {
    let timerInterval: number;

    if (isPlaying && !isPaused) {
      // 1-second interval timer
      timerInterval = window.setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            // Time's up!
            soundEngine.stopBGM();
            soundEngine.playGameOver();
            setIsPlaying(false);
            confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
            onGameOver(score, miceCaughtCount, cheeseCollectedCount, true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    const loop = (timestamp: number) => {
      updateGame();
      drawCanvas();
      requestRef.current = requestAnimationFrame(loop);
    };

    requestRef.current = requestAnimationFrame(loop);

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      if (timerInterval) clearInterval(timerInterval);
    };
  }, [isPlaying, isPaused, updateGame, drawCanvas, score, miceCaughtCount, cheeseCollectedCount, onGameOver]);

  // Resize canvas on window resize
  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current || !canvasRef.current) return;
      const width = containerRef.current.clientWidth;
      const height = Math.min(window.innerHeight * 0.65, 580);

      canvasRef.current.width = width;
      canvasRef.current.height = height;

      if (mode === 'maze') {
        mazeWallsRef.current = generateMazeWalls(width, height);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [mode, generateMazeWalls]);

  // Pointer & Touch Events
  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (controlMethod !== 'mouse_touch' || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    catRef.current.targetX = e.clientX - rect.left;
    catRef.current.targetY = e.clientY - rect.top;
  };

  // Keyboard Event Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current[e.key] = true;
      if (e.code === 'Space') {
        handleDash();
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current[e.key] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleDash]);

  return (
    <div className="flex flex-col items-center w-full max-w-5xl mx-auto px-2 py-3">
      {/* Game Control & Status Bar */}
      <div className="w-full bg-amber-950/80 backdrop-blur-md rounded-2xl p-3 mb-3 border border-amber-700/80 shadow-lg flex flex-wrap items-center justify-between gap-3 text-white">
        
        {/* Score & Combo */}
        <div className="flex items-center space-x-4">
          <div>
            <div className="text-xs text-amber-300 font-bold uppercase tracking-wider">
              {language === 'th' ? 'คะแนน' : 'Score'}
            </div>
            <div className="text-2xl font-black text-amber-100 font-mono tracking-tight drop-shadow">
              {score.toLocaleString()}
            </div>
          </div>

          {combo > 1 && (
            <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-amber-950 font-black px-2.5 py-1 rounded-xl text-xs sm:text-sm animate-bounce shadow-md">
              {combo}x COMBO! ⚡
            </div>
          )}
        </div>

        {/* Mice Caught & Cheese Count */}
        <div className="flex items-center space-x-3 text-xs sm:text-sm font-bold">
          <div className="flex items-center space-x-1.5 bg-amber-900/70 px-3 py-1.5 rounded-xl border border-amber-700">
            <span>🐭</span>
            <span>{miceCaughtCount}</span>
          </div>

          <div className="flex items-center space-x-1.5 bg-amber-900/70 px-3 py-1.5 rounded-xl border border-amber-700 text-amber-300">
            <span>🧀</span>
            <span>{cheeseCollectedCount}</span>
          </div>

          {mode === 'maze' && (
            <div className="flex items-center space-x-1 bg-rose-950/80 px-3 py-1.5 rounded-xl border border-rose-800 text-rose-300">
              <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
              <span>{lives}</span>
            </div>
          )}
        </div>

        {/* Timer & Skill Dash */}
        <div className="flex items-center space-x-3">
          {/* Time Left */}
          <div className="flex items-center space-x-1.5 bg-amber-900/80 px-3 py-1.5 rounded-xl border border-amber-600 font-mono font-black text-amber-200">
            <span>⏳</span>
            <span className="text-base">{timeLeft}s</span>
          </div>

          {/* Dash Skill Button */}
          <button
            onClick={handleDash}
            disabled={dashCooldown > 0 || !isPlaying}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-xl font-bold text-xs transition transform ${
              dashCooldown === 0 && isPlaying
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-md hover:scale-105 active:scale-95'
                : 'bg-gray-800 text-gray-500 cursor-not-allowed'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>{dashCooldown > 0 ? `${Math.ceil(dashCooldown / 60)}s` : 'DASH! (Space)'}</span>
          </button>

          {/* Pause / Play Controls */}
          {isPlaying ? (
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="p-2 bg-amber-800 hover:bg-amber-700 text-amber-200 rounded-xl border border-amber-600 transition"
              title={isPaused ? 'Resume' : 'Pause'}
            >
              {isPaused ? <Play className="w-5 h-5 text-emerald-400" /> : <Pause className="w-5 h-5 text-amber-300" />}
            </button>
          ) : (
            <button
              onClick={startGame}
              className="flex items-center space-x-1.5 px-4 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-amber-950 font-black rounded-xl shadow-lg transition transform hover:scale-105"
            >
              <Play className="w-4 h-4 fill-amber-950" />
              <span>{language === 'th' ? 'เริ่มเล่น!' : 'START!'}</span>
            </button>
          )}
        </div>

      </div>

      {/* Canvas Viewport Box */}
      <div
        ref={containerRef}
        className="relative w-full rounded-3xl overflow-hidden border-4 border-amber-800 shadow-2xl bg-amber-100 min-h-[380px] sm:min-h-[480px] flex items-center justify-center cursor-crosshair"
      >
        <canvas
          ref={canvasRef}
          onPointerMove={handlePointerMove}
          className="w-full h-full touch-none block"
        />

        {/* Start Overlay Screen */}
        {!isPlaying && (
          <div className="absolute inset-0 bg-amber-950/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center text-white z-20">
            <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-3xl flex items-center justify-center text-4xl shadow-2xl border-4 border-amber-200 mb-4 animate-bounce">
              🐱
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-amber-200 mb-2">
              {mode === 'arcade' && (language === 'th' ? 'ไล่จับหนูอาเขต' : 'Arcade Chase')}
              {mode === 'maze' && (language === 'th' ? 'เขาวงกตห้องครัว' : 'Kitchen Maze')}
              {mode === 'mouse_escape' && (language === 'th' ? 'หนูน้อยหลบแมว' : 'Mouse Escape')}
              {mode === 'time_attack' && (language === 'th' ? 'แข่งจับหนูจับเวลา 60s' : 'Time Trial 60s')}
            </h2>
            <p className="text-amber-300 text-sm sm:text-base max-w-md mb-6 leading-relaxed">
              {language === 'th'
                ? 'ใช้เมาส์ / สัมผัสหน้าจอ หรือกดปุ่ม WASD/ลูกศร เคลื่อนที่ไปไล่จับหนู สะสมเนยแข็งและเปิดใช้งานแคทนิป!'
                : 'Control your cat using Touch, Mouse, or WASD keys to chase mice, collect cheese & activate catnip frenzies!'}
            </p>

            {/* Control Method Selector */}
            <div className="flex items-center space-x-2 mb-6 bg-amber-900/90 p-1.5 rounded-2xl border border-amber-700">
              <button
                onClick={() => onChangeControlMethod('mouse_touch')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  controlMethod === 'mouse_touch'
                    ? 'bg-amber-400 text-amber-950 shadow'
                    : 'text-amber-200 hover:text-white'
                }`}
              >
                {language === 'th' ? '👆 ลากเมาส์ / แตะหน้าจอ' : '👆 Mouse / Touch'}
              </button>
              <button
                onClick={() => onChangeControlMethod('keyboard')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  controlMethod === 'keyboard'
                    ? 'bg-amber-400 text-amber-950 shadow'
                    : 'text-amber-200 hover:text-white'
                }`}
              >
                {language === 'th' ? '⌨️ คีย์บอร์ด (WASD)' : '⌨️ WASD / Arrows'}
              </button>
            </div>

            <button
              onClick={startGame}
              className="flex items-center space-x-2 px-8 py-3.5 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 hover:from-amber-300 hover:to-orange-400 text-amber-950 font-black text-lg sm:text-xl rounded-2xl shadow-xl transition transform hover:scale-105 active:scale-95"
            >
              <Play className="w-6 h-6 fill-amber-950" />
              <span>{language === 'th' ? 'เริ่มเล่นเกมเลย!' : 'START GAME NOW!'}</span>
            </button>
          </div>
        )}

        {/* Pause Overlay */}
        {isPaused && isPlaying && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-white z-20">
            <h3 className="text-3xl font-black text-amber-300 mb-4">
              {language === 'th' ? 'พักเกมชั่วคราว ⏸️' : 'Game Paused ⏸️'}
            </h3>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsPaused(false)}
                className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-amber-950 font-black rounded-xl shadow-lg transition"
              >
                {language === 'th' ? 'เล่นต่อ' : 'Resume'}
              </button>
              <button
                onClick={startGame}
                className="px-6 py-2.5 bg-amber-700 hover:bg-amber-600 text-white font-bold rounded-xl border border-amber-500 transition"
              >
                {language === 'th' ? 'เริ่มใหม่' : 'Restart'}
              </button>
            </div>
          </div>
        )}

        {/* Active Catnip / Freeze Indicator Banner */}
        {catnipTime > 0 && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black text-xs sm:text-sm px-4 py-1.5 rounded-full border-2 border-emerald-300 shadow-xl flex items-center space-x-1.5 animate-pulse">
            <Sparkles className="w-4 h-4 text-emerald-200" />
            <span>{language === 'th' ? '🌿 CATNIP FRENZY ความเร็วสายฟ้า!' : '🌿 CATNIP FRENZY ACTIVE!'}</span>
          </div>
        )}

        {freezeTime > 0 && (
          <div className="absolute top-12 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-black text-xs sm:text-sm px-4 py-1.5 rounded-full border-2 border-cyan-300 shadow-xl flex items-center space-x-1.5 animate-pulse">
            <Clock className="w-4 h-4 text-cyan-200" />
            <span>{language === 'th' ? '⏱️ แช่แข็งหนูชั่วคราว!' : '⏱️ MICE FROZEN!'}</span>
          </div>
        )}
      </div>

      {/* Control Guidance Footer */}
      <div className="w-full text-center mt-2.5 text-xs text-amber-800 font-semibold">
        {language === 'th'
          ? '💡 เคล็ดลับ: เก็บแคทนิป 🌿 เพื่อวิ่งไวสายฟ้า และเก็บเนยแข็ง 🧀 สะสมเอาไว้ปลดล็อกน้องแมวตัวใหม่ในร้านค้า!'
          : '💡 Tip: Collect Catnip 🌿 for speed frenzies, and gather Cheese 🧀 to unlock new Cat Skins in the shop!'}
      </div>
    </div>
  );
};
