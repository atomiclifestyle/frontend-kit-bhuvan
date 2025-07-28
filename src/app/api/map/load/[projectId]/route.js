import { NextResponse } from "next/server";
import Project from "@/models/Project";
import { executeQuery } from "@/utils/bhuvan-api-methods";
import { connectToDB } from "@/lib/dbConnect";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req, { params }) {
  try {
    const { projectId } = await params;

    if (!projectId) {
      return NextResponse.json(
        { message: "Project ID is required" },
        { status: 400 }
      );
    }
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { message: "Not authenticated" },
        { status: 401 }
      );
    }
    const userId = session.user_id;

    await connectToDB();
    const projectMeta = await Project.findOne({ projectId: projectId }).lean();

    if (!projectMeta) {
      return NextResponse.json(
        { message: "Project not found" },
        { status: 404 }
      );
    }

    const safeProjectId = projectId.replace(/'/g, "''");
    const query = `
      SELECT * FROM map_states
      WHERE project_id = '${safeProjectId}'
    `;
    const result = await executeQuery(query, userId);
    const mapState = result.data?.[0];

    if (!mapState) {
      return NextResponse.json(
        { message: "Map state not found" },
        { status: 404 }
      );
    }

    const fullProjectData = {
      projectId: projectMeta.projectId,
      name: projectMeta.name,
      createdAt: projectMeta.createdAt,
      mapState: {
        view: mapState.view_state,
        wmsLayers: mapState.wms_layers,
        pbfLayers: mapState.pbf_layers,
        geoJsonUrls: mapState.geojson_urls,
        annotations: mapState.annotations,
      },
    };

    return NextResponse.json(fullProjectData, { status: 200 });
  } catch (error) {
    console.error("❌ Failed to load map state:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
