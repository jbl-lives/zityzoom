import React from 'react';
import { Globe, Phone, Star } from 'lucide-react';

type PlaceInfoWindowProps = {
  placeDetails: google.maps.places.PlaceResult;
  eta: string;
  onCloseClick: () => void;
};

const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text);
  alert('Link copied to clipboard!');
};

const PlaceInfoWindow: React.FC<PlaceInfoWindowProps> = ({ placeDetails, eta, onCloseClick }) => {
  if (!placeDetails) return null;

  const photoUrl = placeDetails.photos?.[0]?.getUrl({ maxWidth: 250, maxHeight: 120 }) || '';
  const name = placeDetails.name || 'Unknown Place';
  const rating = placeDetails.rating || 'N/A';
  const phone = placeDetails.formatted_phone_number || '';
  const website = placeDetails.website || '';
  const lat = placeDetails.geometry?.location?.lat?.();
  const lng = placeDetails.geometry?.location?.lng?.();
  const isOpen = placeDetails.opening_hours?.isOpen() ?? null;
  const types = placeDetails.types || [];

  const mapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name)}&query_place_id=${placeDetails.place_id || ''}`;
  const directionsLink = lat && lng ? `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}` : '#';

  console.log('PlaceInfoWindow links:', { mapsLink, directionsLink, place_id: placeDetails.place_id, lat, lng });
  console.log('Photos array:', placeDetails.photos);
  console.log('Photo URL:', photoUrl);

  return (
    <div className="max-w-[250px] p-3 rounded-lg shadow-lg font-sans text-sm space-y-2 bg-white">
      {photoUrl ? (
        <img
          src={photoUrl}
          alt={name}
          className="w-full h-[100px] object-cover rounded-md"
          crossOrigin="anonymous"
          loading="lazy"
          onError={(e) => console.error('Image failed to load:', photoUrl, e)}
        />
      ) : (
        <div className="w-full h-[100px] bg-gray-200 rounded-md flex items-center justify-center">
          No Photo Available
        </div>
      )}

      <div className="flex justify-between items-center">
        <h4 className="font-semibold text-gray-800 text-base">{name}</h4>
        <div className="flex items-center gap-1 text-yellow-500">
          <Star className="w-4 h-4" />
          <span>{rating}</span>
        </div>
      </div>

      <div className="flex justify-between text-xs">
        <span className="font-bold text-gray-700">ETA: {eta}</span>
        {isOpen !== null && (
          <span className={isOpen ? 'text-green-600' : 'text-red-500'}>
            {isOpen ? 'Open Now ✅' : 'Closed'}
          </span>
        )}
      </div>

      {(phone || website) && (
        <div className="flex justify-between text-xs text-gray-700">
          {phone && (
            <a href={`tel:${phone}`} className="flex items-center gap-1 hover:text-rose-500">
              <Phone className="w-4 h-4" /> {phone}
            </a>
          )}
          {website && (
            <a href={website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-blue-600">
              <Globe className="w-4 h-4" /> Website
            </a>
          )}
        </div>
      )}

      <a
        href={directionsLink}
        target="_blank"
        rel="noopener noreferrer"
        className={`block text-blue-600 underline text-xs ${!lat || !lng ? 'pointer-events-none opacity-50' : ''}`}
      >
        📍 Get Directions
      </a>

      <div className="flex flex-wrap gap-1 mt-1">
        {types.map((t, i) => (
          <span key={i} className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full text-[10px] capitalize">
            {t.replace(/_/g, ' ')}
          </span>
        ))}
      </div>

      <button
        onClick={() => copyToClipboard(mapsLink)}
        className="mt-2 w-full bg-green-600 hover:bg-green-700 text-white py-1 rounded text-xs"
      >
        🔗 Share Place
      </button>

      <button
        onClick={onCloseClick}
        className="mt-2 w-full bg-red-600 hover:bg-red-700 text-white py-1 rounded text-xs"
      >
        Close
      </button>
    </div>
  );
};

export default PlaceInfoWindow;