// app/page.tsx
"use client";

import { useEffect, useState } from "react";
import PlaceList from "@/components/PlaceList";
import Header from "@/components/Header";
import PlaceIcons from "@/components/PlaceIcons";
import MapPanel from "@/components/MapPanel";
import CityInfoPanel from "@/components/CityInfoPanel";
import { motion, AnimatePresence } from "framer-motion";
import { SearchResult } from "@/hooks/use-places-search";

// Import your custom hooks
import { useLocation } from "@/hooks/use-location";
import { usePlacesSearch } from "@/hooks/use-places-search";

export default function Home() {
  const {
    currentLocation,
    isUsingUserLocation,
    setIsUsingUserLocation,
    searchError: locationSearchError,
    handleToggleLocationPreference,
    userCountry,
  } = useLocation();

  const {
    placeList,
    selectedPlace,
    isLoading,
    searchError: placesSearchError,
    currentSessionToken,
    activeCategory,
    currentSearchQuery,
    searchPlacesByQuery,
    handlePlaceSelection,
    handleCategorySelect: handleCategorySelectHook,
    setActiveCategory,
    searchCenterLocation,
  } = usePlacesSearch();

  const [isCityInfoPanelOpen, setIsCityInfoPanelOpen] = useState(false);
  const [cityForInfo, setCityForInfo] = useState<string | null>(null);

  const displayError = locationSearchError || placesSearchError;

  useEffect(() => {
    if (currentLocation && !currentSearchQuery && !activeCategory) {
      searchPlacesByQuery("Restaurants", undefined, currentLocation.lat, currentLocation.lng);
      setActiveCategory("Restaurants");
    }
  }, [currentLocation, currentSearchQuery, activeCategory, searchPlacesByQuery, setActiveCategory]);

  const handleSearchInitiated = () => {
    setActiveCategory(null);
    handlePlaceSelection(null);
  };

  const handleCategorySelectWrapper = async (keyword: string) => {
    await handleCategorySelectHook(keyword, currentLocation);
  };

  const handleCityClick = (cityName: string) => {
    setCityForInfo(cityName);
  };

  useEffect(() => {
    if (cityForInfo && userCountry !== null && !isCityInfoPanelOpen) {
      setIsCityInfoPanelOpen(true);
    }
    if (!cityForInfo && isCityInfoPanelOpen) {
      setIsCityInfoPanelOpen(false);
    }
  }, [cityForInfo, userCountry, isCityInfoPanelOpen]);

  const handleCloseCityInfo = () => {
    setIsCityInfoPanelOpen(false);
    setCityForInfo(null);
  };

  const panelVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
    exit: { opacity: 0, scale: 0.95, y: 20, transition: { duration: 0.3, ease: "easeIn" } },
  };

  return (
    <div className="h-screen w-full">
      <Header
        userInput={searchPlacesByQuery}
        currentLocation={currentLocation}
        onCategorySelect={handleCategorySelectWrapper}
        onToggleLocationPreference={handleToggleLocationPreference}
        isUsingUserLocation={isUsingUserLocation}
        onCityClick={handleCityClick}
        onSearchInitiated={handleSearchInitiated}
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
                  userCountry={userCountry}
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
                    onSelectCategory={handleCategorySelectWrapper}
                    selectedCategory={activeCategory}
                  />
                </div>
                <div className="flex md:flex-nowrap flex-wrap-reverse md:w-[93%] w-full md:h-full h-[97%]
                  bg-none md:p-4 p-2 gap-4 justify-center items-center">
                  <div className="card px-4 md:w-[45%] md:rounded-3xl w-full overflow-hidden md:h-full h-[60%] relative z-10 py-2 md:bg-none bg-white">
                    <h2 className="text-[20px] w-[80%] font-bold text-gray-700 mb-2 pt-4 px-4 sticky top-0 z-10">
                      Search Results
                    </h2>
                    <div className="relative z-10 overflow-y-scroll h-[calc(100%-60px)] px-1 scrollbar-w-2 scrollbar-track-gray-200 scrollbar-thumb-rose-500 rounded-lg">
                      {displayError && !isLoading && (
                        <p className="text-red-500 text-center p-4">{displayError}</p>
                      )}
                      <PlaceList
                        placeList={placeList}
                        onSelectPlace={handlePlaceSelection}
                        isLoading={isLoading}
                        sessionToken={currentSessionToken}
                      />
                    </div>
                  </div>
                  <div className="card md:w-[55%] w-full md:h-full h-[40%] md:rounded-3xl overflow-hidden">
                    {currentLocation ? (
                      <MapPanel
                        mapCenter={searchCenterLocation || currentLocation}
                        userCurrentGeolocation={currentLocation}
                        placeList={placeList}
                        selectedPlaceId={selectedPlace?.place_id}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-500">
                        <span className="loader"></span>
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
  );
}
