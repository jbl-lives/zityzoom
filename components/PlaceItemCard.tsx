import React from 'react';
import Image from 'next/image';
import { UserRound} from 'lucide-react';

const BASE_URL_PHOTO = "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400";

interface PlaceItemCardProps {
    place: {
        name: string;
        vicinity?: string;
        formatted_address?: string;
        rating?: number;
        user_ratings_total?: number;
        photos?: {
            photo_reference: string;
        }[];
        place_id: string;
    };
}

function PlaceItemCard({ place }: PlaceItemCardProps) {
    const photoUrl = place?.photos?.[0]?.photo_reference
        ? `${BASE_URL_PHOTO}&photo_reference=${place.photos[0].photo_reference}&key=${process.env.NEXT_PUBLIC_GOOGLE_PLACE_KEY}`
        : "/placeholder.jpg";

    return (
        <div
            className="flex items-center gap-4 p-4 bg-white rounded-lg shadow hover:bg-gray-100 cursor-pointer"
            key={place.place_id}
        >
            {/* Image */}
            <div className="w-24 h-24 flex-shrink-0 overflow-hidden rounded-md bg-gray-100">
                <Image
                    src={photoUrl}
                    alt="place image"
                    width={100}
                    height={100}
                    className="w-full h-full object-cover"
                />
            </div>

            {/* Text Info */}
            <div className="flex-1 overflow-hidden">
                <h3 className="text-lg font-semibold truncate">{place.name}</h3>
                <p className="text-sm text-gray-600 truncate mt-1">
                    {place.vicinity || place.formatted_address || "Address unavailable"}
                </p>
                {place.rating && (
                    <div className='flex mt-1 w-full gap-4'>
                        <p className="text-sm text-yellow-600 mt-1">
                        ⭐ {place.rating} 
                        </p>
                         <p className='flex items-center text-sm gap-2 mt-1 text-gray-500 '>
                            <UserRound className=' w-4 fill-gray-500' />
                        ({place.user_ratings_total ?? 0} reviews)</p>
                    </div>
                    
                )}
            </div>
        </div>
    );
}

export default PlaceItemCard;
