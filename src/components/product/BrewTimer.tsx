'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { BrewGuideTemplate, BrewGuideStep } from '@/types/brew';
import { Button } from '@/components/ui/Button';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  CheckCircle2,
  Sparkles,
  ChevronRight,
  Flame,
} from 'lucide-react';

interface BrewTimerProps {
  template: BrewGuideTemplate;
  totalWaterGrams: number;
  coffeeDoseGrams: number;
  className?: string;
}

export const BrewTimer: React.FC<BrewTimerProps> = ({
  template,
  totalWaterGrams,
  coffeeDoseGrams,
  className = '',
}) => {
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(0);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const totalTimeSeconds = template.totalTimeSeconds || 180;
  const steps = template.steps;

  // Synthesize soft chime using Web Audio API
  const playChime = useCallback((freq = 587.33, type: OscillatorType = 'sine', duration = 0.6) => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioCtx();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, ctx.currentTime + 0.1);

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // Audio context might be restricted before user interaction
    }
  }, [soundEnabled]);

  // Determine current step index based on elapsed seconds
  useEffect(() => {
    let foundIdx = 0;
    for (let i = 0; i < steps.length; i++) {
      if (elapsedSeconds >= steps[i].timeStartSeconds) {
        foundIdx = i;
      }
    }
    if (foundIdx !== currentStepIdx) {
      setCurrentStepIdx(foundIdx);
      playChime(659.25, 'triangle', 0.4); // E5 chime on step transition
    }
  }, [elapsedSeconds, steps, currentStepIdx, playChime]);

  // Main timer tick loop
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => {
          if (prev + 1 >= totalTimeSeconds) {
            setIsRunning(false);
            setIsCompleted(true);
            playChime(880, 'sine', 1.0);
            return totalTimeSeconds;
          }
          return prev + 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, totalTimeSeconds, playChime]);

  const handleStartPause = () => {
    if (isCompleted) {
      setElapsedSeconds(0);
      setIsCompleted(false);
      setIsRunning(true);
    } else {
      setIsRunning(!isRunning);
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    setElapsedSeconds(0);
    setCurrentStepIdx(0);
    setIsCompleted(false);
  };

  const handleJumpToStep = (index: number) => {
    setCurrentStepIdx(index);
    setElapsedSeconds(steps[index].timeStartSeconds);
    setIsCompleted(false);
  };

  const formatMinSec = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remainder = sec % 60;
    return `${mins}:${remainder < 10 ? '0' : ''}${remainder}`;
  };

  const progressPercent = Math.min(100, Math.round((elapsedSeconds / totalTimeSeconds) * 100));
  const activeStep = steps[currentStepIdx] || steps[0];

  // SVG circular progress calculation
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  return (
    <div
      className={`rounded-2xl bg-surface border border-subtle p-6 sm:p-8 shadow-card space-y-6 ${className}`}
      data-testid="brew-timer"
    >
      {/* Header & Sound Toggle */}
      <div className="flex items-center justify-between border-b border-subtle pb-4">
        <div>
          <h3 className="text-lg font-serif font-bold text-primary flex items-center gap-2">
            <Flame className="w-5 h-5 text-terracotta-500" />
            Interactive Extraction Timer
          </h3>
          <p className="text-xs text-muted">
            {template.name} • {coffeeDoseGrams}g Coffee / {totalWaterGrams}g Water
          </p>
        </div>

        <button
          type="button"
          onClick={() => setSoundEnabled(!soundEnabled)}
          aria-label={soundEnabled ? 'Mute audio timer' : 'Enable audio timer'}
          className="p-2 rounded-lg text-secondary hover:bg-surface-elevated hover:text-primary transition-colors"
        >
          {soundEnabled ? (
            <Volume2 className="w-5 h-5 text-terracotta-500" />
          ) : (
            <VolumeX className="w-5 h-5 text-muted" />
          )}
        </button>
      </div>

      {/* Center Countdown & Progress Ring */}
      <div className="flex flex-col items-center justify-center py-4">
        <div className="relative flex items-center justify-center">
          <svg className="w-48 h-48 sm:w-56 sm:h-56 transform -rotate-90" viewBox="0 0 160 160">
            {/* Background circle */}
            <circle
              cx="80"
              cy="80"
              r={radius}
              className="text-surface-muted stroke-current"
              strokeWidth="8"
              fill="transparent"
            />
            {/* Active progress ring */}
            <circle
              cx="80"
              cy="80"
              r={radius}
              className="text-terracotta-500 stroke-current transition-all duration-500 ease-linear"
              strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>

          {/* Center Digital Display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span
              className="text-4xl sm:text-5xl font-mono font-bold text-primary tracking-tight"
              aria-live="assertive"
            >
              {formatMinSec(elapsedSeconds)}
            </span>
            <span className="text-xs font-medium text-muted mt-1">
              of {formatMinSec(totalTimeSeconds)}
            </span>
            <span className="text-[11px] font-bold text-terracotta-600 dark:text-terracotta-400 mt-1">
              Step {currentStepIdx + 1} of {steps.length}
            </span>
          </div>
        </div>

        {/* Completion Message */}
        {isCompleted && (
          <div className="mt-4 flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 text-xs font-bold animate-bounce">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            Extraction Complete! Oxygenate & Enjoy Your Brew.
          </div>
        )}
      </div>

      {/* Active Phase Card */}
      <div className="p-4 sm:p-5 rounded-xl bg-surface-muted border border-subtle space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-terracotta-600 dark:text-terracotta-400 uppercase tracking-wider">
            Current Phase: {activeStep.title}
          </span>
          <span className="font-mono text-muted">
            {formatMinSec(activeStep.timeStartSeconds)} – {formatMinSec(activeStep.timeEndSeconds)}
          </span>
        </div>

        <p className="text-sm font-semibold text-primary">{activeStep.actionDescription}</p>

        {activeStep.techniqueTip && (
          <p className="text-xs text-secondary italic flex items-center gap-1.5 pt-1">
            <span className="font-bold not-italic text-terracotta-500">Pro Tip:</span>
            {activeStep.techniqueTip}
          </p>
        )}
      </div>

      {/* Step Roadmap */}
      <div className="space-y-1.5">
        <span className="text-xs font-bold text-muted uppercase tracking-wider">Brewing Phases</span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {steps.map((step, idx) => {
            const isActive = currentStepIdx === idx;
            const isPassed = elapsedSeconds >= step.timeEndSeconds;

            return (
              <button
                key={step.stepNumber}
                type="button"
                onClick={() => handleJumpToStep(idx)}
                className={`p-2.5 rounded-lg border text-left text-xs transition-all flex flex-col justify-between ${
                  isActive
                    ? 'border-terracotta-500 bg-terracotta-50/50 dark:bg-terracotta-950/30 text-terracotta-900 dark:text-terracotta-200 ring-1 ring-terracotta-500'
                    : isPassed
                    ? 'border-emerald-200 bg-emerald-50/30 dark:bg-emerald-950/10 text-primary opacity-80'
                    : 'border-subtle bg-surface text-secondary hover:border-medium'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-bold truncate">{step.title}</span>
                  {isPassed ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-muted shrink-0" />
                  )}
                </div>
                <span className="font-mono text-[10px] text-muted mt-1">
                  {formatMinSec(step.timeStartSeconds)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Timer Controls */}
      <div className="flex items-center justify-center gap-3 pt-2">
        <Button
          type="button"
          variant={isRunning ? 'secondary' : 'primary'}
          size="lg"
          onClick={handleStartPause}
          leftIcon={
            isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />
          }
          className="min-w-[160px] justify-center shadow-card"
        >
          {isCompleted ? 'Brew Again' : isRunning ? 'Pause Timer' : elapsedSeconds > 0 ? 'Resume' : 'Start Brew'}
        </Button>

        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={handleReset}
          disabled={elapsedSeconds === 0}
          leftIcon={<RotateCcw className="w-4 h-4" />}
          className="justify-center"
        >
          Reset
        </Button>
      </div>
    </div>
  );
};
