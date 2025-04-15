import { NextResponse } from "next/server";

const BASE_URL = "https://maps.googleapis.com/maps/api/place/nearbysearch/json?";
const GOOGLE_PLACE_KEY = process.env.GOOGLE_PLACE_KEY;

export async function GET(request: any) {
    const { searchParams }: any = new URL(request.url);
    const keyword = searchParams.get("keyword");
    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng");
    const locationBias = searchParams.get("locationBias");
  
    if (!keyword) {
      return NextResponse.json({ error: "Missing keyword" }, { status: 400 });
    }
  
    let url = "";
    const useTextSearch = locationBias === "false" || !lat || !lng;
  
    if (useTextSearch) {
      // Fallback to Text Search API
      url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(keyword)}&key=${GOOGLE_PLACE_KEY}`;
    } else {
      // Use Nearby Search with location bias
      url = `${BASE_URL}keyword=${encodeURIComponent(keyword)}&location=${lat},${lng}&radius=3000&key=${GOOGLE_PLACE_KEY}`;
    }
  
    try {
      const res = await fetch(url);
      const resp = await res.json();
      return NextResponse.json({ resp });
    } catch (error) {
      return NextResponse.json({ error: "Failed to fetch from Google API" }, { status: 500 });
    }
  }
  