"use client";

import { useEffect, useState } from "react";

type Node = {
  id: string;
  name: string;
  kind: string;
  chapterNo: number | null;
  contentTypes: string[];
};
type Step = { options: Node[]; selectedId: string };

const KIND_LABELS: Record<string, string> = {
  COURSE: "Course",
  LEVEL: "Class / Exam",
  STAGE: "Stage",
  SUBJECT: "Subject",
  CHAPTER: "Chapter",
};

async function loadChildren(parentId: string | null): Promise<Node[]> {
  try {
    const res = await fetch("/api/course-nodes" + (parentId ? `?parentId=${parentId}` : ""));
    if (!res.ok) return [];
    const data = await res.json();
    return data.nodes ?? [];
  } catch {
    return [];
  }
}

export default function ChapterPicker({
  onChange,
  inputClass,
  labelClass,
}: {
  // Called with the chosen chapter id (or null) and the content types of the course
  onChange: (courseNodeId: string | null, contentTypes: string[]) => void;
  inputClass: string;
  labelClass: string;
}) {
  const [steps, setSteps] = useState<Step[]>([]);

  useEffect(() => {
    loadChildren(null).then((opts) => setSteps([{ options: opts, selectedId: "" }]));
  }, []);

  async function choose(index: number, id: string) {
    const kept = steps
      .slice(0, index + 1)
      .map((s, i) => (i === index ? { ...s, selectedId: id } : s));

    if (!id) {
      setSteps(kept);
      onChange(null, []);
      return;
    }

    const node = kept[index].options.find((o) => o.id === id);
    const root = kept[0].options.find((o) => o.id === kept[0].selectedId);
    if (!node) return;

    if (node.kind === "CHAPTER") {
      setSteps(kept);
      onChange(node.id, root?.contentTypes ?? []);
      return;
    }

    const children = await loadChildren(id);
    setSteps(children.length ? [...kept, { options: children, selectedId: "" }] : kept);
    onChange(null, []);
  }

  if (steps.length === 0) return null;

  return (
    <div className="rounded-xl border border-zinc-200 p-4 flex flex-col gap-4">
      <p className="text-sm font-semibold text-zinc-900">
        Where should this appear? <span className="font-normal text-zinc-500">(Class, Subject, Chapter)</span>
      </p>
      {steps.map((step, i) => {
        const kind = step.options[0]?.kind ?? "";
        return (
          <div key={i}>
            <label className={labelClass}>{KIND_LABELS[kind] ?? "Choose"}</label>
            <select
              value={step.selectedId}
              onChange={(e) => choose(i, e.target.value)}
              className={inputClass}
            >
              <option value="">Select</option>
              {step.options.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.kind === "CHAPTER" && o.chapterNo ? `${o.chapterNo}. ${o.name}` : o.name}
                </option>
              ))}
            </select>
          </div>
        );
      })}
    </div>
  );
}