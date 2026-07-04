"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    fullName: "", phone: "", college: "", degree: "", graduationYr: "",
    skills: "", bio: "", linkedinUrl: "", githubUrl: "", portfolioUrl: "",
  });

  useEffect(() => {
    async function loadProfile() {
      const res = await fetch("/api/profile");
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      if (res.ok) {
        const data = await res.json();
        const p = data.profile;
        setForm({
          fullName: p.fullName || "",
          phone: p.phone || "",
          college: p.college || "",
          degree: p.degree || "",
          graduationYr: p.graduationYr ? String(p.graduationYr) : "",
          skills: (p.skills || []).join(", "),
          bio: p.bio || "",
          linkedinUrl: p.linkedinUrl || "",
          githubUrl: p.githubUrl || "",
          portfolioUrl: p.portfolioUrl || "",
        });
      }
      setLoading(false);
    }
    loadProfile();
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess(false);

    const res = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        graduationYr: form.graduationYr ? Number(form.graduationYr) : null,
        skills: form.skills.split(",").map((s) => s.trim()).filter(Boolean),
      }),
    });

    setSaving(false);
    if (res.ok) {
      setSuccess(true);
    } else {
      setError("Something went wrong saving your profile");
    }
  }

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-zinc-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto mt-12 p-8 border rounded-lg mb-12">
      <h1 className="text-2xl font-bold mb-6">Edit Profile</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Full name</label>
          <input type="text" className="border rounded px-3 py-2 w-full"
            value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Phone</label>
          <input type="text" className="border rounded px-3 py-2 w-full"
            value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">College</label>
          <input type="text" className="border rounded px-3 py-2 w-full"
            value={form.college} onChange={(e) => setForm({ ...form, college: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Degree</label>
          <input type="text" className="border rounded px-3 py-2 w-full"
            value={form.degree} onChange={(e) => setForm({ ...form, degree: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Graduation year</label>
          <input type="number" className="border rounded px-3 py-2 w-full"
            value={form.graduationYr} onChange={(e) => setForm({ ...form, graduationYr: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Skills (comma-separated)</label>
          <input type="text" className="border rounded px-3 py-2 w-full" placeholder="e.g. Python, React, SQL"
            value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Bio</label>
          <textarea className="border rounded px-3 py-2 w-full" rows={4}
            value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">LinkedIn URL</label>
          <input type="url" className="border rounded px-3 py-2 w-full"
            value={form.linkedinUrl} onChange={(e) => setForm({ ...form, linkedinUrl: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">GitHub URL</label>
          <input type="url" className="border rounded px-3 py-2 w-full"
            value={form.githubUrl} onChange={(e) => setForm({ ...form, githubUrl: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Portfolio URL</label>
          <input type="url" className="border rounded px-3 py-2 w-full"
            value={form.portfolioUrl} onChange={(e) => setForm({ ...form, portfolioUrl: e.target.value })} />
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}
        {success && <p className="text-green-600 text-sm">Profile saved!</p>}

        <button type="submit" disabled={saving}
          className="bg-blue-700 text-white rounded px-3 py-2 font-semibold mt-2">
          {saving ? "Saving..." : "Save profile"}
        </button>
      </form>
    </div>
  );
}
