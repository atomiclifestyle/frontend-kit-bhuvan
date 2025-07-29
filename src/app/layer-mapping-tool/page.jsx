"use client";

import "ol/ol.css";
import { Map, View } from "ol";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import VectorTileLayer from "ol/layer/VectorTile";
import OSM from "ol/source/OSM";
import XYZ from "ol/source/XYZ";
import VectorSource from "ol/source/Vector";
import VectorTileSource from "ol/source/VectorTile";
import TileWMS from "ol/source/TileWMS";
import { fromLonLat, toLonLat } from "ol/proj";
import { Draw, Select, Modify } from "ol/interaction";
import { Circle as CircleStyle, Fill, Stroke, Style, Text } from "ol/style";
import { useEffect, useRef, useState } from "react";
import { Rnd } from "react-rnd";
import { getRouting } from "@/utils/bhuvan-api-methods";
import { useSession } from "next-auth/react";
import GeoJSON from "ol/format/GeoJSON";
import MVT from "ol/format/MVT";
import { toast } from "react-toastify";
import { createXYZ } from "ol/tilegrid";
import "react-toastify/dist/ReactToastify.css";

const availableLayers = [
  {
    id: "bhuvan_drainage",
    name: "BDRAIN",
    url: "https://bhuvanmaps.nrsc.gov.in/vec1wms/gwc/service/wms",
    label: "Bhuvan Drainage",
    type: "wms",
  },
  {
    id: "bhuvan_basin",
    name: "hydrology:BASIN",
    url: "https://bhuvanmaps.nrsc.gov.in/vec1wms/gwc/service/wms",
    label: "Bhuvan Basin",
    type: "wms",
  },
  {
    id: "bhuvan_subbasin",
    name: "hydrology:SUBBASIN",
    url: "https://bhuvanmaps.nrsc.gov.in/nb24wms/gwc/service/wms",
    label: "Bhuvan Subbasin",
    type: "wms",
  },
  {
    id: "bhuvan_watershed",
    name: "hydrology:WSHED",
    url: "https://bhuvanmaps.nrsc.gov.in/nb24wms/gwc/service/wms",
    label: "Bhuvan Watershed",
    type: "wms",
  },
  {
    id: "bhuvan_road_rdd",
    name: "mmi.road_rdd",
    url: "https://bhuvanmaps.nrsc.gov.in/tileserver2/mmi.road_rdd/{z}/{x}/{y}.pbf",
    label: "Bhuvan Roadway",
    type: "pbf",
  },
  {
    id: "bhuvan_rail_rdd",
    name: "bhuvan_rail_rdd",
    url: "https://bhuvanmaps.nrsc.gov.in/tileserver2/rail.india_rail_network/{z}/{x}/{y}.pbf",
    label: "Bhuvan Railway",
    type: "pbf",
  },
];

const PointEditor = ({
  selectedFeature,
  onUpdateFeatureName,
  onDeleteFeature,
  featureName,
  setFeatureName,
}) => {
  useEffect(() => {
    if (selectedFeature) {
      const name = selectedFeature.get("name") || "";
      setFeatureName(name);
    } else {
      setFeatureName("");
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
    <div className="p-4 bg-gray-800 rounded-lg shadow-md space-y-3">
      <h3 className="text-lg font-semibold text-white">Point Editor</h3>
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-300">Name</label>
        <input
          type="text"
          name="name"
          placeholder="Enter point name"
          value={featureName}
          onChange={handleNameChange}
          className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleUpdateName}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
        >
          Update Name
        </button>
        <button
          onClick={onDeleteFeature}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
        >
          Delete Point
        </button>
      </div>
    </div>
  );
};

const PolygonEditor = ({
  selectedPolygon,
  onUpdatePolygonName,
  onDeletePolygon,
  polygonName,
  setPolygonName,
}) => {
  useEffect(() => {
    if (selectedPolygon) {
      const name = selectedPolygon.get("name") || "";
      setPolygonName(name);
    } else {
      setPolygonName("");
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
    <div className="p-4 bg-gray-800 rounded-lg shadow-md space-y-3">
      <h3 className="text-lg font-semibold text-white">Polygon Editor</h3>
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-300">Name</label>
        <input
          type="text"
          name="name"
          placeholder="Enter polygon name"
          value={polygonName}
          onChange={handleNameChange}
          className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleUpdateName}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
        >
          Update Name
        </button>
        <button
          onClick={onDeletePolygon}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
        >
          Delete Polygon
        </button>
      </div>
    </div>
  );
};

export default function CreateLayerPage() {
  const initialData = null;
  const mapRef = useRef();
  const [map, setMap] = useState(null);
  const [isMounted, setIsMounted] = useState(false);
  const { data: session } = useSession();

  // State and refs for base layer toggling
  const [baseLayer, setBaseLayer] = useState("osm");
  const osmLayerRef = useRef(null);
  const satelliteLayerRef = useRef(null);

  const [vectorSource] = useState(new VectorSource());
  const vectorLayerRef = useRef(null);
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [featureName, setFeatureName] = useState("");
  const [pointCount, setPointCount] = useState(0);

  const [polygonSource] = useState(new VectorSource());
  const polygonLayerRef = useRef(null);
  const [selectedPolygon, setSelectedPolygon] = useState(null);
  const [polygonName, setPolygonName] = useState("");

  const [pathSource] = useState(new VectorSource());
  const pathLayerRef = useRef(null);
  const [isPathLoading, setIsPathLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectName, setProjectName] = useState("");

  const [externalLayerUrl, setExternalLayerUrl] = useState("");
  const [externalVectorLayers, setExternalVectorLayers] = useState([]);

  const [wmsLayers, setWmsLayers] = useState([]);
  const [vectorTileLayers, setVectorTileLayers] = useState([]);
  const [checkedState, setCheckedState] = useState({});

  const drawInteractionRef = useRef(null);
  const selectInteractionRef = useRef(null);
  const [activeTool, setActiveTool] = useState(null);

  const [revision, setRevision] = useState(0);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const createTextStyle = (text) => {
    return new Text({
      text: text || "",
      font: "bold 12px Calibri, sans-serif",
      fill: new Fill({ color: "#000" }),
      stroke: new Stroke({ color: "#fff", width: 4 }),
      offsetY: -20,
    });
  };

  useEffect(() => {
    const pointStyleFunction = (feature) => {
      const isSelected =
        selectedFeature && selectedFeature.getId() === feature.getId();
      const name = feature.get("name") || "";
      return new Style({
        image: new CircleStyle({
          radius: isSelected ? 9 : 7,
          fill: new Fill({ color: isSelected ? "#3399CC" : "#ffcc33" }),
          stroke: new Stroke({ color: "white", width: 2 }),
        }),
        text: createTextStyle(name),
      });
    };

    const polygonStyleFunction = (feature) => {
      const isSelected =
        selectedPolygon && selectedPolygon.getId() === feature.getId();
      const name = feature.get("name") || "";
      return new Style({
        stroke: new Stroke({
          color: isSelected ? "#3399CC" : "#e64a19",
          width: 3,
        }),
        fill: new Fill({
          color: isSelected
            ? "rgba(51, 153, 204, 0.4)"
            : "rgba(230, 74, 25, 0.4)",
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
        stroke: new Stroke({ color: "#0000ff", width: 4, opacity: 0.7 }),
      }),
    });
    pathLayerRef.current = pathLayer;

    osmLayerRef.current = new TileLayer({
      source: new OSM(),
    });

    satelliteLayerRef.current = new TileLayer({
      source: new XYZ({
        url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        maxZoom: 19,
        crossOrigin: "anonymous",
      }),
    });

    const initialMap = new Map({
      target: mapRef.current,
      layers: [osmLayerRef.current, vectorLayer, polygonLayer, pathLayer],
      view: new View({
        center: fromLonLat([78.9629, 20.5937]),
        zoom: 4,
      }),
    });

    selectInteractionRef.current = new Select({
      style: null,
      toggleCondition: () => true,
    });
    selectInteractionRef.current.on("select", (event) => {
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
  }, []);

  useEffect(() => {
    if (map && initialData) {
      const {
        view,
        wmsLayers: initialWmsLayers,
        pbfLayers: initialPbfLayers = [],
        geoJsonUrls,
        annotations,
      } = initialData.mapState;

      map.getView().setCenter(fromLonLat(view.center));
      map.getView().setZoom(view.zoom);

      const initialCheckedState = {};
      initialWmsLayers.forEach((wmsInfo) => {
        const layerDefinition = availableLayers.find(
          (l) => l.name === wmsInfo.layerName && l.type === "wms"
        );
        if (layerDefinition) {
          handleAddLayer(layerDefinition);
          initialCheckedState[layerDefinition.id] = true;
        }
      });
      initialPbfLayers.forEach((pbfInfo) => {
        const layerDefinition = availableLayers.find(
          (l) => l.name === pbfInfo.layerName && l.type === "pbf"
        );
        if (layerDefinition) {
          handleAddLayer(layerDefinition);
          initialCheckedState[layerDefinition.id] = true;
        }
      });
      setCheckedState(initialCheckedState);

      geoJsonUrls.forEach((url) => {
        addExternalLayer(url, true);
      });

      if (annotations && annotations.features) {
        const features = new GeoJSON().readFeatures(annotations, {
          dataProjection: "EPSG:4326",
          featureProjection: map.getView().getProjection(),
        });

        const points = [];
        const polygons = [];
        const paths = [];

        features.forEach((feature) => {
          const geomType = feature.getGeometry().getType();
          if (geomType === "Point") {
            points.push(feature);
          } else if (geomType === "Polygon" || geomType === "MultiPolygon") {
            polygons.push(feature);
          } else if (geomType === "LineString") {
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
      const isSelected =
        selectedFeature && selectedFeature.getId() === feature.getId();
      const name = feature.get("name") || "";
      return new Style({
        image: new CircleStyle({
          radius: isSelected ? 9 : 7,
          fill: new Fill({ color: isSelected ? "#3399CC" : "#ffcc33" }),
          stroke: new Stroke({ color: "white", width: 2 }),
        }),
        text: createTextStyle(name),
      });
    };

    const polygonStyleFunction = (feature) => {
      const isSelected =
        selectedPolygon && selectedPolygon.getId() === feature.getId();
      const name = feature.get("name") || "";
      return new Style({
        stroke: new Stroke({
          color: isSelected ? "#3399CC" : "#e64a19",
          width: 3,
        }),
        fill: new Fill({
          color: isSelected
            ? "rgba(51, 153, 204, 0.4)"
            : "rgba(230, 74, 25, 0.4)",
        }),
        text: createTextStyle(name),
      });
    };

    if (vectorLayerRef.current)
      vectorLayerRef.current.setStyle(pointStyleFunction);
    if (polygonLayerRef.current)
      polygonLayerRef.current.setStyle(polygonStyleFunction);
    vectorSource.changed();
    polygonSource.changed();
    map?.render();
  }, [selectedFeature, selectedPolygon, revision, map]);

  useEffect(() => {
    const updatePointCount = () =>
      setPointCount(vectorSource.getFeatures().length);
    vectorSource.on("addfeature", updatePointCount);
    vectorSource.on("removefeature", updatePointCount);
    return () => {
      vectorSource.un("addfeature", updatePointCount);
      vectorSource.un("removefeature", updatePointCount);
    };
  }, [vectorSource]);

  const handleBaseLayerChange = (layerType) => {
    if (layerType === baseLayer || !map) return;

    const layers = map.getLayers();
    layers.removeAt(0);
    if (layerType === "osm") {
      layers.insertAt(0, osmLayerRef.current);
    } else {
      layers.insertAt(0, satelliteLayerRef.current);
    }
    setBaseLayer(layerType);
  };

  const toggleDraw = (type) => {
    if (activeTool === type) {
      map.removeInteraction(drawInteractionRef.current);
      setActiveTool(null);
      selectInteractionRef.current.setActive(true);
      return;
    }

    if (drawInteractionRef.current)
      map.removeInteraction(drawInteractionRef.current);

    selectInteractionRef.current.getFeatures().clear();
    setSelectedFeature(null);
    setSelectedPolygon(null);
    setActiveTool(type);
    selectInteractionRef.current.setActive(false);

    const source = type === "Point" ? vectorSource : polygonSource;
    drawInteractionRef.current = new Draw({ source: source, type: type });

    drawInteractionRef.current.on("drawend", (event) => {
      const feature = event.feature;
      const uniqueId = `${type.toLowerCase()}_${Date.now()}`;
      feature.setId(uniqueId);
      feature.set("name", "");
      source.addFeature(feature);
      map.removeInteraction(drawInteractionRef.current);
      setActiveTool(null);
      selectInteractionRef.current.getFeatures().clear();
      selectInteractionRef.current.getFeatures().push(feature);
      if (type === "Point") {
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
    const sourceFeature = featureId
      ? vectorSource.getFeatureById(featureId)
      : feature;
    if (sourceFeature) {
      sourceFeature.set("name", name);
      setSelectedFeature(sourceFeature);
      vectorSource.changed();
      if (vectorLayerRef.current)
        vectorLayerRef.current.setStyle(vectorLayerRef.current.getStyle());
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
      polygon.set("name", name);
      setRevision((r) => r + 1);
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
    const coords = pointFeatures.map((f) =>
      toLonLat(f.getGeometry().getCoordinates())
    );
    const [lon1, lat1] = coords[0];
    const [lon2, lat2] = coords[1];
    try {
      const routingResult = await getRouting(
        lat1,
        lon1,
        lat2,
        lon2,
        session.user_id
      );
      if (routingResult.error) {
        toast.error("Routing failed: " + routingResult.error);
        return;
      }
      const format = new GeoJSON();
      const routeFeatures = format.readFeatures(routingResult, {
        dataProjection: "EPSG:4326",
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
      ...polygonSource.getFeatures(),
    ];
    externalVectorLayers.forEach((layer) => {
      const source = layer.getSource();
      if (source) allFeatures = [...allFeatures, ...source.getFeatures()];
    });
    if (allFeatures.length === 0) {
      toast.info("There are no vector features on the map to export.");
      return;
    }
    const geojsonFormat = new GeoJSON();
    const geojsonString = geojsonFormat.writeFeatures(allFeatures, {
      featureProjection: "EPSG:3857",
      dataProjection: "EPSG:4326",
    });
    const blob = new Blob([geojsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "exported_features.geojson";
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
    const externalVectorSource = new VectorSource({
      url,
      format: new GeoJSON(),
    });
    externalVectorSource.on("featuresloaderror", () => {
      if (!isInitialLoad)
        toast.error(
          `Error loading features from: ${url}. Please check the URL and CORS policy.`
        );
    });
    const externalVectorLayer = new VectorLayer({
      source: externalVectorSource,
      style: new Style({
        stroke: new Stroke({ color: "#00FFFF", width: 3 }),
        fill: new Fill({ color: "rgba(0, 255, 255, 0.2)" }),
        image: new CircleStyle({
          radius: 7,
          fill: new Fill({ color: "#00FFFF" }),
          stroke: new Stroke({ color: "white", width: 2 }),
        }),
      }),
    });
    map.addLayer(externalVectorLayer);
    setExternalVectorLayers((prev) => [...prev, externalVectorLayer]);
    if (!isInitialLoad) setExternalLayerUrl("");
  };

  const handleAddLayer = (layerInfo) => {
    if (!layerInfo.url || !layerInfo.name || !map) {
      toast.error("Layer information is missing.");
      return;
    }

    if (layerInfo.type === "wms") {
      const existingLayer = wmsLayers.find(
        (l) => l.layerName === layerInfo.name
      );
      if (existingLayer) {
        toast.info(`WMS Layer '${layerInfo.name}' is already added.`);
        return;
      }

      const baseUrl = layerInfo.url.split("?")[0];
      const wmsSource = new TileWMS({
        url: baseUrl,
        params: {
          FORMAT: "image/png",
          SERVICE: "WMS",
          VERSION: "1.1.1",
          REQUEST: "GetMap",
          SRS: "EPSG:3857",
          TRANSPARENT: true,
          WIDTH: 256,
          HEIGHT: 256,
          LAYERS: layerInfo.name,
        },
        serverType: "geoserver",
        transition: 0,
        tileGrid: createXYZ({
          tileSize: 256,
          extent: map.getView().getProjection().getExtent(),
        }),
        crossOrigin: "anonymous",
      });

      wmsSource.on("tileloadstart", (event) => {
        const tile = event.tile;
        const tileCoord = tile.getTileCoord();
        const tileUrl = wmsSource.getTileUrlFunction()(
          tileCoord,
          1,
          map.getView().getProjection()
        );
        console.log(`WMS Request URL for ${layerInfo.name}:`, tileUrl);
      });

      wmsSource.on("tileloaderror", (event) => {
        console.error(`Tile load error for layer '${layerInfo.name}':`, event);
        toast.error(
          `Failed to load WMS layer '${layerInfo.name}'. Check console for details.`
        );
        handleRemoveLayer(layerInfo.name, "wms");
      });

      const wmsLayer = new TileLayer({
        source: wmsSource,
        zIndex: 10,
        opacity: 1.0,
      });

      map.addLayer(wmsLayer);
      setWmsLayers((prev) => [
        ...prev,
        { url: baseUrl, layerName: layerInfo.name, layer: wmsLayer },
      ]);

      wmsSource.refresh();
    } else if (layerInfo.type === "pbf") {
      const existingLayer = vectorTileLayers.find(
        (l) => l.layerName === layerInfo.name
      );
      if (existingLayer) {
        toast.info(`Vector Tile Layer '${layerInfo.name}' is already added.`);
        return;
      }

      const vectorTileSource = new VectorTileSource({
        format: new MVT(),
        url: layerInfo.url,
        tileGrid: createXYZ({
          tileSize: 512,
          maxZoom: 14,
        }),
      });

      vectorTileSource.on("tileloaderror", (event) => {
        console.error(
          `Tile load error for vector tile layer '${layerInfo.name}':`,
          event
        );
        toast.error(
          `Failed to load vector tile layer '${layerInfo.name}'. Check console for details.`
        );
        handleRemoveLayer(layerInfo.name, "pbf");
      });

      const vectorTileLayer = new VectorTileLayer({
        source: vectorTileSource,
        style: new Style({
          stroke: new Stroke({ color: "#000000", width: 2 }),
          fill: new Fill({ color: "rgba(0, 0, 0)" }),
        }),
        zIndex: 10,
      });

      map.addLayer(vectorTileLayer);
      setVectorTileLayers((prev) => [
        ...prev,
        {
          url: layerInfo.url,
          layerName: layerInfo.name,
          layer: vectorTileLayer,
        },
      ]);

      vectorTileSource.refresh();
    }
  };

  const handleRemoveLayer = (layerName, layerType) => {
    if (!layerName || !map) return;

    if (layerType === "wms") {
      const layerToRemove = wmsLayers.find((l) => l.layerName === layerName);
      if (layerToRemove) {
        map.removeLayer(layerToRemove.layer);
        setWmsLayers((prev) => prev.filter((l) => l.layerName !== layerName));
      }
    } else if (layerType === "pbf") {
      const layerToRemove = vectorTileLayers.find(
        (l) => l.layerName === layerName
      );
      if (layerToRemove) {
        map.removeLayer(layerToRemove.layer);
        setVectorTileLayers((prev) =>
          prev.filter((l) => l.layerName !== layerName)
        );
      }
    }
  };

  const handleCheckboxChange = (layer) => {
    const isChecked = !checkedState[layer.id];

    setCheckedState((prevState) => ({
      ...prevState,
      [layer.id]: isChecked,
    }));

    if (isChecked) {
      handleAddLayer(layer);
    } else {
      handleRemoveLayer(layer.name, layer.type);
    }
  };

  const handleSaveMap = async () => {
    const inputPromise = new Promise((resolve) => {
      setIsModalOpen(true);

      window.handleModalSave = () => {
        setIsModalOpen(false);
        resolve(projectName);
      };

      window.handleModalCancel = () => {
        setIsModalOpen(false);
        resolve(null);
      };
    });

    const finalProjectName = await inputPromise;

    if (!finalProjectName) {
      toast.error("Project name is required or save was cancelled");
      return;
    }

    if (!map) {
      toast.error("Map is not ready");
      return;
    }

    const view = map.getView();
    const mapState = {
      view: {
        center: toLonLat(view.getCenter()),
        zoom: view.getZoom(),
      },
      wmsLayers: wmsLayers.map((l) => ({ url: l.url, layerName: l.layerName })),
      pbfLayers: vectorTileLayers.map((l) => ({
        url: l.url,
        layerName: l.layerName,
      })),
      geoJsonUrls: externalVectorLayers.map((layer) =>
        layer.getSource().getUrl()
      ),
      annotations: new GeoJSON().writeFeaturesObject(
        [
          ...vectorSource.getFeatures(),
          ...polygonSource.getFeatures(),
          ...pathSource.getFeatures(),
        ],
        { featureProjection: "EPSG:3857", dataProjection: "EPSG:4326" }
      ),
    };

    try {
      const response = await fetch("/api/map/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectName: finalProjectName, mapState }),
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.message || "Failed to save map.");
      const shareableLink = `${window.location.origin}/map-view/${result.projectId}`;
      toast.success(
        <div>
          Map saved successfully!
          <br />
          <a
            href={shareableLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 underline"
          >
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
    <div className="flex h-screen bg-gray-900 font-sans">
      <div ref={mapRef} className="w-full h-full cursor-default relative z-0" />
      {isMounted && (
        <Rnd
          default={{
            x: window.innerWidth - 380, // Position closer to right edge
            y: 20,
            width: 360,
            height: "auto",
          }}
          minWidth={300}
          maxWidth={400}
          bounds="parent"
          className="bg-gray-800 rounded-xl shadow-2xl border border-gray-700 z-10"
          style={{ maxHeight: "calc(100vh - 40px)" }}
        >
          <div className="p-6 flex flex-col h-full text-gray-100 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
            <h2 className="text-2xl font-semibold text-white mb-4 border-b border-gray-700 pb-2">
              Map Toolbox
            </h2>

            {/* Base Map Toggle Switch */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-200 mb-2">Base Map</h3>
              <div className="flex bg-gray-700 rounded-lg p-1">
                <button
                  onClick={() => handleBaseLayerChange("osm")}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-all duration-300 ${
                    baseLayer === "osm"
                      ? "bg-blue-600 text-white shadow-md"
                      : "text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  Street
                </button>
                <button
                  onClick={() => handleBaseLayerChange("satellite")}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-all duration-300 ${
                    baseLayer === "satellite"
                      ? "bg-blue-600 text-white shadow-md"
                      : "text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  Satellite
                </button>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-200 mb-2">
                  Drawing Tools
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => toggleDraw("Point")}
                    className={`py-2 px-4 rounded-lg font-medium transition-all duration-200 ${
                      activeTool === "Point"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-700 hover:bg-blue-600 text-gray-200 hover:text-white"
                    }`}
                  >
                    {activeTool === "Point" ? "Cancel Drawing" : "Add Point"}
                  </button>
                  <button
                    onClick={() => toggleDraw("Polygon")}
                    className={`py-2 px-4 rounded-lg font-medium transition-all duration-200 ${
                      activeTool === "Polygon"
                        ? "bg-orange-600 text-white"
                        : "bg-gray-700 hover:bg-orange-600 text-gray-200 hover:text-white"
                    }`}
                  >
                    {activeTool === "Polygon" ? "Cancel Drawing" : "Add Polygon"}
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-700">
                <h3 className="text-lg font-medium text-gray-200 mb-2">
                  Bhuvan Layers
                </h3>
                <div className="space-y-2">
                  {availableLayers.map((layer) => (
                    <div key={layer.id} className="flex items-center">
                      <input
                        type="checkbox"
                        id={layer.id}
                        name={layer.name}
                        checked={checkedState[layer.id] || false}
                        onChange={() => handleCheckboxChange(layer)}
                        className="h-4 w-4 text-blue-600 border-gray-600 rounded focus:ring-blue-500 cursor-pointer"
                      />
                      <label
                        htmlFor={layer.id}
                        className="ml-2 text-sm text-gray-300 cursor-pointer"
                      >
                        {layer.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-gray-700">
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
                {!selectedPolygon && pointCount <= 0 && (
                  <div className="p-4 text-center text-gray-400">
                    <p>
                      Select a tool to add a feature or click an existing feature
                      on the map.
                    </p>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-gray-700 space-y-3">
                <button
                  onClick={handleCreatePath}
                  disabled={pointCount !== 2}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 disabled:bg-gray-600 disabled:cursor-not-allowed"
                >
                  {isPathLoading
                    ? "Loading..."
                    : `Create Path (${pointCount}/2 points)`}
                </button>
                <button
                  onClick={handleExportGeoJSON}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200"
                >
                  Export as GeoJSON
                </button>
                <button
                  onClick={handleSaveMap}
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200"
                >
                  Save Map
                </button>
              </div>
            </div>
          </div>
        </Rnd>
      )}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
          <div className="bg-gray-800 p-6 rounded-xl shadow-2xl w-full max-w-md">
            <h2 className="text-xl font-semibold text-white mb-4">
              Save Map Project
            </h2>
            <input
              type="text"
              placeholder="Enter map project name"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={window.handleModalCancel}
                className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-md transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={window.handleModalSave}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-all duration-200"
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