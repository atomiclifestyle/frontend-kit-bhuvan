'use client';

import { useState } from 'react';
import { getRouting, getThematicData, villageGeocoding, getEllipsoid } from 'bhuvan-api';
import '@/app/globals.css';
import SpaceBackground from '@/components/SpaceBackground';
import { useSession } from 'next-auth/react';

function DemoApp() {
    const [routingData, setRoutingData] = useState(null);
    const [thematicData, setThematicData] = useState(null);
    const [vgData, setVgData] = useState(null);
    const { data: session, status } = useSession();

    const [loading, setLoading] = useState({
        routing: false,
        thematic: false,
        geocoding: false,
        ellipsoid: false,
    });
    
    const [ellipsoidStatus, setEllipsoidStatus] = useState({ message: '', type: 'idle' });

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
        setLoading(prev => ({ ...prev, routing: true }));
        try {
            const { startLat, startLon, endLat, endLon } = routingInputs;
            const result = await getRouting(
                parseFloat(startLat),
                parseFloat(startLon),
                parseFloat(endLat),
                parseFloat(endLon)
            );
            setRoutingData(result);
        } catch (error) {
            console.error("Routing error:", error);
            setRoutingData({ error: "Failed to fetch routing data." });
        } finally {
            setLoading(prev => ({ ...prev, routing: false }));
        }
    };

    const handleGetThematicData = async () => {
        setLoading(prev => ({ ...prev, thematic: true }));
        try {
            const { lat, lon, date } = thematicInputs;
            const result = await getThematicData(
                parseFloat(lat),
                parseFloat(lon),
                date
            );
            setThematicData(result);
        } catch (error) {
            console.error("Thematic data error:", error);
            setThematicData({ error: "Failed to fetch thematic data." });
        } finally {
            setLoading(prev => ({ ...prev, thematic: false }));
        }
    };

    const handleGeocoding = async () => {
        setLoading(prev => ({ ...prev, geocoding: true }));
        try {
            const result = await villageGeocoding(villageInput);
            setVgData(result);
        } catch (error) {
            console.error("Geocoding error:", error);
            setVgData({ error: "Failed to fetch geocoding data." });
        } finally {
            setLoading(prev => ({ ...prev, geocoding: false }));
        }
    };
    
    const handleEllipsoid = async () => {
        setLoading(prev => ({ ...prev, ellipsoid: true }));
        setEllipsoidStatus({ message: '', type: 'idle' }); // Reset status on new request
        try {
            const result = await getEllipsoid(ellipsoidInput);
            if (result.error) {
                setEllipsoidStatus({ message: `Download failed: ${result.error}`, type: 'error' });
            } else {
                setEllipsoidStatus({ message: 'Success! The geoid file download has started.', type: 'success' });
            }
        } catch (error) {
            console.error("Ellipsoid error:", error);
            setEllipsoidStatus({ message: `An unexpected error occurred: ${error.message}`, type: 'error' });
        } finally {
            setLoading(prev => ({ ...prev, ellipsoid: false }));
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
                            {/* Input fields remain the same */}
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
                            disabled={loading.routing} // MODIFICATION
                            className="w-full bg-blue-600 text-white font-medium py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md hover:shadow-lg disabled:bg-blue-900 disabled:cursor-not-allowed"
                        >
                            {loading.routing ? 'Fetching...' : 'Fetch Routing API'} {/* MODIFICATION */}
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
                            disabled={loading.thematic}
                            className="w-full bg-blue-600 text-white font-medium py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md hover:shadow-lg disabled:bg-blue-900 disabled:cursor-not-allowed"
                        >
                             {loading.thematic ? 'Fetching...' : 'Fetch Thematic Data'}
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
                            disabled={loading.geocoding}
                            className="w-full bg-blue-600 text-white font-medium py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md hover:shadow-lg disabled:bg-blue-900 disabled:cursor-not-allowed"
                        >
                            {loading.geocoding ? 'Geocoding...' : 'Village Geocoding'}
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
                            disabled={loading.ellipsoid}
                            className="w-full bg-blue-600 text-white font-medium py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md hover:shadow-lg disabled:bg-blue-900 disabled:cursor-not-allowed"
                        >
                            {loading.ellipsoid ? 'Processing...' : 'Ellipsoid to Geoid'}
                        </button>
                        {ellipsoidStatus.message && (
                            <p className={`text-sm text-center mt-2 ${ellipsoidStatus.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                                {ellipsoidStatus.message}
                            </p>
                        )}
                    </div>
                </div>
                <div className="space-y-8">
                    <div>
                        <h2 className="text-xl md:text-2xl font-semibold text-gray-200 mb-3">Routing Data</h2>
                        <pre className="bg-gray-800 text-gray-200 p-4 rounded-lg overflow-auto max-h-96 text-sm font-mono shadow-inner">
                            {loading.routing ? 'Loading...' : (routingData ? JSON.stringify(routingData, null, 2) : 'No data yet')}
                        </pre>
                    </div>
                    <div>
                        <h2 className="text-xl md:text-2xl font-semibold text-gray-200 mb-3">Thematic Data</h2>
                        <pre className="bg-gray-800 text-gray-200 p-4 rounded-lg overflow-auto max-h-96 text-sm font-mono shadow-inner">
                            {loading.thematic ? 'Loading...' : (thematicData ? JSON.stringify(thematicData, null, 2) : 'No data yet')}
                        </pre>
                    </div>
                    <div>
                        <h2 className="text-xl md:text-2xl font-semibold text-gray-200 mb-3">Village Geocoding</h2>
                        <pre className="bg-gray-800 text-gray-200 p-4 rounded-lg overflow-auto max-h-96 text-sm font-mono shadow-inner">
                            {loading.geocoding ? 'Loading...' : (vgData ? JSON.stringify(vgData, null, 2) : 'No data yet')}
                        </pre>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DemoApp;