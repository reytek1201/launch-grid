"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath, updateTag } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { SITE_TAG } from "@/lib/config";
import { isChapter } from "@/lib/gallery";
import { adminClient, adminConfigured } from "@/lib/supabase/server";

/* ───────── sign in / out ───────── */

export type LoginState = { message: string } | null;

/** Emails a sign-in link. Only people already registered as users of this project can receive one. */
export async function requestLink(_: LoginState, form: FormData): Promise<LoginState> {
  if (!adminConfigured()) return { message: "The admin area is not set up on this deployment." };
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { message: "Enter a valid email address." };

  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? (host?.startsWith("localhost") ? "http" : "https");
  const supabase = await adminClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: false, emailRedirectTo: `${proto}://${host}/auth/callback` },
  });
  if (error && error.status === 429) return { message: "Too many requests. Wait a minute and try again." };
  // The same answer whether or not the address is an admin, so this page reveals nothing.
  return { message: "If that address belongs to an admin, a sign-in link is on its way. Open it on this device." };
}

export async function signOut() {
  const supabase = await adminClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

/* ───────── helpers ───────── */

const str = (f: FormData, k: string) => String(f.get(k) ?? "").trim();
const orNull = (s: string) => (s === "" ? null : s);
/** "12.5" → 1250 cents; blank → null (market price / not sold that way). */
const cents = (s: string): number | null => {
  const t = s.replace(/[$,\s]/g, "");
  if (t === "") return null;
  const n = Number(t);
  return Number.isFinite(n) && n >= 0 && n < 100000 ? Math.round(n * 100) : null;
};
const int = (s: string): number | null => {
  const n = Number(s);
  return s !== "" && Number.isInteger(n) ? n : null;
};
const slug = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "item";
const newId = (name: string) => `${slug(name)}-${Math.random().toString(36).slice(2, 6)}`;
const HHMM = /^([01]\d|2[0-3]):[0-5]\d$/;
const TAGS = ["vegetarian", "vegan", "gluten-free", "spicy"];

/** Saved: the public pages refresh on their next visit. Failed: back to the page with the reason. */
const done = (path: string) => {
  updateTag(SITE_TAG);
  revalidatePath(path);
};
const fail = (path: string, message: string): never => redirect(`${path}?error=${encodeURIComponent(message)}`);
const check = (path: string, error: { message: string } | null) => {
  if (error) fail(path, error.message.includes("violates") ? "That change was not allowed. Check the values and try again." : "Could not save. Try again in a moment.");
};

type Tbl = "menu_items" | "menu_sections" | "wines" | "wine_sections" | "gallery_photos";
const TABLES: Tbl[] = ["menu_items", "menu_sections", "wines", "wine_sections", "gallery_photos"];
const PAGE: Record<Tbl, string> = { menu_items: "/admin/menu", menu_sections: "/admin/menu", wines: "/admin/cellar", wine_sections: "/admin/cellar", gallery_photos: "/admin/gallery" };
const PARENT: Record<Tbl, string | null> = { menu_items: "section_id", menu_sections: null, wines: "section_id", wine_sections: null, gallery_photos: "chapter" };
const okTable = (t: string): t is Tbl => (TABLES as string[]).includes(t);

/* ───────── inbox ───────── */

export async function setRequestStatus(id: string, status: "new" | "seen" | "done") {
  if (!["new", "seen", "done"].includes(status)) return;
  const { supabase } = await requireAdmin();
  await supabase.from("requests").update({ status }).eq("id", id);
  revalidatePath("/admin", "layout");
}

export async function deleteRequest(id: string) {
  const { supabase } = await requireAdmin();
  await supabase.from("requests").delete().eq("id", id);
  revalidatePath("/admin", "layout");
}

/* ───────── menu and cellar: switches, order, delete ───────── */

/** The 86 switch: sold out tonight, or back on. */
export async function setSoldOut(table: "menu_items" | "wines", id: string, value: boolean) {
  if (!okTable(table)) return;
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from(table).update({ sold_out: value }).eq("id", id);
  check(PAGE[table], error);
  done(PAGE[table]);
}

export async function setHidden(table: string, id: string, value: boolean) {
  if (!okTable(table)) return;
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from(table).update({ hidden: value }).eq("id", id);
  check(PAGE[table], error);
  done(PAGE[table]);
}

export async function setPick(id: string, value: boolean) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("wines").update({ pick: value }).eq("id", id);
  check("/admin/cellar", error);
  done("/admin/cellar");
}

export async function moveRow(table: string, id: string, dir: -1 | 1) {
  if (!okTable(table)) return;
  const { supabase } = await requireAdmin();
  const parent = PARENT[table];
  const { data: row } = await supabase.from(table).select("*").eq("id", id).single();
  if (!row) return;
  let q = supabase.from(table).select("id, sort").order("sort").order("id");
  if (parent) q = q.eq(parent, row[parent]);
  const { data: sibs } = await q;
  if (!sibs) return;
  const i = sibs.findIndex((s: { id: string }) => s.id === id);
  const j = i + dir;
  if (i < 0 || j < 0 || j >= sibs.length) return;
  [sibs[i], sibs[j]] = [sibs[j], sibs[i]];
  await Promise.all(sibs.map((s: { id: string; sort: number }, n: number) => (s.sort === n ? null : supabase.from(table).update({ sort: n }).eq("id", s.id))));
  done(PAGE[table]);
}

export async function deleteRow(table: string, id: string) {
  if (!okTable(table)) return;
  const { supabase } = await requireAdmin();
  // Photos of the dishes about to go (a section takes its dishes with it).
  let files: string[] = [];
  if (table === "menu_items" || table === "menu_sections") {
    const { data } = await supabase.from("menu_items").select("photo_path").eq(table === "menu_items" ? "id" : "section_id", id);
    files = (data ?? []).map((r: { photo_path: string | null }) => r.photo_path).filter((p): p is string => !!p);
  }
  if (table === "gallery_photos") {
    const { data } = await supabase.from("gallery_photos").select("path").eq("id", id);
    files = (data ?? []).map((r: { path: string }) => r.path).filter((p) => !p.startsWith("sample:"));
  }
  const { error } = await supabase.from(table).delete().eq("id", id);
  check(PAGE[table], error);
  if (files.length) await supabase.storage.from(BUCKET).remove(files);
  done(PAGE[table]);
}

async function nextSort(table: Tbl, parentCol: string | null, parentId: string | null) {
  const { supabase } = await requireAdmin();
  let q = supabase.from(table).select("sort").order("sort", { ascending: false }).limit(1);
  if (parentCol && parentId) q = q.eq(parentCol, parentId);
  const { data } = await q;
  return (data?.[0]?.sort ?? -1) + 1;
}

/* ───────── sections ───────── */

export async function saveSection(table: string, id: string, form: FormData) {
  if (table !== "menu_sections" && table !== "wine_sections") return;
  const { supabase } = await requireAdmin();
  const title = str(form, "title");
  if (!title) fail(PAGE[table], "A section needs a name.");
  const { error } = await supabase.from(table).update({ title, note: orNull(str(form, "note")) }).eq("id", id);
  check(PAGE[table], error);
  done(PAGE[table]);
}

export async function addSection(table: string, form: FormData) {
  if (table !== "menu_sections" && table !== "wine_sections") return;
  const { supabase } = await requireAdmin();
  const title = str(form, "title");
  if (!title) fail(PAGE[table], "A section needs a name.");
  const sort = await nextSort(table, null, null);
  const { error } = await supabase.from(table).insert({ id: newId(title), title, note: orNull(str(form, "note")), sort });
  check(PAGE[table], error);
  done(PAGE[table]);
}

/* ───────── dishes ───────── */

function dishFields(form: FormData) {
  return {
    name: str(form, "name"),
    description: orNull(str(form, "description")),
    price_cents: cents(str(form, "price")),
    tags: form.getAll("tags").map(String).filter((t) => TAGS.includes(t)),
    photo: orNull(str(form, "photo")),
  };
}

export async function saveItem(id: string, form: FormData) {
  const { supabase } = await requireAdmin();
  const f = dishFields(form);
  if (!f.name) fail("/admin/menu", "A dish needs a name.");
  const { error } = await supabase.from("menu_items").update(f).eq("id", id);
  check("/admin/menu", error);
  done("/admin/menu");
}

export async function addItem(sectionId: string, form: FormData) {
  const { supabase } = await requireAdmin();
  const f = dishFields(form);
  if (!f.name) fail("/admin/menu", "A dish needs a name.");
  const sort = await nextSort("menu_items", "section_id", sectionId);
  const { error } = await supabase.from("menu_items").insert({ id: newId(f.name), section_id: sectionId, sort, ...f });
  check("/admin/menu", error);
  done("/admin/menu");
}

/* ───────── specials banner ───────── */

export async function saveBanner(form: FormData) {
  const { supabase } = await requireAdmin();
  const text = str(form, "text").slice(0, 140);
  const on = form.get("on") === "on";
  const until = str(form, "until");
  if (on && !text) fail("/admin", "Write the banner message first, or switch it off.");
  if (until && !/^\d{4}-\d{2}-\d{2}$/.test(until)) fail("/admin", "That date was not understood.");
  const { error } = await supabase.from("settings").update({ banner_text: orNull(text), banner_on: on, banner_until: orNull(until) }).eq("id", 1);
  check("/admin", error);
  done("/admin");
}

/* ───────── order and booking links ───────── */

/** A web address the restaurant gave us: https only, so a typo cannot become a script or a plain-http page. */
function webLink(back: string, raw: string): string | null {
  if (!raw) return null;
  const withScheme = /^[a-z]+:/i.test(raw) ? raw : `https://${raw}`;
  let u: URL;
  try {
    u = new URL(withScheme);
  } catch {
    return fail(back, "That web address was not understood. Paste the full link, like https://order.example.com/menu");
  }
  if (u.protocol !== "https:" || !u.hostname.includes(".") || withScheme.length > 300) return fail(back, "Use a full https:// link of 300 characters or fewer.");
  return u.toString();
}

export async function saveLinks(form: FormData) {
  const { supabase } = await requireAdmin();
  const order = webLink("/admin", str(form, "order"));
  const reserve = webLink("/admin", str(form, "reserve"));
  const { error } = await supabase.from("settings").update({ order_url: order, reserve_url: reserve }).eq("id", 1);
  check("/admin", error);
  done("/admin");
}

/* ───────── dish photos ───────── */

const BUCKET = "trattoria-demo";
const PHOTO_TYPES: Record<string, string> = { "image/webp": "webp", "image/jpeg": "jpg", "image/png": "png" };
const MAX_PHOTO = 2 * 1024 * 1024;

/** Adds or replaces a dish's photo. The browser has already cropped it square and shrunk it. */
export async function setDishPhoto(id: string, form: FormData) {
  const { supabase } = await requireAdmin();
  const file = form.get("photo");
  if (!(file instanceof File) || file.size === 0) fail("/admin/menu", "Choose a photo first.");
  const f = file as File;
  const ext = PHOTO_TYPES[f.type];
  if (!ext) fail("/admin/menu", "Use a JPEG, PNG or WebP photo.");
  if (f.size > MAX_PHOTO) fail("/admin/menu", "That photo is too large. Try another one.");

  const { data: row } = await supabase.from("menu_items").select("photo_path").eq("id", id).single();
  if (!row) fail("/admin/menu", "That dish no longer exists.");
  const path = `dishes/${id}-${Date.now().toString(36)}.${ext}`;
  const up = await supabase.storage.from(BUCKET).upload(path, f, { contentType: f.type, cacheControl: "31536000", upsert: false });
  if (up.error) fail("/admin/menu", "Could not upload the photo. Try again in a moment.");

  const alt = str(form, "alt").slice(0, 300);
  const { error } = await supabase.from("menu_items").update({ photo_path: path, photo_alt: orNull(alt) }).eq("id", id);
  if (error) {
    await supabase.storage.from(BUCKET).remove([path]);
    check("/admin/menu", error);
  }
  // The new photo is saved; clear out the one it replaces.
  const old = row?.photo_path as string | null | undefined;
  if (old && old !== path) await supabase.storage.from(BUCKET).remove([old]);
  done("/admin/menu");
}

/** Changes only the description of a dish's uploaded photo. */
export async function saveDishAlt(id: string, form: FormData) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("menu_items").update({ photo_alt: orNull(str(form, "alt").slice(0, 300)) }).eq("id", id).not("photo_path", "is", null);
  check("/admin/menu", error);
  done("/admin/menu");
}

/** Takes the uploaded photo off a dish (a sample photo picked in the list, if any, shows again). */
export async function clearDishPhoto(id: string) {
  const { supabase } = await requireAdmin();
  const { data: row } = await supabase.from("menu_items").select("photo_path").eq("id", id).single();
  const { error } = await supabase.from("menu_items").update({ photo_path: null, photo_alt: null }).eq("id", id);
  check("/admin/menu", error);
  const old = row?.photo_path as string | null | undefined;
  if (old) await supabase.storage.from(BUCKET).remove([old]);
  done("/admin/menu");
}

/* ───────── gallery ───────── */

/** Adds a photo to the gallery. The browser has already shrunk it and measured it. */
export async function addGalleryPhoto(form: FormData) {
  const { supabase } = await requireAdmin();
  const back = "/admin/gallery";
  const file = form.get("photo");
  if (!(file instanceof File) || file.size === 0) fail(back, "Choose a photo first.");
  const f = file as File;
  const ext = PHOTO_TYPES[f.type];
  if (!ext) fail(back, "Use a JPEG, PNG or WebP photo.");
  if (f.size > MAX_PHOTO) fail(back, "That photo is too large. Try another one.");
  const caption = str(form, "caption").slice(0, 80);
  if (!caption) fail(back, "Write a short caption for the photo.");
  const width = int(str(form, "width"));
  const height = int(str(form, "height"));
  if (!width || !height || width > 4000 || height > 4000 || width < 1 || height < 1) fail(back, "That photo could not be read. Try another one.");

  const id = newId(caption);
  const path = `gallery/${id}.${ext}`;
  const up = await supabase.storage.from(BUCKET).upload(path, f, { contentType: f.type, cacheControl: "31536000", upsert: false });
  if (up.error) fail(back, "Could not upload the photo. Try again in a moment.");
  const sort = await nextSort("gallery_photos", null, null);
  const chapter = isChapter(str(form, "chapter")) ? str(form, "chapter") : "nuove";
  const { error } = await supabase.from("gallery_photos").insert({ id, path, chapter, caption, alt: orNull(str(form, "alt").slice(0, 300)), width, height, sort });
  if (error) {
    await supabase.storage.from(BUCKET).remove([path]);
    check(back, error);
  }
  done(back);
}

export async function saveGalleryPhoto(id: string, form: FormData) {
  const { supabase } = await requireAdmin();
  const caption = str(form, "caption").slice(0, 80);
  if (!caption) fail("/admin/gallery", "A photo needs a caption.");
  const chapter = str(form, "chapter");
  const { error } = await supabase.from("gallery_photos").update({ ...(isChapter(chapter) ? { chapter } : {}), caption, alt: orNull(str(form, "alt").slice(0, 300)) }).eq("id", id);
  check("/admin/gallery", error);
  done("/admin/gallery");
}

/* ───────── wines ───────── */

function wineFields(form: FormData) {
  return {
    name: str(form, "name"),
    producer: str(form, "producer"),
    region: str(form, "region"),
    grape: orNull(str(form, "grape")),
    vintage: int(str(form, "vintage")),
    glass_cents: cents(str(form, "glass")),
    bottle_cents: cents(str(form, "bottle")),
    notes: orNull(str(form, "notes")),
    organic: form.get("organic") === "on",
    pick: form.get("pick") === "on",
    pairs: form.getAll("pairs").map(String),
  };
}

export async function saveWine(id: string, form: FormData) {
  const { supabase } = await requireAdmin();
  const f = wineFields(form);
  if (!f.name || !f.producer || !f.region) fail("/admin/cellar", "A wine needs a name, a producer and a region.");
  const { error } = await supabase.from("wines").update(f).eq("id", id);
  check("/admin/cellar", error);
  done("/admin/cellar");
}

export async function addWine(sectionId: string, form: FormData) {
  const { supabase } = await requireAdmin();
  const f = wineFields(form);
  if (!f.name || !f.producer || !f.region) fail("/admin/cellar", "A wine needs a name, a producer and a region.");
  const sort = await nextSort("wines", "section_id", sectionId);
  const { error } = await supabase.from("wines").insert({ id: newId(f.name), section_id: sectionId, sort, ...f });
  check("/admin/cellar", error);
  done("/admin/cellar");
}

/* ───────── hours, closures, details ───────── */

/** Replaces one weekday's opening intervals with the (up to 4) open/close pairs in the form. */
export async function saveDay(day: number, form: FormData) {
  if (!Number.isInteger(day) || day < 0 || day > 6) return;
  const { supabase } = await requireAdmin();
  const rows: { day: number; open_at: string; close_at: string; sort: number }[] = [];
  for (let i = 0; i < 4; i++) {
    const open = str(form, `open_${i}`);
    const close = str(form, `close_${i}`);
    if (!open && !close) continue;
    if (!HHMM.test(open) || !HHMM.test(close) || open === close) fail("/admin/hours", "Each shift needs an opening and a closing time.");
    if (rows.some((r) => r.open_at === open)) continue;
    rows.push({ day, open_at: open, close_at: close, sort: rows.length });
  }
  const del = await supabase.from("hours_weekly").delete().eq("day", day);
  check("/admin/hours", del.error);
  if (rows.length) check("/admin/hours", (await supabase.from("hours_weekly").insert(rows)).error);
  done("/admin/hours");
}

export async function closeDay(day: number) {
  if (!Number.isInteger(day) || day < 0 || day > 6) return;
  const { supabase } = await requireAdmin();
  check("/admin/hours", (await supabase.from("hours_weekly").delete().eq("day", day)).error);
  done("/admin/hours");
}

export async function addClosure(form: FormData) {
  const { supabase } = await requireAdmin();
  const date = str(form, "date");
  const label = str(form, "label");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !label) fail("/admin/hours", "A closure needs a date and a name, like Christmas Day.");
  check("/admin/hours", (await supabase.from("closures").upsert({ date, label })).error);
  done("/admin/hours");
}

export async function removeClosure(date: string) {
  const { supabase } = await requireAdmin();
  check("/admin/hours", (await supabase.from("closures").delete().eq("date", date)).error);
  done("/admin/hours");
}

export async function saveDetails(form: FormData) {
  const { supabase } = await requireAdmin();
  const need = ["tagline", "blurb", "phone", "email", "street", "city", "state", "zip"] as const;
  const v = Object.fromEntries(need.map((k) => [k, str(form, k)]));
  if (need.some((k) => !v[k])) fail("/admin/hours", "Every detail needs a value.");
  const nums = {
    max_party: int(str(form, "max_party")),
    last_seating_mins: int(str(form, "last_seating_mins")),
    lead_hours: int(str(form, "lead_hours")),
    days_ahead: int(str(form, "days_ahead")),
  };
  const bad = Object.entries(nums).some(([k, n]) => n === null || n < (k === "lead_hours" ? 0 : 1) || n > 400);
  if (bad) fail("/admin/hours", "The booking rules must be whole numbers.");
  check("/admin/hours", (await supabase.from("settings").update({ ...v, ...nums }).eq("id", 1)).error);
  done("/admin/hours");
}
