// zittyzoom/components/Weather.tsx
"use client";

import { useEffect, useState } from "react";

interface WeatherProps {
  currentLocation: { lat: number; lng: number } | null;
}

const Weather: React.FC<WeatherProps> = ({ currentLocation }) => {
  const [weather, setWeather] = useState<{
    temp: number;
    city: string;
    icon: string;
    description: string; // Added description for alt text
  } | null>(null);
  const [error, setError] = useState<string | null>(null); // State for potential errors

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    const fetchWeather = async () => {
      if (!currentLocation) {
        setError("Location not available for weather.");
        setWeather(null);
        return;
      }

      setError(null); // Clear previous errors
      const { lat, lng } = currentLocation;
      // Ensure your API key is correctly loaded from environment variables
      const apiKey = process.env.NEXT_PUBLIC_WEATHER_API_KEY; 

      if (!apiKey) {
        console.error("NEXT_PUBLIC_WEATHER_API_KEY is not set.");
        setError("Weather API key missing.");
        return;
      }

      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&units=metric&appid=${apiKey}`;

      try {
        const res = await fetch(url);
        if (!res.ok) {
          const errorData = await res.json();
          console.error("Weather API error response:", errorData);
          setError(`Failed to fetch weather: ${errorData.message || res.statusText}`);
          setWeather(null); // Clear old weather data on error
          return;
        }

        const data = await res.json();
        if (data.main && data.name && data.weather?.[0]) {
          setWeather({
            temp: Math.round(data.main.temp),
            city: data.name,
            icon: `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`, // Use @2x for higher resolution
            description: data.weather[0].description, // Capture description for alt text
          });
        } else {
          setError("Invalid weather data received.");
          setWeather(null);
        }
      } catch (err) {
        console.error("Weather fetch error:", err);
        setError("An unexpected error occurred while fetching weather.");
        setWeather(null);
      }
    };

    // Initial fetch
    fetchWeather();

    // Set up interval for periodic updates (e.g., every 10 minutes = 600000 ms)
    // Adjust the interval based on how frequently you want weather updates
    intervalId = setInterval(fetchWeather, 600000); // 10 minutes

    // Cleanup function to clear the interval when the component unmounts
    // or when currentLocation changes (to reset the timer for the new location)
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [currentLocation]); // Re-run effect if currentLocation changes

  if (error) {
    return <div className="text-red-500 text-sm p-1">{error}</div>;
  }

  if (!weather) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-700">
        <span className="animate-pulse">Loading weather...</span>
      </div>
    ); // Or a simple loader/placeholder
  }

  return (
    <div className="flex items-center gap-2 text-sm text-gray-700 ">
      {/* Removed background, padding, and rounded-full from the image tag */}
      {/* Added a containing div for potential styling if needed without affecting the icon directly */}
      
      <div className="flex-shrink-0">
        <img
          src={weather.icon}
          alt={weather.description || "Weather Icon"} // Use description for better alt text
          className="w-10 h-10" // Slightly larger size for better visibility
        />
      </div>
      <span className="font-medium text-gray-400" >{weather.temp}°C</span>
      <span className="font-medium text-gray-400">{weather.description}</span>
      <span> | </span>
      <span className="font-medium">{weather.city}</span>
    </div>
  );
};

export default Weather;