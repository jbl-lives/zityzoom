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
    getPlaceList("Hotels in Johannesburg");

    // Fetch user location
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
        }
      );
    }
  }, []);

  const getPlaceList = async (value: string) => {
    const result = await fetch("/api/google-place-api?q=" + value);
    const data = await result.json();
    setPlaceList(data.resp.results);
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
      <Header userInput={getPlaceList} />
      <div className="flex w-full bg-slate-200 p-2 pr-4 h-[89vh]">
        <div className="w-[7%] h-full">
          <PlaceIcons onSelectCategory={getPlaceList} />
        </div>
        <div className="flex w-[93%] rounded-3xl h-full bg-white p-4 gap-4">
          <div className="w-[45%] overflow-y-scroll">
            {placeList.length > 0 && (
              <PlaceList placeList={placeList} onSelectPlace={handlePlaceSelection} />
            )}
          </div>
          <div className="w-[55%] h-full bg-red-500">

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
            />
            
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500">
                Loading map...
              </div>
            )}
          </div>

        </div>
      </div>
     
    </div>
    </>
  );
  


}




