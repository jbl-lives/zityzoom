// components/CityInfoPanel.tsx (modifications)
import { useEffect, useState } from 'react';
import { X } from 'lucide-react'; // Import the X icon from lucide-react

interface CityInfoPanelProps {
  cityName: string;
  userCountry: string | null; // <--- NEW PROP
  onClose: () => void;
}

const CityInfoPanel: React.FC<CityInfoPanelProps> = ({ cityName, userCountry, onClose }) => { // Accept userCountry
  const [history, setHistory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // useEffect(() => {
  //   const fetchCityHistory = async () => {
  //     setIsLoading(true);
  //     setHistory(null);
  //     setError(null);

  //     console.log("DEBUG: CityInfoPanel - Preparing fetch for city:", cityName, "with country:", userCountry);

  //      let url = `/api/city-info/history?city=${encodeURIComponent(cityName)}`;

  //     // This condition now expects userCountry to be either string or null.
  //     // If it's null, we don't append the country parameter.
  //     if (userCountry) {
  //       url += `&country=${encodeURIComponent(userCountry)}`;
  //     }
  //     console.log("DEBUG: CityInfoPanel - Constructed API URL:", url);

  //     try {
  //       let url = `/api/city-info/history?city=${encodeURIComponent(cityName)}`;
  //       if (userCountry) {
  //         url += `&country=${encodeURIComponent(userCountry)}`; // <--- NEW: Add country to URL
  //       }

  //       const response = await fetch(url);
  //       const data = await response.json();

  //       if (response.ok && data.history) {
  //         setHistory(data.history);
  //       } else {
  //         setError(data.error || `Could not find detailed history for ${cityName}.`);
  //       }
  //     } catch (err) {
  //       console.error("Failed to fetch city history:", err);
  //       setError("An unexpected error occurred while fetching history.");
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   };

  //   if (cityName) {
  //     fetchCityHistory();
  //   }
  // }, [cityName, userCountry]); // <--- Dependency array now includes userCountry

  useEffect(() => {
  const fetchCityHistory = async () => {
    setIsLoading(true);
    setHistory(null);
    setError(null);

    console.log("DEBUG: CityInfoPanel - Preparing fetch for city:", cityName, "with country:", userCountry);
    let url = `/api/city-info/history?city=${encodeURIComponent(cityName)}`;

    // This condition now expects userCountry to be either string or null.
    // If it's null, we don't append the country parameter.
    if (userCountry) {
      url += `&country=${encodeURIComponent(userCountry)}`;
    }
    console.log("DEBUG: CityInfoPanel - Constructed API URL:", url);

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (response.ok && data.history) {
        setHistory(data.history);
        setError(null);
      } else {
        setError(data.error || `Could not find detailed history for ${cityName}.`);
      }
    } catch (err) {
      console.error("Failed to fetch city history:", err);
      setError("An unexpected error occurred while fetching history.");
    } finally {
      setIsLoading(false);
    }
  };

  // This is the core condition: only fetch if cityName is set.
  // userCountry will now be either a string or null (resolved) when the panel opens.
  if (cityName) {
    fetchCityHistory();
  }
}, [cityName, userCountry]); 

  return (
    <div className="relativew-full h-full bg-white rounded-3xl p-6 shadow-xl flex flex-col items-center overflow-auto scrollbar-w-2 scrollbar-track-gray-200 scrollbar-thumb-rose-500">
      <div className='flex w-full h-1/2 p-6  gap-16  mb-4'>
        <img
          src="/city-icon.png"
          alt="City Icon"
          className="w-200 h-60 border-1 border-gray-600 rounded-2xl shadow-lg"
        />
        <div>
          <h2 className="text-5xl text-rose-600 mb-6 font-caveat">Welcome To {cityName}</h2>
          {isLoading && (
            <div className="flex items-center justify-center flex-grow text-gray-500">
              <span className="loader"></span>
              <p className="ml-2">Loading history...</p>
            </div>
          )}
          {error && !isLoading && (
            <p className="text-red-500 text-lg flex-grow flex items-center justify-center">{error}</p>
          )}

          {history && !isLoading && (
            <p className="text-gray-800 font-semibold text-base  leading-relaxed flex-grow text-left">
              {history}
            </p>
          )}

        </div>

      </div>
      

      <button
        onClick={onClose}
        className="absolute right-10 top-0 mt-8 cursor-pointer  text-gray-800  font-semibold hover:text-red-700 transition-colors duration-200 "
      >
        <X />
      </button>
    </div>
  );
};

export default CityInfoPanel;