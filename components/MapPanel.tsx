// MapPanel.tsx

interface MapPanelProps {
    location: { lat: number; lng: number }; // Not optional anymore
  }
  
  const MapPanel = ({ location }: { location: { lat: number; lng: number } }) => {
    if (!location) {
      throw new Error("MapPanel requires a valid location object.");
    }
  
    const { lat, lng } = location;
  
    return (
      <iframe
        title="Google Map"
        className="w-full h-full rounded-2xl"
        loading="lazy"
        src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_PLACE_KEY}&q=${lat},${lng}&zoom=14`}
      ></iframe>
    );
  };
  
  
  export default MapPanel;
  