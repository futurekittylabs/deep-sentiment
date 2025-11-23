import type { RequestHandler } from "@sveltejs/kit";
import { json } from "@sveltejs/kit";

interface Topic {
  id: number;
  title: string;
  description: string;
  creator_address: string;
  created_at: string;
}

// GET - Get a single topic by ID
export const GET: RequestHandler = async ({ platform, params }) => {
  if (!platform?.env?.DB) {
    return json({ error: "Database not available" }, { status: 500 });
  }

  try {
    const result = await platform.env.DB.prepare(
      "SELECT * FROM topics WHERE id = ?",
    )
      .bind(params.id)
      .first<Topic>();

    if (!result) {
      return json({ error: "Topic not found" }, { status: 404 });
    }

    return json({ topic: result });
  } catch (error) {
    console.error("Error fetching topic:", error);
    return json({ error: "Failed to fetch topic" }, { status: 500 });
  }
};

// PUT - Update a topic
export const PUT: RequestHandler = async ({ platform, params, request }) => {
  if (!platform?.env?.DB) {
    return json({ error: "Database not available" }, { status: 500 });
  }

  try {
    const body = await request.json();
    const { title, description, creator_address } = body;

    if (!creator_address) {
      return json({ error: "Creator address is required" }, { status: 400 });
    }

    if (!title || !description) {
      return json(
        { error: "Title and description are required" },
        { status: 400 },
      );
    }

    if (title.length > 50) {
      return json(
        { error: "Title must be 50 characters or less" },
        { status: 400 },
      );
    }

    if (description.length > 155) {
      return json(
        { error: "Description must be 155 characters or less" },
        { status: 400 },
      );
    }

    // First check if the topic exists and if the user is the creator
    const topic = await platform.env.DB.prepare(
      "SELECT * FROM topics WHERE id = ?",
    )
      .bind(params.id)
      .first<Topic>();

    if (!topic) {
      return json({ error: "Topic not found" }, { status: 404 });
    }

    if (topic.creator_address.toLowerCase() !== creator_address.toLowerCase()) {
      return json(
        { error: "Only the creator can edit this topic" },
        { status: 403 },
      );
    }

    // Update the topic
    const result = await platform.env.DB.prepare(
      "UPDATE topics SET title = ?, description = ? WHERE id = ? RETURNING *",
    )
      .bind(title, description, params.id)
      .first<Topic>();

    return json({ topic: result });
  } catch (error) {
    console.error("Error updating topic:", error);
    return json({ error: "Failed to update topic" }, { status: 500 });
  }
};

// DELETE - Delete a topic
export const DELETE: RequestHandler = async ({ platform, params, request }) => {
  if (!platform?.env?.DB) {
    return json({ error: "Database not available" }, { status: 500 });
  }

  try {
    const body = await request.json();
    const { creator_address } = body;

    if (!creator_address) {
      return json({ error: "Creator address is required" }, { status: 400 });
    }

    // First check if the topic exists and if the user is the creator
    const topic = await platform.env.DB.prepare(
      "SELECT * FROM topics WHERE id = ?",
    )
      .bind(params.id)
      .first<Topic>();

    if (!topic) {
      return json({ error: "Topic not found" }, { status: 404 });
    }

    if (topic.creator_address.toLowerCase() !== creator_address.toLowerCase()) {
      return json(
        { error: "Only the creator can delete this topic" },
        { status: 403 },
      );
    }

    // Delete the topic
    await platform.env.DB.prepare("DELETE FROM topics WHERE id = ?")
      .bind(params.id)
      .run();

    return json({ success: true });
  } catch (error) {
    console.error("Error deleting topic:", error);
    return json({ error: "Failed to delete topic" }, { status: 500 });
  }
};
