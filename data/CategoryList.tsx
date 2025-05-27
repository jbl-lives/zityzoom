// components/CategoryList.tsx (Example component)

import React from 'react';
import categories from '@/data/category'; // Import your categories data

// Assuming you have a shared SVG paths object, maybe imported or defined here for simplicity
// For now, let's keep it here for demonstration, but you might centralize it.
const svgPaths: { [key: string]: string } = {
  'restaurant': `<path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/>`, // Utensils
  'gas_station': `<line x1="3" x2="15" y1="22" y2="22"/><line x1="4" x2="14" y1="9" y2="9"/><path d="M14 22V4a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v18"/><path d="M14 13h2a2 2 0 0 1 2 2v2a2 2 0 0 0 2 2a2 2 0 0 0 2-2V9.83a2 2 0 0 0-.59-1.42L18 5"/>`, // Fuel
  'supermarket': `<path d="m15 11-1 9"/><path d="m19 11-4-7"/><path d="M2 11h20"/><path d="m3.5 11 1.6 7.4a2 2 0 0 0 2 1.6h9.8a2 2 0 0 0 2-1.6l1.7-7.4"/><path d="M4.5 15.5h15"/><path d="m5 11 4-7"/><path d="m9 11 1 9"/>`, // ShoppingBasket (for Groceries)
  'lodging': `<path d="M2 4v16"/><path d="M2 8h18a2 2 0 0 1 2 2v10"/><path d="M2 17h20"/><path d="M6 8v9"/>`, // Bed
  'bar': `<path d="M8 22h8"/><path d="M12 11v11"/><path d="m19 3-7 8-7-8Z"/>`, // Martini
  'hotel': `<path d="M10 22v-6.57"/><path d="M12 11h.01"/><path d="M12 7h.01"/><path d="M14 15.43V22"/><path d="M15 16a5 5 0 0 0-6 0"/><path d="M16 11h.01"/><path d="M16 7h.01"/><path d="M8 11h.01"/><path d="M8 7h.01"/><rect x="4" y="2" width="16" height="20" rx="2"/>`, // Hotel
  'bank': `<rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/>`, // CreditCard
  'cafe': `<circle cx="12" cy="17" r="4"/><path d="M12 12V3"/><path d="M6.71 10.71l-.71.71A4 4 0 0 0 4 14v2a2 2 0 0 0 2 2h0"/><path d="M17.29 10.71l.71.71A4 4 0 0 1 20 14v2a2 2 0 0 1-2 2h0"/>` // Coffee
  // ... and so on for all your Lucid Icons
};

const CategoryList: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', padding: '20px' }}>
      {categories.map(category => {
        const iconPath = svgPaths[category.keyword]; // Get the SVG path based on the keyword

        // Only render if an icon path exists for the keyword
        if (!iconPath) return null;

        return (
          <div key={category.id} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            border: '1px solid #ddd', borderRadius: '8px', padding: '10px',
            cursor: 'pointer', minWidth: '80px', textAlign: 'center'
          }}>
            {/* Render the SVG icon directly */}
            <svg
              viewBox="0 0 24 24"
              width="30"
              height="30"
              stroke="#333" // Example stroke color
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ marginBottom: '5px' }}
            >
              <div dangerouslySetInnerHTML={{ __html: iconPath }} />
            </svg>
            <span style={{ fontSize: '0.8em', color: '#555' }}>{category.name}</span>
          </div>
        );
      })}
    </div>
  );
};

export default CategoryList;