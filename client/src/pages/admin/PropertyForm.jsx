import { useState } from 'react';
import api from '../../lib/api';

const emptyForm = {
  title: '',
  description: '',
  price: '',
  address: '',
  lat: '',
  lng: '',
  bedrooms: '',
  bathrooms: '',
  areaSqft: '',
  status: 'available',
  images: [],
};

export default function PropertyForm({ initial, onSaved, onCancel }) {
  const [form, setForm] = useState(initial || emptyForm);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const data = new FormData();
      data.append('image', file);
      const { data: res } = await api.post('/upload', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      update('images', [...form.images, res.url]);
    } catch {
      alert('Image upload failed');
    } finally {
      setUploading(false);
    }
  }

  function removeImage(idx) {
    update('images', form.images.filter((_, i) => i !== idx));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    const payload = {
      ...form,
      price: Number(form.price),
      lat: form.lat ? Number(form.lat) : null,
      lng: form.lng ? Number(form.lng) : null,
      bedrooms: Number(form.bedrooms),
      bathrooms: Number(form.bathrooms),
      areaSqft: Number(form.areaSqft),
    };
    try {
      if (initial?.id) {
        await api.put(`/properties/${initial.id}`, payload);
      } else {
        await api.post('/properties', payload);
      }
      onSaved();
    } catch {
      alert('Save failed');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 border border-black/10 rounded-xl p-6">
      <input
        placeholder="Title"
        value={form.title}
        onChange={(e) => update('title', e.target.value)}
        required
        className="w-full border border-black/15 rounded-lg px-3 py-2 text-sm"
      />
      <textarea
        placeholder="Description"
        value={form.description}
        onChange={(e) => update('description', e.target.value)}
        rows={3}
        className="w-full border border-black/15 rounded-lg px-3 py-2 text-sm"
      />
      <div className="grid grid-cols-2 gap-3">
        <input
          type="number"
          placeholder="Price"
          value={form.price}
          onChange={(e) => update('price', e.target.value)}
          required
          className="border border-black/15 rounded-lg px-3 py-2 text-sm"
        />
        <input
          placeholder="Address"
          value={form.address}
          onChange={(e) => update('address', e.target.value)}
          required
          className="border border-black/15 rounded-lg px-3 py-2 text-sm"
        />
        <input
          type="number"
          step="any"
          placeholder="Latitude"
          value={form.lat}
          onChange={(e) => update('lat', e.target.value)}
          className="border border-black/15 rounded-lg px-3 py-2 text-sm"
        />
        <input
          type="number"
          step="any"
          placeholder="Longitude"
          value={form.lng}
          onChange={(e) => update('lng', e.target.value)}
          className="border border-black/15 rounded-lg px-3 py-2 text-sm"
        />
        <input
          type="number"
          placeholder="Bedrooms"
          value={form.bedrooms}
          onChange={(e) => update('bedrooms', e.target.value)}
          required
          className="border border-black/15 rounded-lg px-3 py-2 text-sm"
        />
        <input
          type="number"
          placeholder="Bathrooms"
          value={form.bathrooms}
          onChange={(e) => update('bathrooms', e.target.value)}
          required
          className="border border-black/15 rounded-lg px-3 py-2 text-sm"
        />
        <input
          type="number"
          placeholder="Area (sqft)"
          value={form.areaSqft}
          onChange={(e) => update('areaSqft', e.target.value)}
          required
          className="border border-black/15 rounded-lg px-3 py-2 text-sm"
        />
        <select
          value={form.status}
          onChange={(e) => update('status', e.target.value)}
          className="border border-black/15 rounded-lg px-3 py-2 text-sm"
        >
          <option value="available">Available</option>
          <option value="sold">Sold</option>
        </select>
      </div>

      <div>
        <label className="text-sm text-black/60 block mb-2">Images</label>
        <div className="flex flex-wrap gap-2 mb-2">
          {form.images.map((img, i) => (
            <div key={i} className="relative w-16 h-16 rounded overflow-hidden border border-black/10">
              <img src={img} alt="" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute top-0 right-0 bg-black/70 text-white text-xs w-4 h-4 flex items-center justify-center"
              >
                ×
              </button>
            </div>
          ))}
        </div>
        <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
        {uploading && <span className="text-xs text-black/50 ml-2">Uploading…</span>}
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="px-5 py-2 bg-black text-white rounded-full text-sm disabled:opacity-50"
        >
          {saving ? 'Saving…' : initial?.id ? 'Update' : 'Create'}
        </button>
        <button type="button" onClick={onCancel} className="px-5 py-2 border border-black/15 rounded-full text-sm">
          Cancel
        </button>
      </div>
    </form>
  );
}
