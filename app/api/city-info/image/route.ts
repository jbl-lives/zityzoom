// app/api/city-info/image/route.ts
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get("city");
  const country = searchParams.get("country");

  console.log("DEBUG: GOOGLE_PLACE_KEY =", process.env.GOOGLE_PLACE_KEY); // Debug log

  if (!city) {
    return NextResponse.json({ message: "City is required" }, { status: 400 });
  }

  const apiKey = process.env.GOOGLE_PLACE_KEY; // Use GOOGLE_PLACE_KEY
  if (!apiKey) {
    return NextResponse.json({ message: "Google API key missing" }, { status: 500 });
  }

  try {
    const query = country ? `${city}, ${country}` : city;
    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(
      query
    )}&key=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { message: data.error_message || "Google API error" },
        { status: response.status }
      );
    }

    const photoReference = data.results?.[0]?.photos?.[0]?.photo_reference;
    if (!photoReference) {
      return NextResponse.json({ message: "No image found" }, { status: 404 });
    }

    const imageUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${photoReference}&key=${apiKey}`;
    return NextResponse.json({ imageUrl });
  } catch (error) {
    console.error("Image fetch error:", error);
    return NextResponse.json({ message: "Failed to fetch image" }, { status: 500 });
  }
}