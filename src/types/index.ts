export type Verdict = 'viable' | 'marginal' | 'not-viable';

export interface Duration {
  days: number;
  hours: number;
}

export interface Site {
  id: string;
  name: string;
  group: 'apollo' | 'clps-artemis' | 'international' | 'custom';
  lat: number;
  lon: number;
}

export interface Scenario {
  siteId: string;
  /** ISO 8601, UTC */
  time: string;
}
