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
import { toast } from 'react-toastify';
import { createXYZ } from 'ol/tilegrid';
import 'react-toastify/dist/ReactToastify.css';

const GEOAPIFY_API_KEY = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY || '';

const availableLayers = [
  {
    id: 'usgs_topo',
    name: '0', // Layer name for USGS Topographic Map
    url: 'https://basemap.nationalmap.gov/arcgis/services/USGSTopo/MapServer/WmsServer',
    label: 'USGS Topographic Map',
  },
  {
    id: 'usgs_imagery',
    name: '0', // Layer name for USGS Imagery
    url: 'https://basemap.nationalmap.gov/arcgis/services/USGSImageryOnly/MapServer/WmsServer',
    label: 'USGS Imagery',
  },
];


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

export default function App() {
  const initialData = null;
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectName, setProjectName] = useState('');

  const [externalLayerUrl, setExternalLayerUrl] = useState('');
  const [externalVectorLayers, setExternalVectorLayers] = useState([]);
  
  // --- State for WMS Layers ---
  const [wmsLayers, setWmsLayers] = useState([]); // Stores active OpenLayers layer objects
  const [checkedState, setCheckedState] = useState({}); // Stores the checked status of each checkbox by its ID

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
      const { view, wmsLayers: initialWmsLayers, geoJsonUrls, annotations } = initialData.mapState;

      // 1. Set View
      map.getView().setCenter(fromLonLat(view.center));
      map.getView().setZoom(view.zoom);

      // 2. Load WMS Layers and update checkbox state
      const initialCheckedState = {};
      initialWmsLayers.forEach(wmsInfo => {
        // Find the full layer definition from our availableLayers constant
        const layerDefinition = availableLayers.find(l => l.name === wmsInfo.layerName);
        if (layerDefinition) {
            handleAddWmsLayer(layerDefinition); // Add the layer to the map
            initialCheckedState[layerDefinition.id] = true; // Mark its checkbox as checked
        }
      });
      setCheckedState(initialCheckedState); // Set the initial state for all checkboxes at once

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
      toast.warn("Please place exactly two points to create a path.");
      setIsPathLoading(false);
      return;
    }
    const coords = pointFeatures.map((f) => toLonLat(f.getGeometry().getCoordinates()));
    const [lon1, lat1] = coords[0];
    const [lon2, lat2] = coords[1];
    try {
      const routingResult = await getRouting(lat1, lon1, lat2, lon2, session.user_id);
      if (routingResult.error) {
        toast.error("Routing failed: " + routingResult.error);
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
      toast.error("Unexpected error during routing.");
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
      toast.info("There are no vector features on the map to export.");
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

  const addExternalLayer = (url, isInitialLoad = false) => {
    if (!url || !map) {
      if (!isInitialLoad) toast.error("Please enter a valid GeoJSON URL.");
      return;
    }
    const externalVectorSource = new VectorSource({ url, format: new GeoJSON() });
    externalVectorSource.on('featuresloaderror', () => {
        if (!isInitialLoad) toast.error(`Error loading features from: ${url}. Please check the URL and CORS policy.`);
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

const handleAddWmsLayer = (layerInfo) => {
  if (!layerInfo.url || !layerInfo.name || !map) {
    toast.error("Layer information is missing.");
    return;
  }

  // Prevent adding the same layer twice
  const existingLayer = wmsLayers.find((l) => l.layerName === layerInfo.name);
  if (existingLayer) {
    toast.info(`Layer '${layerInfo.name}' is already added.`);
    return;
  }

  const baseUrl = layerInfo.url.split('?')[0];
  const wmsSource = new TileWMS({
    url: baseUrl,
    params: {
      LAYERS: layerInfo.name,
      VERSION: '1.1.1',
      TRANSPARENT: true,
      FORMAT: 'image/png',
      STYLES: '',
      SRS: 'EPSG:3857',
      WIDTH: 256,
      HEIGHT: 256,
    },
    serverType: 'geoserver',
    transition: 0,
    tileGrid: createXYZ({
      tileSize: 256,
      extent: map.getView().getProjection().getExtent(), // Align with map's extent
    }),
    crossOrigin: 'anonymous', // Handle CORS
  });

  // Log tile URLs for debugging
  wmsSource.on('tileloadstart', (event) => {
    const tile = event.tile;
    const tileCoord = tile.getTileCoord();
    const tileUrl = wmsSource.getTileUrlFunction()(
      tileCoord,
      1, // Pixel ratio
      map.getView().getProjection()
    );
    console.log(`WMS Request URL for ${layerInfo.name}:`, tileUrl);
  });

  // Handle tile load errors
  wmsSource.on('tileloaderror', (event) => {
    console.error(`Tile load error for layer '${layerInfo.name}':`, event);
    toast.error(`Failed to load WMS layer '${layerInfo.name}'. Check console for details.`);
    handleRemoveWmsLayer(layerInfo.name);
  });

  const wmsLayer = new TileLayer({
    source: wmsSource,
    zIndex: 10, // Render above base map
    opacity: 1.0, // Full visibility
  });

  map.addLayer(wmsLayer);
  setWmsLayers((prev) => [
    ...prev,
    { url: baseUrl, layerName: layerInfo.name, layer: wmsLayer },
  ]);

  // Force refresh to ensure tiles are requested
  wmsSource.refresh();
};

  const handleRemoveWmsLayer = (layerName) => {
    if (!layerName || !map) return;

    const layerToRemove = wmsLayers.find(l => l.layerName === layerName);
    if (layerToRemove) {
      map.removeLayer(layerToRemove.layer);
      setWmsLayers(prev => prev.filter(l => l.layerName !== layerName));
    }
  };

  const handleCheckboxChange = (layer) => {
    const isChecked = !checkedState[layer.id];

    // Update the checkbox UI state
    setCheckedState(prevState => ({
      ...prevState,
      [layer.id]: isChecked,
    }));

    // Add or remove the layer from the map
    if (isChecked) {
      handleAddWmsLayer(layer);
    } else {
      handleRemoveWmsLayer(layer.name);
    }
  };

  const handleSaveMap = async () => {
    console.log("save map 1: starting");

    // Create a promise to capture the project name from the modal
    const inputPromise = new Promise((resolve) => {
      console.log("save map 2: opening modal");
      setIsModalOpen(true);

      // Functions to handle save and cancel
      window.handleModalSave = () => {
        console.log("save button clicked, projectName:", projectName);
        setIsModalOpen(false);
        resolve(projectName);
      };

      window.handleModalCancel = () => {
        console.log("cancel button clicked");
        setIsModalOpen(false);
        resolve(null);
      };
    });

    console.log("save map 3: awaiting inputPromise");
    const finalProjectName = await inputPromise;
    console.log("save map 4: promise resolved, projectName:", finalProjectName);

    if (!finalProjectName) {
      toast.error('Project name is required or save was cancelled');
      return;
    }

    if (!map) {
      toast.error('Map is not ready');
      return;
    }

    const view = map.getView();
    const mapState = {
      view: {
        center: toLonLat(view.getCenter()),
        zoom: view.getZoom(),
      },
      wmsLayers: wmsLayers.map((l) => ({ url: l.url, layerName: l.layerName })),
      geoJsonUrls: externalVectorLayers.map((layer) => layer.getSource().getUrl()),
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
      console.log("save map 5: sending API request");
      const response = await fetch('/api/map/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectName: finalProjectName, mapState }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Failed to save map.');
      const shareableLink = `${window.location.origin}/map/view/${result.projectId}`;
      toast.success(
        <div>
          Map saved successfully!
          <br />
          <a href={shareableLink} target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">
            Share this link
          </a>
        </div>,
        { autoClose: 10000 }
      );
    } catch (error) {
      console.error("Error saving map:", error);
      toast.error(`Error saving map: ${error.message}`);
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

            {/* --- WMS Layer Checkbox Section --- */}
            <div className="mt-4 pt-4 border-t border-gray-600">
              <h3 className="text-lg font-bold mb-3 text-gray-100">WMS Layers</h3>
              <div className="space-y-2">
                {availableLayers.map((layer) => (
                  <div key={layer.id} className="flex items-center">
                    <input
                      type="checkbox"
                      id={layer.id}
                      name={layer.name}
                      checked={checkedState[layer.id] || false}
                      onChange={() => handleCheckboxChange(layer)}
                      className="h-4 w-4 text-teal-600 border-gray-400 rounded focus:ring-teal-500 cursor-pointer"
                    />
                    <label htmlFor={layer.id} className="ml-2 block text-sm text-gray-300 cursor-pointer">
                      {layer.label}
                    </label>
                  </div>
                ))}
              </div>
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
            {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-lg font-semibold mb-4">Save Map Project</h2>
            <input
              type="text"
              placeholder="Enter map project name"
              value={projectName}
              onChange={(e) => {
                setProjectName(e.target.value);
                console.log("input changed, projectName:", e.target.value);
              }}
              className="border p-2 w-full text-gray-800 mb-4"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={window.handleModalCancel}
                className="bg-gray-500 text-white p-2 rounded"
              >
                Cancel
              </button>
              <button
                onClick={window.handleModalSave}
                className="bg-blue-500 text-white p-2 rounded"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
