'use client';

import 'ol/ol.css';
import { Map, View } from 'ol';
import { GeoJSON } from 'ol/format';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import OSM from 'ol/source/OSM';
import VectorSource from 'ol/source/Vector';
import { fromLonLat } from 'ol/proj';
import { Draw, Select, Modify } from 'ol/interaction';
import { Circle as CircleStyle, Fill, Stroke, Style, Text } from 'ol/style';
import { useEffect, useRef, useState } from 'react';
import { Rnd } from 'react-rnd';

// --- Helper Components ---

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

  if (!selectedFeature) {
    return (
      <div className="p-4 text-center text-gray-500">
        <p>Click 'Add Point' and place a point on the map to name it.</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white rounded-lg">
      <h3 className="text-lg font-bold mb-4">Point Properties</h3>
      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-700 capitalize">Name</label>
        <input
          type="text"
          name="name"
          placeholder="Enter point name"
          value={featureName}
          onChange={handleNameChange}
          className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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

// --- Main App Component ---

export default function App() {
  const mapRef = useRef();
  const [map, setMap] = useState(null);
  const [vectorSource] = useState(new VectorSource());
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [featureName, setFeatureName] = useState('');
  const drawInteractionRef = useRef(null);
  const selectInteractionRef = useRef(null);
  const [activeTool, setActiveTool] = useState(null);
  const [isMounted, setIsMounted] = useState(false);
  const vectorLayerRef = useRef(null);

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

  useEffect(() => {
    const vectorLayer = new VectorLayer({
      source: vectorSource,
      style: styleFunction,
    });
    vectorLayerRef.current = vectorLayer;

    const initialMap = new Map({
      target: mapRef.current,
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
        vectorLayer,
      ],
      view: new View({
        center: fromLonLat([-98.5795, 39.8283]),
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
  }, [vectorSource]);

  useEffect(() => {
    if (vectorLayerRef.current && selectedFeature) {
      vectorLayerRef.current.setStyle(styleFunction);
      vectorSource.changed();
      map?.render();
    }
  }, [selectedFeature, map]);

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
    }
  };


    const handleExportGeoJSON = () => {
    const features = vectorSource.getFeatures();
    if (features.length === 0) {
        alert("There are no points on the map to export.");
        return;
    }

    // 1. Create a GeoJSON format object
    const geojsonFormat = new GeoJSON();

    // 2. Convert the OpenLayers features to a GeoJSON string.
    //    It's crucial to transform the coordinates from the map's projection
    //    ('EPSG:3857') to the standard GeoJSON projection ('EPSG:4326').
    const geojsonString = geojsonFormat.writeFeatures(features, {
        featureProjection: 'EPSG:3857', // The projection your map is currently using
        dataProjection: 'EPSG:4326',    // The standard projection for GeoJSON
    });

    // 3. Create a Blob to hold the data
    const blob = new Blob([geojsonString], { type: 'application/json' });

    // 4. Create a temporary link element and trigger the download
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'annotated_points.geojson';
    document.body.appendChild(a); // Required for Firefox
    a.click();

    // 5. Clean up by removing the temporary link and URL
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
          <div className="p-5 flex flex-col h-full">
            <h2 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">Tools</h2>
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
                featureName={featureName}
                setFeatureName={setFeatureName}
              />
            </div>
            <div className="mb-4">
                <button
                    onClick={handleExportGeoJSON}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition-colors duration-200"
                >
                    💾 Export as GeoJSON
                </button>
            </div>
          </div>
        </Rnd>
      )}
    </div>
  );
}