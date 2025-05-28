// app/hooks/use-location.ts
import { useState, useEffect, useRef, useCallback } from "react";

export interface LocationData {
  city: string | null;
  country: string | null;
  lat: number | null;
  lng: number | null;
}

interface UseLocationResult {
  currentLocation: LocationData | null;
  isUsingUserLocation: boolean;
  searchError: string | null;
  handleToggleLocationPreference: () => void;
  isLoadingLocation: boolean;
}

export const useLocation = (): UseLocationResult => {
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [isUsingUserLocation, setIsUsingUserLocation] = useState(true);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true); // New state for location loading

  const userDetectedLocationRef = useRef<LocationData | null>(null);
  // Default fallback location for Johannesburg
  const defaultFallbackLocation: LocationData = { city: "Johannesburg", country: "South Africa", lat: -26.2041, lng: 28.0473 };

  // Helper function to fetch country and city for a given location
  const fetchCountryAndCityForLocation = useCallback(async (location: { lat: number; lng: number }) => {
    try {
      const response = await fetch(`/api/reverse-geocode?lat=${location.lat}&lng=${location.lng}`);
      const data = await response.json();
      if (response.ok && data.country && data.city) {
        return {
          lat: location.lat,
          lng: location.lng,
          country: data.country,
          city: data.city,
        };
      } else {
        console.error("Failed to update location with country/city:", data.error);
        return {
          lat: location.lat,
          lng: location.lng,
          country: null,
          city: null,
        };
      }
    } catch (err) {
      console.error("Error updating location with country/city:", err);
      return {
        lat: location.lat,
        lng: location.lng,
        country: null,
        city: null,
      };
    }
  }, []); // No dependencies, as it's a pure geocoding function

  // Effect to get user's initial location and country
  useEffect(() => {
    const getUserLocationAndCountry = async () => {
      setIsLoadingLocation(true);
      let detectedLoc: LocationData | null = null;

      if (navigator.geolocation) {
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 0
            });
          });
          detectedLoc = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            city: null, // Will be filled by reverse geocoding
            country: null, // Will be filled by reverse geocoding
          };
          userDetectedLocationRef.current = { ...detectedLoc }; // Store the initially detected lat/lng
          setIsUsingUserLocation(true);
          setSearchError(null);
        } catch (err) {
          console.warn("Could not get user location, falling back to default.", err);
          detectedLoc = { ...defaultFallbackLocation };
          userDetectedLocationRef.current = null;
          setIsUsingUserLocation(false);
          setSearchError("Could not retrieve your location. Using a default location.");
        }
      } else {
        setSearchError("Geolocation is not supported by your browser. Using a default location.");
        detectedLoc = { ...defaultFallbackLocation };
        setIsUsingUserLocation(false);
      }

      // Now, reverse geocode to get the country and city for the determined location
      if (detectedLoc && detectedLoc.lat !== null && detectedLoc.lng !== null) {
        const fullLocationData = await fetchCountryAndCityForLocation({ lat: detectedLoc.lat, lng: detectedLoc.lng });
        setCurrentLocation(fullLocationData);
        // If user location was successfully detected, update the ref with full data
        if (userDetectedLocationRef.current && detectedLoc.lat === userDetectedLocationRef.current.lat && detectedLoc.lng === userDetectedLocationRef.current.lng) {
          userDetectedLocationRef.current = fullLocationData;
        }
      } else {
        // Fallback to default if no valid lat/lng even from detectedLoc
        setCurrentLocation(defaultFallbackLocation);
      }
      setIsLoadingLocation(false);
    };

    if (currentLocation === null) { // Ensures it runs only once on initial mount
      getUserLocationAndCountry();
    }
  }, [fetchCountryAndCityForLocation, currentLocation]); // Dependency on currentLocation ensures it runs only once on mount


  // Function to toggle location preference
  const handleToggleLocationPreference = useCallback(async () => {
    setIsUsingUserLocation(prev => {
      const newState = !prev;
      setIsLoadingLocation(true); // Start loading state for location toggle
      if (newState && userDetectedLocationRef.current && userDetectedLocationRef.current.lat !== null && userDetectedLocationRef.current.lng !== null) {
        // If switching to user location and detected location is available
        fetchCountryAndCityForLocation({ lat: userDetectedLocationRef.current.lat, lng: userDetectedLocationRef.current.lng })
          .then(fullLocationData => {
            setCurrentLocation(fullLocationData);
            setSearchError(null);
          })
          .catch(error => {
            console.error("Error toggling to user location:", error);
            setSearchError("Failed to switch to your current location.");
            setCurrentLocation(defaultFallbackLocation); // Fallback on error
            setIsUsingUserLocation(false); // Revert toggle if failed
          })
          .finally(() => setIsLoadingLocation(false));
      } else {
        // If switching to default location or user location not detected
        setCurrentLocation(defaultFallbackLocation);
        setSearchError("Using default location. Toggle to use your current location if detected.");
        setIsLoadingLocation(false);
      }
      return newState;
    });
  }, [fetchCountryAndCityForLocation, defaultFallbackLocation]);


  return {
    currentLocation,
    isUsingUserLocation,
    searchError,
    handleToggleLocationPreference,
    isLoadingLocation,
  };
};