
import { TimerConfig } from './types';

export const DAILY_TIMER: TimerConfig = {
  initialSeconds: 120, // 2 minutes
  yellowThreshold: 30,
  redThreshold: 10
};

export const LEADER_TIMER: TimerConfig = {
  initialSeconds: 420, // 7 minutes
  yellowThreshold: 60,
  redThreshold: 30
};

export const NEXT_STEPS_TIMER: TimerConfig = {
  initialSeconds: 60, // 1 minute
  yellowThreshold: 20,
  redThreshold: 5
};
