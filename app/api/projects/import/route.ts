import { getDb } from "../../../../db";
import { projects } from "../../../../db/schema";
import { getChatGPTUser } from "../../../chatgpt-auth";
import { seedProjects } from "../../../../lib/seed";

export async function POST() {
  if (!(await getChatGPTUser())) return Response.json({ error: "กรุณาเข้าสู่ระบบก่อนจัดการผลงาน" }, { status: 401 });
  try {
    const db = getDb();
    const existing = await db.select({ id: projects.id }).from(projects);
    const known = new Set(existing.map((row) => row.id));
    const now = new Date().toISOString();
    const initial = seedProjects.filter((item) => !known.has(item.id)).map((item) => ({ ...item, createdAt: now, updatedAt: now }));
    if (initial.length) await db.insert(projects).values(initial);
    return Response.json({ imported: initial.length });
  } catch (error) {
    console.error("Could not import initial portfolio projects", error);
    return Response.json({ error: "นำเข้ารายการตั้งต้นไม่สำเร็จ กรุณาลองอีกครั้ง" }, { status: 500 });
  }
}
