import { NextResponse } from "next/server";
import Project from "@/models/Project";
import { executeQuery } from "@/utils/bhuvan-api-methods";
import { connectToDB } from '@/lib/dbConnect';

export async function GET(req, { params }) {
  try {
    const { projectId } = params;

    if (!projectId) {
      return NextResponse.json({ message: "Project ID is required" }, { status: 400 });
    }

    await connectToDB();
    const projectMeta = await Project.findOne({ projectId: projectId }).lean();

    if (!projectMeta) {
      return NextResponse.json({ message: "Project not found" }, { status: 404 });
    }

    // 3️⃣ Fetch map state from PostgreSQL
    const safeProjectId = projectId.replace(/'/g, "''"); // prevent SQL injection
    const query = `
      SELECT * FROM map_states
      WHERE project_id = '${safeProjectId}'
    `;
    const result = await executeQuery(query);
    const mapState = result.rows?.[0];

    if (!mapState) {
      return NextResponse.json({ message: "Map state not found" }, { status: 404 });
    }

    const fullProjectData = {
      projectId: projectMeta.projectId,
      name: projectMeta.name,
      createdAt: projectMeta.createdAt,
      mapState: {
        view: mapState.view_state,
        wmsLayers: mapState.wms_layers,
        geoJsonUrls: mapState.geojson_urls,
        annotations: mapState.annotations,
      },
    };

    return NextResponse.json(fullProjectData, { status: 200 });

  } catch (error) {
    console.error("❌ Failed to load map state:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
