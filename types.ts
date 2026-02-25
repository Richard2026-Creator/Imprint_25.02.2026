export type RoomType = 'Living Room' | 'Bedroom' | 'Kitchen' | 'Bathroom' | 'Dining' | 'Home Office';

export interface StyleCategory {
  id: string;
  name: string;
}

export interface LibraryImage {
  id: string;
  url: string; // base64 string for local demo
  roomType: RoomType;
  styleCategories: string[]; // array of style IDs
  createdAt: number;
  isActive?: boolean; // New: determines if image is included in discovery pool
}

export interface StudioSettings {
  logo: string | null;
  sessionLength: number;
  minRequiredImages: number;
  categories: StyleCategory[];
  adminPin: string;
  clientName: string;
}

export interface SwipeDecision {
  imageId: string;
  direction: 'right' | 'left';
  responseTimeMs: number;
  undoUsed: boolean;
  roomType: RoomType;
  styleCategories: string[];
}

export interface SessionResult {
  id: string;
  date: number;
  clientName?: string;
  decisions: SwipeDecision[];
  summary: {
    primaryStyles: string[];
    secondaryStyles: string[];
    narrative: string;
    confidence: string;
    decisiveness: number; // 0 to 1
    averageResponseTime: number;
  };
}

export type View = 'HOME' | 'DISCOVERY' | 'SUMMARY' | 'SETTINGS' | 'ANALYTICS';