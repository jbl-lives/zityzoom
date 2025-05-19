"use client";

import { useEffect, useState } from "react";
import PlaceList from "@/components/PlaceList";
import Header from "@/components/Header";
import PlaceIcons from "@/components/PlaceIcons";
import MapPanel from "@/components/MapPanel";
import Script from 'next/script';

export default function Home() {
  const [placeList, setPlaceList] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState<any>(null); // State for selected place
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    // Fetch user location only once on mount
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (err) => {
          console.warn("Could not get location, using default.", err);
          // Optional: set a default fallback location
          setCurrentLocation({
            lat: -26.2041, // Johannesburg
            lng: 28.0473,
          });
        }
      );
    }
  }, []);
  
  // Call API when location becomes available
  useEffect(() => {
    if (currentLocation) {
      fetchPlacesByCategory("Restaurants"); // 🔥 Uses current location automatically inside getPlaceList
    }
  }, [currentLocation]);
  

  const fetchPlacesByCategory = async (category: string) => {
    if (!currentLocation) return;

    const { lat, lng } = currentLocation;

    try {
      const result = await fetch(
        `/api/google-place-api?keyword=${encodeURIComponent(category)}&lat=${lat}&lng=${lng}&locationBias=true`
      );
      const data = await result.json();
      console.log("Category fetch:", data);
      setPlaceList(data.resp?.results || []);
      setSelectedPlace(null);
    } catch (error) {
      console.error("Error fetching category places:", error);
    }
  };

  const searchPlacesByQuery = async (query: string) => {
    try {
      const result = await fetch(
        `/api/google-place-api?keyword=${encodeURIComponent(query)}&locationBias=false` // No lat/lng for general search
      );
      const data = await result.json();
      console.log("Search fetch:", data);
      setPlaceList(data.resp?.results || []);
      setSelectedPlace(null);
    } catch (error) {
      console.error("Error searching places:", error);
    }
  };

  const handlePlaceSelection = (place: any) => {
    setSelectedPlace(place);
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
        onCategorySelect={fetchPlacesByCategory} // New prop
      />
      <div className="p-6  pt-0">
        <div className="flex w-full md:justify-center md:gap-2 md:bg-rose-200 bg-[url('/images/bg-pic5.jpg')]
          rounded-4xl md:p-0 flex-wrap-reverse md:pr-0 pr-1 p-0 md:h-[89vh] h-[80vh]">
                    <div className="md:w-[5%] md:py-4 md:px-1 md:h-full w-full h-[6%] md:flex hidden">
                      <PlaceIcons onSelectCategory={fetchPlacesByCategory} />
                    </div>
                    <div className="flex md:justify-center md:flex-nowrap flex-wrap-reverse md:w-[93%] w-full 
                    md:h-full h-[97%]  bg-none md:p-4 p-2 gap-4  ">
                      <div className="card md:w-[45%] md:rounded-3xl w-full overflow-hidden md:h-full h-[60%] relative py-2 md:bg-none bg-white">
                        <h2 className="text-[20px] w-[80%] font-bold text-gray-700 mb-2 pt-4 px-4 sticky top-0 z-10">
                          Search Results
                        </h2>
                        <div className="overflow-y-scroll h-[calc(100%-60px)] px-1 scrollbar-w-2 scrollbar-track-gray-200 scrollbar-thumb-rose-500 rounded-lg">
                          {placeList.length > 0 && (
                            <PlaceList placeList={placeList} onSelectPlace={handlePlaceSelection} />
                          )}
                        </div>
                      </div>

            <div className="md:w-[55%]  w-full md:h-full h-[40%] ">

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
                selectedPlaceId={selectedPlace?.place_id} // ✅ add this line!
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




