
export enum AppState {
  SETUP = 'SETUP',
  DAILY = 'DAILY',
  LEADER_RECAP = 'LEADER_RECAP',
  NEXT_STEPS = 'NEXT_STEPS',
  FINISHED = 'FINISHED'
}

// Changed from interface to type to resolve "Spread types may only be created from object types" errors
export type Participant = {
  id: string;
  name: string;
  rating?: number;
}

export interface TimerConfig {
  initialSeconds: number;
  yellowThreshold: number;
  redThreshold: number;
}
