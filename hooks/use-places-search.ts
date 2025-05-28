// zittyzoom/app/hooks/use-places-search.ts
import { useState, useEffect, useCallback } from 'react';
import { LocationData } from './use-location'; // Import LocationData from use-location
import { v4 as uuidv4 } from 'uuid';

interface SearchResult {
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
    // Add other properties you expect from your Google Places API responses
}

// Define the type for the search center, if you decide to expose it
interface SearchCenter {
    lat: number;
    lng: number;
}

interface UsePlacesSearchResult {
    placeList: SearchResult[];
    selectedPlace: SearchResult | null;
    isLoading: boolean;
    searchError: string | null;
    currentSessionToken: string | undefined;
    activeCategory: string | null;
    searchPlacesByQuery: (query: string, sessionTokenFromSearch?: string, searchLat?: number | null, searchLng?: number | null) => Promise<void>;
    handlePlaceSelection: (place: SearchResult | null) => void;
    handleCategorySelect: (categoryKeyword: string, currentLocation: LocationData | null) => Promise<void>;
    setActiveCategory: React.Dispatch<React.SetStateAction<string | null>>;
    currentSearchQuery: string | null;
    searchCenterLocation: SearchCenter | null; // <--- ADDED THIS LINE
}

export const usePlacesSearch = (): UsePlacesSearchResult => {
    const [placeList, setPlaceList] = useState<SearchResult[]>([]);
    const [selectedPlace, setSelectedPlace] = useState<SearchResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [searchError, setSearchError] = useState<string | null>(null);
    const [currentSessionToken, setCurrentSessionToken] = useState<string | undefined>(undefined);
    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const [currentSearchQuery, setCurrentSearchQuery] = useState<string | null>(null);
    const [searchCenterLocation, setSearchCenterLocation] = useState<SearchCenter | null>(null); // <--- NEW STATE

    const searchPlacesByQuery = useCallback(async (query: string, sessionTokenFromSearch?: string, searchLat?: number | null, searchLng?: number | null) => {
        if (!query.trim()) {
            setPlaceList([]);
            setSearchError(null);
            setIsLoading(false);
            setCurrentSessionToken(undefined);
            setCurrentSearchQuery(null);
            setSearchCenterLocation(null); // <--- Clear search center too
            return;
        }

        setIsLoading(true);
        setSearchError(null);
        setPlaceList([]); // Clear previous results
        setCurrentSessionToken(sessionTokenFromSearch);
        setCurrentSearchQuery(query);

        // Prioritize explicit searchLat/Lng for the center, otherwise use previous searchCenter or user's current location
        const effectiveSearchLat = searchLat !== null && searchLat !== undefined ? searchLat : (searchCenterLocation?.lat || null);
        const effectiveSearchLng = searchLng !== null && searchLng !== undefined ? searchLng : (searchCenterLocation?.lng || null);


        try {
            if (effectiveSearchLat === null || effectiveSearchLng === null) {
                console.warn("No effective location for search.");
                setSearchError("Cannot perform search: location not available.");
                setIsLoading(false);
                return;
            }

            let url = `/api/google-place-api?keyword=${encodeURIComponent(query)}&type=textsearch`;
            url += `&lat=${effectiveSearchLat}&lng=${effectiveSearchLng}`; // Use effective search location

            const result = await fetch(url);
            const data = await result.json();
            console.log("Search fetch result:", data);

            if (result.ok && data.resp && data.resp.results) {
                setPlaceList(data.resp.results);
                if (data.resp.results.length === 0) {
                    setSearchError(`No places found for '${query}'.`);
                    setSearchCenterLocation(null); // No results, clear center
                } else {
                    // <--- IMPORTANT: Set the map center to the location of the first result
                    // or to the lat/lng used for the search if available
                    setSearchCenterLocation(data.resp.results[0].geometry.location || { lat: effectiveSearchLat, lng: effectiveSearchLng });
                }
            } else if (data.error) {
                setSearchError(`Error: ${data.error}`);
                setPlaceList([]);
                setSearchCenterLocation(null); // Clear center on error
            } else {
                setSearchError("Failed to search places. Please try again.");
                setPlaceList([]);
                setSearchCenterLocation(null); // Clear center on generic failure
            }
        } catch (error) {
            console.error("Error searching places:", error);
            setSearchError("An unexpected error occurred during search.");
            setPlaceList([]);
            setSearchCenterLocation(null); // Clear center on exception
        } finally {
            setIsLoading(false);
        }
    }, [searchCenterLocation]); // Add searchCenterLocation to dependencies if effectiveSearchLat/Lng uses it.

    const handlePlaceSelection = useCallback((place: SearchResult | null) => {
        setSelectedPlace(place);
        setCurrentSessionToken(undefined); // Clear session token after selection
        // When a place is selected, the map should center on it,
        // so we can also update searchCenterLocation to match for consistency.
        if (place) {
            setSearchCenterLocation(place.geometry.location);
        }
    }, []);

    const handleCategorySelect = useCallback(async (categoryKeyword: string, currentLocation: LocationData | null) => {
        setCurrentSearchQuery(null); // Clear any active text search when a category is selected

        if (activeCategory === categoryKeyword) {
            setActiveCategory(null); // Deselect if same category clicked again
            // When category is deselected, search for a default like "Restaurants"
            if (currentLocation && currentLocation.lat !== null && currentLocation.lng !== null) {
                await searchPlacesByQuery("Restaurants", undefined, currentLocation.lat, currentLocation.lng);
            }
        } else {
            setActiveCategory(categoryKeyword); // Set the new active category
            if (!currentLocation || currentLocation.lat === null || currentLocation.lng === null) {
                console.warn("Current location not available, cannot fetch categories.");
                setSearchError("Location not available to fetch categories. Please allow location access.");
                return;
            }
            await searchPlacesByQuery(categoryKeyword, undefined, currentLocation.lat, currentLocation.lng);
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
        searchCenterLocation, // <--- RETURN THE NEW STATE
    };
};