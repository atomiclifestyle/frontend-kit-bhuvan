'use client';

import { useState } from 'react';
import { getRouting, getThematicData, villageGeocoding, getEllipsoid } from '@/utils/bhuvan-api-methods';
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
                parseFloat(endLon), session.user_id
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
                date, session.user_id
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
            const result = await villageGeocoding(villageInput, session.user_id);
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
            const result = await getEllipsoid(ellipsoidInput, session.user_id);
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
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-teal-300 mb-5">
                    Bhuvan API Demo
                </h1>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">

                    {/* --- Routing API Card --- */}
                    <div className="bg-gray-800/50 p-4 rounded-lg space-y-4 border border-gray-700">
                        <h3 className="text-lg font-semibold text-blue-300">Routing API</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="startLat" className="block mb-1 text-sm font-medium text-gray-400">Start Latitude</label>
                                <input
                                    id="startLat"
                                    name="startLat"
                                    value={routingInputs.startLat}
                                    onChange={handleRoutingInputChange}
                                    placeholder="e.g., 17.3850"
                                    className="w-full bg-gray-700 text-white p-2 rounded-lg"
                                    type="number"
                                    step="any"
                                />
                            </div>
                            <div>
                                <label htmlFor="startLon" className="block mb-1 text-sm font-medium text-gray-400">Start Longitude</label>
                                <input
                                    id="startLon"
                                    name="startLon"
                                    value={routingInputs.startLon}
                                    onChange={handleRoutingInputChange}
                                    placeholder="e.g., 78.4867"
                                    className="w-full bg-gray-700 text-white p-2 rounded-lg"
                                    type="number"
                                    step="any"
                                />
                            </div>
                            <div>
                                <label htmlFor="endLat" className="block mb-1 text-sm font-medium text-gray-400">End Latitude</label>
                                <input
                                    id="endLat"
                                    name="endLat"
                                    value={routingInputs.endLat}
                                    onChange={handleRoutingInputChange}
                                    placeholder="e.g., 17.4375"
                                    className="w-full bg-gray-700 text-white p-2 rounded-lg"
                                    type="number"
                                    step="any"
                                />
                            </div>
                            <div>
                                <label htmlFor="endLon" className="block mb-1 text-sm font-medium text-gray-400">End Longitude</label>
                                <input
                                    id="endLon"
                                    name="endLon"
                                    value={routingInputs.endLon}
                                    onChange={handleRoutingInputChange}
                                    placeholder="e.g., 78.4483"
                                    className="w-full bg-gray-700 text-white p-2 rounded-lg"
                                    type="number"
                                    step="any"
                                />
                            </div>
                        </div>
                        <button
                            onClick={handleGetRouting}
                            disabled={loading.routing}
                            className="w-full bg-blue-600 text-white font-medium py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md hover:shadow-lg disabled:bg-blue-900 disabled:cursor-not-allowed"
                        >
                            {loading.routing ? 'Fetching...' : 'Fetch Routing API'}
                        </button>
                    </div>

                    {/* --- Thematic Data Card --- */}
                    <div className="bg-gray-800/50 p-4 rounded-lg space-y-4 border border-gray-700">
                        <h3 className="text-lg font-semibold text-blue-300">Thematic Data</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="thematicLat" className="block mb-1 text-sm font-medium text-gray-400">Latitude</label>
                                <input
                                    id="thematicLat"
                                    name="lat"
                                    value={thematicInputs.lat}
                                    onChange={handleThematicInputChange}
                                    placeholder="e.g., 17.3850"
                                    className="w-full bg-gray-700 text-white p-2 rounded-lg"
                                    type="number"
                                    step="any"
                                />
                            </div>
                            <div>
                                <label htmlFor="thematicLon" className="block mb-1 text-sm font-medium text-gray-400">Longitude</label>
                                <input
                                    id="thematicLon"
                                    name="lon"
                                    value={thematicInputs.lon}
                                    onChange={handleThematicInputChange}
                                    placeholder="e.g., 78.4867"
                                    className="w-full bg-gray-700 text-white p-2 rounded-lg"
                                    type="number"
                                    step="any"
                                />
                            </div>
                            <div className="col-span-2">
                                <label htmlFor="thematicDate" className="block mb-1 text-sm font-medium text-gray-400">Year</label>
                                <input
                                    id="thematicDate"
                                    name="date"
                                    value={thematicInputs.date}
                                    onChange={handleThematicInputChange}
                                    placeholder="YYYY_MM"
                                    className="w-full bg-gray-700 text-white p-2 rounded-lg"
                                />
                            </div>
                        </div>
                        <button
                            onClick={handleGetThematicData}
                            disabled={loading.thematic}
                            className="w-full bg-blue-600 text-white font-medium py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md hover:shadow-lg disabled:bg-blue-900 disabled:cursor-not-allowed"
                        >
                            {loading.thematic ? 'Fetching...' : 'Fetch Thematic Data'}
                        </button>
                    </div>

                    {/* --- Village Geocoding Card --- */}
                    <div className="bg-gray-800/50 p-4 rounded-lg space-y-4 border border-gray-700">
                        <h3 className="text-lg font-semibold text-blue-300">Village Geocoding</h3>
                        <div>
                            <label htmlFor="villageName" className="block mb-1 text-sm font-medium text-gray-400">Village Name</label>
                            <input
                                id="villageName"
                                value={villageInput}
                                onChange={(e) => setVillageInput(e.target.value)}
                                placeholder="Enter Village Name"
                                className="w-full bg-gray-700 text-white p-2 rounded-lg"
                            />
                        </div>
                        <button
                            onClick={handleGeocoding}
                            disabled={loading.geocoding}
                            className="w-full bg-blue-600 text-white font-medium py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md hover:shadow-lg disabled:bg-blue-900 disabled:cursor-not-allowed"
                        >
                            {loading.geocoding ? 'Geocoding...' : 'Village Geocoding'}
                        </button>
                    </div>

                    {/* --- Ellipsoid to Geoid Card --- */}
                    <div className="bg-gray-800/50 p-4 rounded-lg space-y-4 border border-gray-700">
                        <h3 className="text-lg font-semibold text-blue-300">Ellipsoid to Geoid</h3>
                        <div>
                            <label htmlFor="ellipsoidCode" className="block mb-1 text-sm font-medium text-gray-400">Ellipsoid Code</label>
                            <input
                                id="ellipsoidCode"
                                value={ellipsoidInput}
                                onChange={(e) => setEllipsoidInput(e.target.value)}
                                placeholder="Enter Ellipsoid Code"
                                className="w-full bg-gray-700 text-white p-2 rounded-lg"
                            />
                        </div>
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

                {/* --- Data Display Sections --- */}
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