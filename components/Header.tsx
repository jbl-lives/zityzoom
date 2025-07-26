// Header.tsx
"use client";
import Image from 'next/image';
import { useState, useEffect } from "react";
import Weather from "@/components/Weather";
import SearchBar from "@/components/Searchbar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger as DrawerTriggerDrawer,
} from "@/components/ui/drawer";
import CategoryList from "@/data/CategoryList";

interface HeaderProps {
  userInput: (query: string, sessionToken?: string, lat?: number, lng?: number) => void;
  currentLocation: { lat: number; lng: number } | null;
  onCategorySelect: (category: string) => void;
  onToggleLocationPreference: () => void;
  isUsingUserLocation: boolean;
  onCityClick: (cityName: string) => void;
  onSearchInitiated: () => void;
}

function Header({
  userInput,
  currentLocation,
  onCategorySelect,
  onToggleLocationPreference,
  isUsingUserLocation,
  onCityClick,
  onSearchInitiated,
}: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileBreakpoint, setIsMobileBreakpoint] = useState(false); // Renamed for clarity

  useEffect(() => {
    const handleResize = () => {
      // isMobileBreakpoint is true for screens <= 768px (Tailwind's 'md' breakpoint)
      setIsMobileBreakpoint(window.innerWidth <= 768);
    };
    handleResize(); // Set initial value
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleCategorySelect = (category: string) => {
    console.log("Selected category from Sheet:", category);
    onCategorySelect(category);
    // Close the drawer after selecting a category
    if (isMobileBreakpoint) {
      setIsMenuOpen(false);
    }
  };

  return (
    <header className="w-full bg-white z-20 sticky top-0">
      {/* Main Header Row */}
      <div className="flex items-center justify-between p-1 md:p-2 lg:p-3 xl:px-5">
        {/* Logo and Title */}
        <div className="flex items-center gap-1 md:gap-2">
          <Image src="/zip-logo.png" alt="logo" width={24} height={24} className="md:w-6 md:h-6" />
          <h2 className="text-sm font-semibold tracking-widest text-rose-600 md:text-base lg:text-lg">
            ZITYZOOM
          </h2>
        </div>

        {/* Search Area */}
        {isMobileBreakpoint ? (
          // Mobile: Search icon triggers a Dialog
          <Dialog>
            <DialogTitle className="sr-only">Search</DialogTitle>
            <DialogTrigger asChild>
              <button className="p-2 text-gray-700 ml-auto hover:text-rose-500 focus:outline-none">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
              </button>
            </DialogTrigger>
            {/* Dialog content for mobile search */}
            <DialogContent className="bg-white shadow-lg rounded-lg w-[90vw] max-w-sm">
              <SearchBar
                onSearch={userInput}
                lat={currentLocation?.lat || 0}
                lng={currentLocation?.lng || 0}
                onSearchInitiated={onSearchInitiated}
                isMobileDialog={true} // New prop: signals it's in a mobile dialog
              />
            </DialogContent>
          </Dialog>
        ) : (
          // Tablet & Desktop: SearchBar visible directly in header
          <div className="flex-1 mx-1 md:mx-2 lg:mx-4 flex justify-center"> {/* Added justify-center for desktop search bar */}
            <SearchBar
              onSearch={userInput}
              lat={currentLocation?.lat || 0}
              lng={currentLocation?.lng || 0}
              onSearchInitiated={onSearchInitiated}
              // No isMobileDialog prop when not in dialog
            />
          </div>
        )}

        {/* Right-side elements: Menu (Mobile) or Weather (Tablet/Desktop) */}
        {isMobileBreakpoint ? (
          // Mobile: Hamburger menu triggers Drawer
          <Drawer open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <DrawerTriggerDrawer asChild>
              <button className="p-1 text-gray-700 hover:text-rose-500 focus:outline-none ml-2"> {/* Added ml-2 for spacing */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M12 17.25h8.25" />
                </svg>
              </button>
            </DrawerTriggerDrawer>
            {/* Drawer Content for mobile menu */}
            <DrawerContent className="md:pb-10 py-4 px-4">
              <DrawerHeader>
                <DrawerTitle className="text-lg md:text-xl">
                  <div className="flex justify-between">
                    <div className="flex items-center gap-1 md:gap-2">
                      <Image src="/zip-logo.png" alt="logo" width={24} height={24} className="w-8 h-8" />
                      <h2 className="text-md font-semibold tracking-widest text-rose-600 md:text-base lg:text-lg">
                        ZITYZOOM
                      </h2>
                    </div>
                    {/* Location Toggle within Drawer */}
                    <button
                      onClick={() => {
                        onToggleLocationPreference();
                        setIsMenuOpen(false);
                      }}
                      className="relative cursor-pointer flex items-center justify-center w-14 h-14 rounded-full transition-colors duration-200 overflow-hidden bg-transparent"
                      title={isUsingUserLocation ? "Using Your Current Location" : "Using Default Location"}
                    >
                      <div className="absolute inset-0 flex items-center justify-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 100 100"
                          className="absolute w-full h-full transition-colors duration-200"
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
                          className="absolute w-5 h-7 z-10 transition-colors duration-200"
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
                          className="absolute w-1 h-2 z-20"
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
                  </div>
                </DrawerTitle>
                <DrawerDescription className="text-sm md:text-base">
                  Find out more things you can do in your city
                </DrawerDescription>
              </DrawerHeader>
              <div className="mb-6 space-y-2">
                {/* Weather component now inside the Drawer for mobile */}
                <div className="flex justify-start pl-4">
                  <Weather currentLocation={currentLocation} onCityClick={onCityClick} />
                </div>
                <CategoryList onCategorySelect={handleCategorySelect} />
              </div>
              <div className="mt-3 px-4">
                <DrawerClose asChild>
                  <Button variant="outline" className="w-full h-12 text-lg bg-gray-950 text-white p-4">Close</Button>
                </DrawerClose>
              </div>
            </DrawerContent>
          </Drawer>
        ) : (
          // Tablet & Desktop: Weather visible directly in header
          <div className="hidden md:flex"> {/* This div ensures it's only shown md and above */}
            <Weather currentLocation={currentLocation} onCityClick={onCityClick} />
            <button
                      onClick={() => {
                        onToggleLocationPreference();
                        setIsMenuOpen(false);
                      }}
                      className="relative cursor-pointer flex items-center justify-center w-14 h-14 rounded-full transition-colors duration-200 overflow-hidden bg-transparent"
                      title={isUsingUserLocation ? "Using Your Current Location" : "Using Default Location"}
                    >
                      <div className="absolute inset-0 flex items-center justify-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 100 100"
                          className="absolute w-full h-full transition-colors duration-200"
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
                          className="absolute w-5 h-7 z-10 transition-colors duration-200"
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
                          className="absolute w-1 h-2 z-20"
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
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;