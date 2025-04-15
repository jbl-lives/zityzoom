"use client";

import { useEffect, useRef } from "react";

type Props = {
  userLocation: { lat: number; lng: number } | null;
  placeList: any[];
  selectedPlaceId?: string;
};

export default function MapPanel({ userLocation, placeList, selectedPlaceId }: Props) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const directionsRenderer = useRef<google.maps.DirectionsRenderer | null>(null);

  useEffect(() => {
    if (!mapRef.current || !userLocation || !placeList.length) return;

    const initMap = () => {
      const map = new google.maps.Map(mapRef.current!, {
        center: userLocation,
        zoom: 14,
      });

      const directionsService = new google.maps.DirectionsService();
      directionsRenderer.current = new google.maps.DirectionsRenderer();
      directionsRenderer.current.setMap(map);

      // Add user location marker
      new google.maps.Marker({
        position: userLocation,
        map,
        title: "You are here",
        icon: {
          url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
        },
      });

      const infoWindow = new google.maps.InfoWindow();

      placeList.forEach((place) => {
        const marker = new google.maps.Marker({
          position: place.geometry.location,
          map,
          title: place.name,
          icon: place.place_id === selectedPlaceId
            ? "http://maps.google.com/mapfiles/ms/icons/green-dot.png"
            : undefined,
        });

        if (place.place_id === selectedPlaceId) {
          map.setCenter(place.geometry.location);
          marker.setAnimation(google.maps.Animation.BOUNCE);
          setTimeout(() => marker.setAnimation(null), 1400);
        }

        marker.addListener("click", () => {
          const service = new google.maps.places.PlacesService(map);
          service.getDetails({ placeId: place.place_id }, (details, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK && details) {
              const content = `
                <div style="max-width: 200px;">
                  <strong>${details.name}</strong><br/>
                  ${details.formatted_address || ""}<br/>
                  ${details.formatted_phone_number || ""}<br/>
                  <em>${details.opening_hours?.weekday_text?.join("<br/>") || ""}</em><br/>
                  <button id="dir-btn">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0Z" />
                  </svg>

                  </button>
                  <button id="share-btn" style="margin-top: 5px;">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z" />
                    </svg>
                  </button>
                </div>
              `;
              infoWindow.setContent(content);
              infoWindow.open(map, marker);

              setTimeout(() => {
                const dirBtn = document.getElementById("dir-btn");
                const shareBtn = document.getElementById("share-btn");
                const destination = details.geometry?.location;

                // Directions button logic
                if (dirBtn && destination) {
                  dirBtn.addEventListener("click", () => {
                    directionsService.route(
                      {
                        origin: userLocation,
                        destination,
                        travelMode: google.maps.TravelMode.DRIVING,
                      },
                      (result, status) => {
                        if (status === "OK" && result) {
                          directionsRenderer.current!.setDirections(result);
                        } else {
                          alert("Could not get directions.");
                        }
                      }
                    );
                  });
                }

                // Share button logic
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

      mapInstance.current = map;
    };

    initMap();
  }, [userLocation, placeList, selectedPlaceId]);

  return <div ref={mapRef} className="w-full h-full rounded-xl" />;
}
