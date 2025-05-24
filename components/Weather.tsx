// zittyzoom/components/Weather.tsx
"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion"; // Import motion for animations

// Import specific Lucide icons you'll need
import {
  Sun,
  Cloud,
  CloudRain,
  CloudSnow,
  CloudFog,
  Moon,
  CloudSun,
  CloudMoon,
  Zap, // For thunderstorm
  Droplets, // For drizzle
  ThermometerSun, // For extreme hot
  //ThermometerSnow, // For extreme cold
  Wind, // For windy conditions
  AlertCircle // Fallback for unknown
} from 'lucide-react';

interface WeatherProps {
  currentLocation: { lat: number; lng: number } | null;
  onCityClick: (cityName: string) => void;
}

// Map OpenWeatherMap icon codes to Lucide React components
const getWeatherIconComponent = (iconCode: string) => {
  // Defensive check: If iconCode is not a string or is empty, return a fallback immediately
  if (typeof iconCode !== 'string' || iconCode.length < 2) {
      console.warn("Invalid iconCode received:", iconCode);
      return AlertCircle;
  }

  const isDay = iconCode.endsWith('d');
  const baseCode = iconCode.slice(0, 2); // e.g., "01", "02", "10"

  switch (baseCode) {
    case '01': // Clear sky
      return isDay ? Sun : Moon;
    case '02': // Few clouds
      return isDay ? CloudSun : CloudMoon;
    case '03': // Scattered clouds
    case '04': // Broken clouds / Overcast clouds
      return Cloud;
    case '09': // Shower rain (drizzle)
      return Droplets; // Using Droplets for drizzle/light rain
    case '10': // Rain
      return CloudRain;
    case '11': // Thunderstorm
      return Zap; // Using Zap for lightning/thunder
    case '13': // Snow
      return CloudSnow;
    case '50': // Mist / Fog / Haze
      return CloudFog;
    default:
      return AlertCircle; // Fallback icon for unknown types
  }
};

const Weather: React.FC<WeatherProps> = ({ currentLocation, onCityClick }) => {
  const [weather, setWeather] = useState<{
    temp: number;
    city: string;
    iconCode: string; // Store original icon code to map to Lucide
    description: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    const fetchWeather = async () => {
      if (!currentLocation) {
        setError("Location not available for weather.");
        setWeather(null); // Ensure weather is null if location isn't available
        return;
      }

      setError(null); // Clear previous errors
      const { lat, lng } = currentLocation;
      const apiKey = process.env.NEXT_PUBLIC_WEATHER_API_KEY;

      if (!apiKey) {
        console.error("NEXT_PUBLIC_WEATHER_API_KEY is not set.");
        setError("Weather API key missing.");
        setWeather(null); // Ensure weather is null if API key is missing
        return;
      }

      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&units=metric&appid=${apiKey}`;

      try {
        const res = await fetch(url);
        if (!res.ok) {
          const errorData = await res.json();
          console.error("Weather API error response:", errorData);
          setError(`Failed to fetch weather: ${errorData.message || res.statusText}`);
          setWeather(null); // Ensure weather is null on API error
          return;
        }

        const data = await res.json();
        // **CRITICAL FIX:** Ensure all expected properties exist before setting state
        if (data.main && data.name && data.weather?.[0] && data.weather[0].icon && data.weather[0].description) {
          setWeather({
            temp: Math.round(data.main.temp),
            city: data.name,
            iconCode: data.weather[0].icon, // Store the icon code
            description: data.weather[0].description,
          });
        } else {
          // If API call was successful but data is incomplete
          console.error("Incomplete weather data received:", data);
          setError("Incomplete weather data received. Please try again.");
          setWeather(null); // Ensure weather is null for incomplete data
        }
      } catch (err: any) {
        console.error("Weather fetch error:", err);
        setError("An unexpected error occurred while fetching weather.");
        setWeather(null); // Ensure weather is null on network/parsing errors
      }
    };

    fetchWeather();
    // Clear any existing interval before setting a new one, important for re-renders
    if (intervalId) {
      clearInterval(intervalId);
    }
    intervalId = setInterval(fetchWeather, 600000); // 10 minutes

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [currentLocation]); // Dependency array should only have currentLocation

  // --- Render Logic ---

  if (error) {
    return <div className="text-red-500 text-sm p-1">{error}</div>;
  }

  // **CRITICAL FIX:** Check if weather exists AND if iconCode exists before proceeding
  if (!weather || !weather.iconCode) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-700">
        <span className="animate-pulse">Loading weather...</span>
      </div>
    );
  }

  // Now, `weather` and `weather.iconCode` are guaranteed to be defined
  const LucideIcon = getWeatherIconComponent(weather.iconCode);

  return (
    <div className="flex items-center gap-2 text-sm text-gray-700 ">
      <div className="flex-shrink-0">
        <motion.div
          key={weather.iconCode} // Key changes when icon changes, triggering animation
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className={`
            w-6 h-6 flex items-center justify-center rounded-full
            ${weather.iconCode.endsWith('d') ? 'bg-yellow-100 text-yellow-600' : 'bg-blue-100 text-blue-600'}
          `} // Dynamic background/text color based on day/night
        >
          <LucideIcon className="w-4 h-4" /> {/* Render the Lucide icon */}
        </motion.div>
      </div>
      <span className="font-medium text-gray-400" >{weather.temp}°C</span>
      <span className="font-medium text-gray-400">{weather.description}</span>
      <span> | </span>
      <span
        className="font-medium cursor-pointer hover:underline"
        onClick={() => onCityClick(weather.city)}
      >
        {weather.city}
      </span>
    </div>
  );
};

export default Weather;