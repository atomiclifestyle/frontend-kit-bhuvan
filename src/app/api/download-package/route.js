import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import * as tarStream from "tar-stream";
import { PassThrough } from "stream";
import { NextResponse } from "next/server";

// The functions to be bundled
const functionsContent = (user_id) => `
const base = "https://bhuvan-kit-backend.onrender.com"

export const getRouting = async (lat1, lon1, lat2, lon2) => {
    try {
      const res = await fetch(
        \`\${base}/api/bhuvan/routing?lat1=\${lat1}&lon1=\${lon1}&lat2=\${lat2}&lon2=\${lon2}\`,
        {
          headers: {
            'x-user-id': '${user_id}'
          }
        }
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
      const res = await fetch(
        \`\${base}/api/bhuvan/thematic?lat=\${lat}&lon=\${lon}&year=\${year}\`,
        {
          headers: {
            'x-user-id': '${user_id}'
          }
        }
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
      const res = await fetch(
        \`\${base}/api/bhuvan/vg?village=\${category}\`,
        {
          headers: {
            'x-user-id': '${user_id}'
          }
        }
      );
      if (!res.ok) throw new Error('Failed to add POI');
      const json = await res.json();
      return json;
    } catch (err) {
      return { error: err.message };
    }
};

export const getEllipsoid = async (id) => {
    try {
      const res = await fetch(
        \`\${base}/api/bhuvan/ellipsoid?id=\${id}\`,
        {
          headers: {
            'x-user-id': '${user_id}'
          }
        }
      );
      if (!res.ok) throw new Error('Failed to download ellipsoid file');
      
      // Note: This function is designed for browser environments
      if (typeof window !== 'undefined' && typeof document !== 'undefined') {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = \`\${id}.zip\`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        return { success: true };
      } else {
        // For Node.js, return the raw response or handle differently
        return { warning: 'getEllipsoid is browser-only; use in a browser environment or fetch the blob directly', data: await res.text() };
      }
    } catch (err) {
      return { error: err.message };
    }
};

export const createUser = async () => {
    try {
      const res = await fetch(
        \`\${base}/api/bhuvan/create-user-db\`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': '${user_id}'
          }
        }
      );
      if (!res.ok) throw new Error('Failed');
      const json = await res.json();
      return json;
    } catch (err) {
      return { error: err.message };
    }
};

export const executeQuery = async (query) => {
    try {
      const res = await fetch(
        \`\${base}/api/bhuvan/execute-query\`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': '${user_id}'
          },
          body: {
              query: JSON.stringify({ query })
          }
        }
      );
      if (!res.ok) throw new Error('Failed');
      const json = await res.json();
      return json;
    } catch (err) {
      return { error: err.message };
    }
};

export const executeCentralQuery = async (query) => {
    try {
      const res = await fetch(
        \`\${base}/api/bhuvan/execute-central-query\`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': '${user_id}'
          },
          body: {
              query: JSON.stringify({ query })
          }
        }
      );
      if (!res.ok) throw new Error('Failed');
      const json = await res.json();
      return json;
    } catch (err) {
      return { error: err.message };
    }
};

`;

export async function GET(request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user_id = session.user_id; 
    const pack = tarStream.pack();
    const stream = new PassThrough();

    // Package.json content for the npm package
    const packageJsonContent = JSON.stringify(
      {
        name: "bhuvan-api",
        version: "1.0.0",
        description: "Bhuvan API client functions",
        main: "bhuvan-api.js",
        types: "bhuvan-api.d.ts",
        type: "module",
        keywords: ["bhuvan", "api", "client"],
        author: "Your Name",
        license: "MIT",
        dependencies: {},
      },
      null,
      2
    );
    const dtsContent = `
      export function getRouting(lat1: number, lon1: number, lat2: number, lon2: number): Promise<any>;
      export function getThematicData(lat: number, lon: number, year: number): Promise<any>;
      export function villageGeocoding(category: string): Promise<any>;
      export function getEllipsoid(id: string): Promise<any>;
      export function createUser(): Promise<any>;
      export function executeQuery(query: string): Promise<any>;
      export function executeCentralQuery(query: string): Promise<any>;
      `;

    // Write files to tar stream with user_id injected into functionsContent
    pack.entry({ name: "bhuvan-api/package.json" }, packageJsonContent);
    pack.entry({ name: "bhuvan-api/bhuvan-api.js" }, functionsContent(user_id));
    pack.entry({ name: "bhuvan-api/bhuvan-api.d.ts" }, dtsContent);

    pack.finalize();

    pack.pipe(stream);

    const headers = new Headers();
    headers.set("Content-Type", "application/gzip");
    headers.set("Content-Disposition", 'attachment; filename="bhuvan-api.tar"');

    return new NextResponse(stream, {
      status: 200,
      headers,
    });
  } catch (err) {
    console.error("Tarball generation error:", err);
    return NextResponse.json({ error: "Failed to create tarball" }, { status: 500 });
  }
}
