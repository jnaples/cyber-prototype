// Where the browser is, by its own IP.
//
// A public lookup rather than navigator.geolocation: the client is showing
// which network the query leaves from, not where the person is standing, and
// it shouldn't raise a permission prompt to do it. Falls back to a fixed point
// so the map always has something to pin — offline, blocked, or rate limited.

import { useEffect, useState } from "react";

export type IpLocation = {
  lat: number;
  lon: number;
  /** "Bridgeport, Connecticut" — whatever of it the lookup knew. */
  place: string;
  /** False while the fallback is standing in for a real answer. */
  resolved: boolean;
};

const FALLBACK: IpLocation = {
  lat: 41.1792,
  lon: -73.1894,
  place: "Bridgeport, Connecticut",
  resolved: false,
};

export function useIpLocation() {
  const [location, setLocation] = useState<IpLocation>(FALLBACK);

  useEffect(() => {
    const controller = new AbortController();

    // ipwho.is first, geojs behind it: both are keyless and send CORS headers,
    // and the free tiers rate limit often enough that one alone will fail.
    const lookup = async () => {
      for (const url of [
        "https://ipwho.is/",
        "https://get.geojs.io/v1/ip/geo.json",
      ]) {
        try {
          const response = await fetch(url, { signal: controller.signal });
          if (!response.ok) continue;
          const data = await response.json();
          // ipwho.is says so outright; both hand back strings on some fields.
          if (data?.success === false) continue;
          const lat = Number(data?.latitude);
          const lon = Number(data?.longitude);
          if (!Number.isFinite(lat) || !Number.isFinite(lon)) continue;
          setLocation({
            lat,
            lon,
            place:
              [data.city, data.region].filter(Boolean).join(", ") ||
              FALLBACK.place,
            resolved: true,
          });
          return;
        } catch {
          // The fallback is already on screen; a failed lookup changes nothing.
        }
      }
    };

    void lookup();
    return () => controller.abort();
  }, []);

  return location;
}
