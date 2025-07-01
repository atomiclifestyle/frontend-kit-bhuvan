import { useState } from 'react';
import { getRouting, getThematicData, villageGeocoding, getEllipsoid } from '../utils/bhuvan-api/api-methods';
import '../global.css';

// Function to generate random box-shadows for stars with brighter, varied colors
const generateStars = (count, maxWidth, maxHeight) => {
  let shadows = '';
  for (let i = 0; i < count; i++) {
    const x = Math.random() * maxWidth;
    const y = Math.random() * maxHeight;
    // Brighter color palette: white, light blue, and yellowish
    const color = Math.random() > 0.7 ? '#FFFFFF' : Math.random() > 0.4 ? '#A6CFFF' : '#FFF9A3';
    const size = Math.random() > 0.9 ? '3px' : '2px'; // Slightly larger for visibility
    shadows += `${x}px ${y}px ${size} ${color}, `;
  }
  return shadows.slice(0, -2);
};

// StarLayer component with dynamic animation
const StarLayer = ({ count, speed, maxWidth, maxHeight }) => {
  const shadows = generateStars(count, maxWidth, maxHeight);
  return (
    <div
      className="absolute top-0 left-0 w-[4000px] h-[2000px] will-change-transform pointer-events-none"
      style={{
        boxShadow: shadows,
        animation: `moveStars ${speed}s linear infinite`,
      }}
    />
  );
};

// Nebula component with brighter, more vibrant glow
const Nebula = () => (
  <div
    className="absolute inset-0 pointer-events-none"
    style={{
      background: 'radial-gradient(circle at 30% 20%, rgba(120, 180, 255, 0.3) 0%, transparent 50%), ' +
                 'radial-gradient(circle at 70% 80%, rgba(200, 120, 255, 0.3) 0%, transparent 50%)',
      opacity: 1, // Increased opacity for visibility
      animation: 'pulseNebula 15s ease-in-out infinite', // Slightly faster pulse
    }}
  />
);

// SpaceBackground component combining stars and nebula
const SpaceBackground = () => {
  const maxWidth = 4000;
  const maxHeight = 2000;
  return (
    <div className="absolute inset-0 overflow-hidden z-0">
      <Nebula />
      <StarLayer count={100} speed={80} maxWidth={maxWidth} maxHeight={maxHeight} />
      <StarLayer count={60} speed={120} maxWidth={maxWidth} maxHeight={maxHeight} />
      <StarLayer count={40} speed={160} maxWidth={maxWidth} maxHeight={maxHeight} />
    </div>
  );
};

function DemoApp() {
  const [routingData, setRoutingData] = useState(null);
  const [thematicData, setThematicData] = useState(null);
  const [vgData, setVgData] = useState(null);

  const handleGetRouting = async () => {
    const result = await getRouting(29.66, 77.63, 25.33, 82.70);
    setRoutingData(result);
  };

  const handleGetThematicData = async () => {
    const result = await getThematicData(23, 77, '2004_05');
    setThematicData(result);
  };

  const handleGeocoding = async () => {
    const result = await villageGeocoding('seKuRu');
    setVgData(result);
  };

  const handleEllipsoid = async () => {
    const result = await getEllipsoid('cdnc43e');
    if (result.error) {
      alert(`Download failed: ${result.error}`);
    }   
  };

  return (
    <div className="relative min-h-screen bg-gray-900 text-gray-100 p-6 md:p-8">
      <SpaceBackground />
      <div className="relative z-10 max-w-5xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-center text-blue-400 mb-8 tracking-tight">
          Bhuvan Development Demo
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
          <button
            onClick={handleGetRouting}
            className="bg-blue-600 text-white font-medium py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md hover:shadow-lg"
          >
            Fetch Routing API
          </button>
          <button
            onClick={handleGetThematicData}
            className="bg-blue-600 text-white font-medium py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md hover:shadow-lg"
          >
            Fetch Thematic Data
          </button>
          <button
            onClick={handleGeocoding}
            className="bg-blue-600 text-white font-medium py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md hover:shadow-lg"
          >
            Village Geocoding
          </button>
          <button
            onClick={handleEllipsoid}
            className="bg-blue-600 text-white font-medium py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md hover:shadow-lg"
          >
            Ellipsoid to Geoid
          </button>
        </div>
        <div className="space-y-8">
          <div>
            <h2 className="text-xl md:text-2xl font-semibold text-gray-200 mb-3">Routing Data</h2>
            <pre className="bg-gray-800 text-gray-200 p-4 rounded-lg overflow-auto max-h-96 text-sm font-mono shadow-inner">
              {routingData ? JSON.stringify(routingData, null, 2) : 'No data yet'}
            </pre>
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-semibold text-gray-200 mb-3">Thematic Data</h2>
            <pre className="bg-gray-800 text-gray-200 p-4 rounded-lg overflow-auto max-h-96 text-sm font-mono shadow-inner">
              {thematicData ? JSON.stringify(thematicData, null, 2) : 'No data yet'}
            </pre>
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-semibold text-gray-200 mb-3">Village Geocoding</h2>
            <pre className="bg-gray-800 text-gray-200 p-4 rounded-lg overflow-auto max-h-96 text-sm font-mono shadow-inner">
              {vgData ? JSON.stringify(vgData, null, 2) : 'No data yet'}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DemoApp;