// components/PlaceList.tsx
import React from 'react';
import PlaceItemCard from './PlaceItemCard';
import Skeleton from './Skeleton';

// It's good practice to define an interface for props when using TypeScript
interface PlaceListProps {
  placeList: any[]; // Consider a more specific type if possible (e.g., google.maps.places.PlaceResult[])
  onSelectPlace: (place: any) => void;
  isLoading: boolean; // For initial loading of the list
  sessionToken?: string;
  onLoadMore: () => void; // New prop: function to call to load more results
  hasNextPage: boolean; // New prop: boolean indicating if more pages are available
  isMoreLoading: boolean; // New prop: loading state specifically for "Load More"
}

function PlaceList({ 
  placeList, 
  onSelectPlace, 
  isLoading, 
  onLoadMore, 
  hasNextPage, 
  isMoreLoading // Destructure new prop
}: PlaceListProps) {
  const fetchPlaceDetails = (place: any) => {
    // Only attempt if google.maps is loaded
    if (!window.google || !window.google.maps || !window.google.maps.places) {
      console.warn("Google Maps Places API not loaded.");
      onSelectPlace(place); // Fallback to basic data if API not ready
      return;
    }

    // Creating a dummy map for PlacesService is a common pattern for server-side or non-map-bound calls
    // However, if you already have a map instance in a parent component, you might pass that instead.
    const map = new google.maps.Map(document.createElement("div")); // Required dummy map for PlacesService
    const service = new google.maps.places.PlacesService(map);

    service.getDetails({ placeId: place.place_id }, (details, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK && details) {
        onSelectPlace(details); // Send detailed place back
      } else {
        console.warn("Failed to get place details", status);
        onSelectPlace(place); // Fallback to basic data
      }
    });
  };

  return (
    <div className="flex flex-wrap px-[10px]">

      {/* Conditional Rendering based on loading state */}
      {isLoading ? (
        // Show skeletons when initial loading
        <div className="w-full gap-4 shrink-0">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => ( // Show 8 skeletons, matching your map limit
            <Skeleton key={item} />
          ))}
        </div>
      ) : placeList.length > 0 ? (
        // Show actual place list when not loading and there are results
        <div className="w-full gap-4 shrink-0">
          {placeList.map((place: any, index: number) => (
            // Display all items loaded from the API
            <div key={place.place_id || index} onClick={() => fetchPlaceDetails(place)}>
              <PlaceItemCard place={place} />
            </div>
          ))}

          {/* Load More Button */}
          {hasNextPage && (
            <div className="w-full text-center mt-4 mb-8">
              <button
                onClick={onLoadMore}
                disabled={isMoreLoading} // Disable button when loading more
                className={`px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors duration-200 ${isMoreLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isMoreLoading ? 'Loading More...' : 'Load More Results'}
              </button>
            </div>
          )}
        </div>
      ) : (
        // Show "no results" message when not loading and placeList is empty
        <p className="text-gray-500 text-center w-full mt-4">
          Sorry, no places found for your search.
        </p>
      )}
    </div>
  );
}

export default PlaceList;