"use client";
import { useEffect, useState } from "react";
import useDebounce from "@/hooks/useDebounce";

const searchCache: Record<string, any[]> = {};

export default function SmartSearch({ lat, lng }: { lat: number; lng: number }) {
  const [input, setInput] = useState("");
  const debouncedInput = useDebounce(input, 600);
  const [suggestions, setSuggestions] = useState<any[]>([]);

  useEffect(() => {
    if (debouncedInput.length < 3) {
      setSuggestions([]);
      return;
    }

    const fetchSuggestions = async () => {
      if (searchCache[debouncedInput]) {
        setSuggestions(searchCache[debouncedInput]);
        return;
      }

      try {
        const params = new URLSearchParams({
          keyword: debouncedInput,
          lat: lat.toString(),
          lng: lng.toString(),
          type: "autocomplete",
        });

        const res = await fetch(`/api/google-place-api?${params.toString()}`);
        const data = await res.json();
        const predictions = data.resp?.predictions || [];

        searchCache[debouncedInput] = predictions;
        setSuggestions(predictions);
      } catch (err) {
        console.error("Error fetching suggestions", err);
      }
    };

    fetchSuggestions();
  }, [debouncedInput]);

  return (
    <div className="w-full max-w-md mx-auto">
      <input
        className="border p-2 rounded w-full"
        placeholder="Search for places..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />

      {suggestions.length > 0 && (
        <ul className="bg-white border rounded mt-1 shadow-md">
          {suggestions.map((sug, index) => (
            <li key={index} className="p-2 hover:bg-gray-100 cursor-pointer">
              {sug.description}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
