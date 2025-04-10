import category from '@/data/category'
import Image from 'next/image'
import React, { useState } from 'react'


const Hero = ({userInput}:any) => {
  return (
    <div className='text-center relative bg-amber-200'>
        <div>
            <div className='mt-[70px]'>       
                <div className='mt-5 flex flex-col justify-center 
                items-center'>
                    <h2>Browse by category</h2>
                    <div className='grid grid-cols-3 md:grid-cols-7
                    w-[50%] justify-center gap-5 mt-3'>
                         {/* Make sure 'category' is actually an array here */}
                  {category && category.map((item) => ( // Removed index if item.name is unique
                     <div 
                        key={item.name} // <<< SOLUTION: Added unique key prop
                        className=' border border-gray-500 w-[60px] p-4
                        bg-rose-100 rounded-full z-10 hover:border-rose-600
                        hover:scale-110
                        cursor-pointer transition-all'>
                           <Image 
                             src={item.icon}
                             alt={item.name}
                             width={30}
                             height={30}
                           />
                     </div> 
                     ))}
                    </div>
                </div>

            </div>

        </div>
    </div>
  )
}

export default Hero


{/* <h2 className='text-[55px] text-rose-400 tracking-widest
                font-semibold relative z-10' >
                    DISCOVER
                </h2>
                <h2 className='text-[20px] text-gray-500'>
                    Your Amazing City</h2>
                <div className='mt-5 z-20 flex gap-2 items-center justify-center'>
                    <input type="text"
                    onChange={(e)=>setSearchInput(e.target.value)}
                    placeholder='Search Anything' 
                    className='input bg-white p-3 z-10 border-[1px] border-b-gray-600 rounded-full
                    px-5 w-[36%] shadow-sm outline-rose-600 focus:border-rose-600'  />
                    <button 
                    onClick={()=>userInput(searchInput)}
                    className='bg-rose-500 rounded-full p-3 shadow-md
                    z-10 cursor-pointer hover:scale-105 transition-all'>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 text-white">
                            <path strokeLinecap="round" strokeLinejoin="round" 
                            d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                        </svg>

                    </button>
                </div> */}