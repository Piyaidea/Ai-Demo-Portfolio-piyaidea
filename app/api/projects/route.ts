import { desc } from "drizzle-orm";
import { getDb } from "../../../db";
import { projects } from "../../../db/schema";
import { getChatGPTUser } from "../../chatgpt-auth";
import { slugify } from "../../../lib/projects";
import { env } from "cloudflare:workers";

export async function GET() {
  try {
    const rows = await getDb().select().from(projects).orderBy(desc(projects.featured), desc(projects.year), desc(projects.createdAt));
    return Response.json({ projects: rows });
  } catch {
    return Response.json({ projects: [], unavailable: true }, { status: 200 });
  }
}

export async function POST(request: Request) {
  if (!(await getChatGPTUser())) return Response.json({ error: "กรุณาเข้าสู่ระบบก่อนจัดการผลงาน" }, { status: 401 });
  const form = await request.formData();
  const title = String(form.get("title") || "").trim();
  const category = String(form.get("category") || "").trim();
  if (!title || !category) return Response.json({ error: "กรุณากรอกชื่อผลงานและหมวดหมู่" }, { status: 400 });
  if (!env.BUCKET) return Response.json({ error: "พื้นที่เก็บภาพยังไม่พร้อม" }, { status: 503 });

  const id = crypto.randomUUID();
  const images = form.getAll("gallery").filter((file): file is File => file instanceof File && file.size > 0);
  const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);
  if (images.length > 12 || images.some((file) => file.size > 8 * 1024 * 1024 || !allowedTypes.has(file.type))) {
    return Response.json({ error: "อัปโหลดได้สูงสุด 12 ภาพ ภาพละไม่เกิน 8 MB" }, { status: 400 });
  }
  const paths: string[] = [];
  try {
    for (const image of images) {
      const ext = image.type.split("/")[1]?.replace(/[^a-z0-9]/gi, "") || "jpg";
      const key = `gallery/${id}/${crypto.randomUUID()}.${ext}`;
      await env.BUCKET.put(key, await image.arrayBuffer(), { httpMetadata: { contentType: image.type } });
      paths.push(`/api/media/${key}`);
    }
    const now = new Date().toISOString();
    const data = {
      id, title, slug: slugify(String(form.get("slug") || title)), category,
      year: String(form.get("year") || new Date().getFullYear()),
      location: String(form.get("location") || "").trim(),
      summary: String(form.get("summary") || "").trim(),
      description: String(form.get("description") || "").trim(),
      services: JSON.stringify(String(form.get("services") || "").split(",").map((x) => x.trim()).filter(Boolean)),
      gallery: JSON.stringify(paths), featured: form.get("featured") === "on", createdAt: now, updatedAt: now,
    };
    const [saved] = await getDb().insert(projects).values(data).returning();
    return Response.json({ project: saved }, { status: 201 });
  } catch (error) {
    await Promise.all(paths.map((path) => env.BUCKET!.delete(path.replace("/api/media/", ""))));
    console.error("Could not save portfolio project", error);
    return Response.json({ error: "บันทึกไม่สำเร็จ กรุณาลองอีกครั้ง" }, { status: 500 });
  }
}
