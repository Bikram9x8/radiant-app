"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function CompanyProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    companyName: "",
    website: "",
    industry: "",
    description: "",
    logoUrl: "",
    contactPerson: "",
    contactPhone: "",
  });

  useEffect(() => {
    async function loadProfile() {
      const res = await fetch("/api/company-profile");
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      if (res.ok) {
        const data = await res.json();
        const p = data.profile;
        setForm({
          companyName: p.companyName || "",
          website: p.website || "",
          industry: p.industry || "",
          description: p.description || "",
          logoUrl: p.logoUrl || "",
          contactPerson: p.contactPerson || "",
          contactPhone: p.contactPhone || "",
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

    const res = await fetch("/api/company-profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
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
      <h1 className="text-2xl font-bold mb-6">Edit Company Profile</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Company name</label>
          <input type="text" className="border rounded px-3 py-2 w-full"
            value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Website</label>
          <input type="url" className="border rounded px-3 py-2 w-full" placeholder="https://..."
            value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Industry</label>
          <input type="text" className="border rounded px-3 py-2 w-full" placeholder="e.g. Education, IT Services"
            value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea className="border rounded px-3 py-2 w-full" rows={4}
            value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Logo URL</label>
          <input type="url" className="border rounded px-3 py-2 w-full" placeholder="https://..."
            value={form.logoUrl} onChange={(e) => setForm({ ...form, logoUrl: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Contact person</label>
          <input type="text" className="border rounded px-3 py-2 w-full"
            value={form.contactPerson} onChange={(e) => setForm({ ...form, contactPerson: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Contact phone</label>
          <input type="text" className="border rounded px-3 py-2 w-full"
            value={form.contactPhone} onChange={(e) => setForm({ ...form, contactPhone: e.target.value })} />
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
