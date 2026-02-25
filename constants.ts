import { RoomType, StyleCategory } from './types';

export const DEFAULT_ROOM_TYPES: RoomType[] = [
  'Living Room',
  'Bedroom',
  'Kitchen',
  'Bathroom',
  'Dining',
  'Home Office',
];

export const DEFAULT_CATEGORIES: StyleCategory[] = [
  { id: '1', name: 'Minimalist' },
  { id: '2', name: 'Scandinavian' },
  { id: '3', name: 'Japandi' },
  { id: '4', name: 'Timeless Classic' },
  { id: '5', name: 'Contemporary Modern' },
  { id: '6', name: 'Vintage' },
  { id: '7', name: 'Industrial' },
  { id: '8', name: 'Bohemian' },
  { id: '9', name: 'Decorative' },
  { id: '10', name: 'Luxury Glamour' },
];

export const MIN_LIBRARY_SIZE = 5;
export const DEFAULT_SESSION_LENGTH = 30;
export const MAX_SESSION_LENGTH = 40;
export const MIN_SESSION_LENGTH = 5;

// Refined brand logo with TM removed as requested
export const IMPRINT_BRAND_LOGO = `data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzUwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDM1MCAxMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHRleHQgeD0iMCIgeT0iNzAiIGZvbnQtZmFtaWx5PSInUGxheWZhaXIgRGlzcGxheScsIHNlcmlmIiBmb250LXNpemU9IjY0IiBmaWxsPSIjMDAwMDAwIiBsZXR0ZXItc3BhY2luZz0iMC4wM2VtIj5JTVBSSU5UPC90ZXh0PjxyZWN0IHg9IjAiIHk9Ijg4IiB3aWR0aD0iMzEwIiBoZWlnaHQ9IjIiIGZpbGw9IiNjZmI2ODMiLz48L3N2Zz4=`;