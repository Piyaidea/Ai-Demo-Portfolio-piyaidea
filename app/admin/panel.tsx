"use client";

import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import Link from "next/link";
import { parseList, type Project } from "../../lib/projects";

const categories = ["Corporate", "E-commerce", "Product Catalog", "Restaurant", "Spa & Wellness", "Technology", "Other"];
const blank = { title: "", slug: "", category: "Corporate", year: String(new Date().getFullYear()), location: "Thailand", summary: "", description: "", services: "", featured: false };

async function isFourChannelJpeg(file: File) {
  if (file.type !== "image/jpeg") return false;
  const bytes = new Uint8Array(await file.slice(0, 256 * 1024).arrayBuffer());
  if (bytes[0] !== 0xff || bytes[1] !== 0xd8) return false;
  let offset = 2;
  while (offset + 4 < bytes.length) {
    if (bytes[offset] !== 0xff) { offset++; continue; }
    while (bytes[offset] === 0xff) offset++;
    const marker = bytes[offset++];
    if (marker === 0xd9 || marker === 0xda) return false;
    if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) continue;
    const length = (bytes[offset] << 8) | bytes[offset + 1];
    if (length < 2 || offset + length > bytes.length) return false;
    const isStartOfFrame = [0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf].includes(marker);
    if (isStartOfFrame) return bytes[offset + 7] === 4;
    offset += length;
  }
  return false;
}

async function normalizeUploadToSrgb(file: File): Promise<File> {
  // Keep already screen-friendly image formats byte-for-byte to preserve detail.
  if (!(await isFourChannelJpeg(file))) return file;
  const bitmap = await createImageBitmap(file, { colorSpaceConversion: "default" });
  const canvas = document.createElement("canvas");
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  try {
    const context = canvas.getContext("2d", { colorSpace: "srgb" });
    if (!context) throw new Error("ไม่สามารถเตรียมพื้นที่แปลงสีภาพได้");
    context.drawImage(bitmap, 0, 0);
    const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob((result) => result ? resolve(result) : reject(new Error("แปลงภาพไม่สำเร็จ")), "image/webp", 1));
    const extension = blob.type.split("/")[1]?.replace("jpeg", "jpg") || "webp";
    const baseName = file.name.replace(/\.[^.]+$/, "");
    return new File([blob], `${baseName}.${extension}`, { type: blob.type || "image/webp", lastModified: file.lastModified });
  } finally {
    bitmap.close();
    canvas.width = 0;
    canvas.height = 0;
  }
}

export default function AdminPanel() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [current, setCurrent] = useState<Project | null>(null);
  const [fields, setFields] = useState(blank);
  const [removed, setRemoved] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [converting, setConverting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [notice, setNotice] = useState("");

  async function load() {
    const response = await fetch("/api/projects", { cache: "no-store" });
    const data = await response.json() as { projects?: Project[]; unavailable?: boolean };
    setProjects(data.projects || []);
    if (data.unavailable) setNotice("ฐานข้อมูลกำลังเตรียมใช้งาน สามารถเริ่มเพิ่มผลงานได้หลังจากตั้งค่าเว็บเสร็จ");
  }
  useEffect(() => {
    let active = true;
    fetch("/api/projects", { cache: "no-store" }).then((response) => response.json() as Promise<{ projects?: Project[]; unavailable?: boolean }>).then((data) => {
      if (!active) return;
      setProjects(data.projects || []);
      if (data.unavailable) setNotice("ฐานข้อมูลกำลังเตรียมใช้งาน สามารถเริ่มเพิ่มผลงานได้หลังจากตั้งค่าเว็บเสร็จ");
    }).catch(() => { if (active) setNotice("โหลดรายการผลงานไม่สำเร็จ กรุณาลองใหม่"); });
    return () => { active = false; };
  }, []);

  function newProject() { setCurrent(null); setFields(blank); setRemoved([]); setFiles([]); setNotice(""); }
  function editProject(project: Project) {
    setCurrent(project); setRemoved([]); setFiles([]);
    setFields({ title: project.title, slug: project.slug, category: project.category, year: project.year, location: project.location, summary: project.summary, description: project.description, services: parseList(project.services).join(", "), featured: project.featured });
    setNotice("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function set<K extends keyof typeof blank>(key: K, value: (typeof blank)[K]) { setFields((prev) => ({ ...prev, [key]: value })); }

  async function handleGallerySelect(event: ChangeEvent<HTMLInputElement>) {
    const selectedFiles = Array.from(event.currentTarget.files || []);
    if (!selectedFiles.length) return;
    setConverting(true); setNotice("");
    try {
      const normalized: File[] = [];
      for (const file of selectedFiles) normalized.push(await normalizeUploadToSrgb(file));
      setFiles(normalized);
      setNotice(`เตรียมภาพ ${normalized.length} ภาพแล้ว · คงไฟล์เดิมไว้ และแปลงเฉพาะภาพ JPEG แบบ CMYK เป็น sRGB`);
    } catch {
      setFiles([]);
      setNotice("เตรียมสีภาพไม่สำเร็จ กรุณาลองไฟล์ใหม่ หรือ export ภาพเป็น sRGB ก่อนอัปโหลด");
    } finally { setConverting(false); }
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setNotice("");
    const form = new FormData();
    for (const [key, value] of Object.entries(fields)) if (key !== "featured") form.set(key, String(value));
    if (fields.featured) form.set("featured", "on");
    files.forEach((file) => form.append("gallery", file));
    removed.forEach((path) => form.append("removeGallery", path));
    try {
      const response = await fetch(current ? `/api/projects/${current.id}` : "/api/projects", { method: current ? "PUT" : "POST", body: form });
      const data = await response.json() as { project?: Project; error?: string };
      if (!response.ok) throw new Error(data.error || "บันทึกไม่สำเร็จ");
      setNotice(current ? "บันทึกการแก้ไขแล้ว" : "เพิ่มผลงานแล้ว");
      await load();
      setCurrent(null); setFields(blank); setRemoved([]); setFiles([]);
      (document.querySelector("#project-form") as HTMLFormElement | null)?.reset();
    } catch (error) { setNotice(error instanceof Error ? error.message : "เกิดข้อผิดพลาด"); }
    finally { setBusy(false); }
  }

  async function deleteProject(project: Project) {
    if (!window.confirm(`ลบผลงาน “${project.title}” ใช่ไหม?`)) return;
    const response = await fetch(`/api/projects/${project.id}`, { method: "DELETE" });
    if (response.ok) { setNotice("ลบผลงานแล้ว"); if (current?.id === project.id) newProject(); await load(); }
    else setNotice("ลบไม่สำเร็จ กรุณาลองอีกครั้ง");
  }

  async function importInitialProjects() {
    setImporting(true); setNotice("");
    try {
      const response = await fetch("/api/projects/import", { method: "POST" });
      const data = await response.json() as { imported?: number; error?: string };
      if (!response.ok) throw new Error(data.error || "นำเข้าไม่สำเร็จ");
      setNotice(data.imported ? `เพิ่มรายการตั้งต้น ${data.imported} รายการแล้ว คุณแก้ชื่อ รายละเอียด และเปลี่ยนภาพเป็น Gallery ของจริงได้` : "รายการตั้งต้นถูกนำเข้าไว้แล้ว");
      await load();
    } catch (error) { setNotice(error instanceof Error ? error.message : "เกิดข้อผิดพลาด"); }
    finally { setImporting(false); }
  }

  const existingGallery = current ? parseList(current.gallery).filter((path) => !removed.includes(path)) : [];
  return <main className="admin-shell"><header className="admin-header"><Link className="brand" href="/">PIYA<span>IDEA</span><i>®</i></Link><div><span>Portfolio manager</span><Link href="/">← กลับไปหน้าเว็บไซต์</Link></div></header>
    <div className="admin-wrap"><div className="admin-intro"><span className="eyebrow">PIYAIDEA / CONTENT STUDIO</span><h1>จัดการผลงาน</h1><p>เพิ่มภาพแกลเลอรีและกรอกรายละเอียด ผลงานจะขึ้นบนหน้า Portfolio ทันทีหลังบันทึก</p></div>
      <div className="admin-columns"><section className="editor-card"><div className="editor-title"><div><span className="eyebrow">{current ? "EDIT PROJECT" : "NEW PROJECT"}</span><h2>{current ? "แก้ไขผลงาน" : "เพิ่มผลงานใหม่"}</h2></div>{current && <button type="button" className="text-button" onClick={newProject}>+ สร้างรายการใหม่</button>}</div>
        {notice && <div className="notice" role="status">{notice}</div>}
        <form id="project-form" onSubmit={save} className="project-form">
          <label>ชื่อผลงาน *<input required value={fields.title} onChange={(e) => set("title", e.target.value)} placeholder="เช่น Savoir Design Studio" /></label>
          <div className="form-row"><label>หมวดหมู่ *<select required value={fields.category} onChange={(e) => set("category", e.target.value)}>{categories.map((category) => <option key={category}>{category}</option>)}</select></label><label>ปี<input value={fields.year} onChange={(e) => set("year", e.target.value)} /></label></div>
          <div className="form-row"><label>Slug / URL<input value={fields.slug} onChange={(e) => set("slug", e.target.value)} placeholder="เว้นว่างเพื่อสร้างอัตโนมัติ" /></label><label>สถานที่<input value={fields.location} onChange={(e) => set("location", e.target.value)} placeholder="Bangkok, Thailand" /></label></div>
          <label>คำโปรย<input value={fields.summary} onChange={(e) => set("summary", e.target.value)} placeholder="อธิบายผลงานสั้นๆ ในหนึ่งประโยค" /></label>
          <label>รายละเอียด<textarea rows={5} value={fields.description} onChange={(e) => set("description", e.target.value)} placeholder="เล่าถึงโจทย์ แนวคิด และสิ่งที่ทำในโปรเจกต์นี้" /></label>
          <label>บริการ / ทักษะที่ใช้<input value={fields.services} onChange={(e) => set("services", e.target.value)} placeholder="Web Design, WordPress, Branding" /><small>คั่นแต่ละรายการด้วยเครื่องหมายจุลภาค ,</small></label>
          <div className="upload-area"><label className="upload-label" htmlFor="gallery-upload"><span className="upload-icon">＋</span><strong>{converting ? "กำลังเตรียมภาพ…" : "เพิ่มภาพ Gallery"}</strong><span>คงคุณภาพไฟล์เดิม และแปลงเฉพาะ JPEG แบบ CMYK เป็น sRGB · สูงสุด 12 ภาพ · ภาพละไม่เกิน 8 MB · ภาพแรกเป็นภาพปก</span></label><input id="gallery-upload" type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple disabled={converting} onChange={(e) => void handleGallerySelect(e)} />{files.length > 0 && <div className="file-list">{files.map((file) => <span key={`${file.name}-${file.size}`}>{file.name}</span>)}</div>}</div>
          {existingGallery.length > 0 && <div className="gallery-edit"><span className="field-label">ภาพเดิม <small>ภาพแรกจะแสดงเป็นปก</small></span><div>{existingGallery.map((src, index) => <label key={src} className="gallery-thumb"><img src={src} alt={`Gallery ${index + 1}`} /><input type="checkbox" checked={removed.includes(src)} onChange={(e) => setRemoved((prev) => e.target.checked ? [...prev, src] : prev.filter((x) => x !== src))} /><span>ลบภาพ</span></label>)}</div></div>}
          <label className="checkbox-row"><input type="checkbox" checked={fields.featured} onChange={(e) => set("featured", e.target.checked)} /><span>แสดงเป็นผลงานเด่น</span></label>
          <button className="save-button" type="submit" disabled={busy || converting}>{busy ? "กำลังบันทึก…" : current ? "บันทึกการแก้ไข ↗" : "เพิ่มผลงาน ↗"}</button>
        </form>
      </section>
      <aside className="project-list-card"><div className="list-heading"><div><span className="eyebrow">SAVED PROJECTS</span><h2>ผลงานทั้งหมด <span>{projects.length}</span></h2></div><button onClick={newProject} aria-label="Add project">＋</button></div>
        {projects.length ? <div className="admin-project-list">{projects.map((project) => {const image = parseList(project.gallery)[0]; return <article className={current?.id === project.id ? "admin-project selected" : "admin-project"} key={project.id}><div className="admin-project-image">{image && <img src={image} alt="" />}</div><div className="admin-project-info"><h3>{project.title}</h3><span>{project.category} · {project.year}</span><div><button onClick={() => editProject(project)}>แก้ไข</button><button onClick={() => void deleteProject(project)}>ลบ</button></div></div></article>})}</div> : <div className="admin-empty"><span>✳</span><strong>ยังไม่มีผลงานที่บันทึก</strong><p>เริ่มเพิ่มผลงานใหม่ หรือ</p><button className="text-button import-button" disabled={importing} onClick={() => void importInitialProjects()}>{importing ? "กำลังนำเข้า…" : "นำเข้ารายการตั้งต้นจากหน้าเว็บ"}</button><small>คำอธิบายและภาพเป็นตัวอย่าง กรุณาเปลี่ยนเป็น Gallery ของผลงานจริง</small></div>}
      </aside></div>
      <p className="admin-footnote">ไฟล์ภาพและรายละเอียดจะถูกบันทึกไว้บนเว็บไซต์ เพื่อแสดงให้ผู้เข้าชมทุกคน</p>
    </div></main>;
}
