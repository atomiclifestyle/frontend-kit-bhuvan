'use client';

import { useState } from 'react';
import { getRouting, getThematicData, villageGeocoding, getEllipsoid } from '@/utils/bhuvan-api-methods';
import '@/app/globals.css';
import SpaceBackground from '@/components/SpaceBackground';

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