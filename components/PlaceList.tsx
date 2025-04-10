import React, { useState } from 'react';
import PlaceItemCard from './PlaceItemCard';
import Sidedrawer from './Sidedrawer';
import Skeleton from './Skeleton';

function PlaceList({ placeList }: any) {
  const [selectedPlace, setSelectedPlace] = useState<any>([]);

  return (
    <div className="px-[10px] md:px-[120px] mt-7 z-10">
      <h2 className="text-[20px] font-bold">Search Results</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {placeList.map((place: any, index: number) => (
          index <= 7 && (
            <div className="z-10" key={index} onClick={() => setSelectedPlace(place)}>
              <PlaceItemCard place={place} />
            </div>
          )
        ))}
      </div>
      {selectedPlace?.name && (
        <div className="fixed top-0 right-0 z-20">
          <Sidedrawer place={selectedPlace} close={() => setSelectedPlace([])} />
        </div>
      )}
      {placeList?.length === 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {[1, 2, 3, 4, 5, 6, 7].map((item, index) => (
            <Skeleton key={index} /> // Added key prop here
          ))}
        </div>
      )}
    </div>
  );
}

export default PlaceList;