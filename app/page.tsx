// zittyzoom/app/page.tsx
"use client";

import { useEffect, useState, useRef } from "react";
import PlaceList from "@/components/PlaceList";
import Header from "@/components/Header";
import PlaceIcons from "@/components/PlaceIcons";
import MapPanel from "@/components/MapPanel";
import Script from 'next/script';
import CityInfoPanel from "@/components/CityInfoPanel"; // <--- Import CityInfoPanel
import { motion, AnimatePresence } from "framer-motion"; 

export default function Home() {
  const [placeList, setPlaceList] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState<any>(null);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [currentSessionToken, setCurrentSessionToken] = useState<string | undefined>(undefined);
  const [activeCategory, setActiveCategory] = useState<string | null>(null); // State to hold the currently selected category keyword

   // States for location preference
  const [isUsingUserLocation, setIsUsingUserLocation] = useState(true); // Default to using user's detected location
  const userDetectedLocationRef = useRef<{ lat: number; lng: number } | null>(null); // To store the actual detected location
  const defaultFallbackLocation = { lat: -26.2041, lng: 28.0473 }; // Johannesburg fallback

   // State for CityInfoPanel
  const [isCityInfoPanelOpen, setIsCityInfoPanelOpen] = useState(false);
  const [cityForInfo, setCityForInfo] = useState<string | null>(null);
  const [userCountry, setUserCountry] = useState<string | null>(null);

  console.log("DEBUG: app/page.tsx - userCountry state on render:", userCountry);

  useEffect(() => {
    const getUserLocationAndCountry = async () => {
      let detectedLoc: { lat: number; lng: number } | null = null;
      let errorOccurred = false;

      if (navigator.geolocation) {
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject);
          });
          detectedLoc = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          userDetectedLocationRef.current = detectedLoc;
          setCurrentLocation(detectedLoc);
        } catch (err) {
          console.warn("Could not get location, using default.", err);
          detectedLoc = defaultFallbackLocation; // Fallback immediately on error
          userDetectedLocationRef.current = null;
          setCurrentLocation(defaultFallbackLocation);
          setIsUsingUserLocation(false);
          setSearchError("Could not retrieve your location. Using a default location.");
          errorOccurred = true;
        }
      } else {
        setSearchError("Geolocation is not supported by your browser. Using a default location.");
        detectedLoc = defaultFallbackLocation;
        setCurrentLocation(defaultFallbackLocation);
        setIsUsingUserLocation(false);
        errorOccurred = true;
      }

      // Now, reverse geocode to get the country if a location was determined
      // if (detectedLoc) {
      //   try {
      //     const response = await fetch(`/api/reverse-geocode?lat=${detectedLoc.lat}&lng=${detectedLoc.lng}`);
      //     const data = await response.json();
      //     if (response.ok && data.country) {
      //       setUserCountry(data.country);
      //       console.log("Detected user country:", data.country);
      //     } else {
      //       console.error("Failed to fetch user country:", data.error);
      //       // Optionally, set an error or fallback for the country lookup
      //     }
      //   } catch (err) {
      //     console.error("Error fetching user country:", err);
      //   }
      // }
       if (detectedLoc) {
        await fetchCountryForLocation(detectedLoc); // Call the helper function
      }
    };

    getUserLocationAndCountry();
  }, []);

  // Effect to re-fetch when currentLocation changes
  useEffect(() => {
    if (currentLocation) {
      console.log("Current active search location:", currentLocation);
      // Trigger an initial search based on the current location
      searchPlacesByQuery("Restaurants", undefined, currentLocation.lat, currentLocation.lng);
    }
  }, [currentLocation]); // Re-run when currentLocation changes

  // Function to toggle location preference
   const handleToggleLocationPreference = async () => { // Make async to await country lookup
    setIsUsingUserLocation(prev => {
      const newState = !prev;
      if (newState && userDetectedLocationRef.current) {
        setCurrentLocation(userDetectedLocationRef.current);
        setSearchError(null);
        // Re-fetch country if switching back to user location
        if (userDetectedLocationRef.current) {
          fetchCountryForLocation(userDetectedLocationRef.current);
        }
      } else {
        setCurrentLocation(defaultFallbackLocation);
        setSearchError("Using default location. Toggle to use your current location if detected.");
        // Set country to default location's country
        fetchCountryForLocation(defaultFallbackLocation);
      }
      return newState;
    });
  };

  // Helper function to fetch country for a given location
    const fetchCountryForLocation = async (location: { lat: number; lng: number }) => {
      try {
        const response = await fetch(`/api/reverse-geocode?lat=${location.lat}&lng=${location.lng}`);
        const data = await response.json();
        if (response.ok && data.country) {
          setUserCountry(data.country);
          console.log("Updated user country to:", data.country);
        } else {
          console.error("Failed to update user country:", data.error);
          setUserCountry(null); // Clear country if lookup fails
        }
      } catch (err) {
        console.error("Error updating user country:", err);
        setUserCountry(null);
      }
    };


  // Renamed and adjusted this for clarity and correct Text Search usage
  const searchPlacesByQuery = async (query: string, sessionTokenFromSearch?: string, searchLat?: number, searchLng?: number) => {
    if (!query.trim()) {
      setPlaceList([]);
      setSearchError(null);
      setIsLoading(false);
      setCurrentSessionToken(undefined);
      return;
    }

    setIsLoading(true);
    setSearchError(null);
    setPlaceList([]);
    setCurrentSessionToken(sessionTokenFromSearch);

    try {
      // Determine which location to use for the search
      const effectiveLat = searchLat !== undefined ? searchLat : currentLocation?.lat;
      const effectiveLng = searchLng !== undefined ? searchLng : currentLocation?.lng;

      if (effectiveLat === undefined || effectiveLng === undefined) {
        console.warn("No effective location for search.");
        setSearchError("Cannot perform search: location not available.");
        setIsLoading(false);
        return;
      }

      let url = `/api/google-place-api?keyword=${encodeURIComponent(query)}&type=textsearch`;

      // Only add location parameters if they are valid numbers
      if (typeof effectiveLat === 'number' && typeof effectiveLng === 'number') {
        url += `&lat=${effectiveLat}&lng=${effectiveLng}`;
      }

      const result = await fetch(url);
      const data = await result.json();
      console.log("Search fetch:", data);

      if (result.ok && data.resp && data.resp.results) {
        setPlaceList(data.resp.results);
        if (data.resp.results.length === 0) {
          setSearchError(`No places found for '${query}'.`);
        }
      } else if (data.error) {
        setSearchError(`Error: ${data.error}`);
        setPlaceList([]);
      } else {
        setSearchError("Failed to search places. Please try again.");
        setPlaceList([]);
      }
    } catch (error) {
      console.error("Error searching places:", error);
      setSearchError("An unexpected error occurred during search.");
      setPlaceList([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPlacesByCategory = async (categoryKeyword: string) => { // Renamed parameter for clarity
    // Set the active category state
    setActiveCategory(categoryKeyword); // This is where the selection "sticks"
    // ... (rest of your fetchPlacesByCategory logic) ...
    if (!currentLocation) {
        console.warn("Current location not available, cannot fetch categories.");
        setSearchError("Location not available to fetch categories. Please allow location access.");
        return;
    }
    await searchPlacesByQuery(categoryKeyword, undefined, currentLocation.lat, currentLocation.lng);
  };

  const handlePlaceSelection = (place: any) => {
    setSelectedPlace(place);
    setCurrentSessionToken(undefined);
  };

   // New handler for city click
    const handleCityClick = (cityName: string) => {
    setCityForInfo(cityName);
    // DO NOT set setIsCityInfoPanelOpen(true) here directly.
    // It will be handled by the new useEffect below.
    console.log("DEBUG: City clicked. Waiting for userCountry to be resolved.");
  };

  // NEW useEffect: To open CityInfoPanel only when cityForInfo is set AND userCountry is resolved (string or null)
  useEffect(() => {
    if (cityForInfo && userCountry !== null && !isCityInfoPanelOpen) {
      // This means a city was clicked (cityForInfo is set) AND userCountry
      // has been resolved (it's either a string or explicitly null from failure).
      // And the panel is not already open.
      setIsCityInfoPanelOpen(true);
      console.log("DEBUG: Opening CityInfoPanel now that country is resolved:", userCountry);
    }
    // Also, if cityForInfo becomes null (panel closed), ensure isCityInfoPanelOpen is false
    if (!cityForInfo && isCityInfoPanelOpen) {
      setIsCityInfoPanelOpen(false);
    }
  }, [cityForInfo, userCountry, isCityInfoPanelOpen]); // Dependencies: react to changes in these states


  const handleCloseCityInfo = () => {
    setIsCityInfoPanelOpen(false);
    setCityForInfo(null);
  };

    // Function to unselect category if the same one is clicked again
  const handleCategorySelect = (keyword: string) => {
    if (activeCategory === keyword) {
      setActiveCategory(null); // Unselect if the same category is clicked
      searchPlacesByQuery("", undefined, currentLocation?.lat, currentLocation?.lng); // Optionally clear search
    } else {
      fetchPlacesByCategory(keyword); // Select and search
    }
  };
  

   // Define Framer Motion variants for the animation
  const panelVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 }, // Slightly scaled down and moved on entry/exit
    visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
    exit: { opacity: 0, scale: 0.95, y: 20, transition: { duration: 0.3, ease: "easeIn" } },
  };

   return (
    <>
      
      <div className="h-screen w-full">
        <Header
          userInput={searchPlacesByQuery}
          currentLocation={currentLocation}
          onCategorySelect={fetchPlacesByCategory}
          onToggleLocationPreference={handleToggleLocationPreference}
          isUsingUserLocation={isUsingUserLocation}
          onCityClick={handleCityClick}
        />
         <div className="p-6 pt-0 flex justify-center items-center"> {/* This flex container now centers its *single* child */}
          {/* Main content area - This is the div where the magic happens */}
          <div className="flex w-full md:max-w-7xl md:justify-center items-center md:gap-4 md:bg-rose-200 bg-[url('/images/bg-pic5.jpg')]
            rounded-4xl md:p-0 flex-wrap-reverse md:pr-0 pr-1 p-0 md:h-[89vh] h-[80vh] relative overflow-hidden">
            {/* Added md:max-w-7xl to limit width on large screens and facilitate centering */}

            {/* AnimatePresence allows components to animate when they are removed from the DOM */}
            <AnimatePresence mode="wait">
              {isCityInfoPanelOpen && cityForInfo ? (
                // Render CityInfoPanel when open
                <motion.div
                  key="cityInfoPanel"
                  variants={panelVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="absolute inset-0 flex items-center justify-center p-4 rounded-4xl z-30" // Overlay styles
                >
                  <CityInfoPanel
                    cityName={cityForInfo}
                    userCountry={userCountry}
                    onClose={handleCloseCityInfo}
                  />
                </motion.div>
              ) : (
                // Render main content when CityInfoPanel is closed
                <motion.div
                  key="mainContent"
                  variants={panelVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="flex w-full h-full justify-center items-center" // Ensure this div takes up full space AND centers its children
                >
                  {/* Category Icons (only visible on md screens and up) */}
                  <div className="md:w-[5%] md:py-4 md:px-1 md:h-full w-full h-[6%] md:flex hidden relative z-20">
                    <PlaceIcons
                      onSelectCategory={handleCategorySelect} // Use the new handler
                      selectedCategory={activeCategory} // Pass the active category state
                    />
                  </div>

                  {/* PlaceList and MapPanel Wrapper */}
                  <div className="flex md:flex-nowrap flex-wrap-reverse md:w-[93%] w-full md:h-full h-[97%]
                    bg-none md:p-4 p-2 gap-4 justify-center items-center"> {/* Added justify-center and items-center here */}
                    <div className="card md:w-[45%] md:rounded-3xl w-full overflow-hidden md:h-full h-[60%] relative z-10 py-2 md:bg-none bg-white">
                      <h2 className="text-[20px] w-[80%] font-bold text-gray-700 mb-2 pt-4 px-4 sticky top-0 z-10">
                        Search Results
                      </h2>
                      <div className="relative z-10 overflow-y-scroll h-[calc(100%-60px)] px-1 scrollbar-w-2 scrollbar-track-gray-200 scrollbar-thumb-rose-500 rounded-lg">
                        {searchError && !isLoading && (
                          <p className="text-red-500 text-center p-4">{searchError}</p>
                        )}
                        <PlaceList
                          placeList={placeList}
                          onSelectPlace={handlePlaceSelection}
                          isLoading={isLoading}
                          sessionToken={currentSessionToken}
                          onLoadMore={() => {}} // Provide a no-op or actual load more handler
                          hasNextPage={false}   // Set to true if there are more pages to load
                          isMoreLoading={false} // Set to true if loading more results
                        />
                      </div>
                    </div>
                    <div className="md:w-[55%] w-full md:h-full h-[40%] ">
                      {(selectedPlace?.geometry?.location || currentLocation) ? (
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
                                }
                              : currentLocation
                          }
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
    </>
  );
}