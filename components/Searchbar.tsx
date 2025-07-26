// SearchBar.tsx
"use client";
import { useState, useEffect, useRef } from "react";
import { v4 as uuidv4 } from 'uuid';

type Props = {
  onSearch: (query: string, sessionToken?: string, lat?: number, lng?: number) => void;
  lat: number;
  lng: number;
  isMobileDialog?: boolean; // New prop: true if rendered inside the mobile dialog
  onSearchInitiated?: () => void;
  className?: string; // Still not used, consider removing if not needed
};

const SearchBar = ({ onSearch, lat, lng, isMobileDialog = false, onSearchInitiated }: Props) => {
  const [searchInput, setSearchInput] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const sessionTokenRef = useRef<string | null>(null);

  useEffect(() => {
    if (!searchInput.trim()) {
      setSuggestions([]);
      sessionTokenRef.current = null;
      return;
    }

    if (!sessionTokenRef.current) {
      sessionTokenRef.current = uuidv4();
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/google-place-api?keyword=${encodeURIComponent(
            searchInput
          )}&lat=${lat}&lng=${lng}&type=autocomplete&sessiontoken=${sessionTokenRef.current}`
        );

        const data = await res.json();
        const predictions = data.resp?.predictions || [];

        const mapped = predictions.map((p: any) => p.description);
        setSuggestions(mapped);
      } catch (error) {
        console.error("SmartSearch API error:", error);
      }
    }, 400);
  }, [searchInput, lat, lng]);

  const handleSearch = (query: string) => {
    if (onSearchInitiated) {
      onSearchInitiated();
    }

    onSearch(query, sessionTokenRef.current || undefined, lat, lng);
    setSearchInput(query);
    setShowSuggestions(false);
    sessionTokenRef.current = null;
  }

  const handleClearSearch = () => {
    setSearchInput("");
    setSuggestions([]);
    setShowSuggestions(false);
    sessionTokenRef.current = null;
    if (onSearchInitiated) {
      onSearchInitiated();
    }
    onSearch("");
  };

  return (
    // Width logic:
    // If inside mobile dialog, it's w-full.
    // Otherwise, apply responsive widths for tablet (md) and desktop (lg).
    <div className={`relative ${isMobileDialog ? "w-full mt-3" : "w-full md:w-[350px] lg:w-[600px]"}`}>
      <input
        type="text"
        value={searchInput}
        onFocus={() => setShowSuggestions(true)}
        onBlur={() => setTimeout(() => {
          if (document.activeElement?.className !== 'input-clear-button') {
            setShowSuggestions(false);
          }
        }, 100)}
        onChange={(e) => setSearchInput(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSearch(searchInput)}
        placeholder="Search Anything"
        // Adjust input styling based on context if needed
        className={`input bg-white p-3 rounded-full px-5 w-full border ${
          isMobileDialog ? "shadow-sm" : "border-gray-200"
        } outline-rose-400 focus:border-rose-400 pr-10`}
      />

      {searchInput.length > 0 && (
        <button
          type="button"
          onClick={handleClearSearch}
          className="input-clear-button absolute right-12 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 cursor-pointer p-1 rounded-full z-30"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-4 h-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}

      {showSuggestions && suggestions.length > 0 && (
        <ul className="absolute bg-white border border-gray-300 rounded-md w-full mt-1 z-50 shadow-lg max-h-48 overflow-y-auto">
          {suggestions.map((suggestion) => (
            <li
              key={suggestion}
              className="p-2 hover:bg-rose-100 cursor-pointer text-sm"
              onMouseDown={() => handleSearch(suggestion)}
            >
              {suggestion}
            </li>
          ))}
        </ul>
      )}

      <button
        disabled={!searchInput.trim()}
        onClick={() => handleSearch(searchInput)}
        className={`absolute right-0 top-1/2 -translate-y-1/2 bg-rose-500 rounded-full p-3 shadow-md z-20 transition-all ${
          !searchInput.trim() ? "opacity-50 cursor-not-allowed" : "hover:scale-90"
        }`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-4 h-4 text-white"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
          />
        </svg>
      </button>
    </div>
  );
};

export default SearchBar;