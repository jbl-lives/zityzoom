import React from 'react';
import Image from 'next/image';

const BASE_URL_PHOTO = "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400";

interface PlaceItemCardProps {
    place: any; // Replace 'any' with a more specific type if possible
}

function PlaceItemCard({ place }: PlaceItemCardProps) {
    return (
        <div className='flex h-[130px] justify-center  items-center gap-3 w-[100%] 
        shrink p-2 z-10 rounded-xl shadow-xl/20 bg-white cursor-pointer hover:translate-x-2 transition-all duration-75'>
            <div className="w-[30%] h-[90%]">
                <Image
                    src={
                    place?.photos && place.photos[0]?.photo_reference
                        ? `${BASE_URL_PHOTO}&photo_reference=${place.photos[0].photo_reference}&key=${process.env.NEXT_PUBLIC_GOOGLE_PLACE_KEY}`
                        : "/placeholder.jpg"
                    }
                    alt="place image"
                    width={170}
                    height={100}
                    className="w-[170px] h-full flex-shrink-0 object-cover rounded-xl"
                    key={place?.photos?.[0]?.photo_reference || place?.place_id}
                />
            </div>
            
            <div className='p-2 w-[70%] '>
                <h2 className='line-clamp-2 font-semibold truncate'>{place?.name}</h2>
                <div className='flex gap-2 mt-1.5 items-start'>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none"
                        viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"
                        className="w-5 h-5 flex-shrink-0 text-rose-600">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                    </svg>

                    <h2 className='text-[0.84rem] text-gray-600 line-clamp-2'>{place?.formatted_address}</h2>
                </div>

                <div className='flex gap-2 mt-2'>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" 
                    className="w-5 h-5 flex-shrink-0 text-yellow-500">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
                    </svg>
                    <h2 className=' text-[0.85rem] text-gray-400 line-clamp-2 tracking-wider flex'>
                        {place?.rating}
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" 
                        className="w-5 h-5 flex-shrink-0 ml-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                        </svg>
                        <span>{place?.user_ratings_total}</span>
                    </h2>
                </div>
            </div>
        </div>
    );
}

export default PlaceItemCard;