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
  currentLocation: { lat: number; lng: number } | null;
  onCategorySelect: (category: string) => void;
  onToggleLocationPreference: () => void; // <--- NEW PROP for toggling location
  isUsingUserLocation: boolean; // <--- NEW PROP to indicate current preference
}



function Header({
  userInput,
  currentLocation,
  onCategorySelect,
  onToggleLocationPreference, // Destructure new prop
  isUsingUserLocation // Destructure new prop
}: HeaderProps) {
  const [searchInput, setSearchInput] = useState(""); // This state might be redundant here if SearchBar handles its own input.
  const [isCategorySheetOpen, setIsCategorySheetOpen] = useState(false);

  const handleCategorySelect = (category: string) => {
    console.log("Selected category from Sheet:", category);
    onCategorySelect(category);
    setIsCategorySheetOpen(false);
  };

  return (
    <div className="flex justify-between p-3 px-5 flex-wrap">
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
        <SearchBar onSearch={userInput} lat={currentLocation?.lat || 0} lng={currentLocation?.lng || 0} />
      </div>

      <Weather currentLocation={currentLocation} />

      {/** Nav Button and Location Toggle */}
      <div className="flex items-center gap-2"> {/* New container for buttons */}
        {/* Location Toggle Button */}
        <button
          onClick={onToggleLocationPreference}
          className={`flex items-center cursor-pointer justify-center p-1 rounded-full transition-colors duration-200 ${
            isUsingUserLocation
              ? 'bg-green-300 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
          title={isUsingUserLocation ? "Using Your Current Location" : "Using Default Location"}
        >
          {isUsingUserLocation ? (
            // Icon for "using current location" (e.g., location filled)
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
            </svg>

          ) : (
            // Icon for "using default location" (e.g., location outline)
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
            </svg>
          )}
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
        {/* Pass currentLocation's lat/lng to SearchBar */}
        <SearchBar onSearch={userInput} isMobile lat={currentLocation?.lat || 0} lng={currentLocation?.lng || 0} />
      </div>
    </div>
  );
}

export default Header