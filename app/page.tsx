// zittyzoom/app/page.tsx
"use client";

import { useEffect, useState, useRef, useCallback } from "react"; // Added useCallback
import PlaceList from "@/components/PlaceList";
import Header from "@/components/Header";
import PlaceIcons from "@/components/PlaceIcons";
import MapPanel from "@/components/MapPanel";
import Script from 'next/script'; // Still needed if Google Maps API loaded this way
import CityInfoPanel from "@/components/CityInfoPanel";
import { motion, AnimatePresence } from "framer-motion";

import { useLocation } from "@/app/hooks/use-location"; // Import the custom location hook
import { usePlacesSearch } from "@/app/hooks/use-places-search"; // Import the custom places search hook

export default function Home() {
  // --- Use Location Hook ---
  const {
    currentLocation,
    isUsingUserLocation,
    searchError: locationError, // Renamed to avoid clash with places search error
    handleToggleLocationPreference,
    isLoadingLocation, // New loading state from hook
  } = useLocation();

  // --- Use Places Search Hook ---
  const {
    placeList,
    selectedPlace,
    isLoading, // Search loading state
    searchError: placesSearchError, // Renamed to avoid clash with location error
    currentSessionToken,
    activeCategory,
    searchPlacesByQuery,
    handlePlaceSelection,
    handleCategorySelect,
    setActiveCategory, // Exposing setter for specific use cases like general search initiated
    currentSearchQuery, // Keep track of the current query
    searchCenterLocation, // Map center based on search results or selected place
  } = usePlacesSearch();


  // --- CityInfoPanel specific states and handlers (remain in page.tsx as they are top-level UI concerns) ---
  const [isCityInfoPanelOpen, setIsCityInfoPanelOpen] = useState(false);
  const [cityForInfo, setCityForInfo] = useState<string | null>(null);

  // Derive userCountry directly from currentLocation from useLocation hook
  const userCountry = currentLocation?.country || null;

  // Handler for city click (from Weather component via Header)
  const handleCityClick = useCallback((cityName: string) => {
    setCityForInfo(cityName);
    console.log("DEBUG: City clicked. Waiting for userCountry to be resolved.");
  }, []); // useCallback for stable reference

  // useEffect to open CityInfoPanel only when cityForInfo is set AND userCountry is resolved
  useEffect(() => {
    // Only open if we have a city and country (country being null means it's still resolving or failed)
    if (cityForInfo && userCountry !== null && !isCityInfoPanelOpen) {
      setIsCityInfoPanelOpen(true);
      console.log("DEBUG: Opening CityInfoPanel now that country is resolved:", userCountry);
    }
    // Close if cityForInfo is cleared while panel is open
    if (!cityForInfo && isCityInfoPanelOpen) {
      setIsCityInfoPanelOpen(false);
    }
  }, [cityForInfo, userCountry, isCityInfoPanelOpen]); // Dependencies

  const handleCloseCityInfo = useCallback(() => {
    setIsCityInfoPanelOpen(false);
    setCityForInfo(null);
  }, []); // useCallback for stable reference


  // --- Initial Search Trigger (after location is available) ---
  useEffect(() => {
    // Trigger an initial search for "Restaurants" once the current location is available and loaded
    if (currentLocation && currentLocation.lat !== null && currentLocation.lng !== null && !isLoadingLocation) {
      console.log("DEBUG: Initial search for 'Restaurants' triggered with location:", currentLocation);
      // Ensure the search hook knows about this initial search, passing explicit coords
      searchPlacesByQuery("Restaurants", undefined, currentLocation.lat, currentLocation.lng);
      // Also set the active category so the icon is highlighted
      setActiveCategory("Restaurants");
    }
  }, [currentLocation, isLoadingLocation, searchPlacesByQuery, setActiveCategory]); // Dependencies

  // --- Search Initiated Handler (for general search bar, e.g., to clear categories) ---
  const handleSearchInitiated = useCallback(() => {
    console.log("DEBUG: handleSearchInitiated called. Setting activeCategory to null.");
    setActiveCategory(null); // Clear the selected category when a general search is initiated
    handlePlaceSelection(null); // Clear any selected place too
  }, [setActiveCategory, handlePlaceSelection]);


  // Determine the overall search error to display (prioritize places search error)
  const displaySearchError = placesSearchError || locationError;


  // Define Framer Motion variants for the animation
  const panelVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
    exit: { opacity: 0, scale: 0.95, y: 20, transition: { duration: 0.3, ease: "easeIn" } },
  };

  return (
    <>
      <div className="h-screen w-full">
        <Header
          userInput={searchPlacesByQuery} // From usePlacesSearch
          currentLocation={currentLocation} // From useLocation
          onCategorySelect={(keyword: string) => handleCategorySelect(keyword, currentLocation)} // Pass currentLocation
          onToggleLocationPreference={handleToggleLocationPreference} // From useLocation
          isUsingUserLocation={isUsingUserLocation} // From useLocation
          onCityClick={handleCityClick} // Remains in page.tsx
          onSearchInitiated={handleSearchInitiated} // Remains in page.tsx for general search orchestration
        />
        <div className="p-6 pt-0 flex justify-center items-center">
          <div className="flex w-full md:max-w-7xl md:justify-center items-center md:gap-4 md:bg-rose-200 bg-[url('/images/bg-pic5.jpg')]
            rounded-4xl md:p-0 flex-wrap-reverse md:pr-0 pr-1 p-0 md:h-[89vh] h-[80vh] relative overflow-hidden">

            <AnimatePresence mode="wait">
              {isCityInfoPanelOpen && cityForInfo ? (
                <motion.div
                  key="cityInfoPanel"
                  variants={panelVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="absolute inset-0 flex items-center justify-center p-4 rounded-4xl z-30"
                >
                  <CityInfoPanel
                    cityName={cityForInfo}
                    userCountry={userCountry} // Derived from currentLocation
                    onClose={handleCloseCityInfo}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="mainContent"
                  variants={panelVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="flex w-full h-full justify-center items-center"
                >
                  <div className="md:w-[5%] md:py-4 md:px-1 md:h-full w-full h-[6%] md:flex hidden relative z-20">
                    <PlaceIcons
                      onSelectCategory={(keyword: string) => handleCategorySelect(keyword, currentLocation)} // Pass currentLocation
                      selectedCategory={activeCategory} // From usePlacesSearch
                    />
                  </div>

                  <div className="flex md:flex-nowrap flex-wrap-reverse md:w-[93%] w-full md:h-full h-[97%]
                    bg-none md:p-4 p-2 gap-4 justify-center items-center">
                    <div className="card md:w-[45%] md:rounded-3xl w-full overflow-hidden md:h-full h-[60%] relative z-10 py-2 md:bg-none bg-white">
                      <h2 className="text-[20px] w-[80%] font-bold text-gray-700 mb-2 pt-4 px-4 sticky top-0 z-10">
                        Search Results
                      </h2>
                      <div className="relative z-10 overflow-y-scroll h-[calc(100%-60px)] px-1 scrollbar-w-2 scrollbar-track-gray-200 scrollbar-thumb-rose-500 rounded-lg">
                        {displaySearchError && !isLoading && (
                          <p className="text-red-500 text-center p-4">{displaySearchError}</p>
                        )}
                        {isLoading || isLoadingLocation ? ( // Check both loading states
                          <div className="flex justify-center items-center h-full">
                            <span className="loader"></span> {/* Or a simpler loading spinner */}
                          </div>
                        ) : (
                          <PlaceList
                            placeList={placeList} // From usePlacesSearch
                            onSelectPlace={handlePlaceSelection} // From usePlacesSearch
                            isLoading={isLoading} // From usePlacesSearch
                            sessionToken={currentSessionToken} // From usePlacesSearch
                            onLoadMore={() => {}} // Still a placeholder
                            hasNextPage={false} // Still a placeholder
                            isMoreLoading={false} // Still a placeholder
                          />
                        )}
                      </div>
                    </div>
                    <div className="md:w-[55%] w-full md:h-full h-[40%] ">
                      {/* Map should render when location is available OR when selectedPlace/searchCenterLocation is set */}
                      {(selectedPlace?.geometry?.location || searchCenterLocation || (currentLocation && currentLocation.lat !== null && currentLocation.lng !== null)) ? (
                        <MapPanel
                          userLocation={
                            selectedPlace?.geometry?.location
                              ? {
                                  lat: typeof selectedPlace.geometry.location.lat === 'function'
                                    ? selectedPlace.geometry.location.lat()
                                    : selectedPlace.geometry.location.lat,
                                  lng: typeof selectedPlace.geometry.location.lng === 'function'
                                    ? selectedPlace.geometry.location.lng()
                                    : selectedPlace.geometry.location.lng,
                                  city: selectedPlace.city || null, // Assuming SearchResult can have city, or use currentLocation
                                  country: selectedPlace.country || null, // Assuming SearchResult can have country, or use currentLocation
                                }
                              : (searchCenterLocation || currentLocation) // Prioritize searchCenterLocation if no place selected
                          }
                          placeList={placeList} // From usePlacesSearch
                          selectedPlaceId={selectedPlace?.place_id} // From usePlacesSearch
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-500">
                           {isLoadingLocation ? (
                              <span className="loader"></span>
                           ) : (
                              <p>Awaiting location and search data...</p>
                           )}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </>
  );
}