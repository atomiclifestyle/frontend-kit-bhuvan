'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import MapContainer from '@/components/MapContainer';

export default function MapViewPage() {
  const params = useParams();
  const { projectId } = params;

  const [mapData, setMapData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!projectId) return;

    const fetchMapData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/map/load/${projectId}`);
        
        if (!response.ok) {
          const errorResult = await response.json();
          throw new Error(errorResult.message || 'Failed to load map data.');
        }

        const data = await response.json();
        setMapData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMapData();
  }, [projectId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-xl font-semibold text-gray-700">Loading Map...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-xl font-semibold text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <MapContainer initialData={mapData} />
  );
}
