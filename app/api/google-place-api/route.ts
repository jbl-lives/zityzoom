import { NextResponse } from "next/server";

const BASE_URL = "https://maps.googleapis.com/maps/api/place/nearbysearch/json?";
const GOOGLE_PLACE_KEY = process.env.GOOGLE_PLACE_KEY;
const DISTANCE_MATRIX_URL = "https://maps.googleapis.com/maps/api/distancematrix/json?";

export async function GET(request: any) {
  const { searchParams }: any = new URL(request.url);
  const keyword = searchParams.get("keyword");
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");

  // Safety check
  if (!keyword || !lat || !lng) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  }

  const url = `${BASE_URL}location=${lat},${lng}&radius=3000&keyword=${encodeURIComponent(
    keyword
  )}&key=${GOOGLE_PLACE_KEY}`;

  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  const resp = await res.json();

  return NextResponse.json({ resp });
}
