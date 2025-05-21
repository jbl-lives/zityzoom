// utils/mockApi.ts (optional helper for mock testing)
export const fetchRemoteSuggestions = async (query: string): Promise<string[]> => {
  // Simulate an API delay and return mock data
  await new Promise((res) => setTimeout(res, 300));
  const allSuggestions = [
    "Restaurant near me",
    "Restaurants in Cape Town",
    "Hotel deals",
    "Parking garages",
    "Gas stations nearby",
    "Tourist Attractions in Johannesburg",
  ];
  return allSuggestions.filter((item) =>
    item.toLowerCase().includes(query.toLowerCase())
  );
};
