// components/PlaceIcons.tsx
'use client'
import React from 'react'
import category from '@/data/category'
import Image from 'next/image'

const PlaceIcons = ({ onSelectCategory }: { onSelectCategory: (value: string) => void }) => {
  return (
    <div className="flex md:flex-col items-center bg-slate-200 p-3 gap-4">
      {category.map((item) => (
       <div
            key={item.name}
            onClick={() => onSelectCategory(item.keyword)}
            className="group relative icon w-[40px] h-[40px] p-2 rounded-full cursor-pointer hover:border-rose-600 hover:scale-110 transition-all"
        >
       <Image src={item.icon} alt={item.name} width={30} height={30} />
     
        {/* Tooltip to the right */}
        <span className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 rounded bg-black text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-120">
            {item.name}
        </span>
      </div>
     
      ))}
    </div>
  )
}

export default PlaceIcons
