"use client";

import { useEffect, useRef, useState } from "react";

type Suggestion = {
  id: string;
  label: string;
};

type NominatimResult = {
  place_id: number;
  display_name: string;
};

export default function LocationAutocomplete({
  value,
  onChange,
  placeholder = "City, state, or country",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  const [inputValue, setInputValue] = useState(value);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Keep local input in sync if the parent value is reset elsewhere
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced fetch to OpenStreetMap Nominatim (no API key required)
  useEffect(() => {
    const query = inputValue.trim();

    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    setLoadingSuggestions(true);

    const handle = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&addressdetails=0&limit=6&q=${encodeURIComponent(
            query
          )}`,
          {
            headers: {
              Accept: "application/json",
            },
          }
        );
        const data: NominatimResult[] = await res.json();

        setSuggestions(
          data.map((item) => ({
            id: String(item.place_id),
            label: item.display_name,
          }))
        );
      } catch (err) {
        console.error("Location lookup failed:", err);
        setSuggestions([]);
      } finally {
        setLoadingSuggestions(false);
      }
    }, 350);

    return () => clearTimeout(handle);
  }, [inputValue]);

  function handleSelect(label: string) {
    setInputValue(label);
    onChange(label);
    setShowDropdown(false);
  }

  function handleClear() {
    setInputValue("");
    onChange("");
    setSuggestions([]);
  }

  return (
    <div ref={wrapperRef} className="relative w-full">
      <div className="relative">
        <input
          type="text"
          value={inputValue}
          placeholder={placeholder}
          onFocus={() => setShowDropdown(true)}
          onChange={(e) => {
            setInputValue(e.target.value);
            setShowDropdown(true);
            onChange(e.target.value);
          }}
          className="w-full text-sm border border-gray-300 rounded-md pl-3 pr-8 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {inputValue && (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Clear location"
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>

      {showDropdown && inputValue.trim().length >= 2 && (
        <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-72 overflow-y-auto">
          {loadingSuggestions && (
            <div className="px-4 py-3 text-sm text-gray-400">Searching...</div>
          )}

          {!loadingSuggestions && suggestions.length === 0 && (
            <div className="px-4 py-3 text-sm text-gray-400">
              No matching places found
            </div>
          )}

          {!loadingSuggestions &&
            suggestions.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => handleSelect(s.label)}
                className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 border-b border-gray-50 last:border-0"
              >
                {s.label}
              </button>
            ))}
        </div>
      )}
    </div>
  );
}