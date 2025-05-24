"use client";

import { useEffect, useRef } from "react";

type Props = {
  userLocation: { lat: number; lng: number } | null;
  placeList: any[];
  selectedPlaceId?: string;
};

// --- SVG Path Definitions for Lucid Icons ---
// These are the extracted 'd' attributes or inner SVG elements
// from the Lucid Icons you provided.
const svgPaths: { [key: string]: string } = {
  // IMPORTANT: For Lucid icons, we're providing the inner SVG content (paths, rects, lines, circles)
  // excluding the <svg> wrapper and its stroke/fill attributes, as these are set dynamically.
  'default': `<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>`, // Generic info circle (using a placeholder for a fill-based icon)
  'restaurant': `<path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/>`, // Utensils
  'gas_station': `<line x1="3" x2="15" y1="22" y2="22"/><line x1="4" x2="14" y1="9" y2="9"/><path d="M14 22V4a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v18"/><path d="M14 13h2a2 2 0 0 1 2 2v2a2 2 0 0 0 2 2a2 2 0 0 0 2-2V9.83a2 2 0 0 0-.59-1.42L18 5"/>`, // Fuel
  'supermarket': `<path d="m15 11-1 9"/><path d="m19 11-4-7"/><path d="M2 11h20"/><path d="m3.5 11 1.6 7.4a2 2 0 0 0 2 1.6h9.8a2 2 0 0 0 2-1.6l1.7-7.4"/><path d="M4.5 15.5h15"/><path d="m5 11 4-7"/><path d="m9 11 1 9"/>`, // ShoppingBasket (for Groceries)
  'lodging': `<path d="M2 4v16"/><path d="M2 8h18a2 2 0 0 1 2 2v10"/><path d="M2 17h20"/><path d="M6 8v9"/>`, // Bed (for Bed and Breakfast)
  'bar': `<path d="M8 22h8"/><path d="M12 11v11"/><path d="m19 3-7 8-7-8Z"/>`, // Martini (for Bar/Night Club)
  'hotel': `<path d="M10 22v-6.57"/><path d="M12 11h.01"/><path d="M12 7h.01"/><path d="M14 15.43V22"/><path d="M15 16a5 5 0 0 0-6 0"/><path d="M16 11h.01"/><path d="M16 7h.01"/><path d="M8 11h.01"/><path d="M8 7h.01"/><rect x="4" y="2" width="16" height="20" rx="2"/>`, // Hotel
  'bank': `<rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/>`, // CreditCard (for Bank)
  'user_location_pin': `<path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/>` // Lucid map-pin
};


// --- Helper Functions for Custom SVG Markers ---

/**
 * Creates a DOM div element that serves as a custom marker.
 * It's a colored circle with an SVG icon inside.
 * @param svgPath The 'd' attribute value of the SVG path.
 * @param backgroundColor The background color of the circular marker.
 * @param svgColor The stroke color of the SVG icon.
 * @param size The diameter of the circular marker in pixels.
 * @returns A DOM div element ready to be used as AdvancedMarkerElement content.
 */
const createCustomSvgMarkerContent = (svgPath: string, backgroundColor: string, svgColor: string, size: number = 40): HTMLDivElement => {
    const markerContent = document.createElement('div');
    markerContent.style.width = `${size}px`;
    markerContent.style.height = `${size}px`;
    markerContent.style.backgroundColor = backgroundColor;
    markerContent.style.borderRadius = '50%'; // Make it circular
    markerContent.style.border = `2px solid ${backgroundColor}`; // Border same as background for solid look
    markerContent.style.display = 'flex';
    markerContent.style.justifyContent = 'center';
    markerContent.style.alignItems = 'center';
    markerContent.style.overflow = 'hidden';
    markerContent.style.boxShadow = '0 2px 6px rgba(0,0,0,0.3)'; // Subtle shadow

    // Create SVG element
    const svgElement = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svgElement.setAttribute("viewBox", "0 0 24 24"); // Standard viewBox for most icons
    // Adjusted size for icons inside the circular markers
    svgElement.setAttribute("width", `${size * 0.5}px`); // Reduced from 0.6 to 0.5
    svgElement.setAttribute("height", `${size * 0.5}px`); // Reduced from 0.6 to 0.5

    // For Lucid icons, they are designed with strokes.
    // Set the stroke color dynamically, and ensure fill is 'none'.
    // Use stroke-width for the line thickness
    svgElement.innerHTML = `<g stroke="${svgColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none">${svgPath}</g>`;

    markerContent.appendChild(svgElement);
    return markerContent;
};

/**
 * Determines the appropriate SVG path string for a given place based on its types.
 * This function now maps directly to the primary keyword provided for each category,
 * ensuring no sharing of icons.
 * @param types An array of place types from Google Places API.
 * @returns The SVG path string corresponding to the place type.
 */
const getSvgPathForPlaceType = (types: string[]): string => {
  if (!types || types.length === 0) return svgPaths['default'];

  // Check for exact matches based on your category keywords
  if (types.includes('restaurant')) return svgPaths['restaurant'];
  if (types.includes('gas_station')) return svgPaths['gas_station'];
  if (types.includes('supermarket')) return svgPaths['supermarket'];
  if (types.includes('lodging')) return svgPaths['lodging'];
  if (types.includes('bar')) return svgPaths['bar'];
  if (types.includes('hotel')) return svgPaths['hotel'];
  if (types.includes('bank')) return svgPaths['bank'];

  // Fallback to default if no specific match
  return svgPaths['default'];
};


export default function MapPanel({ userLocation, placeList, selectedPlaceId }: Props) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const directionsRenderer = useRef<google.maps.DirectionsRenderer | null>(null);
  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
  const userMarkerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(null);

  useEffect(() => {
    // Ensure Google Maps API and marker library are loaded
    if (typeof window.google === 'undefined' || !window.google.maps || !window.google.maps.marker) {
      console.warn("Google Maps JavaScript API (and marker library) not yet loaded.");
      return;
    }

    if (!mapRef.current || !userLocation) return;

    const initMap = () => {
      // Clear previous markers
      markersRef.current.forEach(marker => marker.map = null);
      markersRef.current = [];
      if (userMarkerRef.current) {
        userMarkerRef.current.map = null;
        userMarkerRef.current = null;
      }
      if (directionsRenderer.current) {
        directionsRenderer.current.setMap(null);
      }

      const map = new google.maps.Map(mapRef.current!, {
        center: userLocation,
        zoom: 14,
        mapId: process.env.NEXT_PUBLIC_MAP_ID || undefined, // Map ID is required for Advanced Markers
        gestureHandling: 'greedy', // Allows direct scroll wheel zoom
      });
      mapInstance.current = map;

      const directionsService = new google.maps.DirectionsService();
      directionsRenderer.current = new google.maps.DirectionsRenderer();
      directionsRenderer.current.setMap(map);

      // --- Custom User Location Marker (Green Pin with Lucid Map Pin SVG) ---
      const userMarkerContent = createCustomSvgMarkerContent(
          svgPaths['user_location_pin'], // Use the Lucid map-pin SVG
          '#4CAF50', // Green background
          '#FFFFFF' // White SVG icon (stroke)
      );

      userMarkerRef.current = new google.maps.marker.AdvancedMarkerElement({
        position: userLocation,
        map,
        title: "You are here",
        content: userMarkerContent, // Use the custom HTML element
      });


      const infoWindow = new google.maps.InfoWindow();

      placeList.forEach((place) => {
        let markerContentElement: HTMLDivElement;
        const placeSvgPath = getSvgPathForPlaceType(place.types); // Get SVG path based on place types

        if (place.place_id === selectedPlaceId) {
          // --- Selected Place Marker (Blue Pin with White SVG Icon) ---
          markerContentElement = createCustomSvgMarkerContent(
              placeSvgPath,
              '#19aeff', // Blue background
              '#FFFFFF' // White SVG icon (stroke)
          );
          // Map remains centered on user's location, it does not pan to selected place
        } else {
          // --- Default Place Marker (Red Pin with White SVG Icon) ---
          markerContentElement = createCustomSvgMarkerContent(
              placeSvgPath,
              '#d41d01', // Rose/Red background
              '#FFFFFF' // White SVG icon (stroke)
          );
        }

        const marker = new google.maps.marker.AdvancedMarkerElement({
          position: place.geometry.location,
          map,
          title: place.name,
          content: markerContentElement, // Set the custom HTML element
        });

        markersRef.current.push(marker);

        // Use gmp-click for AdvancedMarkerElement
        marker.addListener("gmp-click", () => {
          const service = new google.maps.places.PlacesService(map);
          service.getDetails({ placeId: place.place_id }, (details, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK && details) {
              const content = `
                <div style="max-width: 200px;">
                  <strong style="color: #f43f5e; font-weight:bold; font-size:16px" >${details.name}</strong><br/>
                  <span style="color:#585858;">${details.formatted_address || ""}</span><br/>
                  <span style="color:#005ce6;">${details.formatted_phone_number || ""}</span><br/>
                  <em>${details.opening_hours?.weekday_text?.join("<br/>") || ""}</em><br/>
                  <button id="dir-btn" style="background-color:green; padding:5px; color:#fff; margin-top:7px;">
                    Directions
                  </button>
                  <button id="share-btn" style="margin-top:7px; margin-left:10px; padding:5px; background-color:blue; color:#fff;">
                    Share
                  </button>
                </div>
              `;
              infoWindow.setContent(content);
              infoWindow.open(map, marker);

              setTimeout(() => {
                const dirBtn = document.getElementById("dir-btn");
                const shareBtn = document.getElementById("share-btn");
                const destination = details.geometry?.location;

                if (dirBtn && destination && userLocation) {
                  dirBtn.addEventListener("click", () => {
                    const destLat = destination.lat();
                    const destLng = destination.lng();
                    const originLat = userLocation.lat;
                    const originLng = userLocation.lng;

                    const mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${originLat},${originLng}&destination=${destLat},${destLng}&travelmode=driving`;
                    window.open(mapsUrl, '_blank');
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

      // --- Map Centering Logic (Always centers on user location unless actively moved by user) ---
      // This ensures the map stays focused on the user's vicinity
      map.setCenter(userLocation);
      map.setZoom(14);
    };

    if (userLocation) {
      initMap();
    }

    return () => {
      // Clean up markers and directions when the component unmounts or dependencies change
      markersRef.current.forEach(marker => marker.map = null);
      markersRef.current = [];
      if (userMarkerRef.current) {
        userMarkerRef.current.map = null;
        userMarkerRef.current = null;
      }
      if (directionsRenderer.current) {
        directionsRenderer.current.setMap(null);
        directionsRenderer.current = null;
      }
    };
  }, [userLocation, placeList, selectedPlaceId]); // Dependencies for useEffect

  return <div ref={mapRef} className="w-full h-full rounded-2xl border-2 border-white" />;
}