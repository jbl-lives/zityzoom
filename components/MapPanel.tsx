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
                  <strong style="color: #f43f5e; font-weight:bold; font-size:16px" >${details.name}</strong><br/>
                  <span style="color:#585858;">${details.formatted_address || ""}</span><br/>
                  <span style="color:#005ce6;">${details.formatted_phone_number || ""}</span><br/>
                  <em>${details.opening_hours?.weekday_text?.join("<br/>") || ""}</em><br/>
                  <button id="dir-btn">Directions</button>
                  <button id="share-btn" style="margin-top: 5px;">Share</button>
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
