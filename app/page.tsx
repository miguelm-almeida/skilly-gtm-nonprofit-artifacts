"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { MapPin, LocateFixed } from "lucide-react";
import { SkillyLogo } from "@/components/skilly-logo";
import { CategoryCard } from "@/components/category-card";
import { BenchmarkView } from "@/components/benchmark-view";
import { CATEGORIES } from "@/lib/types";
import type { CategoryConfig, CategoryBenchmark, SSEProgress } from "@/lib/types";

interface PlaceSuggestion {
  placeId: string;
  description: string;
  mainText: string;
  secondaryText: string;
}

function getBrowserPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      reject(new Error("Browser geolocation is not available."));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      resolve,
      (error) => reject(new Error(error.message || "Could not detect your location.")),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 },
    );
  });
}

function reverseGeocodeCurrentLocation(lat: number, lng: number): Promise<string> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !window.google?.maps) {
      resolve(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
      return;
    }

    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === google.maps.GeocoderStatus.OK && results) {
        const locality =
          results.find((r) => r.types.includes("locality")) ??
          results.find((r) => r.types.includes("administrative_area_level_2")) ??
          results.find((r) => r.types.includes("postal_code")) ??
          results[0];

        if (locality) {
          const parts = locality.formatted_address.split(",").map((s) => s.trim());
          resolve(parts.slice(0, 2).join(", "));
          return;
        }
      }

      resolve(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
    });
  });
}

async function fetchBenchmarkStream(url: string, signal: AbortSignal): Promise<Response> {
  try {
    return await fetch(url, { signal });
  } catch (error) {
    await new Promise((resolve) => window.setTimeout(resolve, 300));
    return fetch(url, { signal }).catch(() => {
      throw error;
    });
  }
}

function buildResultKey(
  categorySlug: string,
  locationLabel: string,
  latitude: number | null,
  longitude: number | null,
) {
  if (latitude !== null && longitude !== null) {
    return `${categorySlug}::coords:${latitude.toFixed(4)},${longitude.toFixed(4)}`;
  }
  const normalizedLocation = locationLabel.trim().toLowerCase() || "all";
  return `${categorySlug}::location:${normalizedLocation}`;
}

function getLoadingProgress(progress: SSEProgress | null): number {
  if (!progress) return 0;
  if (progress.phase === "complete") return 100;
  if (progress.phase === "error") return 100;
  if (progress.phase === "search") return 8;
  if (progress.phase === "compute") return 92;

  if (progress.phase === "filter") {
    if (progress.total && progress.current) {
      return 12 + (progress.current / progress.total) * 38;
    }
    return 18;
  }

  if (progress.phase === "fetch") {
    if (progress.total && progress.current) {
      return 50 + (progress.current / progress.total) * 28;
    }
    return 58;
  }

  if (progress.phase === "enrich") {
    if (progress.total && progress.current) {
      return 78 + (progress.current / progress.total) * 18;
    }
    return 84;
  }

  return 0;
}

export default function Home() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeResultKey, setActiveResultKey] = useState<string | null>(null);
  const [progress, setProgress] = useState<SSEProgress | null>(null);
  const [results, setResults] = useState<Record<string, CategoryBenchmark>>({});
  const [error, setError] = useState<string | null>(null);
  const [locationInput, setLocationInput] = useState("");
  const [detectedLatitude, setDetectedLatitude] = useState<number | null>(null);
  const [detectedLongitude, setDetectedLongitude] = useState<number | null>(null);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [locationSuggestions, setLocationSuggestions] = useState<PlaceSuggestion[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const query = locationInput.trim();

    if (detectedLatitude !== null && detectedLongitude !== null) {
      setLocationSuggestions([]);
      setShowSuggestions(false);
      setIsLoadingSuggestions(false);
      return;
    }

    if (query.length < 2) {
      setLocationSuggestions([]);
      setShowSuggestions(false);
      setIsLoadingSuggestions(false);
      return;
    }

    if (typeof window === "undefined" || !window.google?.maps?.places) {
      return;
    }

    const service = new google.maps.places.AutocompleteService();
    const timeout = window.setTimeout(() => {
      setIsLoadingSuggestions(true);
      service.getPlacePredictions(
        {
          input: query,
          componentRestrictions: { country: "us" },
          types: ["(regions)"],
        },
        (predictions, status) => {
          setIsLoadingSuggestions(false);
          if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
            setLocationSuggestions(
              predictions.map((p) => ({
                placeId: p.place_id,
                description: p.description,
                mainText: p.structured_formatting?.main_text ?? p.description,
                secondaryText: p.structured_formatting?.secondary_text ?? "",
              })),
            );
            setShowSuggestions(true);
          } else {
            setLocationSuggestions([]);
            setShowSuggestions(false);
          }
        },
      );
    }, 200);

    return () => window.clearTimeout(timeout);
  }, [detectedLatitude, detectedLongitude, locationInput]);

  const selectSuggestion = useCallback((suggestion: PlaceSuggestion) => {
    setLocationInput(suggestion.description);
    setLocationSuggestions([]);
    setShowSuggestions(false);

    if (typeof window === "undefined" || !window.google?.maps) return;

    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ placeId: suggestion.placeId }, (results, status) => {
      if (status === google.maps.GeocoderStatus.OK && results?.[0]) {
        const loc = results[0].geometry.location;
        setDetectedLatitude(loc.lat());
        setDetectedLongitude(loc.lng());
      }
    });
  }, []);

  const resolveCurrentLocation = useCallback(async () => {
    setIsDetectingLocation(true);
    setError(null);

    try {
      const position = await getBrowserPosition();
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      const label = await reverseGeocodeCurrentLocation(lat, lng);

      setDetectedLatitude(lat);
      setDetectedLongitude(lng);
      setLocationInput(label);
      setLocationSuggestions([]);
      setShowSuggestions(false);

      return { lat, lng, label };
    } finally {
      setIsDetectingLocation(false);
    }
  }, []);

  const startBenchmark = useCallback(async (config: CategoryConfig) => {
    abortRef.current?.abort();
    let nextLocationLabel = locationInput.trim();
    let nextLatitude = detectedLatitude;
    let nextLongitude = detectedLongitude;

    if (!nextLocationLabel && nextLatitude === null && nextLongitude === null) {
      setProgress({ phase: "search", message: "Detecting your location..." });
      try {
        const currentLocation = await resolveCurrentLocation();
        nextLocationLabel = currentLocation.label;
        nextLatitude = currentLocation.lat;
        nextLongitude = currentLocation.lng;
      } catch (err) {
        setProgress(null);
        setError(err instanceof Error ? err.message : "Could not detect your location.");
        return;
      }
    }

    const resultKey = buildResultKey(config.slug, nextLocationLabel, nextLatitude, nextLongitude);
    if (results[resultKey]) {
      setActiveCategory(config.slug);
      setActiveResultKey(resultKey);
      setProgress(null);
      return;
    }

    setActiveCategory(config.slug);
    setActiveResultKey(resultKey);
    setError(null);
    setProgress({ phase: "search", message: "Connecting..." });

    const abort = new AbortController();
    abortRef.current = abort;

    const params = new URLSearchParams({ category: config.slug, top: "20" });
    if (nextLocationLabel) {
      params.set("location", nextLocationLabel);
    }
    if (nextLatitude !== null && nextLongitude !== null) {
      params.set("latitude", String(nextLatitude));
      params.set("longitude", String(nextLongitude));
    }

    fetchBenchmarkStream(`/api/benchmark?${params}`, abort.signal)
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`Server error: ${response.status}`);
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error("No stream");

        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n\n");
          buffer = lines.pop() || "";

          for (const chunk of lines) {
            const dataLine = chunk.trim();
            if (!dataLine.startsWith("data: ")) continue;
            try {
              const event: SSEProgress = JSON.parse(dataLine.slice(6));
              setProgress(event);

              if (event.phase === "complete" && event.data) {
                setResults((prev) => ({ ...prev, [resultKey]: event.data! }));
                setProgress(null);
              }
              if (event.phase === "error") {
                setError(event.message || "Unknown error");
                setProgress(null);
              }
            } catch {
              // skip malformed events
            }
          }
        }
      })
      .catch((err) => {
        if (err instanceof Error && err.name === "AbortError") return;
        const message =
          err instanceof Error && err.message === "Failed to fetch"
            ? "Could not reach the benchmark API. The dev server may have reloaded. Try once more."
            : err instanceof Error
              ? err.message
              : "Connection failed";
        setError(message);
        setProgress(null);
      });
  }, [detectedLatitude, detectedLongitude, locationInput, resolveCurrentLocation, results]);

  const cancelBenchmark = useCallback(() => {
    abortRef.current?.abort();
    setProgress(null);
    setActiveCategory(null);
    setActiveResultKey(null);
  }, []);

  const goBack = useCallback(() => {
    setActiveCategory(null);
    setActiveResultKey(null);
    setError(null);
  }, []);

  const activeBenchmark = activeResultKey ? results[activeResultKey] : null;
  const isLoading = progress !== null;
  const loadingProgress = getLoadingProgress(progress);

  const detectLocation = useCallback(() => {
    resolveCurrentLocation().catch((err) => {
      setError(err instanceof Error ? err.message : "Could not detect your location.");
    });
  }, [resolveCurrentLocation]);

  if (activeBenchmark) {
    return (
      <div className="min-h-screen bg-[#F7F7F8]">
        <header className="sticky top-0 z-50 bg-[#1F1C26] shadow-[0_1px_8px_rgba(31,28,38,0.08)] print:static print:bg-white print:border-none">
          <div className="mx-auto max-w-6xl flex items-center justify-between px-6 py-2">
            <SkillyLogo className="h-7 w-auto" />
            <span className="text-sm font-semibold text-white/90">Nonprofit Benchmarking</span>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-6 py-8">
          <BenchmarkView benchmark={activeBenchmark} onBack={goBack} />
        </main>
        <footer className="border-t border-[#E9E9EA] bg-white py-8 text-center print:hidden">
          <a
            href="https://skillyai.com"
            target="_blank"
            rel="noopener noreferrer"
            className="mx-auto mb-2 inline-flex rounded-full bg-[#1F1C26] px-4 py-2"
          >
            <SkillyLogo className="h-5 w-auto" />
          </a>
          <p className="text-xs text-[#77757B] font-medium">
            Powered by{" "}
            <a
              href="https://skillyai.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#5848F7] underline underline-offset-2"
            >
              Skilly
            </a>{" "}
            AI
          </p>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F7F8]">
      <header className="relative bg-[#1F1C26] pb-[5px]">
        <div className="mx-auto max-w-3xl flex items-center justify-between px-6 py-2">
          <SkillyLogo className="h-7 w-auto" />
          <span className="text-sm font-semibold text-white/90">Nonprofit Benchmarking</span>
        </div>
        <div className="absolute inset-x-0 bottom-0 h-[5px] bg-white/8">
          <div
            className="h-full bg-[#5848F7] transition-[width] duration-300 ease-out"
            style={{ width: isLoading ? `${loadingProgress}%` : "0%" }}
          />
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-3xl">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-[#1F1C26]" style={{ letterSpacing: "-0.01em" }}>
              Nonprofit Category Benchmarks
            </h1>
            <p className="mt-2 text-[#77757B] text-base max-w-lg mx-auto font-medium">
              Explore nonprofit benchmarks using IRS Form 990 financial data for organizations within 100 miles of a person&apos;s location.
            </p>
          </div>

          <div className="mb-6 rounded-md border border-[#E9E9EA] bg-white p-4 shadow-[0_1px_2px_rgba(10,13,18,0.05)]">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9A999D]" />
                <input
                  value={locationInput}
                  onChange={(event) => {
                    setLocationInput(event.target.value);
                    setDetectedLatitude(null);
                    setDetectedLongitude(null);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => {
                    if (locationSuggestions.length > 0) {
                      setShowSuggestions(true);
                    }
                  }}
                  onBlur={() => {
                    window.setTimeout(() => setShowSuggestions(false), 120);
                  }}
                  placeholder="Enter a person location, ZIP, or city"
                  className="h-11 w-full rounded-full border border-[#D2D2D4] bg-white pl-10 pr-10 text-sm font-medium text-[#1F1C26] shadow-[0_1px_2px_rgba(10,13,18,0.05)] outline-none transition focus:border-[#5848F7]"
                />
                {isLoadingSuggestions && (
                  <div className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full border-2 border-[#CECAFC] border-t-[#5848F7] animate-spin" />
                )}
                {showSuggestions && locationSuggestions.length > 0 && (
                  <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-20 max-h-64 overflow-y-auto rounded-2xl border border-[#E9E9EA] bg-white py-2 shadow-[0_8px_24px_rgba(31,28,38,0.12)]">
                    {locationSuggestions.map((suggestion) => (
                      <button
                        key={suggestion.placeId}
                        type="button"
                        onMouseDown={() => selectSuggestion(suggestion)}
                        className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-[#F7F7F8]"
                      >
                        <MapPin className="h-4 w-4 shrink-0 text-[#9A999D]" />
                        <div className="min-w-0">
                          <span className="block text-sm font-medium text-[#1F1C26]">{suggestion.mainText}</span>
                          {suggestion.secondaryText && (
                            <span className="block text-xs text-[#9A999D]">{suggestion.secondaryText}</span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={detectLocation}
                disabled={isDetectingLocation}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-[#D2D2D4] bg-white px-4 text-sm font-bold text-[#4C4951] shadow-[0_1px_2px_rgba(10,13,18,0.05)] transition hover:bg-[#F7F7F8] disabled:cursor-wait disabled:opacity-60"
              >
                <LocateFixed className="h-4 w-4" />
                {isDetectingLocation ? "Locating..." : "Use My Location"}
              </button>
            </div>
            <p className="mt-3 text-xs font-medium text-[#77757B]">
              Rankings are filtered to nonprofits within 100 miles of this location.
            </p>
          </div>

          {error && (
            <div className="mb-6 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700 font-medium">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {CATEGORIES.map((config) => (
              <CategoryCard
                key={config.slug}
                config={config}
                onClick={() => startBenchmark(config)}
                isLoading={isLoading && activeCategory === config.slug}
              />
            ))}
          </div>

          <p className="mt-8 text-center text-xs text-[#9A999D] font-medium">
            Each category analyzes IRS Form 990 financial data, filters organizations within a 100-mile radius, and computes benchmark metrics like revenue, assets, program spending, and administrative efficiency.
          </p>
        </div>
      </main>

      <footer className="border-t border-[#E9E9EA] bg-white py-6 text-center">
        <a
          href="https://skillyai.com"
          target="_blank"
          rel="noopener noreferrer"
          className="mx-auto mb-2 inline-flex rounded-full bg-[#1F1C26] px-4 py-2"
        >
          <SkillyLogo className="h-5 w-auto" />
        </a>
        <p className="text-xs text-[#77757B] font-medium">
          Powered by{" "}
          <a
            href="https://skillyai.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#5848F7] underline underline-offset-2"
          >
            Skilly
          </a>{" "}
          AI
        </p>
      </footer>
    </div>
  );
}
