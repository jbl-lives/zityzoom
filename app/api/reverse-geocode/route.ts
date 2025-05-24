// app/api/reverse-geocode/route.ts
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');

  if (!lat || !lng) {
    return NextResponse.json({ error: 'Latitude and longitude parameters are required.' }, { status: 400 });
  }

  // Ensure you replace YOUR_GOOGLE_GEOCODING_API_KEY with your actual key
  const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_Maps_API_KEY; // Using the same public key for consistency, but if you have a separate server-side key, use that.

  if (!GOOGLE_API_KEY) {
    console.error("Google API key is not set in environment variables.");
    return NextResponse.json({ error: 'Server configuration error: API key missing.' }, { status: 500 });
  }

  try {
    const googleGeocodingUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_API_KEY}`;
    const response = await fetch(googleGeocodingUrl);
    const data = await response.json();

    if (!response.ok || data.status !== 'OK') {
      console.error("Google Geocoding API error:", data);
      return NextResponse.json({ error: data.error_message || 'Failed to reverse geocode location.' }, { status: response.status || 500 });
    }

    // Find the country component in the results
    const countryComponent = data.results.find((result: any) =>
      result.types.includes('country')
    );

    const countryName = countryComponent?.address_components?.[0]?.long_name || null;

    if (!countryName) {
      console.warn("Could not determine country for location:", lat, lng, data);
      return NextResponse.json({ error: 'Country not found for this location.' }, { status: 404 });
    }

    return NextResponse.json({ country: countryName }, { status: 200 });

  } catch (error) {
    console.error("Error in reverse geocoding API route:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}