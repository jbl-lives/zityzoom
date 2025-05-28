// components/MapPanel.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import MapLoader from './MapLoader';

type Props = {
  userLocation: { lat: number; lng: number } | null;
  placeList: any[];
  selectedPlaceId?: string;
};

// --- SVG Path Definitions for Lucid Icons (remain the same) ---
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

// --- Helper Functions for Custom SVG Markers (remain the same) ---
const createCustomSvgMarkerContent = (svgPath: string, backgroundColor: string, svgColor: string, size: number = 40): HTMLDivElement => {
    const markerContent = document.createElement('div');
    markerContent.style.width = `${size}px`;
    markerContent.style.height = `${size}px`;
    markerContent.style.backgroundColor = backgroundColor;
    markerContent.style.borderRadius = '50%';
    markerContent.style.border = `2px solid ${backgroundColor}`;
    markerContent.style.display = 'flex';
    markerContent.style.justifyContent = 'center';
    markerContent.style.alignItems = 'center';
    markerContent.style.overflow = 'hidden';
    markerContent.style.boxShadow = '0 2px 6px rgba(0,0,0,0.3)';

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

    if (types.includes('restaurant')) return svgPaths['restaurant'];
    if (types.includes('gas_station')) return svgPaths['gas_station'];
    if (types.includes('supermarket')) return svgPaths['supermarket'];
    if (types.includes('lodging')) return svgPaths['lodging'];
    if (types.includes('bar')) return svgPaths['bar'];
    if (types.includes('hotel')) return svgPaths['hotel'];
    if (types.includes('bank')) return svgPaths['bank'];

    return svgPaths['default'];
};


export default function MapPanel({ userLocation, placeList, selectedPlaceId }: Props) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const directionsRenderer = useRef<google.maps.DirectionsRenderer | null>(null);
  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
  const userMarkerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof window.google === 'undefined' || !window.google.maps || !window.google.maps.marker) {
      console.warn("Google Maps JavaScript API (and marker library) not yet loaded.");
      setIsLoading(true);
      return;
    }

    if (!mapRef.current || !userLocation) {
      setIsLoading(true);
      return;
    }

    const initMap = async () => {
      setIsLoading(true);

      // Clear previous markers
      markersRef.current.forEach(marker => marker.map = null);
      markersRef.current = [];
      if (userMarkerRef.current) {
        userMarkerRef.current.map = null;
        userMarkerRef.current = null;
      }

      // Initialize directionsService and directionsRenderer ONLY ONCE per map load
      const directionsService = new google.maps.DirectionsService();
      directionsRenderer.current = new google.maps.DirectionsRenderer({
        polylineOptions: {
          strokeColor: '#0eac04' // green color for the direction line
        }
      });

      const map = new google.maps.Map(mapRef.current!, {
        center: userLocation,
        zoom: 14,
        mapId: process.env.NEXT_PUBLIC_MAP_ID || undefined,
        gestureHandling: 'greedy',
      });
      mapInstance.current = map;
      directionsRenderer.current.setMap(map); // Attach renderer to the map

      const userMarkerContent = createCustomSvgMarkerContent(
        svgPaths['user_location_pin'],
        '#4CAF50',
        '#FFFFFF'
      );

      userMarkerRef.current = new google.maps.marker.AdvancedMarkerElement({
        position: userLocation,
        map,
        title: "You are here",
        content: userMarkerContent,
      });

      const infoWindow = new google.maps.InfoWindow();

      if (placeList && placeList.length > 0) {
        placeList.forEach((place) => { // 'place' and 'marker' are in scope here
          let markerContentElement: HTMLDivElement;
          const placeSvgPath = getSvgPathForPlaceType(place.types);

          if (place.place_id === selectedPlaceId) {
            markerContentElement = createCustomSvgMarkerContent(
              placeSvgPath,
              '#005ce6',
              '#FFFFFF'
            );
          } else {
            markerContentElement = createCustomSvgMarkerContent(
              placeSvgPath,
              '#d41d01',
              '#FFFFFF'
            );
          }

          const marker = new google.maps.marker.AdvancedMarkerElement({
            position: place.geometry.location,
            map,
            title: place.name,
            content: markerContentElement,
          });

          markersRef.current.push(marker);

          marker.addListener("gmp-click", () => {
            const service = new google.maps.places.PlacesService(map);
            service.getDetails({ placeId: place.place_id }, (details, status) => {
              if (status === google.maps.places.PlacesServiceStatus.OK && details) {
                // Initial content without ETA
                const initialContent = `
                  <div style="max-width: 200px;">
                    <strong style="color: #f43f5e; font-weight:bold; font-size:16px" >${details.name}</strong><br/>
                    <span style="color:#585858;">${details.formatted_address || ""}</span><br/>
                    <span style="color:#005ce6;">${details.formatted_phone_number || ""}</span><br/>
                    <em>${details.opening_hours?.weekday_text?.join("<br/>") || ""}</em><br/>
                    <button id="dir-btn" style="background-color:green; padding:5px; color:#fff; margin-top:7px; border-radius: 5px; border:none; cursor:pointer;">
                      Get Directions
                    </button>
                    <button id="share-btn" style="margin-top:7px; margin-left:10px; padding:5px; background-color:blue; color:#fff; border-radius: 5px; border:none; cursor:pointer;">
                      Share
                    </button>
                  </div>
                `;
                infoWindow.setContent(initialContent);
                infoWindow.open(map, marker);

                setTimeout(() => {
                  const dirBtn = document.getElementById("dir-btn");
                  const shareBtn = document.getElementById("share-btn");
                  const destination = details.geometry?.location;

                  if (dirBtn && destination && userLocation) {
                    dirBtn.addEventListener("click", () => {
                      // Clear existing directions if any before showing new ones
                      if (directionsRenderer.current) {
                        directionsRenderer.current.setMap(null); // Detach from map to clear
                        directionsRenderer.current.setMap(map);  // Re-attach to the map
                      }

                      directionsService.route(
                        {
                          origin: userLocation, // User's current location
                          destination: destination, // The selected place
                          travelMode: google.maps.TravelMode.DRIVING, // Or WALKING, BICYCLING, TRANSIT
                        },
                        (response, status) => {
                          if (status === google.maps.DirectionsStatus.OK) {
                            if (response) { // Check if response is valid
                              directionsRenderer.current?.setDirections(response); // Render the route

                              // --- START: Display ETA in InfoWindow ---
                              const durationText = response.routes[0]?.legs[0]?.duration?.text;
                              let etaHtml = '';
                              if (durationText) {
                                etaHtml = `<p style="font-weight:bold; color: #585858; margin-top: 5px;">ETA: ${durationText}</p>`;
                              }

                              // Reconstruct InfoWindow content to include ETA
                              const updatedContent = `
                                <div style="max-width: 200px;">
                                  <strong style="color: #f43f5e; font-weight:bold; font-size:16px" >${details.name}</strong><br/>
                                  <span style="color:#585858;">${details.formatted_address || ""}</span><br/>
                                  <span style="color:#005ce6;">${details.formatted_phone_number || ""}</span><br/>
                                  <em>${details.opening_hours?.weekday_text?.join("<br/>") || ""}</em><br/>
                                  ${etaHtml} <button id="dir-btn" style="background-color:green; padding:5px; color:#fff; margin-top:7px; border-radius: 5px; border:none; cursor:pointer;">
                                    Get Directions
                                  </button>
                                  <button id="share-btn" style="margin-top:7px; margin-left:10px; padding:5px; background-color:blue; color:#fff; border-radius: 5px; border:none; cursor:pointer;">
                                    Share
                                  </button>
                                </div>
                              `;
                              infoWindow.setContent(updatedContent);
                              infoWindow.open(map, marker); // Re-open to refresh content
                              // --- END: Display ETA in InfoWindow ---

                              // Optionally, zoom and center the map to fit the route
                              if (response.routes && response.routes[0] && response.routes[0].bounds) {
                                map.fitBounds(response.routes[0].bounds);
                              }
                            } else {
                              console.error("Directions response is null or undefined.");
                              window.alert("Could not display directions. Please try again.");
                            }
                          } else {
                            console.error("Directions request failed:", status); // Log the actual status
                            window.alert("Directions request failed due to " + status);
                          }
                        }
                      );
                    });
                  }

                  if (shareBtn && details.url) {
                    shareBtn.addEventListener("click", () => {
                      const shareText = `Check out this place: ${details.name}\n${details.url}`;
                      if (navigator.share) {
                        navigator.share({
                          title: details.name,
                          text: shareText,
                          url: details.url,
                        }).catch(err => console.error("Error sharing:", err));
                      } else {
                        navigator.clipboard.writeText(shareText)
                          .then(() => alert("Link copied to clipboard!"))
                          .catch(() => alert("Failed to copy the link."));
                      }
                    });
                  }
                }, 300);
              }
            });
          });
        });
      }

      map.setCenter(userLocation);
      map.setZoom(14);

      setIsLoading(false);
    };

    if (userLocation) {
      initMap();
    }

    // Cleanup function for useEffect
    return () => {
      markersRef.current.forEach(marker => marker.map = null);
      markersRef.current = [];
      if (userMarkerRef.current) {
        userMarkerRef.current.map = null;
        userMarkerRef.current = null;
      }
      // Ensure directions are cleared when component unmounts or dependencies change
      if (directionsRenderer.current) {
        directionsRenderer.current.setMap(null);
      }
    };
  }, [userLocation, placeList, selectedPlaceId]);

  return (
    <div className="w-full h-full rounded-2xl border-2 border-white relative overflow-hidden">
      {isLoading && <MapLoader />}
      <div ref={mapRef} className="w-full h-full" />
    </div>
  );
}