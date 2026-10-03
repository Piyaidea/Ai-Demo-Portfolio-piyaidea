import { eq } from "drizzle-orm";
import { env } from "cloudflare:workers";
import { getDb } from "../../../../db";
import { projects } from "../../../../db/schema";
import { getChatGPTUser } from "../../../chatgpt-auth";
import { parseList, slugify } from "../../../../lib/projects";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await getChatGPTUser())) return Response.json({ error: "กรุณาเข้าสู่ระบบก่อนจัดการผลงาน" }, { status: 401 });
  const { id } = await params;
  const form = await request.formData();
  const [existing] = await getDb().select().from(projects).where(eq(projects.id, id)).limit(1);
  if (!existing) return Response.json({ error: "ไม่พบผลงาน" }, { status: 404 });
  if (!env.BUCKET) return Response.json({ error: "พื้นที่เก็บภาพยังไม่พร้อม" }, { status: 503 });
  const title = String(form.get("title") || "").trim();
  const category = String(form.get("category") || "").trim();
  if (!title || !category) return Response.json({ error: "กรุณากรอกชื่อผลงานและหมวดหมู่" }, { status: 400 });
  const oldGallery = parseList(existing.gallery);
  const remove = new Set(form.getAll("removeGallery").map(String));
  const images = form.getAll("gallery").filter((file): file is File => file instanceof File && file.size > 0);
  const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);
  if (images.length + oldGallery.filter((path) => !remove.has(path)).length > 12 || images.some((file) => file.size > 8 * 1024 * 1024 || !allowedTypes.has(file.type))) {
    return Response.json({ error: "แกลเลอรีรวมได้สูงสุด 12 ภาพ ภาพละไม่เกิน 8 MB" }, { status: 400 });
  }
  const added: string[] = [];
  try {
    for (const image of images) {
      const ext = image.type.split("/")[1]?.replace(/[^a-z0-9]/gi, "") || "jpg";
      const key = `gallery/${id}/${crypto.randomUUID()}.${ext}`;
      await env.BUCKET!.put(key, await image.arrayBuffer(), { httpMetadata: { contentType: image.type } });
      added.push(`/api/media/${key}`);
    }
    const now = new Date().toISOString();
    const [saved] = await getDb().update(projects).set({
      title, slug: slugify(String(form.get("slug") || title)), category,
      year: String(form.get("year") || existing.year), location: String(form.get("location") || "").trim(),
      summary: String(form.get("summary") || "").trim(), description: String(form.get("description") || "").trim(),
      services: JSON.stringify(String(form.get("services") || "").split(",").map((x) => x.trim()).filter(Boolean)),
      gallery: JSON.stringify([...oldGallery.filter((path) => !remove.has(path)), ...added]),
      featured: form.get("featured") === "on", updatedAt: now,
    }).where(eq(projects.id, id)).returning();
    await Promise.all([...remove].filter((path) => path.startsWith("/api/media/")).map((path) => env.BUCKET!.delete(path.replace("/api/media/", ""))));
    return Response.json({ project: saved });
  } catch (error) {
    await Promise.all(added.map((path) => env.BUCKET!.delete(path.replace("/api/media/", ""))));
    console.error("Could not update portfolio project", error);
    return Response.json({ error: "บันทึกไม่สำเร็จ กรุณาลองอีกครั้ง" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await getChatGPTUser())) return Response.json({ error: "กรุณาเข้าสู่ระบบก่อนจัดการผลงาน" }, { status: 401 });
  const { id } = await params;
  const [existing] = await getDb().select().from(projects).where(eq(projects.id, id)).limit(1);
  if (existing) {
    await Promise.all(parseList(existing.gallery).filter((path) => path.startsWith("/api/media/")).map((path) => env.BUCKET?.delete(path.replace("/api/media/", ""))));
    await getDb().delete(projects).where(eq(projects.id, id));
  }
  return Response.json({ ok: true });
}
