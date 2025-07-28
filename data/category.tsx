// data/category.ts (Your existing content is good, just confirming)

// Define your SVG icon paths directly here, or import them from utils/svgPaths
let RestaurantIcon = `<path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/>`;
let GasStationIcon = `<line x1="3" x2="15" y1="22" y2="22"/><line x1="4" x2="14" y1="9" y2="9"/><path d="M14 22V4a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v18"/><path d="M14 13h2a2 2 0 0 1 2 2v2a2 2 0 0 0 2 2a2 2 0 0 0 2-2V9.83a2 2 0 0 0-.59-1.42L18 5"/>`;
let SupermarketIcon = `<path d="m15 11-1 9"/><path d="m19 11-4-7"/><path d="M2 11h20"/><path d="m3.5 11 1.6 7.4a2 2 0 0 0 2 1.6h9.8a2 2 0 0 0 2-1.6l1.7-7.4"/><path d="M4.5 15.5h15"/><path d="m5 11 4-7"/><path d="m9 11 1 9"/>`;
let LodgingIcon = `<path d="M2 4v16"/><path d="M2 8h18a2 2 0 0 1 2 2v10"/><path d="M2 17h20"/><path d="M6 8v9"/>`;
let BarIcon = `<path d="M8 22h8"/><path d="M12 11v11"/><path d="m19 3-7 8-7-8Z"/>`;
let HotelIcon = `<path d="M10 22v-6.57"/><path d="M12 11h.01"/><path d="M12 7h.01"/><path d="M14 15.43V22"/><path d="M15 16a5 5 0 0 0-6 0"/><path d="M16 11h.01"/><path d="M16 7h.01"/><path d="M8 11h.01"/><path d="M8 7h.01"/><rect x="4" y="2" width="16" height="20" rx="2"/>`;
let BankIcon = `<rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/>`;


export default [
  { id: 1, name: "Restaurants", icon: RestaurantIcon, keyword: "restaurant" },
  { id: 2, name: "Gas Stations", icon: GasStationIcon, keyword: "gas_station" },
  { id: 3, name: "Grocery Stores", icon: SupermarketIcon, keyword: "supermarket" },
  { id: 4, name: "Bed and Breakfast", icon: LodgingIcon, keyword: "lodging" },
  { id: 5, name: "Night Club", icon: BarIcon, keyword: "bar" },
  { id: 6, name: "Hotels", icon: HotelIcon, keyword: "hotel" },
  { id: 7, name: "Banks", icon: BankIcon, keyword: "bank" },
];