import React, { useState, useEffect, useRef } from "react";
import {
  searchPanIndiaCities,
  searchOfflineIndianCities,
  type CitySuggestion
} from "../../services/citySearchService";

export interface CityAutocompleteInputProps {
  value?: string;
  onSelectCity: (city: {
    name: string;
    lat: number;
    lng: number;
    pincode?: string;
    stateName?: string;
  }) => void;
  placeholder?: string;
  label?: string;
  currentSelectedCity?: string;
  currentLat?: number;
  currentLng?: number;
  disabled?: boolean;
  className?: string;
}

export const CityAutocompleteInput: React.FC<CityAutocompleteInputProps> = ({
  value = "",
  onSelectCity,
  placeholder = "ಉದಾ: ಬೆಂಗಳೂರು, ಗೋಕರ್ಣ, Mumbai, Delhi, Varanasi...",
  label = "ಜನನ ಸ್ಥಳ (Birth Place)",
  currentSelectedCity,
  currentLat,
  currentLng,
  disabled = false,
  className = ""
}) => {
  const [searchTerm, setSearchTerm] = useState(value);
  const [suggestions, setSuggestions] = useState<CitySuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoadingOnline, setIsLoadingOnline] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<any>(null);

  // Synchronize internal text if external value changes and input is not active
  useEffect(() => {
    if (value && value !== searchTerm && !isOpen) {
      setSearchTerm(value);
    }
  }, [value]);

  // Click outside listener to dismiss dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  // Instant Typing Handler: immediately fetches local suggestions, then debounces online API
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchTerm(query);
    setHighlightedIndex(-1);

    if (query.trim().length < 2) {
      setSuggestions([]);
      setIsOpen(false);
      setIsLoadingOnline(false);
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      return;
    }

    // 1. Instant Synchronous Offline Suggestion Pass (0ms latency)
    const instantOffline = searchOfflineIndianCities(query, 8);
    setSuggestions(instantOffline);
    setIsOpen(true);

    // 2. Debounce Online Nominatim Pan-India API (300ms)
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    if (query.trim().length >= 3) {
      setIsLoadingOnline(true);
      debounceTimerRef.current = setTimeout(async () => {
        try {
          const merged = await searchPanIndiaCities(query, 8);
          if (merged && merged.length > 0) {
            setSuggestions(merged);
          }
        } finally {
          setIsLoadingOnline(false);
        }
      }, 300);
    } else {
      setIsLoadingOnline(false);
    }
  };

  const handleSelectSuggestion = (city: CitySuggestion) => {
    setSearchTerm(city.displayName);
    setIsOpen(false);
    setSuggestions([]);
    onSelectCity({
      name: city.displayName,
      lat: city.lat,
      lng: city.lng,
      pincode: city.pincode,
      stateName: city.stateName
    });
  };

  const handleClear = () => {
    setSearchTerm("");
    setSuggestions([]);
    setIsOpen(false);
    if (inputRef.current) inputRef.current.focus();
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || suggestions.length === 0) {
      if (e.key === "ArrowDown" && searchTerm.trim().length >= 2) {
        setIsOpen(true);
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
        handleSelectSuggestion(suggestions[highlightedIndex]);
      } else if (suggestions.length > 0) {
        handleSelectSuggestion(suggestions[0]);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Search Input Box with Google-style icons */}
      <div className="relative flex items-center">
        {/* Leading Search Icon */}
        <div className="absolute left-3 text-amber-400 pointer-events-none flex items-center justify-center">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.5"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        {/* Input */}
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={() => {
            if (searchTerm.trim().length >= 2) {
              const instant = searchOfflineIndianCities(searchTerm, 8);
              setSuggestions(instant);
              setIsOpen(true);
            }
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full bg-slate-950 border border-amber-500/40 rounded-xl pl-9 pr-8 py-2 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 font-medium transition shadow-inner"
          autoComplete="off"
          spellCheck="false"
        />

        {/* Trailing Clear or Loading Spinner */}
        <div className="absolute right-2.5 flex items-center gap-1">
          {isLoadingOnline && (
            <svg className="animate-spin h-3.5 w-3.5 text-amber-400" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          )}

          {searchTerm && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="text-slate-400 hover:text-amber-300 p-0.5 rounded-full hover:bg-slate-800 transition"
              title="Clear"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Floating Dropdown Suggestion List */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-slate-900 border-2 border-amber-500/80 rounded-2xl shadow-[0_10px_35px_rgba(0,0,0,0.8)] overflow-hidden backdrop-blur-xl animate-fadeIn max-h-64 overflow-y-auto">
          {/* Header Badge */}
          <div className="px-3 py-1.5 bg-slate-950/90 border-b border-amber-500/30 flex items-center justify-between text-[10px] text-amber-300 font-bold uppercase tracking-wider">
            <span className="flex items-center gap-1">
              <span>🇮🇳</span>
              <span>ನಗರಗಳ ಸಲಹೆಗಳು (Indian Cities & Towns)</span>
            </span>
            <span className="text-slate-400 lowercase">{suggestions.length} ಕಂಡುಬಂದಿವೆ</span>
          </div>

          {/* Suggestion Items */}
          <ul className="divide-y divide-slate-800/80">
            {suggestions.map((city, idx) => {
              const isHighlighted = idx === highlightedIndex;
              return (
                <li
                  key={city.id}
                  onClick={() => handleSelectSuggestion(city)}
                  onMouseEnter={() => setHighlightedIndex(idx)}
                  className={`px-3 py-2.5 flex items-center justify-between gap-2 cursor-pointer transition select-none ${
                    isHighlighted
                      ? "bg-amber-500/25 text-amber-100"
                      : "hover:bg-amber-500/15 text-slate-200"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-base text-amber-400 shrink-0">📍</span>
                    <div className="truncate">
                      <div className="font-bold text-xs sm:text-sm text-amber-200 font-serif">
                        {city.cityName}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate">
                        {city.stateName}
                        {city.pincode ? ` · PIN: ${city.pincode}` : ""}
                        {city.district && city.district !== city.cityName ? ` (${city.district})` : ""}
                      </div>
                    </div>
                  </div>

                  {/* Coordinates pill */}
                  <div className="shrink-0 text-right">
                    <span className="text-[10px] font-mono text-amber-400/90 bg-amber-950/70 border border-amber-500/30 px-1.5 py-0.5 rounded-md">
                      {city.lat.toFixed(2)}°, {city.lng.toFixed(2)}°
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>

          {/* Footer Helper */}
          <div className="px-3 py-1.5 bg-slate-950/90 border-t border-amber-500/20 text-center text-[10px] text-slate-400">
            <span>ನಗರದ ಮೇಲೆ ಕ್ಲಿಕ್ ಮಾಡಿ ಆಯ್ಕೆಮಾಡಿ (Click to select)</span>
          </div>
        </div>
      )}

      {/* No Results Message when typing 3+ characters */}
      {isOpen && suggestions.length === 0 && searchTerm.trim().length >= 3 && !isLoadingOnline && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-slate-900 border border-amber-500/40 rounded-xl p-3 shadow-2xl text-center text-xs text-slate-400 animate-fadeIn">
          <p className="text-amber-300 font-semibold mb-0.5">ಯಾವುದೇ ನಗರ ಕಂಡುಬಂದಿಲ್ಲ (City not found)</p>
          <p className="text-[11px] text-slate-500">
            ದಯವಿಟ್ಟು ಹತ್ತಿರದ ತಾಲೂಕು, ಜಿಲ್ಲೆ ಅಥವಾ ಪಿನ್‌ಕೋಡ್ ನಮೂದಿಸಿ (Try nearest district or pincode)
          </p>
        </div>
      )}
    </div>
  );
};
