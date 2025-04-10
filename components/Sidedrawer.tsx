import Image from "next/image";
import React from "react";

const BASE_URL_PHOTO =
  "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400";

interface SidedrawerProps {
  place: any; // Replace 'any' with a more specific type if possible
  close: () => void;
}

function Sidedrawer({ place, close }: SidedrawerProps) {

    const onDirectionClick=()=>{
        window.open('https://www.google.com/maps/search/?api=1query='
            +place.name+place.formatted_address)
    }
  return (
    <div className="h-screen w-screen md:w-[400px] bg-white shadow-md p-5 z-20">
      <button onClick={() => close()}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="size-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 18 18 6M6 6l12 12"
          />
        </svg>
      </button>
      <div>
        <h2 className="line-clamp-2 text-[23px] font-semibold mb-3">
          {place?.name}
        </h2>
        {place?.photos && place.photos[0]?.photo_reference && (
          <Image
            src={
              BASE_URL_PHOTO +
              "&photo_reference=" +
              place.photos[0].photo_reference +
              "&key=" +
              process.env.NEXT_PUBLIC_GOOGLE_PLACE_KEY
            }
            alt="placeholder"
            width={400} // Adjust width as needed
            height={170} // Adjust height as needed
            className="w-full h-[170px] object-fill rounded-xl"
            key={place.photos[0].photo_reference} // Add key prop
          />
        )}

        <div className="flex gap-2 mt-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-6 text-rose-600"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
            />
          </svg>

          <h2 className="text-[16px] text-gray-400 line-clamp-2">
            {place?.formatted_address}
          </h2>
        </div>
        <div className="flex gap-2 mt-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-6 text-yellow-500"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"
            />
          </svg>

          <h2 className="text-[16px] text-gray-400 line-clamp-2 tracking-wider flex">
            {place?.rating}(
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
              />
            </svg>
            <span>{place?.user_ratings_total}</span>)
          </h2>
        </div>
        <div className="flex gap-4 mt-3.5">
            <button onClick={()=>onDirectionClick()}>
                Diresction
            </button>

            <button>
                Share
            </button>
        </div>
        <div className="m-3">
          {place?.formatted_address && (
            <iframe
              width="450"
              height="250"
              loading="lazy"
              className=" w-full h-[200px] rounded-lg"
              src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_PLACE_KEY}&q=${encodeURIComponent(
                place.formatted_address
              )}`}
            ></iframe>
          )}
        </div>
      </div>
    </div>
  );
}

export default Sidedrawer;