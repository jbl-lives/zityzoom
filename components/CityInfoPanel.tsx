// components/CityInfoPanel.tsx
import { useEffect, useState } from 'react';
import { X } from 'lucide-react'; // Import the X icon from lucide-react

interface CityInfoPanelProps {
  cityName: string;
  userCountry: string | null;
  onClose: () => void;
}

const CityInfoPanel: React.FC<CityInfoPanelProps> = ({ cityName, userCountry, onClose }) => {
  const [history, setHistory] = useState<string | null>(null);
  const [thingsToDo, setThingsToDo] = useState<string[]>([]);
  const [cityImageUrl, setCityImageUrl] = useState<string | null>(null); // NEW: State for city image URL

  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [isLoadingThingsToDo, setIsLoadingThingsToDo] = useState(true);
  const [isLoadingImage, setIsLoadingImage] = useState(true); // NEW: Loading state for image

  const [historyError, setHistoryError] = useState<string | null>(null);
  const [thingsToDoError, setThingsToDoError] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null); // NEW: Error state for image

  // Effect for fetching City History (remains largely the same)
  useEffect(() => {
    const fetchCityHistory = async () => {
      setIsLoadingHistory(true);
      setHistory(null);
      setHistoryError(null);

      let url = `/api/city-info/history?city=${encodeURIComponent(cityName)}`;
      if (userCountry) {
        url += `&country=${encodeURIComponent(userCountry)}`;
      }
      console.log("DEBUG: CityInfoPanel - Constructed History API URL:", url);

      try {
        const response = await fetch(url);
        const data = await response.json();

        if (response.ok && data.history) {
          setHistory(data.history);
          setHistoryError(null);
        } else {
          setHistoryError(data.error || `Could not find detailed history for ${cityName}.`);
        }
      } catch (err) {
        console.error("Failed to fetch city history:", err);
        setHistoryError("An unexpected error occurred while fetching history.");
      } finally {
        setIsLoadingHistory(false);
      }
    };

    if (cityName) {
      fetchCityHistory();
    }
  }, [cityName, userCountry]);

  // Effect for fetching "Things to Do" (remains largely the same)
  useEffect(() => {
    const fetchThingsToDo = async () => {
      setIsLoadingThingsToDo(true);
      setThingsToDo([]);
      setThingsToDoError(null);

      let url = `/api/city-info/things-to-do?city=${encodeURIComponent(cityName)}`;
      if (userCountry) {
        url += `&country=${encodeURIComponent(userCountry)}`;
      }
      console.log("DEBUG: CityInfoPanel - Constructed Things To Do API URL:", url);

      try {
        const response = await fetch(url);
        const data = await response.json();

        if (response.ok && data.activities && Array.isArray(data.activities)) {
          setThingsToDo(data.activities);
          setThingsToDoError(null);
        } else {
          setThingsToDoError(data.error || `No interesting activities found for ${cityName}.`);
        }
      } catch (err) {
        console.error("Failed to fetch things to do:", err);
        setThingsToDoError("An unexpected error occurred while fetching activities.");
      } finally {
        setIsLoadingThingsToDo(false);
      }
    };

    if (cityName) {
      fetchThingsToDo();
    }
  }, [cityName, userCountry]);

  // NEW useEffect: Fetching City Image from Wikipedia via API route
  useEffect(() => {
    const fetchCityImage = async () => {
      setIsLoadingImage(true);
      setCityImageUrl(null);
      setImageError(null);

      if (!cityName) {
        setIsLoadingImage(false);
        return;
      }

      let url = `/api/city-info/image?city=${encodeURIComponent(cityName)}`;
      if (userCountry) {
        url += `&country=${encodeURIComponent(userCountry)}`;
      }
      console.log("DEBUG: CityInfoPanel - Constructed Image API URL:", url);

      try {
        const response = await fetch(url);
        const data = await response.json();

        if (response.ok && data.imageUrl) {
          setCityImageUrl(data.imageUrl);
          setImageError(null);
        } else {
          setImageError(data.error || "Could not load city image.");
          // Fallback to a default image if dynamic fetch fails
          setCityImageUrl("/city-icon.png"); // Ensure you have a default image
        }
      } catch (err) {
        console.error("Failed to fetch city image:", err);
        setImageError("An unexpected error occurred while fetching city image.");
        setCityImageUrl("/city-icon.png"); // Fallback on error
      } finally {
        setIsLoadingImage(false);
      }
    };

    fetchCityImage();
  }, [cityName, userCountry]); // Re-fetch image when city or country changes

  return (
    <div className="relative w-full h-full bg-white rounded-3xl p-6 shadow-xl flex flex-col items-center overflow-auto scrollbar-w-2 scrollbar-track-gray-200 scrollbar-thumb-rose-500">
      <div className='flex w-full p-6 gap-16 mb-4 flex-col md:flex-row'>
        {/* City Image Section */}
        <div className=" md:w-90 h-60 border-1 border-gray-600 rounded-2xl shadow-lg overflow-hidden flex-shrink-0">
          {isLoadingImage ? (
            <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-500">
              <span className="loader"></span> {/* Your loading spinner */}
              <p className="ml-2">Loading image...</p>
            </div>
          ) : cityImageUrl ? (
            <img
              src={cityImageUrl}
              alt={`${cityName} City`}
              className="w-full h-full object-cover"
              loading="lazy"
              onError={(e) => {
                // Fallback to a default image if the fetched URL fails to load
                e.currentTarget.src = "/city-icon.webp";
                e.currentTarget.onerror = null; // Prevent infinite loop if fallback also fails
                console.error("Failed to load dynamic city image, falling back to default.");
                setImageError("Image failed to load, showing default.");
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-500">
              <p>{imageError || "No image available"}</p>
            </div>
          )}
        </div>

        <div className="flex-1">
          <h2 className="text-5xl text-rose-600 mb-6 font-caveat">Welcome To {cityName}</h2>
          {isLoadingHistory && (
            <div className="flex items-center justify-center flex-grow text-gray-500">
              <span className="loader"></span>
              <p className="ml-2">Loading history...</p>
            </div>
          )}
          {historyError && !isLoadingHistory && (
            <p className="text-red-500 text-lg flex-grow flex items-center justify-center">{historyError}</p>
          )}

          {history && !isLoadingHistory && (
            <p className="text-gray-800 font-semibold text-base leading-relaxed flex-grow text-left">
              {history}
            </p>
          )}
        </div>
      </div>

      {/* Section: Interesting Things To Do */}
      <div className="w-full p-6 mt-4 border-t border-gray-200 pt-6">
        <h3 className="text-3xl text-rose-600 mb-4 font-caveat">Things To Do</h3>
        {isLoadingThingsToDo ? (
          <div className="flex items-center justify-center text-gray-500">
            <span className="loader"></span>
            <p className="ml-2">Finding activities...</p>
          </div>
        ) : thingsToDoError ? (
          <p className="text-red-500 text-lg">{thingsToDoError}</p>
        ) : thingsToDo.length > 0 ? (
          <ul className="list-disc list-inside text-gray-800 text-base leading-relaxed space-y-2">
            {thingsToDo.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No specific activities listed for {cityName} yet.</p>
        )}
      </div>

      <button
        onClick={onClose}
        className="absolute right-10 top-0 mt-8 cursor-pointer text-gray-800 font-semibold hover:text-red-700 transition-colors duration-200"
      >
        <X />
      </button>
    </div>
  );
};

export default CityInfoPanel;