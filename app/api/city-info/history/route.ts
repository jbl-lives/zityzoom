// app/api/city-info/history/route.ts
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city');
    const country = searchParams.get('country'); // <--- NEW: Get country parameter

    console.log(`DEBUG: API Route (/api/city-info/history): Received city='${city}', country='${country}'`);

    if (!city || typeof city !== 'string') {
        return NextResponse.json({ error: 'City parameter is required.' }, { status: 400 });
    }

    let wikipediaQuery = city;

    // --- NEW LOGIC START ---
    // Special handling for Orkney, South Africa
    if (city.toLowerCase() === 'orkney' && country?.toLowerCase() === 'south africa') {
        wikipediaQuery = 'Orkney, North West'; // This is the specific Wikipedia page title
        console.log(`Special handling for Orkney, South Africa. Searching Wikipedia for: ${wikipediaQuery}`);
    } else if (country) {
        // General handling: Append country for disambiguation if provided
        wikipediaQuery = `${city}, ${country}`;
        console.log(`Searching Wikipedia for: ${wikipediaQuery}`);
    }
    // --- NEW LOGIC END ---


    try {
        const wikipediaUrl = `https://en.wikipedia.org/w/api.php?action=query&prop=extracts&exintro&explaintext&redirects=1&format=json&titles=${encodeURIComponent(wikipediaQuery)}`;

        const wikipediaResponse = await fetch(wikipediaUrl);
        const wikipediaData = await wikipediaResponse.json();

        if (!wikipediaResponse.ok || !wikipediaData.query) {
            console.error("Wikipedia API error:", wikipediaData);
            return NextResponse.json({ error: wikipediaData.error?.info || "Failed to fetch from Wikipedia." }, { status: wikipediaResponse.status || 500 });
        }

        const pages = wikipediaData.query.pages;
        const pageId = Object.keys(pages)[0];
        const extract = pages[pageId].extract;

        // If the primary query failed or was too short, try the general city query as a last resort
        // (This fallback is less likely to be hit for "Orkney" now with the special handling)
        if (pageId === "-1" || !extract || extract.trim().length < 50) {
            console.warn(`Primary query '${wikipediaQuery}' failed or was too short. Trying general query for '${city}'.`);
            const fallbackWikipediaUrl = `https://en.wikipedia.org/w/api.php?action=query&prop=extracts&exintro&explaintext&redirects=1&format=json&titles=${encodeURIComponent(city)}`;
            const fallbackResponse = await fetch(fallbackWikipediaUrl);
            const fallbackData = await fallbackResponse.json();

            if (fallbackResponse.ok && fallbackData.query) {
                const fallbackPages = fallbackData.query.pages;
                const fallbackPageId = Object.keys(fallbackPages)[0];
                const fallbackExtract = fallbackPages[fallbackPageId].extract;

                if (fallbackPageId !== "-1" && fallbackExtract && fallbackExtract.trim().length > 50) {
                    console.log(`Used fallback search for '${city}'.`);
                    let conciseHistory = fallbackExtract.split('. ').find((sentence: string) =>
                        sentence.toLowerCase().includes('founded') ||
                        sentence.toLowerCase().includes('established') ||
                        sentence.toLowerCase().includes('history') ||
                        sentence.toLowerCase().includes('developed')
                    );
                    if (!conciseHistory) {
                        const sentences = fallbackExtract.split('. ').filter((s: string) => s.trim().length > 0);
                        conciseHistory = sentences.slice(0, Math.min(3, sentences.length)).join('. ');
                    }
                    if (!conciseHistory) {
                        conciseHistory = fallbackExtract.split('. ')[0] + '.';
                    }
                    return NextResponse.json({ history: conciseHistory.trim() }, { status: 200 });
                }
            }
            // If both fail
            return NextResponse.json({ error: `No relevant Wikipedia entry found for ${city}.` }, { status: 404 });
        }

        // If the primary query was successful
        let conciseHistory = extract.split('. ').find((sentence: string) =>
            sentence.toLowerCase().includes('founded') ||
            sentence.toLowerCase().includes('established') ||
            sentence.toLowerCase().includes('history') ||
            sentence.toLowerCase().includes('developed')
        );

        if (!conciseHistory) {
            const sentences = extract.split('. ').filter((s: string) => s.trim().length > 0);
            conciseHistory = sentences.slice(0, Math.min(3, sentences.length)).join('. ');
        }

        if (!conciseHistory) {
            conciseHistory = extract.split('. ')[0] + '.';
        }

        return NextResponse.json({ history: conciseHistory.trim() }, { status: 200 });

    } catch (error) {
        console.error("Server error fetching city history:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}