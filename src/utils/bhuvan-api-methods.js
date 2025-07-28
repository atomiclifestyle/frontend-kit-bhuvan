
const base = "https://bhuvan-kit-backend.onrender.com";


export const getRouting = async (lat1, lon1, lat2, lon2, userId) => {
    if (!userId) {
        return { error: 'User ID is required.' };
    }
    try {
        const res = await fetch(
            `${base}/api/bhuvan/routing?lat1=${lat1}&lon1=${lon1}&lat2=${lat2}&lon2=${lon2}`,
            {
                headers: {
                    'x-user-id': userId
                }
            }
        );
        if (!res.ok) throw new Error('Failed to fetch routing data');
        return await res.json();
    } catch (err) {
        console.error("Error in getRouting:", err);
        return { error: err.message };
    }
};


export const getThematicData = async (lat, lon, year, userId) => {
    if (!userId) {
        return { error: 'User ID is required.' };
    }
    try {
        const res = await fetch(
            `${base}/api/bhuvan/thematic?lat=${lat}&lon=${lon}&year=${year}`,
            {
                headers: {
                    'x-user-id': userId
                }
            }
        );
        if (!res.ok) throw new Error('Failed to fetch thematic data');
        return await res.json();
    } catch (err) {
        console.error("Error in getThematicData:", err);
        return { error: err.message };
    }
};


export const villageGeocoding = async (category, userId) => {
    if (!userId) {
        return { error: 'User ID is required.' };
    }
    try {
        const res = await fetch(
            `${base}/api/bhuvan/vg?village=${category}`,
            {
                headers: {
                    'x-user-id': userId
                }
            }
        );
        if (!res.ok) throw new Error('Failed to geocode village');
        return await res.json();
    } catch (err) {
        console.error("Error in villageGeocoding:", err);
        return { error: err.message };
    }
};


export const getEllipsoid = async (id, userId) => {
    if (!userId) {
        return { error: 'User ID is required.' };
    }
    try {
        const res = await fetch(
            `${base}/api/bhuvan/ellipsoid?id=${id}`,
            {
                headers: {
                    'x-user-id': userId
                }
            }
        );
        if (!res.ok) throw new Error('Failed to download ellipsoid file');

        // This check ensures the code only tries to create a download link in the browser.
        if (typeof window !== 'undefined' && typeof document !== 'undefined') {
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = `${id}.zip`; // Assuming the file is a zip
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
            return { success: true };
        } else {
            // On the server, we can't trigger a download, so we return a warning.
            return { warning: 'getEllipsoid is browser-only; cannot trigger download on the server.', data: await res.text() };
        }
    } catch (err) {
        console.error("Error in getEllipsoid:", err);
        return { error: err.message };
    }
};


export const createUser = async (userId) => {
    if (!userId) {
        return { error: 'User ID is required.' };
    }
    try {
        const res = await fetch(
            `${base}/api/bhuvan/create-user-db`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-id': userId
                }
            }
        );
        if (!res.ok) throw new Error('Failed to create user');
        return await res.json();
    } catch (err) {
        console.error("Error in createUser:", err);
        return { error: err.message };
    }
};


export const executeQuery = async (query, userId) => {
    if (!userId) {
        return { error: 'User ID is required.' };
    }
    try {
        const res = await fetch(
            `${base}/api/bhuvan/execute-query`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-id': userId
                },
                body: JSON.stringify({ query: query })
            }
        );
        if (!res.ok) throw new Error('Failed to execute query');
        return await res.json();
    } catch (err) {
        console.error("Error in executeQuery:", err);
        return { error: err.message };
    }
};


export const executeCentralQuery = async (query, userId) => {
    if (!userId) {
        return { error: 'User ID is required.' };
    }
    try {
        const res = await fetch(
            `${base}/api/bhuvan/execute-central-query`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-id': userId
                },
                body: JSON.stringify({ query: query })
            }
        );
        if (!res.ok) throw new Error('Failed to execute central query');
        return await res.json();
    } catch (err) {
        console.error("Error in executeCentralQuery:", err);
        return { error: err.message };
    }
};
