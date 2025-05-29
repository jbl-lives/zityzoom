// components/PlaceList.tsx
import React from "react";
import { SearchResult } from "@/hooks/use-places-search"; // adjust path
import PlaceItemCard from "./PlaceItemCard";

interface Place {
  place_id: string;
  name: string;
  // Add other relevant fields as needed
}

interface PlaceListProps {
  placeList: SearchResult[];
  onSelectPlace: (place: SearchResult) => void;
  isLoading: boolean;
  sessionToken?: string;
}

function convertToPlace(result: SearchResult): Place {
  return {
    place_id: result.place_id,
    name: result.name,
    // map any other fields if needed
  };
}


const PlaceList: React.FC<PlaceListProps> = ({
  placeList,
  onSelectPlace,
  isLoading,
  sessionToken,
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <span className="loader"></span>
      </div>
    );
  }

  if (!placeList || placeList.length === 0) {
    return (
      <div className="text-center text-gray-500 p-4">
        No places found.
      </div>
    );
  }

  return (
  <ul className="space-y-4">
    {placeList.map((place) => (
      <li key={place.place_id} onClick={() => onSelectPlace(place)} className="cursor-pointer">
        <PlaceItemCard place={place} />
      </li>
    ))}
  </ul>
);

};

export default PlaceList;
