"use client";
import Image from 'next/image';
import Link from 'next/link';
import React, { useState } from 'react'

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { Button } from "@/components/ui/button";
import { usePathname } from 'next/navigation';


function Header({userInput}:any) {
  const [searchInput, setSearchInput] = useState<string>("");
  return (
    <div className="flex justify-between p-3 px-5 flex-wrap shadow-sm bg-slate-200">
      <div className="flex gap-3 items-center ">
        <Image src="/zip-logo.png" alt="logo" width={50} height={50} />
        <h2
          className="text-[25px] font-semibold 
        tracking-widest text-rose-600"
        >
          ZITYZOOM
        </h2>
      </div>
      

      {/**Mobile Navigation */}
      <div className=" hidden md:flex gap-2 items-center justify-center">
      <input
        type="text"
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value) }
        onKeyDown={(e) => {
          if (e.key === 'Enter') userInput(searchInput);
          console.log("Search triggered:", searchInput);

        }}
        
        placeholder="Search Anything"
        className="input bg-white p-3 z-10 rounded-full px-5 w-[600px] shadow-sm outline-rose-400 focus:border-rose-400"
      />

          <button
            disabled={!searchInput.trim()}
            onClick={() => userInput(searchInput)}
            className={`bg-rose-500 rounded-full p-3 shadow-md z-10 cursor-pointer transition-all ${
              !searchInput.trim() ? "opacity-50 cursor-not-allowed" : "hover:scale-90"
            }`}
          >

          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-5 text-white"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
            />
          </svg>
        </button>
      </div>

      <Drawer>
  <DrawerTrigger asChild>
    <button className='nav-btn flex items-center justify-center p-3 shadow-md z-10 cursor-pointer transition-all'>
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
        strokeWidth={1.5} stroke="currentColor" className="size-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9h16.5m-16.5 6.75h16.5" />
      </svg>
    </button>
  </DrawerTrigger>

  <DrawerContent className="md:pb-10 py:4 md:px-20 px-4">
    <DrawerHeader>
      <DrawerTitle className='text-[1.5rem]'>About</DrawerTitle>
      <DrawerDescription className='text-[1rem] '>
         ZittyZoom helps travelers explore cities with ease — find nearby 
         hotels, restaurants, gas stations, and hotspots instantly. More 
         than just directions — it’s your city, zoomed in.
      </DrawerDescription>
    </DrawerHeader>

    

    <DrawerFooter className="mt-4">
      <DrawerClose asChild>
        <Button variant="outline" className="w-full">Close</Button>
      </DrawerClose>
    </DrawerFooter>
  </DrawerContent>
</Drawer>


     

      {/**Mobile Search*/}
      <div className=" w-full flex md:hidden mt-3 gap-2 items-center justify-center">
      <input
        type="text"
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value) }
        onKeyDown={(e) => {
          if (e.key === 'Enter') userInput(searchInput);
          console.log("Search triggered:", searchInput);

        }}
        
        placeholder="Search Anything"
        className="input bg-white p-3 z-10 rounded-full px-5 w-[600px] shadow-sm outline-rose-400 focus:border-rose-400"
      />

          <button
            disabled={!searchInput.trim()}
            onClick={() => userInput(searchInput)}
            className={`bg-rose-500 rounded-full p-3 shadow-md z-10 cursor-pointer transition-all ${
              !searchInput.trim() ? "opacity-50 cursor-not-allowed" : "hover:scale-90"
            }`}
          >

          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-5 text-white"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
            />
          </svg>
        </button>
      </div>

    </div>
  );
}

export default Header