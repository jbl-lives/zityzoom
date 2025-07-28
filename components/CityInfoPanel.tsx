// components/CityInfoPanel.tsx
import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

interface Activity {
  name: string;
  image: string;
  openNow?: boolean;
  hours?: string;
}

interface CityInfoPanelProps {
  cityName: string;
  userCountry: string | null;
  onClose: () => void;
}

const CityInfoPanel: React.FC<CityInfoPanelProps> = ({ cityName, userCountry, onClose }) => {
  const [history, setHistory] = useState<string | null>(null);
  const [thingsToDo, setThingsToDo] = useState<Activity[]>([]);
  const [cityImageUrl, setCityImageUrl] = useState<string | null>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [isLoadingThingsToDo, setIsLoadingThingsToDo] = useState(true);
  const [isLoadingImage, setIsLoadingImage] = useState(true);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [thingsToDoError, setThingsToDoError] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const isFeatureEnabled = true; // Set to false to disable things-to-do

  // Fetch City History
  useEffect(() => {
    const fetchCityHistory = async () => {
      setIsLoadingHistory(true);
      setHistory(null);
      setHistoryError(null);

      let url = `/api/city-info/history?city=${encodeURIComponent(cityName)}`;
      if (userCountry !== null) {
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

  // Fetch Things to Do
  useEffect(() => {
    if (!isFeatureEnabled) {
      setThingsToDo([
        { name: "City Museum", image: "/city-icon.webp", hours: "9 AM - 5 PM" },
        { name: "Botanical Garden", image: "/city-icon.webp", hours: "8 AM - 6 PM" },
      ]);
      setIsLoadingThingsToDo(false);
      setThingsToDoError(null);
      return;
    }

    const fetchThingsToDo = async () => {
      setIsLoadingThingsToDo(true);
      setThingsToDo([]);
      setThingsToDoError(null);

      let url = `/api/city-info/things-to-do?city=${encodeURIComponent(cityName)}`;
      if (userCountry !== null) {
        url += `&country=${encodeURIComponent(userCountry)}`;
      }
      console.log("DEBUG: CityInfoPanel - Constructed Things-to-Do API URL:", url);

      try {
        const response = await fetch(url);
        const text = await response.text();
        console.log("Raw things-to-do response:", text);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${text || "Failed to fetch activities"}`);
        }

        let data;
        try {
          data = JSON.parse(text);
        } catch (parseError) {
          throw new Error("Invalid JSON response from API");
        }

        const activitiesData = Array.isArray(data.activities)
          ? data.activities.map((item: any) => ({
              name: item.name || "Unknown Activity",
              image: item.image || "/city-icon.webp",
              openNow: item.openNow ?? undefined,
              hours: item.hours || "Hours not available",
            }))
          : [];
        setThingsToDo(activitiesData);
        setThingsToDoError(null);
      } catch (err: any) {
        console.error("Failed to fetch things to do:", err);
        setThingsToDoError("Unable to load activities. Please try again later.");
        setThingsToDo([]);
      } finally {
        setIsLoadingThingsToDo(false);
      }
    };

    if (cityName) {
      fetchThingsToDo();
    }
  }, [cityName, userCountry]);

  // Fetch City Image
  useEffect(() => {
    const fetchCityImage = async () => {
      setIsLoadingImage(true);
      setCityImageUrl(null);
      setImageError(null);

      let url = `/api/city-info/image?city=${encodeURIComponent(cityName)}`;
      if (userCountry !== null) {
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
          setCityImageUrl("/city-icon.webp");
        }
      } catch (err) {
        console.error("Failed to fetch city image:", err);
        setImageError("An unexpected error occurred while fetching city image.");
        setCityImageUrl("/city-icon.webp");
      } finally {
        setIsLoadingImage(false);
      }
    };

    if (cityName) {
      fetchCityImage();
    }
  }, [cityName, userCountry]);

  return (
    <div className="relative w-full h-full bg-white rounded-3xl md:p-6 py-4 px-0 shadow-xl flex flex-col items-center overflow-auto scrollbar-w-2 scrollbar-track-gray-200 scrollbar-thumb-rose-500">
      {/* City Header and Image */}
      <div className="flex w-full p-6 gap-8 mb-4 flex-col md:flex-row">
        <div className="md:w-1/3 h-60 border border-gray-300 rounded-2xl shadow-lg overflow-hidden flex-shrink-0">
          {isLoadingImage ? (
            <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-500">
              <span className="loader"></span>
              <p className="ml-2">Loading image...</p>
            </div>
          ) : cityImageUrl ? (
            <img
              src={cityImageUrl}
              alt={`${cityName} City`}
              className="w-full h-full object-cover rounded-2xl"
              loading="lazy"
              onError={(e) => {
                e.currentTarget.src = "/city-icon.webp";
                e.currentTarget.onerror = null;
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
          <h2 className="text-4xl md:text-5xl text-rose-600 mb-4 font-caveat font-bold">
            Welcome to {cityName}
          </h2>
          {isLoadingHistory && (
            <div className="flex items-center justify-center flex-grow text-gray-500">
              <span className="loader"></span>
              <p className="ml-2">Loading history...</p>
            </div>
          )}
          {historyError && !isLoadingHistory && (
            <p className="text-red-500 text-lg flex-grow flex items-center justify-center">
              {historyError}
            </p>
          )}
          {history && !isLoadingHistory && (
            <p className="text-gray-800 text-base md:text-lg leading-relaxed flex-grow text-left">
              {history}
            </p>
          )}
        </div>
      </div>

      {/* Things to Do Section */}
      <div className="w-full p-6 border-t border-gray-200">
        <h3 className="text-3xl md:text-4xl text-rose-600 mb-6 font-caveat font-bold">
          Things to Do
        </h3>
        {isLoadingThingsToDo ? (
          <div className="flex items-center justify-center text-gray-500">
            <span className="loader"></span>
            <p className="ml-2">Finding activities...</p>
          </div>
        ) : thingsToDoError ? (
          <p className="text-red-500 text-lg">{thingsToDoError}</p>
        ) : thingsToDo.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {thingsToDo.map((item, index) => (
              <div
                key={index}
                className="bg-gray-50 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-40 object-cover"
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.src = "/city-icon.webp";
                    e.currentTarget.onerror = null;
                  }}
                />
                <div className="p-4">
                  <h4 className="text-lg font-semibold text-gray-800">{item.name}</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    {item.openNow !== undefined
                      ? item.openNow
                        ? "Open Now"
                        : "Closed"
                      : "Status unknown"}
                  </p>
                  <p className="text-sm text-gray-600">{item.hours}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-lg">No specific activities listed for {cityName} yet.</p>
        )}
      </div>

      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute md:right-4 md:top-4 right-2 top-2 p-2 bg-gray-900 rounded-full text-white"
      >
        <svg
           xmlns="http://www.w3.org/2000/svg"
           width={16}
           height={16}
           fill="none"
           stroke="currentColor"
           strokeWidth="2"
           strokeLinecap="round"
           strokeLinejoin="round"
        >
           <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};

export default CityInfoPanel;