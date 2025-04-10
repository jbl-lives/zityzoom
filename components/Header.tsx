"use client";
import Image from 'next/image';
import React, { useState } from 'react'

function Header({userInput}:any) {
  const [searchInput,setSearchInput]=useState<string>();
  return (
    <div className="flex justify-between p-3 px-5 shadow-sm bg-slate-200">
      <div className="flex gap-3 items-center ">
        <Image src="/zip-logo.png" alt="logo" width={50} height={50} />
        <h2
          className="text-[25px] font-semibold 
        tracking-widest text-rose-600"
        >
          ZITYZOOM
        </h2>
      </div>
      <div className="  flex gap-2 items-center justify-center">
        <input
          type="text"
           onChange={(e)=>setSearchInput(e.target.value)}
          placeholder="Search Anything"
          className="input bg-white p-2.5 z-10  rounded-full
                    px-5 w-[600px] shadow-sm outline-rose-600 focus:border-rose-600"
        />
        <button
          onClick={()=>userInput(searchInput)}
          className="bg-rose-500 rounded-full p-3 shadow-md
                    z-10 cursor-pointer hover:scale-90 transition-all"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-6 text-white"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
            />
          </svg>
        </button>
      </div>
      <ul className="flex gap-8 items-center ">
        <li className="text-[18px] hover:text-rose-600 cursor-pointer">Home</li>
        <li className="text-[18px] hover:text-rose-600 cursor-pointer">
          About Us
        </li>
        <li className="text-[18px] hover:text-rose-600 cursor-pointer">
          Contact Us
        </li>
      </ul>
    </div>
  );
}

export default Header