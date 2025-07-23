// zittyzoom/app/hooks/use-location.ts
import { useState, useEffect, useRef, useCallback } from "react";

// Define the type for location data that includes city and country
export interface LocationData {
  lat: number;
  lng: number;
  city: string | null;
  country: string | null;
}

// Default fallback location
const defaultFallbackLocation: LocationData = { lat: -26.2041, lng: 28.0473, city: "Johannesburg", country: "South Africa" };

export const useLocation = () => {
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [isUsingUserLocation, setIsUsingUserLocation] = useState(true); // Default to using user's detected location
  const [searchError, setSearchError] = useState<string | null>(null); // For location-specific errors
  const [userCountry, setUserCountry] = useState<string | null>(null); // For weather component
  const userDetectedLocationRef = useRef<LocationData | null>(null); // To store the initially detected user location

  // Helper function to fetch city/country for a given location
  const fetchCityAndCountryForLocation = useCallback(async (
    location: { lat: number; lng: number }
  ): Promise<{ city: string | null; country: string | null }> => {
    try {
      const response = await fetch(`/api/reverse-geocode?lat=${location.lat}&lng=${location.lng}`);
      const data = await response.json();
      console.log("fetchCityAndCountryForLocation: API response =", data);

      if (response.ok && data.city && data.country) {
        return { city: data.city, country: data.country };
      } else {
        console.warn("Failed to reverse geocode location:", data.error || "No city/country in response");
        return { city: null, country: "South Africa" }; // Fallback country
      }
    } catch (err) {
      console.error("Error reverse geocoding location:", err);
      return { city: null, country: "South Africa" }; // Fallback country
    }
  }, []);

  // Effect to get user's initial location
  useEffect(() => {
    const getUserLocationAndCountry = async () => {
    let tempDetectedLoc: LocationData | null = null;

    if (navigator.geolocation) {
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
          });
        });
        const basicLoc = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        const { city, country } = await fetchCityAndCountryForLocation(basicLoc);
        tempDetectedLoc = { ...basicLoc, city, country: country || "South Africa" };
        console.log("getUserLocationAndCountry: Setting tempDetectedLoc =", tempDetectedLoc);

        userDetectedLocationRef.current = tempDetectedLoc;
        setCurrentLocation(tempDetectedLoc);
        setUserCountry(country || "South Africa"); // Ensure userCountry is set
        setSearchError(null);
      } catch (err) {
        console.warn("Could not get location, using default.", err);
        tempDetectedLoc = defaultFallbackLocation;
        userDetectedLocationRef.current = null;
        setCurrentLocation(defaultFallbackLocation);
        setIsUsingUserLocation(false);
        setSearchError("Could not retrieve your location. Using a default location.");
        setUserCountry(defaultFallbackLocation.country);
      }
    } else {
      setSearchError("Geolocation is not supported by your browser. Using a default location.");
      tempDetectedLoc = defaultFallbackLocation;
      setCurrentLocation(defaultFallbackLocation);
      setIsUsingUserLocation(false);
      setUserCountry(defaultFallbackLocation.country);
    }
  };

    getUserLocationAndCountry();
  }, [fetchCityAndCountryForLocation]); // Dependency on fetchCityAndCountryForLocation for useCallback

  // Function to toggle location preference
  const handleToggleLocationPreference = useCallback(() => {
    setIsUsingUserLocation(prev => {
      const newState = !prev;
      if (newState && userDetectedLocationRef.current) {
        setCurrentLocation(userDetectedLocationRef.current);
        setSearchError(null);
        setUserCountry(userDetectedLocationRef.current.country);
      } else {
        setCurrentLocation(defaultFallbackLocation);
        setSearchError("Using default location. Toggle to use your current location if detected.");
        setUserCountry(defaultFallbackLocation.country);
      }
      return newState;
    });
  }, []);

  return {
    currentLocation,
    userDetectedLocationRef,
    isUsingUserLocation,
    setIsUsingUserLocation,
    searchError, // Location-specific error
    setSearchError,
    fetchCityAndCountryForLocation,
    handleToggleLocationPreference,
    userCountry,
    setUserCountry,
    defaultFallbackLocation, // Expose default for external use if needed
  };
};
