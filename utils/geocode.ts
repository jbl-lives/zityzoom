// utils/geocode.ts
export async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
  if (!lat || !lng) {
    console.error('Invalid coordinates for reverse geocoding:', { lat, lng });
    return null;
  }
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${process.env.NEXT_PUBLIC_Maps_API_KEY}`
    );
    const data = await response.json();
    if (data.status === 'OK' && data.results[0]) {
      return data.results[0].formatted_address;
    }
    console.error('Reverse geocoding failed:', data.status);
    return null;
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return null;
  }
}