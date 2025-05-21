import { NextRequest, NextResponse } from 'next/server';

const GOOGLE_PLACE_KEY = process.env.GOOGLE_PLACE_KEY;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const keyword = searchParams.get('keyword');
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');
  const type = searchParams.get('type'); // <--- IMPORTANT: Get the 'type' parameter
  const sessiontoken = searchParams.get('sessiontoken');

  if (!keyword) {
    return NextResponse.json({ error: "Missing keyword" }, { status: 400 });
  }

   let googleApiUrl = '';
   let params: string[] = [];
   params.push(`key=${process.env.NEXT_PUBLIC_Maps_API_KEY}`);

   if (type === 'autocomplete') {
    googleApiUrl = 'https://maps.googleapis.com/maps/api/place/autocomplete/json?';
    params.push(`input=${encodeURIComponent(keyword)}`);
    if (lat && lng) {
      params.push(`location=${lat},${lng}`);
      params.push('radius=50000'); // Optional: Add a radius for autocomplete bias
    }
    if (sessiontoken) {
        params.push(`sessiontoken=${sessiontoken}`);
    }
  } else if (type === 'textsearch') { // <--- Handle 'textsearch' specifically
    googleApiUrl = 'https://maps.googleapis.com/maps/api/place/textsearch/json?';
    params.push(`query=${encodeURIComponent(keyword)}`); // For Text Search, use 'query' not 'input'
    if (lat && lng) {
        params.push(`location=${lat},${lng}`);
        // No 'locationBias' for Text Search. Providing location implicitly biases.
        // If you need more strictness, consider 'strictbounds=true' and 'bounds' parameter.
    }
    // Session token is not directly used by Text Search for billing,
    // it's primarily for Autocomplete + Place Details pairing.
  } else {
    // Default or fallback to a different search type if needed, or return an error
    return NextResponse.json({ error: 'Invalid or missing search type' }, { status: 400 });
  }

  try {
    const googleResponse = await fetch(googleApiUrl + params.join('&'));
    const data = await googleResponse.json();
    return NextResponse.json({ resp: data });
  } catch (error) {
    console.error('Error fetching from Google Places API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
