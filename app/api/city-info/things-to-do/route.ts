// app/api/city-info/things-to-do/route.ts
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get("city");
  const country = searchParams.get("country");

  console.log("DEBUG: GOOGLE_PLACE_KEY =", process.env.GOOGLE_PLACE_KEY);

  if (!city) {
    return NextResponse.json({ message: "City is required" }, { status: 400 });
  }

  const apiKey = process.env.GOOGLE_PLACE_KEY;
  if (!apiKey) {
    return NextResponse.json({ message: "Google API key missing" }, { status: 500 });
  }

  try {
    const query = country ? `points of interest in ${city}, ${country}` : `points of interest in ${city}`;
    const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(
      query
    )}&type=tourist_attraction&key=${apiKey}`;
    const searchResponse = await fetch(searchUrl);
    const searchData = await searchResponse.json();

    if (!searchResponse.ok) {
      return NextResponse.json(
        { message: searchData.error_message || "Google API error" },
        { status: searchResponse.status }
      );
    }

    // Fetch details for each place to get opening hours
    const activities = await Promise.all(
      (searchData.results || []).slice(0, 6).map(async (place: any) => {
        const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=name,photos,opening_hours&key=${apiKey}`;
        const detailsResponse = await fetch(detailsUrl);
        const detailsData = await detailsResponse.json();

        return {
          name: place.name || "Unknown Activity",
          image: place.photos?.[0]?.photo_reference
            ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${place.photos[0].photo_reference}&key=${apiKey}`
            : "/city-icon.webp",
          openNow: detailsData.result?.opening_hours?.open_now ?? undefined,
          hours: detailsData.result?.opening_hours?.weekday_text?.[0] || "Hours not available",
        };
      })
    );

    return NextResponse.json({ activities });
  } catch (error) {
    console.error("Things-to-do error:", error);
    return NextResponse.json({ message: "Failed to fetch activities" }, { status: 500 });
  }
}