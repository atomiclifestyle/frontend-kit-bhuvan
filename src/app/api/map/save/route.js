import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { v4 as uuidv4 } from "uuid";
import { executeQuery } from "@/utils/bhuvan-api-methods";
import { NextResponse } from "next/server";
import { connectToDB } from '@/lib/dbConnect';
import Project from "@/models/Project";

export async function POST(req) {
  let projectId;

  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }
    const userId = session.user_id;

    const { projectName, mapState } = await req.json();
    if (!projectName || !mapState) {
      return NextResponse.json(
        { message: "Missing project name or map state" },
        { status: 400 }
      );
    }

    projectId = uuidv4();

    await connectToDB();

    await Project.create({
      projectId,
      name: projectName,
      userId: userId
    });

    const { view, wmsLayers, geoJsonUrls, annotations } = mapState;

    const viewJSON = JSON.stringify(view).replace(/'/g, "''");
    const wmsJSON = JSON.stringify(wmsLayers).replace(/'/g, "''");
    const geoJSON = JSON.stringify(geoJsonUrls).replace(/'/g, "''");
    const annJSON = JSON.stringify(annotations).replace(/'/g, "''");

    const query = `
      CREATE TABLE IF NOT EXISTS map_states (
        project_id VARCHAR(255) PRIMARY KEY,
        view_state JSONB NOT NULL,
        wms_layers JSONB,
        geojson_urls JSONB,
        annotations JSONB
      );

      INSERT INTO map_states (project_id, view_state, wms_layers, geojson_urls, annotations)
      VALUES ('${projectId}', '${viewJSON}', '${wmsJSON}', '${geoJSON}', '${annJSON}');
    `;

    await executeQuery(query);

    return NextResponse.json(
      { message: "Map saved successfully!", projectId },
      { status: 201 }
    );

  } catch (error) {
    console.error("❌ Failed to save map state:", error);

    if (projectId) {
      try {
        await Project.findByIdAndDelete(projectId);
        console.log(`🗑 Rolled back MongoDB entry for projectId: ${projectId}`);
      } catch (rollbackError) {
        console.error("⚠️ Rollback failed:", rollbackError);
      }
    }

    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
