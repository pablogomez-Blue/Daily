
import React, { useState, useEffect, useRef } from 'react';
import { TimerConfig } from '../types';

interface TimerProps {
  config: TimerConfig;
  onTimeUp?: () => void;
  resetTrigger?: any;
}

const Timer: React.FC<TimerProps> = ({ config, onTimeUp, resetTrigger }) => {
  const [seconds, setSeconds] = useState(config.initialSeconds);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    setSeconds(config.initialSeconds);
  }, [resetTrigger, config.initialSeconds]);

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          if (onTimeUp) onTimeUp();
          playBeep();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [resetTrigger]);

  const playBeep = () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5 Note
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8);
      osc.start();
      osc.stop(ctx.currentTime + 0.8);
    } catch (e) {
      console.warn("Audio feedback skipped");
    }
  };

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimerClasses = () => {
    if (seconds <= config.redThreshold) return 'text-red-600 bg-red-50 border-red-200 animate-pulse';
    if (seconds <= config.yellowThreshold) return 'text-amber-500 bg-amber-50 border-amber-200';
    return 'text-black bg-slate-50 border-slate-100';
  };

  return (
    <div className={`flex flex-col items-center justify-center py-10 px-6 rounded-[2.5rem] border-2 transition-all duration-500 ${getTimerClasses()}`}>
      <span className="text-8xl font-black tabular-nums tracking-tighter leading-none">
        {formatTime(seconds)}
      </span>
      {seconds === 0 && (
        <span className="mt-4 text-xs font-black uppercase tracking-widest text-red-600">
          Turno Finalizado
        </span>
      )}
    </div>
  );
};

export default Timer;
