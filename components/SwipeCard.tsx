
import React from 'react';
import { LibraryImage } from '../types';

interface SwipeCardProps {
  image: LibraryImage;
}

export const SwipeCard: React.FC<SwipeCardProps> = ({ image }) => {
  return (
    <div className="relative w-full h-full bg-stone-100 rounded-[3.5rem] overflow-hidden ios-shadow border border-stone-100 select-none">
      <img 
        src={image.url} 
        alt="Interior" 
        className="w-full h-full object-cover pointer-events-none"
      />
    </div>
  );
};
