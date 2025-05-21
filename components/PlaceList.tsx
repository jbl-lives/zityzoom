import React from 'react';
import PlaceItemCard from './PlaceItemCard';
import Skeleton from './Skeleton';

// Add isLoading to Props type
// It's good practice to define an interface for props when using TypeScript
interface PlaceListProps {
  placeList: any[]; // Consider a more specific type if possible
  onSelectPlace: (place: any) => void;
  isLoading: boolean; // New prop
  sessionToken?: string;
}

function PlaceList({ placeList, onSelectPlace, isLoading }: PlaceListProps) {
  const fetchPlaceDetails = (place: any) => {
    // Only attempt if google.maps is loaded
    if (!window.google || !window.google.maps || !window.google.maps.places) {
      console.warn("Google Maps Places API not loaded.");
      onSelectPlace(place); // Fallback to basic data if API not ready
      return;
    }

    const map = new google.maps.Map(document.createElement("div")); // Required dummy map
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
        // Show skeletons when loading
        <div className="w-full gap-4 shrink-0">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => ( // Show 8 skeletons, matching your map limit
            <Skeleton key={item} />
          ))}
        </div>
      ) : placeList.length > 0 ? (
        // Show actual place list when not loading and there are results
        <div className="w-full gap-4 shrink-0">
          {placeList.map((place: any, index: number) => (
            // Limit to 8 items as per your original code
            index <= 7 && (
              <div key={place.place_id || index} onClick={() => fetchPlaceDetails(place)}>
                <PlaceItemCard place={place} />
              </div>
            )
          ))}
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