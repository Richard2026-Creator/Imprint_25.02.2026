
import React from 'react';
import { LibraryImage } from '../types';

interface SwipeCardProps {
  image: LibraryImage;
}

export const SwipeCard: React.FC<SwipeCardProps> = ({ image }) => {
  return (
    <div className="relative w-full h-full bg-white/90 shadow-[0_8px_32px_rgba(0,0,0,0.12)] select-none will-change-transform -webkit-mask-image:linear-gradient(#fff,#fff)">
      <div className="absolute inset-0 overflow-hidden">
        <img
          src={image.url}
          alt="Interior"
          className="w-full h-full object-cover pointer-events-none"
          loading="eager"
          draggable="false"
        />
      </div>
    </div>

  );
};
