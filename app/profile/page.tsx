"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const inputClass =
  "bg-white/70 dark:bg-zinc-900/70 rounded-xl px-3 py-2 w-full outline-none text-zinc-900 dark:text-white placeholder:text-zinc-500";
const labelClass = "block text-sm font-medium mb-1 text-zinc-900 dark:text-white";

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [uploadingResume, setUploadingResume] = useState(false);
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

  async function handleResumeUpload() {
    if (!resumeFile) return;
    setUploadingResume(true);
    setError("");

    const fd = new FormData();
    fd.append("file", resumeFile);

    const res = await fetch("/api/upload-resume", {
      method: "POST",
      body: fd,
    });

    setUploadingResume(false);
    if (res.ok) {
      setSuccess(true);
      setResumeFile(null);
    } else {
      const data = await res.json();
      setError(data.error || "Resume upload failed");
    }
  }

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
        <p className="text-zinc-600 dark:text-zinc-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto mt-12 px-6 mb-12">
      <div className="glass rounded-2xl p-8">
        <h1 className="text-2xl font-bold mb-6 text-zinc-900 dark:text-white">Edit Profile</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className={labelClass}>Full name</label>
            <input type="text" className={inputClass}
              value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
          </div>
          <div>
            <label className={labelClass}>Phone</label>
            <input type="text" className={inputClass}
              value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div>
            <label className={labelClass}>College</label>
            <input type="text" className={inputClass}
              value={form.college} onChange={(e) => setForm({ ...form, college: e.target.value })} />
          </div>
          <div>
            <label className={labelClass}>Degree</label>
            <input type="text" className={inputClass}
              value={form.degree} onChange={(e) => setForm({ ...form, degree: e.target.value })} />
          </div>
          <div>
            <label className={labelClass}>Graduation year</label>
            <input type="number" className={inputClass}
              value={form.graduationYr} onChange={(e) => setForm({ ...form, graduationYr: e.target.value })} />
          </div>
          <div>
            <label className={labelClass}>Skills (comma-separated)</label>
            <input type="text" className={inputClass} placeholder="e.g. Python, React, SQL"
              value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} />
          </div>
          <div>
            <label className={labelClass}>Bio</label>
            <textarea className={inputClass} rows={4}
              value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
          </div>
          <div>
            <label className={labelClass}>LinkedIn URL</label>
            <input type="url" className={inputClass}
              value={form.linkedinUrl} onChange={(e) => setForm({ ...form, linkedinUrl: e.target.value })} />
          </div>
          <div>
            <label className={labelClass}>GitHub URL</label>
            <input type="url" className={inputClass}
              value={form.githubUrl} onChange={(e) => setForm({ ...form, githubUrl: e.target.value })} />
          </div>
          <div>
            <label className={labelClass}>Portfolio URL</label>
            <input type="url" className={inputClass}
              value={form.portfolioUrl} onChange={(e) => setForm({ ...form, portfolioUrl: e.target.value })} />
          </div>
          <div className="border-t border-white/20 dark:border-white/10 pt-4 mt-2">
            <label className={`${labelClass} mb-2`}>Resume (PDF, max 5MB)</label>
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
              className="text-sm text-zinc-700 dark:text-zinc-300"
            />
            <button
              type="button"
              onClick={handleResumeUpload}
              disabled={!resumeFile || uploadingResume}
              className="mt-3 rounded-xl px-4 py-2 glass font-semibold text-sm text-zinc-900 dark:text-white disabled:opacity-50"
            >
              {uploadingResume ? "Uploading..." : "Upload Resume"}
            </button>
          </div>

          {error && <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>}
          {success && <p className="text-emerald-600 dark:text-emerald-400 text-sm">Profile saved!</p>}

          <button type="submit" disabled={saving}
            className="bg-purple-600 text-white rounded-xl px-3 py-2.5 font-semibold mt-2 hover:bg-purple-700 transition-colors disabled:opacity-50">
            {saving ? "Saving..." : "Save profile"}
          </button>
        </form>
      </div>
    </div>
  );
}
