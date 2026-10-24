import type { MenuItem } from "@/lib/types";

const label = { vegetarian: ["V", "vegetarian"], vegan: ["VG", "vegan"], "gluten-free": ["GF", "gluten-free"], spicy: ["Spicy", "spicy"] } as const;

export function DietTags({ tags }: { tags?: MenuItem["tags"] }) {
  if (!tags?.length) return null;
  return (
    <span className="ml-2 inline-flex gap-1 align-middle">
      {tags.map((t) => (
        <span key={t} title={label[t][1]} className="rounded border border-olive/50 px-1 text-[0.65rem] font-semibold uppercase tracking-wide text-olive">
          <span aria-hidden>{label[t][0]}</span>
          <span className="sr-only">{label[t][1]}</span>
        </span>
      ))}
    </span>
  );
}
