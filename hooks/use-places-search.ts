// zittyzoom/app/hooks/use-places-search.ts
import { useState, useEffect, useCallback } from 'react';
import { LocationData } from '@/hooks/use-location'; // Corrected import path for LocationData. Ensure this path is correct.
// import { v4 as uuidv4 } from 'uuid'; // Removed, as it doesn't seem to be used in this specific hook

// Ensure these interfaces are exported so other files (like MapPanel) can import them
export interface SearchResult {
    place_id: string;
    name: string;
    vicinity: string;
    geometry: {
        location: {
            lat: number;
            lng: number;
        };
    };
    photos?: Array<{
        photo_reference: string;
        width: number;
        height: number;
    }>;
    rating?: number;
    user_ratings_total?: number;
    price_level?: number;
    types?: string[]; // Added types for MapPanel
    // Add other potential properties from Places API if needed for InfoWindow
    formatted_address?: string; // Often available, useful for InfoWindow
    formatted_phone_number?: string; // Useful for InfoWindow
    opening_hours?: { // Useful for InfoWindow
        open_now: boolean;
        weekday_text: string[];
    };
    url?: string; // For sharing
}

// Define the type for the search center, ensuring it's exported
export interface SearchCenter {
    lat: number;
    lng: number;
}

interface UsePlacesSearchResult {
    placeList: SearchResult[];
    selectedPlace: SearchResult | null;
    isLoading: boolean;
    searchError: string | null;
    currentSessionToken: string | undefined; // Not strictly used for Maps, but good to keep if needed elsewhere
    activeCategory: string | null;
    searchPlacesByQuery: (query: string, sessionTokenFromSearch?: string, searchLat?: number | null, searchLng?: number | null) => Promise<void>;
    handlePlaceSelection: (place: SearchResult | null) => void;
    handleCategorySelect: (categoryKeyword: string, currentLocation: LocationData | null) => Promise<void>;
    setActiveCategory: React.Dispatch<React.SetStateAction<string | null>>;
    currentSearchQuery: string | null;
    searchCenterLocation: SearchCenter | null; // This will be the mapCenter for MapPanel
}

export const usePlacesSearch = (): UsePlacesSearchResult => {
    const [placeList, setPlaceList] = useState<SearchResult[]>([]);
    const [selectedPlace, setSelectedPlace] = useState<SearchResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [searchError, setSearchError] = useState<string | null>(null);
    const [currentSessionToken, setCurrentSessionToken] = useState<string | undefined>(undefined);
    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const [currentSearchQuery, setCurrentSearchQuery] = useState<string | null>(null);
    const [searchCenterLocation, setSearchCenterLocation] = useState<SearchCenter | null>(null);

    const searchPlacesByQuery = useCallback(async (query: string, sessionTokenFromSearch?: string, searchLat?: number | null, searchLng?: number | null) => {
        if (!query.trim()) {
            setPlaceList([]);
            setSearchError(null);
            setIsLoading(false);
            setCurrentSessionToken(undefined);
            setCurrentSearchQuery(null);
            setSearchCenterLocation(null); // Clear map center if query is empty
            return;
        }

        setIsLoading(true);
        setSearchError(null);
        setPlaceList([]); // Clear previous results
        setCurrentSessionToken(sessionTokenFromSearch);
        setCurrentSearchQuery(query);

        // Determine the effective center for the API call
        // Prioritize explicit searchLat/Lng, then current searchCenterLocation, then fall back to null
        const effectiveSearchLat = searchLat !== null && searchLat !== undefined ? searchLat : (searchCenterLocation?.lat || null);
        const effectiveSearchLng = searchLng !== null && searchLng !== undefined ? searchLng : (searchCenterLocation?.lng || null);

        if (effectiveSearchLat === null || effectiveSearchLng === null) {
            console.warn("No effective location for search.");
            setSearchError("Cannot perform search: location not available.");
            setIsLoading(false);
            return;
        }
        
        // Update searchCenterLocation here to reflect the coordinates being used for the API call
        // This ensures MapPanel receives the correct mapCenter based on the current search
        setSearchCenterLocation({ lat: effectiveSearchLat, lng: effectiveSearchLng });


        try {
            let url = `/api/google-place-api?keyword=${encodeURIComponent(query)}&type=textsearch`;
            url += `&lat=${effectiveSearchLat}&lng=${effectiveSearchLng}`; // Use effective search location

            const result = await fetch(url);
            const data = await result.json();
            console.log("Search fetch result:", data);

            if (result.ok && data.resp && data.resp.results) {
                // Filter out results that don't have a location before setting
                const validResults = data.resp.results.filter((place: any) => 
                    place.geometry && place.geometry.location && 
                    (typeof place.geometry.location.lat === 'function' ? place.geometry.location.lat() !== undefined : place.geometry.location.lat !== undefined) &&
                    (typeof place.geometry.location.lng === 'function' ? place.geometry.location.lng() !== undefined : place.geometry.location.lng !== undefined)
                ).map((place: any) => ({
                    place_id: place.place_id,
                    name: place.name,
                    vicinity: place.vicinity || place.formatted_address || '', // Use vicinity or formatted_address
                    geometry: {
                        location: {
                            // Handle cases where lat/lng might be functions (Google Maps object behavior)
                            lat: typeof place.geometry.location.lat === 'function' ? place.geometry.location.lat() : place.geometry.location.lat,
                            lng: typeof place.geometry.location.lng === 'function' ? place.geometry.location.lng() : place.geometry.location.lng,
                        },
                    },
                    photos: place.photos?.map((photo: any) => ({
                        photo_reference: photo.photo_reference,
                        width: photo.width,
                        height: photo.height,
                    })),
                    rating: place.rating,
                    user_ratings_total: place.user_ratings_total,
                    price_level: place.price_level,
                    types: place.types || [],
                    formatted_address: place.formatted_address,
                    formatted_phone_number: place.formatted_phone_number,
                    opening_hours: place.opening_hours,
                    url: place.url,
                }));
                
                setPlaceList(validResults);

                if (validResults.length === 0) {
                    setSearchError(`No places found for '${query}'.`);
                    // If no valid results, the searchCenterLocation remains at the effective search location used
                }
                // No need to set searchCenterLocation here again as it's already set before the fetch
            } else if (data.error) {
                setSearchError(`Error: ${data.error}`);
                setPlaceList([]);
                // If error, searchCenterLocation remains at the effective search location used
            } else {
                setSearchError("Failed to search places. Please try again.");
                setPlaceList([]);
                // If no data/unknown error, searchCenterLocation remains at the effective search location used
            }
        } catch (error) {
            console.error("Error searching places:", error);
            setSearchError("An unexpected error occurred during search.");
            setPlaceList([]);
            // If error, searchCenterLocation remains at the effective search location used
        } finally {
            setIsLoading(false);
        }
    }, [searchCenterLocation]); // Dependency on searchCenterLocation is important for determining effectiveSearchLat/Lng

    const handlePlaceSelection = useCallback((place: SearchResult | null) => {
        setSelectedPlace(place);
        setCurrentSessionToken(undefined); // Clear session token after selection
        // When a place is selected, update searchCenterLocation to center the map on it
        if (place) {
            const selectedLoc = place.geometry.location;
            setSearchCenterLocation({
                lat: selectedLoc.lat,
                lng: selectedLoc.lng,
            });
        }
    }, []);

    const handleCategorySelect = useCallback(async (categoryKeyword: string, currentLocation: LocationData | null) => {
        setCurrentSearchQuery(null); // Clear any active text search when a category is selected

        // Always ensure we have a location to search from when a category is selected
        if (!currentLocation || currentLocation.lat === null || currentLocation.lng === null) {
            console.warn("Current location not available, cannot fetch categories.");
            setSearchError("Location not available to fetch categories. Please allow location access.");
            return;
        }

        if (activeCategory === categoryKeyword) {
            setActiveCategory(null); // Deselect if same category clicked again
            // When category is deselected, default back to 'Restaurants' around the user's current location
            await searchPlacesByQuery("Restaurants", undefined, currentLocation.lat, currentLocation.lat); // Pass user's current location directly
        } else {
            setActiveCategory(categoryKeyword); // Set the new active category
            await searchPlacesByQuery(categoryKeyword, undefined, currentLocation.lat, currentLocation.lng); // Pass user's current location directly
        }
    }, [activeCategory, searchPlacesByQuery]);

    return {
        placeList,
        selectedPlace,
        isLoading,
        searchError,
        currentSessionToken,
        activeCategory,
        searchPlacesByQuery,
        handlePlaceSelection,
        handleCategorySelect,
        setActiveCategory,
        currentSearchQuery,
        searchCenterLocation, // This is the mapCenter for MapPanel
    };
};