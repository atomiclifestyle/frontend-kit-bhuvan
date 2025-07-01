import { useState } from 'react';
import { getRouting, getThematicData, villageGeocoding, getEllipsoid } from '../utils/bhuvan-api/api-methods';

    function DemoApp() {
      const [routingData, setRoutingData] = useState(null);
      const [thematicData, setThematicData] = useState(null);
      const [vgData, setVgData] = useState(null);
      // const [ellipsoid, setEllipsoid] = useState(null);

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

      // const handleEllipsoid = async () => {
      //   const result = await getEllipsoid('cdnc43e');
      //   setEllipsoid(result);
      // };

      return (
        <div className="bg-gray-100 p-8">
          {/* <h1 className="text-4xl font-bold text-center text-blue-600 mb-2">Welcome To</h1> */}
          <h1 className="text-4xl font-bold text-center text-blue-600 mb-8">Bhuvan Development Demo App</h1>
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <button
                onClick={handleGetRouting}
                className="bg-blue-500 text-white font-semibold py-2 px-4 rounded hover:bg-blue-600"
              >
                Fetch Routing API
              </button>
              <button
                onClick={handleGetThematicData}
                className="bg-blue-500 text-white font-semibold py-2 px-4 rounded hover:bg-blue-600"
              >
                Fetch Thematic Data
              </button>
              <button
                onClick={handleGeocoding}
                className="bg-blue-500 text-white font-semibold py-2 px-4 rounded hover:bg-blue-600"
              >
                Add Village Geocoding
              </button>
              {/* <button
                onClick={handleEllipsoid}
                className="bg-blue-500 text-white font-semibold py-2 px-4 rounded hover:bg-blue-600"
              >
                Ellipsoid to Geoid conversion API
              </button> */}
            </div>
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-semibold text-gray-800 mb-2">Routing Data</h2>
                <pre className="bg-gray-800 text-white p-4 rounded-lg overflow-auto max-h-96">
                  {routingData ? JSON.stringify(routingData, null, 2) : 'No data yet'}
                </pre>
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-gray-800 mb-2">Thematic Data</h2>
                <pre className="bg-gray-800 text-white p-4 rounded-lg overflow-auto max-h-96">
                  {thematicData ? JSON.stringify(thematicData, null, 2) : 'No data yet'}
                </pre>
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-gray-800 mb-2">Village Geocoding</h2>
                <pre className="bg-gray-800 text-white p-4 rounded-lg overflow-auto max-h-96">
                  {vgData ? JSON.stringify(vgData, null, 2) : 'No data yet'}
                </pre>
              </div>
              {/* <div>
                <h2 className="text-2xl font-semibold text-gray-800 mb-2">Ellipsoid to Geoid conversion</h2>
                <pre className="bg-gray-800 text-white p-4 rounded-lg overflow-auto max-h-96">
                  {ellipsoid ? JSON.stringify(ellipsoid, null, 2) : 'No data yet'}
                </pre>
              </div> */}
            </div>
          </div>
        </div>
      );
    }

export default DemoApp
