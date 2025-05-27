// components/MapLoader.tsx
// REMOVE THE OLD MapLoader.tsx CONTENT AND REPLACE WITH THIS

import React from 'react';
import styles from '../app/loading.module.css'; // Import the CSS module

type MapLoaderProps = {
  message?: string;
};

// SVG content for the Lucid Map Pin, INCLUDING the <g> tag with styling attributes
// This ensures that stroke, stroke-width, fill, etc., are directly applied to the paths
// within the SVG content itself, giving more control.
const MAP_PIN_SVG_CONTENT = `
  <g stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none">
    <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/>
    <circle cx="12" cy="10" r="3"/>
  </g>
`;


const MapLoader: React.FC<MapLoaderProps> = ({ message = "Finding the best spots..." }) => {
  return (
    <div className={styles.loaderOverlay}>
      <div className={styles.mapPinContainer}>
        {/* Radar effect behind the pin */}
        <div className={styles.radarEffect}></div>
        {/* The map pin SVG */}
        <svg className={styles.mapPinSvg} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          {/* Using dangerouslySetInnerHTML to inject the full SVG content including <g> */}
          <div dangerouslySetInnerHTML={{ __html: MAP_PIN_SVG_CONTENT }} />
        </svg>
      </div>
      <p className={styles.loaderText}>{message}</p>
    </div>
  );
};

export default MapLoader;