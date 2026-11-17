"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// Calm form style (Phase 2): white fields with a 1.5px line, teal focus ring
const inputClass =
  "w-full min-h-[46px] rounded-xl border-[1.5px] border-(--btn-line) bg-white px-3 py-2 text-base text-(--ink) placeholder:text-(--muted) hover:border-[#b8c4d1] focus-visible:border-(--ink) focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-teal";
const labelClass = "block text-sm font-bold mb-1.5 text-(--ink)";

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
        <p className="text-(--muted)">Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto mt-10 px-4 sm:px-6 mb-12 w-full">
      <div className="rounded-[18px] border border-(--line) bg-white p-6 shadow-soft sm:p-8">
        <h1 className="mb-6 font-display text-[40px] leading-[0.95] font-extrabold uppercase text-(--ink) sm:text-5xl">
          Edit <span className="font-serif font-normal normal-case italic text-(--teal)">profile</span>
        </h1>
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
          <div className="border-t border-(--line) pt-4 mt-2">
            <label className={`${labelClass} mb-2`}>Resume (PDF, max 5MB)</label>
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
              className="text-sm text-(--ink-2)"
            />
            <button
              type="button"
              onClick={handleResumeUpload}
              disabled={!resumeFile || uploadingResume}
              className="mt-3 inline-flex min-h-[44px] items-center rounded-full border-[1.5px] border-(--btn-line) bg-white px-5 text-sm font-bold text-(--ink) hover:border-(--ink) disabled:opacity-50"
            >
              {uploadingResume ? "Uploading..." : "Upload Resume"}
            </button>
          </div>

          {error && <p className="text-red-700 text-sm font-semibold">{error}</p>}
          {success && <p className="text-(--teal-dark) text-sm font-semibold">Profile saved!</p>}

          <button type="submit" disabled={saving}
            className="mt-2 inline-flex min-h-12 items-center justify-center rounded-full bg-(--teal) px-6 font-bold text-white shadow-[0_8px_20px_-10px_rgb(15_118_110/0.6)] transition-colors hover:bg-(--teal-dark) disabled:opacity-50">
            {saving ? "Saving..." : "Save profile"}
          </button>
        </form>
      </div>
    </div>
  );
}
