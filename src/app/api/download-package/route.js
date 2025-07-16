import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import * as tarStream from "tar-stream";
import { PassThrough } from "stream";
import { NextResponse } from "next/server";

// The functions to be bundled
const functionsContent = `
const base = "https://bhuvan-kit-backend.onrender.com"

export const getRouting = async (lat1, lon1, lat2, lon2) => {
    try {
      const res = await fetch(
        \`\${base}/api/bhuvan/routing?lat1=\${lat1}&lon1=\${lon1}&lat2=\${lat2}&lon2=\${lon2}\`
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
        \`\${base}/api/bhuvan/thematic?lat=\${lat}&lon=\${lon}&year=\${year}\`
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
      const res = await fetch(\`\${base}/api/bhuvan/vg?village=\${category}\`);
      if (!res.ok) throw new Error('Failed to add POI');
      const json = await res.json();
      return json;
    } catch (err) {
      return { error: err.message };
    }
};

export const getEllipsoid = async (id) => {
    try {
      const res = await fetch(\`\${base}/api/bhuvan/ellipsoid?id=\${id}\`);
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
`;

// Package.json content for the npm package
const packageJsonContent = JSON.stringify(
  {
    name: "bhuvan-api",
    version: "1.0.0",
    description: "Bhuvan API client functions",
    main: "bhuvan-api.js",
    type: "module",
    keywords: ["bhuvan", "api", "client"],
    author: "Your Name",
    license: "MIT",
    dependencies: {},
  },
  null,
  2
);

export async function GET(request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const pack = tarStream.pack(); // This is the tar stream
    const stream = new PassThrough();

    // Write files to tar stream
    pack.entry({ name: "bhuvan-api/package.json" }, packageJsonContent);
    pack.entry({ name: "bhuvan-api/bhuvan-api.js" }, functionsContent);
    pack.finalize();

    // Pipe tar to PassThrough for Next.js response
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