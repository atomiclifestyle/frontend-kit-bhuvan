export const getRouting = async (lat1, lon1, lat2, lon2) => {
    try {
      const base = import.meta.env.VITE_BASE_URL;
      const res = await fetch(
        `${base}/api/bhuvan/routing?lat1=${lat1}&lon1=${lon1}&lat2=${lat2}&lon2=${lon2}`
      );
      if (!res.ok) throw new Error('Failed to fetch routing data');
      const json = await res.json();
      return json;
    } catch (err) {
      return { error: err.message };
    }
  };
  
  export const getThematicData = async (lat, lon, year) => {
    try {
      const base = import.meta.env.VITE_BASE_URL;
      const res = await fetch(
        `${base}/api/bhuvan/thematic?lat=${lat}&lon=${lon}&year=${year}`
      );
      if (!res.ok) throw new Error('Failed to fetch thematic data');
      const json = await res.json();
      return json;
    } catch (err) {
      return { error: err.message };
    }
  };
  
  export const villageGeocoding = async (category) => {
    try {
      const base = import.meta.env.VITE_BASE_URL;
      const res = await fetch(`${base}/api/bhuvan/vg?village=${category}`);
      if (!res.ok) throw new Error('Failed to add POI');
      const json = await res.json();
      return json;
    } catch (err) {
      return { error: err.message };
    }
  };
  
  export const getEllipsoid = async (id) => {
    try {
      const base = import.meta.env.VITE_BASE_URL;
      const res = await fetch(
        `${base}/api/bhuvan/ellipsoid?id=${id}`
      );
      if (!res.ok) throw new Error('Failed to fetch vehicle tracking data');
      const json = await res.json();
      return json;
    } catch (err) {
      return { error: err.message };
    }
  };
  
  export const getFloodRunoff = async (catchmentId, outletLat, outletLon) => {
    try {
      const base = import.meta.env.VITE_BASE_URL;
      const res = await fetch(
        `${base}/api/bhuvan/floodrunoff?catchmentId=${catchmentId}&outletLat=${outletLat}&outletLon=${outletLon}`
      );
      if (!res.ok) throw new Error('Failed to fetch flood runoff data');
      const json = await res.json();
      return json;
    } catch (err) {
      return { error: err.message };
    }
  };