import React from 'react';
import PlaceItemCard from './PlaceItemCard';
import Skeleton from './Skeleton';

function PlaceList({ placeList, onSelectPlace }: any) {
  const fetchPlaceDetails = (place: any) => {
    if (!window.google) return;

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
    <div className="flex flex-wrap px-[10px] ">
      <h2 className="text-[20px] font-bold text-rose-400 mb-2 pt-4">Search Results</h2>
      <div className="w-full gap-4 shrink-0">
        {placeList.map((place: any, index: number) => (
          index <= 7 && (
            <div key={index} onClick={() => fetchPlaceDetails(place)}>
              <PlaceItemCard place={place} />
            </div>
          )
        ))}
      </div>

      {placeList?.length === 0 && (
        <div className="flex flex-wrap px-[10px]">
          {[1, 2, 3, 4, 5, 6, 7].map((item, index) => (
            <Skeleton key={index} />
          ))}
        </div>
      )}
    </div>
  );
}

export default PlaceList;
