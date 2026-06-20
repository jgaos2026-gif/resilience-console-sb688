import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Upload, X, ImageIcon, Loader2, ChevronDown, ChevronUp, Pencil } from "lucide-react";
import ImageEditor from "./ImageEditor";

const GOLD = "#C9A84C";

const DEFAULT_IMGS = {
  flyer:   "https://media.base44.com/images/public/69d5af52688205fc104c687c/336e66e85_FF2B5757-3BC6-4E14-9251-BF3005F719D7.png",
  logo:    "https://media.base44.com/images/public/69d5af52688205fc104c687c/a27bf93c0_IMG_0843_Original_Original.jpeg",
  sb712:   "https://media.base44.com/images/public/69d5af52688205fc104c687c/cab0b693b_10E06BC3-278A-42DB-9012-1281571C15D8.png",
  founder: "https://media.base44.com/images/public/69d5af52688205fc104c687c/006aa7b4e_IMG_1321_Original_Original.jpeg",
};

const LABELS = {
  flyer:   "Hero Banner (Flyer)",
  logo:    "Brand Logo / Identity",
  sb712:   "SB712 Architecture Visual",
  founder: "Founder / Jay's Graphic Arts",
};

const STORAGE_KEY = "jga_custom_imgs";

export function loadImages() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? { ...DEFAULT_IMGS, ...JSON.parse(stored) } : { ...DEFAULT_IMGS };
  } catch {
    return { ...DEFAULT_IMGS };
  }
}

function saveImages(imgs) {
  const custom = {};
  for (const key of Object.keys(DEFAULT_IMGS)) {
    if (imgs[key] !== DEFAULT_IMGS[key]) custom[key] = imgs[key];
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(custom));
}

export default function ImageManager({ images, onImagesChange }) {
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(null);
  const [editingKey, setEditingKey] = useState(null); // key being edited
  const [editingUrl, setEditingUrl] = useState(null); // url for editor

  const handleUpload = async (key, file) => {
    if (!file) return;
    setUploading(key);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setUploading(null);
    // Open editor immediately after upload
    setEditingKey(key);
    setEditingUrl(file_url);
  };

  const handleEditExisting = (key) => {
    setEditingKey(key);
    setEditingUrl(images[key]);
  };

  const handleReset = (key) => {
    const updated = { ...images, [key]: DEFAULT_IMGS[key] };
    saveImages(updated);
    onImagesChange(updated);
  };

  const handleEditorSave = (dataUrl) => {
    const updated = { ...images, [editingKey]: dataUrl };
    saveImages(updated);
    onImagesChange(updated);
    setEditingKey(null);
    setEditingUrl(null);
  };

  const handleEditorCancel = () => {
    setEditingKey(null);
    setEditingUrl(null);
  };

  const customCount = Object.keys(DEFAULT_IMGS).filter(k => images[k] !== DEFAULT_IMGS[k]).length;

  return (
    <>
      <div className="mx-4 sm:mx-6 mb-4">
        <button
          onClick={() => setOpen(v => !v)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border text-[10px] font-bold uppercase tracking-widest transition-all"
          style={{ borderColor: `${GOLD}25`, color: `${GOLD}80`, background: `${GOLD}06` }}
        >
          <ImageIcon className="w-3.5 h-3.5" />
          Manage Images
          {customCount > 0 && (
            <span className="px-1.5 py-0.5 rounded text-[8px] font-black"
              style={{ background: `${GOLD}20`, color: GOLD }}>{customCount} custom</span>
          )}
          {open ? <ChevronUp className="w-3 h-3 ml-auto" /> : <ChevronDown className="w-3 h-3 ml-auto" />}
        </button>

        {open && (
          <div className="mt-2 rounded-2xl border p-4 grid grid-cols-1 sm:grid-cols-2 gap-3"
            style={{ background: "#0e0c00", borderColor: `${GOLD}20` }}>
            {Object.keys(DEFAULT_IMGS).map(key => {
              const isCustom = images[key] !== DEFAULT_IMGS[key];
              const isUploading = uploading === key;
              return (
                <div key={key} className="rounded-xl border overflow-hidden"
                  style={{ borderColor: isCustom ? `${GOLD}40` : `${GOLD}14`, background: "#080808" }}>
                  {/* Preview */}
                  <div className="relative group" style={{ height: 110 }}>
                    <img src={images[key]} alt={LABELS[key]} className="w-full h-full object-cover" />
                    {isCustom && (
                      <div className="absolute top-1.5 left-1.5">
                        <span className="text-[8px] font-black px-1.5 py-0.5 rounded"
                          style={{ background: GOLD, color: "#080808" }}>CUSTOM</span>
                      </div>
                    )}
                    {/* Edit overlay */}
                    <button
                      onClick={() => handleEditExisting(key)}
                      className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                      style={{ background: "rgba(0,0,0,0.55)" }}>
                      <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[10px] font-bold"
                        style={{ borderColor: `${GOLD}60`, color: GOLD, background: `${GOLD}12` }}>
                        <Pencil className="w-3 h-3" /> Edit Image
                      </span>
                    </button>
                  </div>
                  {/* Controls */}
                  <div className="p-3 space-y-2">
                    <p className="text-[9px] font-bold uppercase tracking-wider" style={{ color: `${GOLD}80` }}>{LABELS[key]}</p>
                    <div className="flex items-center gap-2">
                      <label className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border cursor-pointer transition-all hover:opacity-80 text-[10px] font-bold"
                        style={{ borderColor: `${GOLD}30`, color: GOLD, background: `${GOLD}08` }}>
                        {isUploading
                          ? <><Loader2 className="w-3 h-3 animate-spin" /> Uploading…</>
                          : <><Upload className="w-3 h-3" /> Upload New</>
                        }
                        <input type="file" accept="image/*" className="hidden"
                          disabled={isUploading}
                          onChange={e => handleUpload(key, e.target.files[0])} />
                      </label>
                      <button onClick={() => handleEditExisting(key)}
                        className="p-1.5 rounded-lg border transition-all hover:opacity-80"
                        style={{ borderColor: `${GOLD}30`, color: GOLD, background: `${GOLD}08` }}
                        title="Open editor">
                        <Pencil className="w-3 h-3" />
                      </button>
                      {isCustom && (
                        <button onClick={() => handleReset(key)}
                          className="p-1.5 rounded-lg border transition-all hover:opacity-80"
                          style={{ borderColor: "rgba(248,113,113,0.3)", color: "#f87171", background: "rgba(248,113,113,0.08)" }}
                          title="Restore original">
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Editor modal */}
      {editingKey && editingUrl && (
        <ImageEditor
          imageUrl={editingUrl}
          onSave={handleEditorSave}
          onCancel={handleEditorCancel}
        />
      )}
    </>
  );
}