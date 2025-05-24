'use client'
import React from 'react'
import category from '@/data/category'
import Image from 'next/image'

const PlaceIcons = ({ onSelectCategory }: { onSelectCategory: (value: string) => void }) => {
  return (
    <div className="card2 flex flex-col gap-4 md:flex-col md:items-center md:justify-center md:rounded-2xl md:bg-gray-900 p-3 w-full">

      {category.map((item) => (
        <div
          key={item.name}
          onClick={() => onSelectCategory(item.keyword)}
          className="group flex items-center  gap-3 md:gap-0 md:justify-center md:relative cursor-pointer hover:scale-105 transition-all"
        >
          <div className="w-10 h-10 flex items-center justify-center rounded-full hover:border-1 border-rose-500 transition-all">
            <Image src={item.icon} alt={item.name} width={21} height={21} />
          </div>

          {/* Always show label on mobile (flex-col), only show tooltip on desktop */}
          <span className="block text-sm font-medium text-gray-800 md:hidden">
            {item.name}
          </span>

          {/* Tooltip for desktop */}
          <span className="hidden md:block absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 rounded
           bg-black text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-5000">
            {item.name}
          </span>
        </div>
      ))}
    </div>
  )
}

export default PlaceIcons
