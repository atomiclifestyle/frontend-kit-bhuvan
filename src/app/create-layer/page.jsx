'use client';

import 'ol/ol.css';
import { Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import OSM from 'ol/source/OSM';
import VectorSource from 'ol/source/Vector';
import { fromLonLat } from 'ol/proj';
import { Draw, Select, Modify } from 'ol/interaction';
import { Circle as CircleStyle, Fill, Stroke, Style, Text } from 'ol/style';
import { useEffect, useRef, useState } from 'react';
import { Rnd } from 'react-rnd';
import { getRouting } from '@/utils/bhuvan-api-methods';
import { useSession } from 'next-auth/react';
import GeoJSON from 'ol/format/GeoJSON';
import { toLonLat } from 'ol/proj';

const PointEditor = ({ selectedFeature, onUpdateFeatureName, onDeleteFeature, featureName, setFeatureName, onCreatePath, pointCount }) => {
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

  if (!selectedFeature) {
    return (
      <div className="p-4 text-center text-gray-500">
        <p>Click 'Add Point' and place a point on the map to name it.</p>
      </div>
    );
  }

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


export default function App() {
  const mapRef = useRef();
  const [map, setMap] = useState(null);
  const [vectorSource] = useState(new VectorSource());
  const [pathSource] = useState(new VectorSource());
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [featureName, setFeatureName] = useState('');
  const drawInteractionRef = useRef(null);
  const selectInteractionRef = useRef(null);
  const [activeTool, setActiveTool] = useState(null);
  const [isMounted, setIsMounted] = useState(false);
  const vectorLayerRef = useRef(null);
  const pathLayerRef = useRef(null);
  const [pointCount, setPointCount] = useState(0);
  const { data: session, status } = useSession();
  const [isPathLoading, setIsPathLoading] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const createTextStyle = (text) => {
    return new Text({
      text: text || 'Unnamed',
      font: 'bold 12px Calibri, sans-serif',
      fill: new Fill({ color: '#000' }),
      stroke: new Stroke({ color: '#fff', width: 4 }),
      offsetY: -20,
    });
  };

  const styleFunction = (feature) => {
    const isSelected = selectedFeature && selectedFeature.getId() === feature.getId();
    const name = feature.get('name') || '';

    const style = new Style({
      image: new CircleStyle({
        radius: isSelected ? 9 : 7,
        fill: new Fill({ color: isSelected ? '#3399CC' : '#ffcc33' }),
        stroke: new Stroke({ color: 'white', width: 2 }),
      }),
    });

    style.setText(createTextStyle(name));
    return style;
  };

  const pathStyleFunction = () => {
    return new Style({
      stroke: new Stroke({
        color: '#0000ff',
        width: 4,
        opacity: 0.7,
      }),
    });
  };

  useEffect(() => {
    const vectorLayer = new VectorLayer({
      source: vectorSource,
      style: styleFunction,
    });
    vectorLayerRef.current = vectorLayer;

    const pathLayer = new VectorLayer({
      source: pathSource,
      style: pathStyleFunction,
    });
    pathLayerRef.current = pathLayer;

    const initialMap = new Map({
      target: mapRef.current,
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
        vectorLayer,
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
      if (event.selected.length > 0) {
        const selected = event.selected[0];
        const featureId = selected.getId();
        if (featureId && vectorSource.getFeatureById(featureId)) {
          setSelectedFeature(vectorSource.getFeatureById(featureId));
        }
      } else {
        setSelectedFeature(null);
      }
      vectorSource.changed();
      initialMap.render();
    });

    initialMap.addInteraction(selectInteractionRef.current);

    const modifyInteraction = new Modify({
      features: selectInteractionRef.current.getFeatures(),
    });
    initialMap.addInteraction(modifyInteraction);

    setMap(initialMap);

    return () => initialMap.setTarget(undefined);
  }, [vectorSource, pathSource]);

  useEffect(() => {
    if (vectorLayerRef.current && selectedFeature) {
      vectorLayerRef.current.setStyle(styleFunction);
      vectorSource.changed();
      map?.render();
    }
  }, [selectedFeature, map]);

  useEffect(() => {
    const updatePointCount = () => {
      setPointCount(vectorSource.getFeatures().length);
    };
    vectorSource.on('addfeature', updatePointCount);
    vectorSource.on('removefeature', updatePointCount);
    return () => {
      vectorSource.un('addfeature', updatePointCount);
      vectorSource.un('removefeature', updatePointCount);
    };
  }, [vectorSource]);

  const addDrawInteraction = () => {
    if (activeTool) {
      map.removeInteraction(drawInteractionRef.current);
      setActiveTool(null);
      selectInteractionRef.current.setActive(true);
      return;
    }

    selectInteractionRef.current.getFeatures().clear();
    setSelectedFeature(null);
    setActiveTool('Point');
    selectInteractionRef.current.setActive(false);

    drawInteractionRef.current = new Draw({
      source: vectorSource,
      type: 'Point',
    });

    drawInteractionRef.current.on('drawend', (event) => {
      const feature = event.feature;
      const uniqueId = 'point_' + Date.now();
      feature.setId(uniqueId);
      feature.set('name', '');
      vectorSource.addFeature(feature);
      map.removeInteraction(drawInteractionRef.current);
      setActiveTool(null);
      selectInteractionRef.current.getFeatures().clear();
      selectInteractionRef.current.getFeatures().push(feature);
      setSelectedFeature(feature);
      selectInteractionRef.current.setActive(true);
      vectorSource.changed();
      map?.render();
      pathSource.clear();
    });

    map.addInteraction(drawInteractionRef.current);
  };

  const handleUpdateFeatureName = (feature, name) => {
    const featureId = feature.getId();
    const sourceFeature = featureId ? vectorSource.getFeatureById(featureId) : feature;
    if (sourceFeature) {
      sourceFeature.set('name', name);
      setSelectedFeature(sourceFeature);
    }
    vectorSource.changed();
    if (vectorLayerRef.current) {
      vectorLayerRef.current.setStyle(styleFunction);
    }
    map?.render();
  };

  const handleDeleteFeature = () => {
    if (selectedFeature) {
      vectorSource.removeFeature(selectedFeature);
      selectInteractionRef.current.getFeatures().clear();
      setSelectedFeature(null);
      vectorSource.changed();
      map?.render();
      pathSource.clear();
    }
  };

  const routeStyle = new Style({
  stroke: new Stroke({
    color: '#ff0000',
    width: 4,
    lineDash: [10, 10], // optional dashed line
  }),
});

  const handleCreatePath = async () => {
    setIsPathLoading(true);

    const pointFeatures = vectorSource.getFeatures();

    if (pointFeatures.length !== 2) {
      alert("Please place exactly two points to create a path.");
      setIsPathLoading(false);
      return;
    }

    const coords = pointFeatures.map((f) => {
      const mercatorCoords = f.getGeometry().getCoordinates();
      return toLonLat(mercatorCoords); 
    });

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
      routeFeatures.forEach(f => f.setStyle(routeStyle));
      pathSource.addFeatures(routeFeatures);
      map.render();
    } catch (err) {
      console.error("Path creation failed:", err);
      alert("Unexpected error during routing.");
    } finally {
      setIsPathLoading(false);
    }
  };

  const handleExportGeoJSON = () => {
  const pointFeatures = vectorSource.getFeatures();
  const pathFeatures = pathSource.getFeatures();

  if (pointFeatures.length === 0 && pathFeatures.length === 0) {
    alert("There are no features on the map to export.");
    return;
  }

  const allFeatures = [...pointFeatures, ...pathFeatures];

  const geojsonFormat = new GeoJSON();

  const geojsonString = geojsonFormat.writeFeatures(allFeatures, {
    featureProjection: 'EPSG:3857', // Map projection
    dataProjection: 'EPSG:4326',    // GeoJSON standard
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
            <div className="mb-4">
              <button
                onClick={addDrawInteraction}
                className={`w-full font-bold py-2 px-4 rounded transition-colors duration-200 ${
                  activeTool === 'Point' ? 'bg-blue-700 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
              >
                {activeTool ? 'Cancel Drawing' : 'Add Point'}
              </button>
            </div>
            <div className="flex-grow">
              <PointEditor
                selectedFeature={selectedFeature}
                onUpdateFeatureName={handleUpdateFeatureName}
                onDeleteFeature={handleDeleteFeature}
                onCreatePath={handleCreatePath}
                featureName={featureName}
                setFeatureName={setFeatureName}
                pointCount={pointCount}
              />
            </div>
            <div className="mb-4">
              <button
                onClick={handleExportGeoJSON}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition-colors duration-200"
              >
                Export as GeoJSON
              </button>
              <button
                onClick={handleCreatePath}
                className="mt-2 mb-4 w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                {isPathLoading ? 'Loading...' : 'Create Path'}
              </button>
            </div>
          </div>
        </Rnd>
      )}
    </div>
  );
}