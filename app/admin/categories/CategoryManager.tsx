"use client";

import { useState } from "react";

type Category = {
  id: string;
  name: string;
  description: string | null;
  _count: { opportunities: number };
};

export default function CategoryManager({
  categories: initial,
}: {
  categories: Category[];
}) {
  const [categories, setCategories] = useState(initial);
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!newName.trim()) {
      setError("Name is required");
      return;
    }

    setAdding(true);
    const res = await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim(), description: newDescription.trim() }),
    });
    setAdding(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Something went wrong");
      return;
    }

    const data = await res.json();
    setCategories((prev) =>
      [...prev, { ...data.category, _count: { opportunities: 0 } }].sort((a, b) =>
        a.name.localeCompare(b.name)
      )
    );
    setNewName("");
    setNewDescription("");
  }

  function startEdit(c: Category) {
    setEditingId(c.id);
    setEditName(c.name);
    setEditDescription(c.description || "");
  }

  async function saveEdit(id: string) {
    const res = await fetch(`/api/admin/categories/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editName.trim(), description: editDescription.trim() }),
    });

    if (res.ok) {
      const data = await res.json();
      setCategories((prev) =>
        prev
          .map((c) => (c.id === id ? { ...c, name: data.category.name, description: data.category.description } : c))
          .sort((a, b) => a.name.localeCompare(b.name))
      );
      setEditingId(null);
    }
  }

  async function handleDelete(id: string) {
    setDeleteError(null);
    const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });

    if (res.ok) {
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } else {
      const data = await res.json().catch(() => ({}));
      setDeleteError(data.error || "Couldn't delete this category");
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <form onSubmit={handleAdd} className="glass rounded-2xl p-5 flex flex-col gap-3">
        <h2 className="font-semibold text-sm text-zinc-900 dark:text-white">Add category</h2>
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="e.g. Class 11 - Physics"
          className="w-full rounded-xl bg-white/70 dark:bg-zinc-900/70 px-3 py-2 outline-none text-sm text-zinc-900 dark:text-white placeholder:text-zinc-500"
        />
        <input
          type="text"
          value={newDescription}
          onChange={(e) => setNewDescription(e.target.value)}
          placeholder="Description (optional)"
          className="w-full rounded-xl bg-white/70 dark:bg-zinc-900/70 px-3 py-2 outline-none text-sm text-zinc-900 dark:text-white placeholder:text-zinc-500"
        />
        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={adding}
          className="self-start rounded-xl px-4 py-2 bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50"
        >
          {adding ? "Adding..." : "Add category"}
        </button>
      </form>

      {deleteError && (
        <p className="text-sm text-red-600 dark:text-red-400 -mt-4">{deleteError}</p>
      )}

      <div className="glass rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/20 dark:border-white/10">
              <th className="text-left px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">Name</th>
              <th className="text-left px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">Description</th>
              <th className="text-left px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">Opportunities</th>
              <th className="text-left px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10 dark:divide-white/5">
            {categories.map((c) => (
              <tr key={c.id}>
                {editingId === c.id ? (
                  <>
                    <td className="px-4 py-2">
                      <input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full rounded-lg bg-white/70 dark:bg-zinc-900/70 px-2 py-1 outline-none text-zinc-900 dark:text-white"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        className="w-full rounded-lg bg-white/70 dark:bg-zinc-900/70 px-2 py-1 outline-none text-zinc-900 dark:text-white"
                      />
                    </td>
                    <td className="px-4 py-2 text-zinc-600 dark:text-zinc-400">{c._count.opportunities}</td>
                    <td className="px-4 py-2">
                      <div className="flex gap-2">
                        <button
                          onClick={() => saveEdit(c.id)}
                          className="text-xs px-2 py-1 rounded-lg bg-purple-600 text-white"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="text-xs px-2 py-1 rounded-lg glass text-zinc-900 dark:text-white"
                        >
                          Cancel
                        </button>
                      </div>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-4 py-3 font-medium text-zinc-900 dark:text-white">{c.name}</td>
                    <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{c.description || "—"}</td>
                    <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{c._count.opportunities}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => startEdit(c)}
                          className="text-xs px-2 py-1 rounded-lg glass text-zinc-900 dark:text-white"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(c.id)}
                          className="text-xs px-2 py-1 rounded-lg glass text-red-600 dark:text-red-400"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}