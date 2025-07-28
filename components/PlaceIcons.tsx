'use client'
import React from 'react'
import category from '@/data/category'

interface PlaceIconsProps {
  onSelectCategory: (value: string) => void;
  selectedCategory: string | null; // This prop is crucial for tracking selection
}

const PlaceIcons: React.FC<PlaceIconsProps> = ({ onSelectCategory, selectedCategory }) => {
  return (
    <div
      className="card2 h-auto w-full 
      flex flex-row items-center justify-center gap-4 lg:flex-col  lg:items-center lg:justify-center lg:rounded-2xl p-3 
      rounded-xl min-w-0 bg-gray-900 xl:h-full md:h-[10vh]  relative"
      style={{ WebkitOverflowScrolling: 'touch' }}
    >
      {category.map((item) => {
        const iconSvgContent = item.icon;

        if (!iconSvgContent) {
          console.warn(`No SVG content found for category: ${item.name}`);
          return null;
        }

        const isSelected = selectedCategory === item.keyword;

        return (
          <div
            key={item.name}
            onClick={() => onSelectCategory(item.keyword)}
            className="group flex items-center cursor-pointer transition-all xl:group-hover:scale-105 relative"
          >
            <div className={`xl:w-9 xl:h-9 p-2 flex items-center justify-center rounded-full transition-all duration-200
              ${isSelected ? 'ring-1 ring-rose-500' : 'ring-0 ring-transparent'} 
              md:group-hover:ring-1 md:group-hover:ring-rose-500
            `}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width={21}
                height={21}
              >
                <g
                  fill="none"
                  stroke={isSelected ? '#ffffff' : '#ffffff'}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  dangerouslySetInnerHTML={{ __html: iconSvgContent }}
                />
              </svg>
            </div>
            <span className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 rounded 
              bg-black text-white text-xs opacity-0 md:group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-60 border-2 border-white">
              {item.name}
            </span>
          </div>
        );
      })}
    </div>
  )
}

export default PlaceIcons