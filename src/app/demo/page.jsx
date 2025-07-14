'use client';

import { useState } from 'react';
import { getRouting, getThematicData, villageGeocoding, getEllipsoid } from '@/utils/bhuvan-api-methods';
import '@/app/globals.css';

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
      <div className="absolute inset-0 opacity-30">
            {[...Array(100)].map((_, i) => (
              <div
                key={i}
                className="absolute bg-white rounded-full"
                style={{
                  width: Math.random() * 4 + 1 + 'px',
                  height: Math.random() * 4 + 1 + 'px',
                  left: Math.random() * 100 + '%',
                  top: Math.random() * 100 + '%',
                  animation: `twinkle ${Math.random() * 5 + 5}s infinite`,
                }}
              />
            ))}
          </div>
    </div>
  );
};

    function DemoApp() {
      const [routingData, setRoutingData] = useState(null);
      const [thematicData, setThematicData] = useState(null);
      const [vgData, setVgData] = useState(null);
      
      // State for input fields
      const [routingInputs, setRoutingInputs] = useState({
        startLat: '29.66',
        startLon: '77.63',
        endLat: '25.33',
        endLon: '82.70'
      });
      const [thematicInputs, setThematicInputs] = useState({
        lat: '23',
        lon: '77',
        date: '2004_05'
      });
      const [villageInput, setVillageInput] = useState('seKuRu');
      const [ellipsoidInput, setEllipsoidInput] = useState('cdnc43e');

      const handleGetRouting = async () => {
        const { startLat, startLon, endLat, endLon } = routingInputs;
        const result = await getRouting(
          parseFloat(startLat), 
          parseFloat(startLon), 
          parseFloat(endLat), 
          parseFloat(endLon)
        );
        setRoutingData(result);
      };

      const handleGetThematicData = async () => {
        const { lat, lon, date } = thematicInputs;
        const result = await getThematicData(
          parseFloat(lat), 
          parseFloat(lon), 
          date
        );
        setThematicData(result);
      };

      const handleGeocoding = async () => {
        const result = await villageGeocoding(villageInput);
        setVgData(result);
      };

      const handleEllipsoid = async () => {
        const result = await getEllipsoid(ellipsoidInput);
        if (result.error) {
          alert(`Download failed: ${result.error}`);
        }   
      };

      const handleRoutingInputChange = (e) => {
        const { name, value } = e.target;
        setRoutingInputs(prev => ({ ...prev, [name]: value }));
      };

      const handleThematicInputChange = (e) => {
        const { name, value } = e.target;
        setThematicInputs(prev => ({ ...prev, [name]: value }));
      };

      return (
        <div className="relative min-h-screen bg-gray-900 text-gray-100 p-6 md:p-8">
          <SpaceBackground />
          <div className="relative z-10 max-w-5xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold text-center text-blue-400 mb-8 tracking-tight">
              Bhuvan Development Demo
            </h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <input
                    name="startLat"
                    value={routingInputs.startLat}
                    onChange={handleRoutingInputChange}
                    placeholder="Start Latitude"
                    className="bg-gray-800 text-white p-2 rounded-lg"
                    type="number"
                    step="any"
                  />
                  <input
                    name="startLon"
                    value={routingInputs.startLon}
                    onChange={handleRoutingInputChange}
                    placeholder="Start Longitude"
                    className="bg-gray-800 text-white p-2 rounded-lg"
                    type="number"
                    step="any"
                  />
                  <input
                    name="endLat"
                    value={routingInputs.endLat}
                    onChange={handleRoutingInputChange}
                    placeholder="End Latitude"
                    className="bg-gray-800 text-white p-2 rounded-lg"
                    type="number"
                    step="any"
                  />
                  <input
                    name="endLon"
                    value={routingInputs.endLon}
                    onChange={handleRoutingInputChange}
                    placeholder="End Longitude"
                    className="bg-gray-800 text-white p-2 rounded-lg"
                    type="number"
                    step="any"
                  />
                </div>
                <button
                  onClick={handleGetRouting}
                  className="w-full bg-blue-600 text-white font-medium py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md hover:shadow-lg"
                >
                  Fetch Routing API
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <input
                    name="lat"
                    value={thematicInputs.lat}
                    onChange={handleThematicInputChange}
                    placeholder="Latitude"
                    className="bg-gray-800 text-white p-2 rounded-lg"
                    type="number"
                    step="any"
                  />
                  <input
                    name="lon"
                    value={thematicInputs.lon}
                    onChange={handleThematicInputChange}
                    placeholder="Longitude"
                    className="bg-gray-800 text-white p-2 rounded-lg"
                    type="number"
                    step="any"
                  />
                  <input
                    name="date"
                    value={thematicInputs.date}
                    onChange={handleThematicInputChange}
                    placeholder="Date (YYYY_MM)"
                    className="bg-gray-800 text-white p-2 rounded-lg col-span-2"
                  />
                </div>
                <button
                  onClick={handleGetThematicData}
                  className="w-full bg-blue-600 text-white font-medium py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md hover:shadow-lg"
                >
                  Fetch Thematic Data
                </button>
              </div>

              <div className="space-y-4">
                <input
                  value={villageInput}
                  onChange={(e) => setVillageInput(e.target.value)}
                  placeholder="Village Name"
                  className="w-full bg-gray-800 text-white p-2 rounded-lg"
                />
                <button
                  onClick={handleGeocoding}
                  className="w-full bg-blue-600 text-white font-medium py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md hover:shadow-lg"
                >
                  Village Geocoding
                </button>
              </div>

              <div className="space-y-4">
                <input
                  value={ellipsoidInput}
                  onChange={(e) => setEllipsoidInput(e.target.value)}
                  placeholder="Ellipsoid Code"
                  className="w-full bg-gray-800 text-white p-2 rounded-lg"
                />
                <button
                  onClick={handleEllipsoid}
                  className="w-full bg-blue-600 text-white font-medium py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md hover:shadow-lg"
                >
                  Ellipsoid to Geoid
                </button>
              </div>
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
