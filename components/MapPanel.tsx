"use client";

import { useEffect, useRef } from "react";

type Props = {
  userLocation: { lat: number; lng: number } | null;
  placeList: any[];
};

export default function MapPanel({ userLocation, placeList }: Props) {
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
        });

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
                  <button id="dir-btn">Get Directions</button>
                </div>
              `;
              infoWindow.setContent(content);
              infoWindow.open(map, marker);

              setTimeout(() => {
                const dirBtn = document.getElementById("dir-btn");
                const destination = details.geometry?.location;
              
                if (dirBtn && destination) {
                  dirBtn.addEventListener("click", () => {
                    directionsService.route(
                      {
                        origin: userLocation,
                        destination, // safe now
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
              }, 300);
              
            }
          });
        });
      });

      mapInstance.current = map;
    };

    initMap();
  }, [userLocation, placeList]);

  return <div ref={mapRef} className="w-full h-full rounded-xl" />;
}
