// zittyzoom/components/Header.tsx
"use client";
import Image from 'next/image';
import { useState } from "react";
import Weather from "@/components/Weather";
import SearchBar from "@/components/Searchbar";
import { Button } from "@/components/ui/button";

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

interface HeaderProps {
  userInput: (query: string, sessionToken?: string, lat?: number, lng?: number) => void;
  currentLocation: { lat: number; lng: number } | null; // **NOTE:** We'll still need to align this type with page.tsx as discussed previously.
  onCategorySelect: (category: string) => void;
  onToggleLocationPreference: () => void;
  isUsingUserLocation: boolean;
  onCityClick: (cityName: string) => void;
  // NEW: Add onSearchInitiated prop
  onSearchInitiated: () => void; // This will be called by SearchBar when a search starts
}

function Header({
  userInput,
  currentLocation,
  onCategorySelect,
  onToggleLocationPreference,
  isUsingUserLocation,
  onCityClick,
  onSearchInitiated, // Destructure the new prop
}: HeaderProps) {
  const [searchInput, setSearchInput] = useState(""); // This state is indeed redundant, you can remove it if you wish.
  const [isCategorySheetOpen, setIsCategorySheetOpen] = useState(false);

  const handleCategorySelect = (category: string) => { // This function is not currently used in Header itself, but is a prop.
    console.log("Selected category from Sheet:", category);
    onCategorySelect(category);
    setIsCategorySheetOpen(false);
  };

  return (
    <div className="relative flex justify-between p-3 px-5 flex-wrap">
      {/** Logo and Title */}
      <div className="flex gap-3 items-center ">
        <Image src="/zip-logo.png" alt="logo" width={30} height={30} />
        <h2
          className="text-[1rem] font-semibold
          tracking-widest text-rose-600"
        >
          ZITYZOOM
        </h2>
      </div>

      {/**Search input */}
      <div className="hidden md:flex gap-2 items-center justify-center">
        {/* Pass currentLocation's lat/lng to SearchBar */}
        <SearchBar
          onSearch={userInput}
          lat={currentLocation?.lat || 0}
          lng={currentLocation?.lng || 0}
          // NEW: Pass the handler here
          onSearchInitiated={onSearchInitiated}
        />
      </div>

      <Weather currentLocation={currentLocation} onCityClick={onCityClick} />

      {/** Nav Button and Location Toggle */}
      <div className="flex items-center gap-4 ">
        <button
          onClick={onToggleLocationPreference}
          className={`relative cursor-pointer flex items-center justify-center w-14 h-14 rounded-full transition-colors duration-200 overflow-hidden bg-transparent`}
          title={isUsingUserLocation ? "Using Your Current Location" : "Using Default Location"}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 100 100"
              className={`absolute w-full h-full transition-colors duration-200`}
              style={{
                transform: 'rotateX(65deg) scale(0.5) translateY(80%)',
                transformOrigin: 'center center',
                filter: isUsingUserLocation
                  ? 'drop-shadow(0 4px 6px rgba(34, 197, 94, 0.4))'
                  : 'drop-shadow(0 2px 4px rgba(107, 114, 128, 0.2))'
              }}
            >
              <circle
                cx="50"
                cy="50"
                r="40"
                className={isUsingUserLocation ? 'fill-green-500' : 'fill-gray-400'}
              />
            </svg>

            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
              className={`absolute w-5 h-7 z-10 transition-colors duration-200 ${
                  isUsingUserLocation ? 'text-green-700' : 'text-gray-700'
              }`}
              style={{
                transform: 'translateY(-10%)',
                filter: isUsingUserLocation
                  ? 'drop-shadow(0 2px 2px rgba(0,0,0,0.3))'
                  : 'drop-shadow(0 1px 1px rgba(0,0,0,0.2))'
              }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
            </svg>

            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 100 100"
              className={`absolute w-1 h-2 z-20`}
              style={{
                  transform: 'rotateX(65deg) scale(0.1) translateY(15%)',
                  transformOrigin: 'center center',
              }}
            >
              <circle
                cx="30"
                cy="30"
                r="3"
                className={isUsingUserLocation ? 'fill-red-900' : 'fill-gray-600'}
              />
            </svg>
          </div>
        </button>

        <Drawer>
          <DrawerTrigger asChild>
            <button className='nav-btn flex items-center justify-center p-3 z-10 cursor-pointer transition-all'>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M12 17.25h8.25" />
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
      </div>

      {/**Mobile Search*/}
      <div className="w-full md:hidden flex justify-center items-center gap-2">
        <SearchBar
          onSearch={userInput}
          isMobile
          lat={currentLocation?.lat || 0}
          lng={currentLocation?.lng || 0}
          // NEW: Pass the handler here for mobile too
          onSearchInitiated={onSearchInitiated}
        />
      </div>
    </div>
  );
}

export default Header;