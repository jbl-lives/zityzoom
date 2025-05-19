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
  } | null>(null);

  useEffect(() => {
    const fetchWeather = async () => {
      if (!currentLocation) return;

      const { lat, lng } = currentLocation;
      const apiKey = process.env.NEXT_PUBLIC_WEATHER_API_KEY;
      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&units=metric&appid=${apiKey}`;

      try {
        const res = await fetch(url);
        const data = await res.json();
        if (data.main && data.name && data.weather?.[0]) {
          setWeather({
            temp: Math.round(data.main.temp),
            city: data.name,
            icon: `https://openweathermap.org/img/wn/${data.weather[0].icon}.png`,
          });
        }
      } catch (err) {
        console.error("Weather fetch error:", err);
      }
    };

    fetchWeather();
  }, [currentLocation]);

  if (!weather) return null;

  return (
    <div className="flex items-center gap-2 text-sm text-gray-700 ">
      <img src={weather.icon} alt="Weather Icon" className="w-7 h-7 bg-blue-400 p-1 rounded-full" />
      <span>{weather.temp}°C</span>
      <span className="font-medium">{weather.city}</span>
    </div>
  );
};

export default Weather;
