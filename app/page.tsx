// zittyzoom/app/page.tsx
"use client";

import { useEffect, useState, useRef } from "react";
import PlaceList from "@/components/PlaceList";
import Header from "@/components/Header";
import PlaceIcons from "@/components/PlaceIcons";
import MapPanel from "@/components/MapPanel";
import Script from 'next/script';

export default function Home() {
  const [placeList, setPlaceList] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState<any>(null);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [currentSessionToken, setCurrentSessionToken] = useState<string | undefined>(undefined);

  // New states for location preference
  const [isUsingUserLocation, setIsUsingUserLocation] = useState(true); // Default to using user's detected location
  const userDetectedLocationRef = useRef<{ lat: number; lng: number } | null>(null); // To store the actual detected location
  const defaultFallbackLocation = { lat: -26.2041, lng: 28.0473 }; // Johannesburg fallback


  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const detectedLoc = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          userDetectedLocationRef.current = detectedLoc; // Store detected location
          setCurrentLocation(detectedLoc); // Set as current if initial preference is user location
        },
        (err) => {
          console.warn("Could not get location, using default.", err);
          // If geolocation fails, we immediately fall back to default
          userDetectedLocationRef.current = null; // Clear detected location
          setCurrentLocation(defaultFallbackLocation);
          setIsUsingUserLocation(false); // Switch to default location mode
          setSearchError("Could not retrieve your location. Using a default location.");
        }
      );
    } else {
      setSearchError("Geolocation is not supported by your browser. Using a default location.");
      setCurrentLocation(defaultFallbackLocation);
      setIsUsingUserLocation(false); // Switch to default location mode
    }
  }, []);

  // Effect to re-fetch when currentLocation changes
  useEffect(() => {
    if (currentLocation) {
      console.log("Current active search location:", currentLocation);
      // Trigger an initial search based on the current location
      // You might want to debounce this or only run once on initial load
      searchPlacesByQuery("Restaurants", undefined, currentLocation.lat, currentLocation.lng);
    }
  }, [currentLocation]); // Re-run when currentLocation changes

  // Function to toggle location preference
  const handleToggleLocationPreference = () => {
    setIsUsingUserLocation(prev => {
      const newState = !prev;
      if (newState && userDetectedLocationRef.current) {
        // Switching to user location, if detected
        setCurrentLocation(userDetectedLocationRef.current);
        setSearchError(null); // Clear error if switching to user location
      } else {
        // Switching to default location or if user location not detected
        setCurrentLocation(defaultFallbackLocation);
        setSearchError("Using default location. Toggle to use your current location if detected.");
      }
      return newState;
    });
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

  const fetchPlacesByCategory = async (category: string) => {
    // Ensure we use the currently active search location
    if (!currentLocation) {
      console.warn("Current location not available, cannot fetch categories.");
      setSearchError("Location not available to fetch categories. Please allow location access.");
      return;
    }
    await searchPlacesByQuery(category, undefined, currentLocation.lat, currentLocation.lng);
  };

  const handlePlaceSelection = (place: any) => {
    setSelectedPlace(place);
    setCurrentSessionToken(undefined);
  };

  return (
    <>
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=AIzaSyA6rT8Jea8UIGbupwx2jQfFBt4plm8iDhM&libraries=places`}
        strategy="beforeInteractive"
      />
      <div className="h-screen w-full">
        <Header
          userInput={searchPlacesByQuery}
          currentLocation={currentLocation}
          onCategorySelect={fetchPlacesByCategory}
          onToggleLocationPreference={handleToggleLocationPreference} // <--- Pass the new handler
          isUsingUserLocation={isUsingUserLocation} // <--- Pass the new state
        />
        <div className="p-6 pt-0">
          <div className="flex w-full md:justify-center md:gap-2 md:bg-rose-200 bg-[url('/images/bg-pic5.jpg')]
            rounded-4xl md:p-0 flex-wrap-reverse md:pr-0 pr-1 p-0 md:h-[89vh] h-[80vh]">
            <div className="md:w-[5%] md:py-4 md:px-1 md:h-full w-full h-[6%] md:flex hidden relative z-20">
              <PlaceIcons onSelectCategory={fetchPlacesByCategory} />
            </div>
            <div className="flex md:justify-center md:flex-nowrap flex-wrap-reverse md:w-[93%] w-full
              md:h-full h-[97%] bg-none md:p-4 p-2 gap-4">
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
                  />
                </div>
              </div>

              <div className="md:w-[55%] w-full md:h-full h-[40%]">
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
          </div>
        </div>
      </div>
    </>
  );
}