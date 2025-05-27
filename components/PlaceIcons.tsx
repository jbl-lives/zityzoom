// components/PlaceIcons.tsx
'use client'
import React from 'react'
import category from '@/data/category'

interface PlaceIconsProps {
  onSelectCategory: (value: string) => void;
  selectedCategory: string | null; // This prop is crucial for tracking selection
}

const PlaceIcons: React.FC<PlaceIconsProps> = ({ onSelectCategory, selectedCategory }) => {
  return (
    <div className="card2 flex flex-col gap-4 md:flex-col md:items-center md:justify-center md:rounded-2xl md:bg-gray-900 p-3 w-full">

      {category.map((item) => {
        const iconSvgContent = item.icon;

        if (!iconSvgContent) {
          console.warn(`No SVG content found for category: ${item.name}`);
          return null;
        }

        // Determine if the current item is selected
        const isSelected = selectedCategory === item.keyword;

        return (
          <div
            key={item.name}
            onClick={() => onSelectCategory(item.keyword)}
            // Outer container for the whole item (icon + label/tooltip)
            // No complex background changes here, just basic layout and hover scale
            className="group flex items-center gap-3 md:gap-0 md:justify-center md:relative cursor-pointer hover:scale-105 transition-all"
          >
            {/* Inner div for the icon and its border/ring */}
            <div className={`w-10 h-10 flex items-center justify-center rounded-full transition-all duration-200
              ${isSelected ? 'ring-1 ring-rose-500' : 'ring-0 ring-transparent'} 
              group-hover:ring-1 group-hover:ring-rose-500
            `}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width={21}
                height={21}
              >
                <g
                  fill="none"
                  // Icon stroke color: white if selected, white by default (if not selected)
                  // The ring provides the visual differentiation
                  stroke={isSelected ? '#ffffff' : '#ffffff'} // Icon remains white
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  dangerouslySetInnerHTML={{ __html: iconSvgContent }}
                />
              </svg>
            </div>

            {/* Mobile label: always visible on mobile */}
            <span className={`block text-sm font-medium md:hidden
              ${isSelected ? 'text-rose-500' : 'text-gray-800'}`}> {/* Label color changes based on selection */}
              {item.name}
            </span>

            {/* Tooltip for desktop: only shows on hover */}
            <span className="hidden border-2 border-white md:block absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 rounded
              bg-black text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-5000">
              {item.name}
            </span>
          </div>
        );
      })}
    </div>
  )
}

export default PlaceIcons;