'use client';

import 'ol/ol.css';
import { Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import OSM from 'ol/source/OSM';
import VectorSource from 'ol/source/Vector';
import { fromLonLat, toLonLat } from 'ol/proj';
import { Draw, Select, Modify } from 'ol/interaction';
import { Circle as CircleStyle, Fill, Stroke, Style, Text } from 'ol/style';
import { useEffect, useRef, useState } from 'react';
import { Rnd } from 'react-rnd';
import { getRouting, executeQuery } from '@/utils/bhuvan-api-methods';
import { useSession } from 'next-auth/react';
import GeoJSON from 'ol/format/GeoJSON';

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

// Editor component for Polygon features
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

export default function App() {
  const mapRef = useRef();
  const [map, setMap] = useState(null);
  const [isMounted, setIsMounted] = useState(false);
  const { data: session } = useSession();

  // State and sources for points
  const [vectorSource] = useState(new VectorSource());
  const vectorLayerRef = useRef(null);
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [featureName, setFeatureName] = useState('');
  const [pointCount, setPointCount] = useState(0);

  // State and sources for polygons
  const [polygonSource] = useState(new VectorSource());
  const polygonLayerRef = useRef(null);
  const [selectedPolygon, setSelectedPolygon] = useState(null);
  const [polygonName, setPolygonName] = useState('');

  // State and sources for paths
  const [pathSource] = useState(new VectorSource());
  const pathLayerRef = useRef(null);
  const [isPathLoading, setIsPathLoading] = useState(false);

  // Interactions and tools state
  const drawInteractionRef = useRef(null);
  const selectInteractionRef = useRef(null);
  const [activeTool, setActiveTool] = useState(null);

  // Revision state to force style updates
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Generic text style for feature names
  const createTextStyle = (text) => {
    return new Text({
      text: text || '',
      font: 'bold 12px Calibri, sans-serif',
      fill: new Fill({ color: '#000' }),
      stroke: new Stroke({ color: '#fff', width: 4 }),
      offsetY: -20,
    });
  };

  // Map initialization effect
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

    const vectorLayer = new VectorLayer({
      source: vectorSource,
      style: pointStyleFunction,
    });
    vectorLayerRef.current = vectorLayer;

    const polygonLayer = new VectorLayer({
      source: polygonSource,
      style: polygonStyleFunction,
    });
    polygonLayerRef.current = polygonLayer;

    const pathLayer = new VectorLayer({
      source: pathSource,
      style: new Style({
        stroke: new Stroke({
          color: '#0000ff',
          width: 4,
          opacity: 0.7,
        }),
      }),
    });
    pathLayerRef.current = pathLayer;

    const initialMap = new Map({
      target: mapRef.current,
      layers: [
        new TileLayer({ source: new OSM() }),
        vectorLayer,
        polygonLayer,
        pathLayer,
      ],
      view: new View({
        center: fromLonLat([78.9629, 20.5937]),
        zoom: 4,
      }),
    });

    selectInteractionRef.current = new Select({
      style: null,
      toggleCondition: () => true,
    });

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

    const modifyInteraction = new Modify({
      features: selectInteractionRef.current.getFeatures(),
    });
    initialMap.addInteraction(modifyInteraction);

    setMap(initialMap);

    return () => initialMap.setTarget(undefined);
  }, [vectorSource, polygonSource]);

  // Effect to apply the latest style function when selection or names change
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

    if (vectorLayerRef.current) {
      vectorLayerRef.current.setStyle(pointStyleFunction);
    }
    if (polygonLayerRef.current) {
      polygonLayerRef.current.setStyle(polygonStyleFunction);
    }
    vectorSource.changed();
    polygonSource.changed();
    map?.render();
  }, [selectedFeature, selectedPolygon, revision, map]);

  // Effect to update point count for UI
  useEffect(() => {
    const updatePointCount = () => setPointCount(vectorSource.getFeatures().length);
    vectorSource.on('addfeature', updatePointCount);
    vectorSource.on('removefeature', updatePointCount);
    return () => {
      vectorSource.un('addfeature', updatePointCount);
      vectorSource.un('removefeature', updatePointCount);
    };
  }, [vectorSource]);

  // Unified function to handle drawing points or polygons
  const toggleDraw = (type) => {
    if (activeTool === type) {
      map.removeInteraction(drawInteractionRef.current);
      setActiveTool(null);
      selectInteractionRef.current.setActive(true);
      return;
    }

    if (drawInteractionRef.current) {
      map.removeInteraction(drawInteractionRef.current);
    }

    selectInteractionRef.current.getFeatures().clear();
    setSelectedFeature(null);
    setSelectedPolygon(null);
    setActiveTool(type);
    selectInteractionRef.current.setActive(false);

    const source = type === 'Point' ? vectorSource : polygonSource;

    drawInteractionRef.current = new Draw({
      source: source,
      type: type,
    });

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

  // Handler for updating point feature names
  const handleUpdateFeatureName = (feature, name) => {
    const featureId = feature.getId();
    const sourceFeature = featureId ? vectorSource.getFeatureById(featureId) : feature;
    if (sourceFeature) {
      sourceFeature.set('name', name);
      setSelectedFeature(sourceFeature);
      vectorSource.changed();
      if (vectorLayerRef.current) {
        vectorLayerRef.current.setStyle(vectorLayerRef.current.getStyle());
      }
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

  // Handler for updating polygon feature names
  const handleUpdatePolygonName = (polygon, name) => {
    if (polygon) {
      polygon.set('name', name);
      setRevision(r => r + 1); // Force style update
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

  // Handler for creating a path between two points
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

  // Handler for exporting all features to a GeoJSON file
  const handleExportGeoJSON = () => {
    const pointFeatures = vectorSource.getFeatures();
    const pathFeatures = pathSource.getFeatures();
    const polygonFeatures = polygonSource.getFeatures();

    if (pointFeatures.length === 0 && pathFeatures.length === 0 && polygonFeatures.length === 0) {
      alert("There are no features on the map to export.");
      return;
    }

    const allFeatures = [...pointFeatures, ...pathFeatures, ...polygonFeatures];
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

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      <div ref={mapRef} className="w-full h-full cursor-default" />
      {isMounted && (
        <Rnd
          default={{
            x: window.innerWidth * 0.68,
            y: 20,
            width: 350,
            height: 'auto',
          }}
          minWidth={300}
          bounds="parent"
          className="bg-gray-50 rounded-lg shadow-2xl border border-gray-200"
        >
          <div className="p-5 flex flex-col h-full bg-[#000010] text-gray-100">
            <h2 className="text-xl font-bold mb-4 text-gray-100 border-b pb-2">Tools</h2>
            <div className="mb-4 space-y-2">
              <button
                onClick={() => toggleDraw('Point')}
                className={`w-full font-bold py-2 px-4 rounded transition-colors duration-200 ${
                  activeTool === 'Point' ? 'bg-blue-700 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
              >
                {activeTool === 'Point' ? 'Cancel Drawing' : 'Add Point'}
              </button>
              <button
                onClick={() => toggleDraw('Polygon')}
                className={`w-full font-bold py-2 px-4 rounded transition-colors duration-200 ${
                  activeTool === 'Polygon' ? 'bg-orange-700 text-white' : 'bg-orange-500 hover:bg-orange-600 text-white'
                }`}
              >
                {activeTool === 'Polygon' ? 'Cancel Drawing' : 'Add Polygon'}
              </button>
            </div>
            <div className="flex-grow">
              {pointCount > 0 && (
                <PointEditor
                  selectedFeature={selectedFeature}
                  onUpdateFeatureName={handleUpdateFeatureName}
                  onDeleteFeature={handleDeleteFeature}
                  featureName={featureName}
                  setFeatureName={setFeatureName}
                />
              )}
              {selectedPolygon && (
                <PolygonEditor
                  selectedPolygon={selectedPolygon}
                  onUpdatePolygonName={handleUpdatePolygonName}
                  onDeletePolygon={handleDeletePolygon}
                  polygonName={polygonName}
                  setPolygonName={setPolygonName}
                />
              )}
              {(!selectedPolygon && pointCount <= 0) && (
                <div className="p-4 text-center text-gray-500">
                  <p>Click a tool to add a feature, or select an existing feature on the map.</p>
                </div>
              )}
            </div>
            <div className="mt-4 pt-4 border-t">
              <button
                onClick={handleCreatePath}
                disabled={pointCount !== 2}
                className="w-full bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isPathLoading ? 'Loading...' : `Create Path (${pointCount}/2 points)`}
              </button>
              <button
                onClick={handleExportGeoJSON}
                className="mt-2 w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition-colors duration-200"
              >
                Export as GeoJSON
              </button>
            </div>
          </div>
        </Rnd>
      )}
    </div>
  );
}