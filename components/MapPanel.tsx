// components/MapPanel.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import MapLoader from './MapLoader';
import { SearchResult } from '@/hooks/use-places-search';

interface MapLocation {
  lat: number;
  lng: number;
}

interface MapPanelProps {
  mapCenter: MapLocation | null;
  userCurrentGeolocation: MapLocation | null;
  placeList: SearchResult[];
  selectedPlaceId: string | undefined;
}

const svgPaths: { [key: string]: string } = {
  'default': `<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>`,
  'restaurant': `<path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/>`,
  'gas_station': `<line x1="3" x2="15" y1="22" y2="22"/><line x1="4" x2="14" y1="9" y2="9"/><path d="M14 22V4a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v18"/><path d="M14 13h2a2 2 0 0 1 2 2v2a2 2 0 0 0 2 2a2 2 0 0 0 2-2V9.83a2 2 0 0 0-.59-1.42L18 5"/>`,
  'supermarket': `<path d="m15 11-1 9"/><path d="m19 11-4-7"/><path d="M2 11h20"/><path d="m3.5 11 1.6 7.4a2 2 0 0 0 2 1.6h9.8a2 2 0 0 0 2-1.6l1.7-7.4"/><path d="M4.5 15.5h15"/><path d="m5 11 4-7"/><path d="m9 11 1 9"/>`,
  'lodging': `<path d="M2 4v16"/><path d="M2 8h18a2 2 0 0 1 2 2v10"/><path d="M2 17h20"/><path d="M6 8v9"/>`,
  'bar': `<path d="M8 22h8"/><path d="M12 11v11"/><path d="m19 3-7 8-7-8Z"/>`,
  'hotel': `<path d="M10 22v-6.57"/><path d="M12 11h.01"/><path d="M12 7h.01"/><path d="M14 15.43V22"/><path d="M15 16a5 5 0 0 0-6 0"/><path d="M16 11h.01"/><path d="M16 7h.01"/><path d="M8 11h.01"/><path d="M8 7h.01"/><rect x="4" y="2" width="16" height="20" rx="2"/>`,
  'bank': `<rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/>`,
  'user_location_pin': `<path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/>`
};

const createCustomSvgMarkerContent = (
  svgPath: string,
  backgroundColor: string,
  svgColor: string,
  size: number = 40
): HTMLDivElement => {
  const markerContent = document.createElement("div");
  markerContent.style.width = `${size}px`;
  markerContent.style.height = `${size}px`;
  markerContent.style.backgroundColor = backgroundColor;
  markerContent.style.borderRadius = "50%";
  markerContent.style.border = `2px solid ${backgroundColor}`;
  markerContent.style.display = "flex";
  markerContent.style.justifyContent = "center";
  markerContent.style.alignItems = "center";
  markerContent.style.overflow = "hidden";
  markerContent.style.boxShadow = "0 2px 6px rgba(0,0,0,0.3)";

  const svgElement = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svgElement.setAttribute("viewBox", "0 0 24 24");
  svgElement.setAttribute("width", `${size * 0.5}px`);
  svgElement.setAttribute("height", `${size * 0.5}px`);
  svgElement.innerHTML = `<g stroke="${svgColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none">${svgPath}</g>`;

  markerContent.appendChild(svgElement);
  return markerContent;
};

const getSvgPathForPlaceType = (types: string[]): string => {
  if (!types || types.length === 0) return svgPaths['default'];
  for (const type of types) {
    if (svgPaths[type]) return svgPaths[type];
  }
  return svgPaths['default'];
};

export default function MapPanel({ mapCenter, userCurrentGeolocation, placeList, selectedPlaceId }: MapPanelProps) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const directionsRenderer = useRef<google.maps.DirectionsRenderer | null>(null);
  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
  const userMarkerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(null);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (
      typeof window.google === "undefined" ||
      !window.google.maps ||
      !window.google.maps.marker ||
      !mapRef.current ||
      !mapCenter
    ) {
      setIsLoading(true);
      return;
    }

    const initMap = async () => {
      setIsLoading(true);

      // Clear old markers
      markersRef.current.forEach(marker => marker.map = null);
      markersRef.current = [];
      if (userMarkerRef.current) {
        userMarkerRef.current.map = null;
        userMarkerRef.current = null;
      }
      directionsRenderer.current?.setMap(null);

      const map = new google.maps.Map(mapRef.current!, {
        center: mapCenter,
        zoom: 14,
        mapId: process.env.NEXT_PUBLIC_MAP_ID || undefined,
        gestureHandling: "greedy",
      });
      mapInstance.current = map;

      const directionsService = new google.maps.DirectionsService();
      directionsRenderer.current = new google.maps.DirectionsRenderer({
        polylineOptions: {
          strokeColor: "#0eac04"
        },
        suppressMarkers: true,
        map
      });

      infoWindowRef.current = new google.maps.InfoWindow();

      if (userCurrentGeolocation) {
        const userMarkerContent = createCustomSvgMarkerContent(
          svgPaths["user_location_pin"],
          "#4CAF50",
          "#FFFFFF"
        );

        userMarkerRef.current = new google.maps.marker.AdvancedMarkerElement({
          position: userCurrentGeolocation,
          map,
          title: "You are here",
          content: userMarkerContent
        });
      }

      // Render place markers
      placeList.forEach(place => {
        const path = getSvgPathForPlaceType(place.types ?? []);
        const isSelected = place.place_id === selectedPlaceId;
        const markerContent = createCustomSvgMarkerContent(
          path,
          isSelected ? "#005ce6" : "#d41d01",
          "#FFFFFF"
        );

        const marker = new google.maps.marker.AdvancedMarkerElement({
          position: place.geometry.location,
          map,
          title: place.name,
          content: markerContent,
        });

        markersRef.current.push(marker);

        marker.addListener("gmp-click", () => {
          const service = new google.maps.places.PlacesService(map);
          service.getDetails({ placeId: place.place_id }, (details, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK && details) {
              if (userCurrentGeolocation) {
                const routeRequest: google.maps.DirectionsRequest = {
                  origin: userCurrentGeolocation,
                  destination: place.geometry.location,
                  travelMode: google.maps.TravelMode.DRIVING,
                };
                directionsService.route(routeRequest, (result, status) => {
                  if (status === google.maps.DirectionsStatus.OK && result?.routes?.[0]) {
                    directionsRenderer.current?.setDirections(result);

                    const eta = result.routes[0].legs[0].duration?.text ?? "Unknown";
                    infoWindowRef.current!.setContent(`
                      <div style="max-width: 200px;">
                        <strong style="color: #f43f5e; font-weight:bold; font-size:16px">${details.name}</strong><br/>
                        <span style="color:#585858">${details.formatted_address ?? 'No address available'}</span><br/>
                        <strong style="color: #0eac04">ETA: ${eta}</strong>
                      </div>
                    `);
                    infoWindowRef.current!.open(map, marker);
                  }
                });
              } else {
                infoWindowRef.current!.setContent(`
                  <div style="max-width: 200px;">
                    <strong style="color: #f43f5e; font-weight:bold; font-size:16px">${details.name}</strong><br/>
                    <span style="color:#585858">${details.formatted_address ?? 'No address available'}</span>
                  </div>
                `);
                infoWindowRef.current!.open(map, marker);
              }
            }
          });
        });

        // Auto center if it's the selected one
        if (isSelected) {
          map.panTo(place.geometry.location);
        }
      });

      setIsLoading(false);
    };

    initMap();
  }, [mapCenter, placeList, userCurrentGeolocation, selectedPlaceId]);

  return (
    <div className="relative w-full h-full">
      {isLoading && <MapLoader />}
      <div ref={mapRef} className="absolute inset-0" />
    </div>
  );
}
