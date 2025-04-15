import React, { useState } from 'react';
import PlaceItemCard from './PlaceItemCard';
import Sidedrawer from './Sidedrawer';
import Skeleton from './Skeleton';

function PlaceList({ placeList, onSelectPlace }: any) {
    return (
      <div className="flex flex-wrap px-[10px]">
        <h2 className="text-[20px] font-bold text-rose-400 mb-4">Search Results</h2>
        <div className=" w-full gap-4 shrink-0">
          {placeList.map((place: any, index: number) => (
            index <= 7 && (
              <div key={index} onClick={() => onSelectPlace(place)}>
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