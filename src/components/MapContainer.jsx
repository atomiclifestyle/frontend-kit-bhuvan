'use client';

import 'ol/ol.css';
import { Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import XYZ from 'ol/source/XYZ';
import VectorSource from 'ol/source/Vector';
import TileWMS from 'ol/source/TileWMS';
import { fromLonLat, toLonLat } from 'ol/proj';
import { Draw, Select, Modify } from 'ol/interaction';
import { Circle as CircleStyle, Fill, Stroke, Style, Text } from 'ol/style';
import { useEffect, useRef, useState } from 'react';
import { Rnd } from 'react-rnd';
import { getRouting } from '@/utils/bhuvan-api-methods';
import { useSession } from 'next-auth/react';
import GeoJSON from 'ol/format/GeoJSON';

const GEOAPIFY_API_KEY = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY || '';

const PointEditor = ({ selectedFeature, onUpdateFeatureName, onDeleteFeature, featureName, setFeatureName }) => {
  useEffect(() => {
    if (selectedFeature) {
      const name = selectedFeature.get('name') || '';
      setFeatureName(name);
    } else {
      setFeatureName('');
    }
  }, [selectedFeature, setFeatureName]);

  const handleNameChange = (e) => {
    setFeatureName(e.target.value);
  };

  const handleUpdateName = () => {
    if (selectedFeature) {
      onUpdateFeatureName(selectedFeature, featureName);
    }
  };

  return (
    <div className="p-4 rounded-lg bg-[#000010]">
      <h3 className="text-lg font-bold mb-4 text-gray-100">Point Properties</h3>
      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-500 capitalize">Name</label>
        <input
          type="text"
          name="name"
          placeholder="Enter point name"
          value={featureName}
          onChange={handleNameChange}
          className="mt-1 block w-full px-3 py-2 bg-white text-gray-500 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>
      <button
        onClick={handleUpdateName}
        className="mt-2 mb-4 w-full bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
      >
        Update Name
      </button>
      <button
        onClick={onDeleteFeature}
        className="mt-4 w-full bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
      >
        Delete Point
      </button>
    </div>
  );
};

const PolygonEditor = ({ selectedPolygon, onUpdatePolygonName, onDeletePolygon, polygonName, setPolygonName }) => {
  useEffect(() => {
    if (selectedPolygon) {
      const name = selectedPolygon.get('name') || '';
      setPolygonName(name);
    } else {
      setPolygonName('');
    }
  }, [selectedPolygon, setPolygonName]);

  const handleNameChange = (e) => {
    setPolygonName(e.target.value);
  };

  const handleUpdateName = () => {
    if (selectedPolygon) {
      onUpdatePolygonName(selectedPolygon, polygonName);
    }
  };

  return (
    <div className="p-4 rounded-lg bg-[#000010]">
      <h3 className="text-lg font-bold mb-4 text-gray-100">Polygon Properties</h3>
      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-500 capitalize">Name</label>
        <input
          type="text"
          name="name"
          placeholder="Enter polygon name"
          value={polygonName}
          onChange={handleNameChange}
          className="mt-1 block w-full px-3 py-2 bg-white text-gray-500 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>
      <button
        onClick={handleUpdateName}
        className="mt-2 mb-4 w-full bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
      >
        Update Name
      </button>
      <button
        onClick={onDeletePolygon}
        className="mt-4 w-full bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
      >
        Delete Polygon
      </button>
    </div>
  );
};

export default function MapContainer({ initialData = null }) {
  const mapRef = useRef();
  const [map, setMap] = useState(null);
  const [isMounted, setIsMounted] = useState(false);
  const { data: session } = useSession();

  const [vectorSource] = useState(new VectorSource());
  const vectorLayerRef = useRef(null);
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [featureName, setFeatureName] = useState('');
  const [pointCount, setPointCount] = useState(0);

  const [polygonSource] = useState(new VectorSource());
  const polygonLayerRef = useRef(null);
  const [selectedPolygon, setSelectedPolygon] = useState(null);
  const [polygonName, setPolygonName] = useState('');

  const [pathSource] = useState(new VectorSource());
  const pathLayerRef = useRef(null);
  const [isPathLoading, setIsPathLoading] = useState(false);

  const [externalLayerUrl, setExternalLayerUrl] = useState('');
  const [externalVectorLayers, setExternalVectorLayers] = useState([]);
  
  const [wmsLayerUrl, setWmsLayerUrl] = useState('');
  const [wmsLayerName, setWmsLayerName] = useState('');
  const [wmsLayers, setWmsLayers] = useState([]);

  const drawInteractionRef = useRef(null);
  const selectInteractionRef = useRef(null);
  const [activeTool, setActiveTool] = useState(null);

  const [revision, setRevision] = useState(0);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const createTextStyle = (text) => {
    return new Text({
      text: text || '',
      font: 'bold 12px Calibri, sans-serif',
      fill: new Fill({ color: '#000' }),
      stroke: new Stroke({ color: '#fff', width: 4 }),
      offsetY: -20,
    });
  };

  // This effect now runs only once to initialize the map structure.
  useEffect(() => {
    const pointStyleFunction = (feature) => {
      const isSelected = selectedFeature && selectedFeature.getId() === feature.getId();
      const name = feature.get('name') || '';
      return new Style({
        image: new CircleStyle({
          radius: isSelected ? 9 : 7,
          fill: new Fill({ color: isSelected ? '#3399CC' : '#ffcc33' }),
          stroke: new Stroke({ color: 'white', width: 2 }),
        }),
        text: createTextStyle(name),
      });
    };

    const polygonStyleFunction = (feature) => {
      const isSelected = selectedPolygon && selectedPolygon.getId() === feature.getId();
      const name = feature.get('name') || '';
      return new Style({
        stroke: new Stroke({
          color: isSelected ? '#3399CC' : '#e64a19',
          width: 3,
        }),
        fill: new Fill({
          color: isSelected ? 'rgba(51, 153, 204, 0.4)' : 'rgba(230, 74, 25, 0.4)',
        }),
        text: createTextStyle(name),
      });
    };

    const vectorLayer = new VectorLayer({ source: vectorSource, style: pointStyleFunction });
    vectorLayerRef.current = vectorLayer;

    const polygonLayer = new VectorLayer({ source: polygonSource, style: polygonStyleFunction });
    polygonLayerRef.current = polygonLayer;

    const pathLayer = new VectorLayer({
      source: pathSource,
      style: new Style({ stroke: new Stroke({ color: '#0000ff', width: 4, opacity: 0.7 }) }),
    });
    pathLayerRef.current = pathLayer;

    const geoapifyBaseLayer = new TileLayer({
      source: new XYZ({
        url: `https://maps.geoapify.com/v1/tile/maptiler-3d/{z}/{x}/{y}.png?apiKey=${GEOAPIFY_API_KEY}`,
        attributions: 'Powered by <a href="https://www.geoapify.com/" target="_blank">Geoapify</a> | <a href="https://openmaptiles.org/" target="_blank">© OpenMapTiles</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">© OpenStreetMap</a> contributors',
        tilePixelRatio: 2,
      }),
    });

    const initialMap = new Map({
      target: mapRef.current,
      layers: [geoapifyBaseLayer, vectorLayer, polygonLayer, pathLayer],
      view: new View({
        center: fromLonLat([78.9629, 20.5937]),
        zoom: 4,
      }),
    });

    selectInteractionRef.current = new Select({ style: null, toggleCondition: () => true });
    selectInteractionRef.current.on('select', (event) => {
      setSelectedFeature(null);
      setSelectedPolygon(null);
      if (event.selected.length > 0) {
        const selected = event.selected[0];
        const featureId = selected.getId();
        if (featureId && vectorSource.getFeatureById(featureId)) {
          setSelectedFeature(vectorSource.getFeatureById(featureId));
        } else if (featureId && polygonSource.getFeatureById(featureId)) {
          setSelectedPolygon(polygonSource.getFeatureById(featureId));
        }
      }
      vectorSource.changed();
      polygonSource.changed();
      initialMap.render();
    });
    initialMap.addInteraction(selectInteractionRef.current);

    const modifyInteraction = new Modify({ features: selectInteractionRef.current.getFeatures() });
    initialMap.addInteraction(modifyInteraction);

    setMap(initialMap);

    return () => initialMap.setTarget(undefined);
  }, []); // Empty dependency array ensures this runs only once on mount.

  // New useEffect to load initial state from props
  useEffect(() => {
    if (map && initialData) {
      const { view, wmsLayers, geoJsonUrls, annotations } = initialData.mapState;

      // 1. Set View
      map.getView().setCenter(fromLonLat(view.center));
      map.getView().setZoom(view.zoom);

      // 2. Load WMS Layers programmatically
      wmsLayers.forEach(wmsInfo => {
        addWmsLayer(wmsInfo.url, wmsInfo.layerName, true);
      });

      // 3. Load External GeoJSON Layers programmatically
      geoJsonUrls.forEach(url => {
        addExternalLayer(url, true);
      });

      // 4. Load Annotations
      if (annotations && annotations.features) {
        const features = new GeoJSON().readFeatures(annotations, {
          dataProjection: 'EPSG:4326',
          featureProjection: map.getView().getProjection(),
        });
        
        const points = [];
        const polygons = [];
        const paths = [];

        features.forEach(feature => {
            const geomType = feature.getGeometry().getType();
            if (geomType === 'Point') {
                points.push(feature);
            } else if (geomType === 'Polygon' || geomType === 'MultiPolygon') {
                polygons.push(feature);
            } else if (geomType === 'LineString') {
                paths.push(feature);
            }
        });

        vectorSource.addFeatures(points);
        polygonSource.addFeatures(polygons);
        pathSource.addFeatures(paths);
      }
    }
  }, [map, initialData]);


  useEffect(() => {
    const pointStyleFunction = (feature) => {
      const isSelected = selectedFeature && selectedFeature.getId() === feature.getId();
      const name = feature.get('name') || '';
      return new Style({
        image: new CircleStyle({
          radius: isSelected ? 9 : 7,
          fill: new Fill({ color: isSelected ? '#3399CC' : '#ffcc33' }),
          stroke: new Stroke({ color: 'white', width: 2 }),
        }),
        text: createTextStyle(name),
      });
    };

    const polygonStyleFunction = (feature) => {
      const isSelected = selectedPolygon && selectedPolygon.getId() === feature.getId();
      const name = feature.get('name') || '';
      return new Style({
        stroke: new Stroke({
          color: isSelected ? '#3399CC' : '#e64a19',
          width: 3,
        }),
        fill: new Fill({
          color: isSelected ? 'rgba(51, 153, 204, 0.4)' : 'rgba(230, 74, 25, 0.4)',
        }),
        text: createTextStyle(name),
      });
    };

    if (vectorLayerRef.current) vectorLayerRef.current.setStyle(pointStyleFunction);
    if (polygonLayerRef.current) polygonLayerRef.current.setStyle(polygonStyleFunction);
    vectorSource.changed();
    polygonSource.changed();
    map?.render();
  }, [selectedFeature, selectedPolygon, revision, map]);

  useEffect(() => {
    const updatePointCount = () => setPointCount(vectorSource.getFeatures().length);
    vectorSource.on('addfeature', updatePointCount);
    vectorSource.on('removefeature', updatePointCount);
    return () => {
      vectorSource.un('addfeature', updatePointCount);
      vectorSource.un('removefeature', updatePointCount);
    };
  }, [vectorSource]);

  const toggleDraw = (type) => {
    if (activeTool === type) {
      map.removeInteraction(drawInteractionRef.current);
      setActiveTool(null);
      selectInteractionRef.current.setActive(true);
      return;
    }

    if (drawInteractionRef.current) map.removeInteraction(drawInteractionRef.current);

    selectInteractionRef.current.getFeatures().clear();
    setSelectedFeature(null);
    setSelectedPolygon(null);
    setActiveTool(type);
    selectInteractionRef.current.setActive(false);

    const source = type === 'Point' ? vectorSource : polygonSource;
    drawInteractionRef.current = new Draw({ source: source, type: type });

    drawInteractionRef.current.on('drawend', (event) => {
      const feature = event.feature;
      const uniqueId = `${type.toLowerCase()}_${Date.now()}`;
      feature.setId(uniqueId);
      feature.set('name', '');
      source.addFeature(feature);
      map.removeInteraction(drawInteractionRef.current);
      setActiveTool(null);
      selectInteractionRef.current.getFeatures().clear();
      selectInteractionRef.current.getFeatures().push(feature);
      if (type === 'Point') {
        setSelectedFeature(feature);
        pathSource.clear();
      } else {
        setSelectedPolygon(feature);
      }
      source.changed();
      map?.render();
    });

    map.addInteraction(drawInteractionRef.current);
  };

  const handleUpdateFeatureName = (feature, name) => {
    const featureId = feature.getId();
    const sourceFeature = featureId ? vectorSource.getFeatureById(featureId) : feature;
    if (sourceFeature) {
      sourceFeature.set('name', name);
      setSelectedFeature(sourceFeature);
      vectorSource.changed();
      if (vectorLayerRef.current) vectorLayerRef.current.setStyle(vectorLayerRef.current.getStyle());
      map?.render();
    }
  };

  const handleDeleteFeature = () => {
    if (selectedFeature) {
      vectorSource.removeFeature(selectedFeature);
      selectInteractionRef.current.getFeatures().clear();
      setSelectedFeature(null);
      pathSource.clear();
      vectorSource.changed();
      map?.render();
    }
  };

  const handleUpdatePolygonName = (polygon, name) => {
    if (polygon) {
      polygon.set('name', name);
      setRevision(r => r + 1);
    }
  };

  const handleDeletePolygon = () => {
    if (selectedPolygon) {
      polygonSource.removeFeature(selectedPolygon);
      selectInteractionRef.current.getFeatures().clear();
      setSelectedPolygon(null);
      polygonSource.changed();
      map?.render();
    }
  };

  const handleCreatePath = async () => {
    setIsPathLoading(true);
    const pointFeatures = vectorSource.getFeatures();
    if (pointFeatures.length !== 2) {
      alert("Please place exactly two points to create a path.");
      setIsPathLoading(false);
      return;
    }
    const coords = pointFeatures.map((f) => toLonLat(f.getGeometry().getCoordinates()));
    const [lon1, lat1] = coords[0];
    const [lon2, lat2] = coords[1];
    try {
      const routingResult = await getRouting(lat1, lon1, lat2, lon2, session.user_id);
      if (routingResult.error) {
        alert("Routing failed: " + routingResult.error);
        return;
      }
      const format = new GeoJSON();
      const routeFeatures = format.readFeatures(routingResult, {
        dataProjection: 'EPSG:4326',
        featureProjection: map.getView().getProjection(),
      });
      pathSource.clear();
      pathSource.addFeatures(routeFeatures);
    } catch (err) {
      console.error("Path creation failed:", err);
      alert("Unexpected error during routing.");
    } finally {
      setIsPathLoading(false);
    }
  };

  const handleExportGeoJSON = () => {
    let allFeatures = [
      ...vectorSource.getFeatures(), 
      ...pathSource.getFeatures(), 
      ...polygonSource.getFeatures()
    ];
    externalVectorLayers.forEach(layer => {
        const source = layer.getSource();
        if (source) allFeatures = [...allFeatures, ...source.getFeatures()];
    });
    if (allFeatures.length === 0) {
      alert("There are no vector features on the map to export.");
      return;
    }
    const geojsonFormat = new GeoJSON();
    const geojsonString = geojsonFormat.writeFeatures(allFeatures, {
      featureProjection: 'EPSG:3857',
      dataProjection: 'EPSG:4326',
    });
    const blob = new Blob([geojsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'exported_features.geojson';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Refactored to be callable programmatically
  const addExternalLayer = (url, isInitialLoad = false) => {
    if (!url || !map) {
      if (!isInitialLoad) alert("Please enter a valid GeoJSON URL.");
      return;
    }
    const externalVectorSource = new VectorSource({ url, format: new GeoJSON() });
    externalVectorSource.on('featuresloaderror', () => {
        if (!isInitialLoad) alert(`Error loading features from: ${url}. Please check the URL and CORS policy.`);
    });
    const externalVectorLayer = new VectorLayer({
      source: externalVectorSource,
      style: new Style({
        stroke: new Stroke({ color: '#00FFFF', width: 3 }),
        fill: new Fill({ color: 'rgba(0, 255, 255, 0.2)' }),
        image: new CircleStyle({
          radius: 7,
          fill: new Fill({ color: '#00FFFF' }),
          stroke: new Stroke({ color: 'white', width: 2 }),
        }),
      }),
    });
    map.addLayer(externalVectorLayer);
    setExternalVectorLayers(prev => [...prev, externalVectorLayer]);
    if (!isInitialLoad) setExternalLayerUrl('');
  };

  // Refactored to be callable programmatically
  const addWmsLayer = (url, name, isInitialLoad = false) => {
    if (!url || !name || !map) {
      if (!isInitialLoad) alert("Please enter a valid WMS Service URL and Layer Name.");
      return;
    }
    const baseUrl = url.split('?')[0];
    const wmsSource = new TileWMS({
        url: baseUrl,
        params: { 'LAYERS': name, 'TILED': true, 'VERSION': '1.1.1' },
        serverType: 'geoserver',
        transition: 0,
    });
    wmsSource.on('tileloaderror', () => {
        if (!isInitialLoad) {
            alert(`Error loading WMS tile for layer '${name}'. Check URL, layer name, and CORS policy.`);
            const layerToRemove = map.getLayers().getArray().find(l => l.getSource() === wmsSource);
            if (layerToRemove) map.removeLayer(layerToRemove);
        }
    });
    const wmsLayer = new TileLayer({ source: wmsSource });
    map.addLayer(wmsLayer);
    setWmsLayers(prev => [...prev, { url: baseUrl, layerName: name, layer: wmsLayer }]);
    if (!isInitialLoad) {
      setWmsLayerUrl('');
      setWmsLayerName('');
    }
  };

  const handleSaveMap = async () => {
    const projectName = prompt("Please enter a name for your map project:");
    if (!projectName) return;
    if (!map) {
      alert("Map is not ready.");
      return;
    }
    const view = map.getView();
    const mapState = {
      view: {
        center: toLonLat(view.getCenter()),
        zoom: view.getZoom(),
      },
      wmsLayers: wmsLayers.map(l => ({ url: l.url, layerName: l.layerName })),
      geoJsonUrls: externalVectorLayers.map(layer => layer.getSource().getUrl()),
      annotations: new GeoJSON().writeFeaturesObject(
        [
          ...vectorSource.getFeatures(),
          ...polygonSource.getFeatures(),
          ...pathSource.getFeatures(),
        ],
        { featureProjection: 'EPSG:3857', dataProjection: 'EPSG:4326' }
      ),
    };
    try {
      const response = await fetch('/api/map/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectName, mapState }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Failed to save map.');
      const shareableLink = `${window.location.origin}/map/view/${result.projectId}`;
      alert(`Map saved successfully!\n\nShare this link:\n${shareableLink}`);
    } catch (error) {
      console.error("Error saving map:", error);
      alert(`Error saving map: ${error.message}`);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      <div ref={mapRef} className="w-full h-full cursor-default" />
      {isMounted && (
        <Rnd
          default={{ x: window.innerWidth * 0.68, y: 20, width: 350, height: 'auto' }}
          minWidth={300}
          bounds="parent"
          className="bg-gray-50 rounded-lg shadow-2xl border border-gray-200"
        >
          <div className="p-5 flex flex-col h-full bg-[#000010] text-gray-100 overflow-y-auto" style={{maxHeight: '90vh'}}>
            <h2 className="text-xl font-bold mb-4 text-gray-100 border-b pb-2">Tools</h2>
            <div className="mb-4 space-y-2">
              <button onClick={() => toggleDraw('Point')} className={`w-full font-bold py-2 px-4 rounded transition-colors duration-200 ${activeTool === 'Point' ? 'bg-blue-700 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}>
                {activeTool === 'Point' ? 'Cancel Drawing' : 'Add Point'}
              </button>
              <button onClick={() => toggleDraw('Polygon')} className={`w-full font-bold py-2 px-4 rounded transition-colors duration-200 ${activeTool === 'Polygon' ? 'bg-orange-700 text-white' : 'bg-orange-500 hover:bg-orange-600 text-white'}`}>
                {activeTool === 'Polygon' ? 'Cancel Drawing' : 'Add Polygon'}
              </button>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-600">
                 <h3 className="text-lg font-bold mb-2 text-gray-100">External Layers</h3>
                 <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-500">GeoJSON URL</label>
                    <input type="text" placeholder="https://.../data.geojson" value={externalLayerUrl} onChange={(e) => setExternalLayerUrl(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white text-gray-500 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                 </div>
                 <button onClick={() => addExternalLayer(externalLayerUrl)} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded">
                    Add GeoJSON Layer
                 </button>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-600">
                 <h3 className="text-lg font-bold mb-2 text-gray-100">WMS Layers</h3>
                 <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-500">WMS Service URL</label>
                    <input type="text" placeholder="https://bhuvanmaps.nrsc.gov.in/..." value={wmsLayerUrl} onChange={(e) => setWmsLayerUrl(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white text-gray-500 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                 </div>
                 <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-500">Layer Name</label>
                    <input type="text" placeholder="e.g., BDRAIN" value={wmsLayerName} onChange={(e) => setWmsLayerName(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white text-gray-500 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                 </div>
                 <button onClick={() => addWmsLayer(wmsLayerUrl, wmsLayerName)} className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded">
                    Add WMS Layer
                 </button>
            </div>
            <div className="flex-grow mt-4">
              {pointCount > 0 && <PointEditor selectedFeature={selectedFeature} onUpdateFeatureName={handleUpdateFeatureName} onDeleteFeature={handleDeleteFeature} featureName={featureName} setFeatureName={setFeatureName} />}
              {selectedPolygon && <PolygonEditor selectedPolygon={selectedPolygon} onUpdatePolygonName={handleUpdatePolygonName} onDeletePolygon={handleDeletePolygon} polygonName={polygonName} setPolygonName={setPolygonName} />}
              {(!selectedPolygon && pointCount <= 0) && <div className="p-4 text-center text-gray-500"><p>Click a tool to add a feature, or select an existing feature on the map.</p></div>}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-600">
              <button onClick={handleCreatePath} disabled={pointCount !== 2} className="w-full bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded disabled:bg-gray-400 disabled:cursor-not-allowed">
                {isPathLoading ? 'Loading...' : `Create Path (${pointCount}/2 points)`}
              </button>
              <button onClick={handleExportGeoJSON} className="mt-2 w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition-colors duration-200">
                Export as GeoJSON
              </button>
              <button onClick={handleSaveMap} className="mt-2 w-full bg-sky-600 hover:bg-sky-700 text-white font-bold py-2 px-4 rounded transition-colors duration-200">
                Save Map
              </button>
            </div>
          </div>
        </Rnd>
      )}
    </div>
  );
}
