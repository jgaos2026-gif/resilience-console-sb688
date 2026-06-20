import React, { useRef, useEffect, useState, useCallback } from "react";
import { X, ZoomIn, ZoomOut, RotateCw, Sun, Contrast, Eraser, MousePointer, Crop, RotateCcw, Check } from "lucide-react";

const GOLD = "#C9A84C";

export default function ImageEditor({ imageUrl, onSave, onCancel }) {
  const canvasRef = useRef(null);
  const overlayRef = useRef(null);
  const imgRef = useRef(null);

  const [tool, setTool] = useState("move"); // move | eraser | crop
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [eraserSize, setEraserSize] = useState(30);
  const [isDrawing, setIsDrawing] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [cropBox, setCropBox] = useState(null);
  const [cropStart, setCropStart] = useState(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  const W = 640;
  const H = 400;

  // Load image onto canvas
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      imgRef.current = img;
      setImageLoaded(true);
      // Auto-fit
      const scaleX = W / img.naturalWidth;
      const scaleY = H / img.naturalHeight;
      const fit = Math.min(scaleX, scaleY, 1);
      setScale(fit);
      setOffset({ x: 0, y: 0 });
    };
    img.src = imageUrl;
  }, [imageUrl]);

  // Render
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, W, H);
    ctx.save();
    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;
    ctx.translate(W / 2 + offset.x, H / 2 + offset.y);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(scale, scale);
    ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
    ctx.restore();

    // Draw crop box if active
    if (cropBox) {
      const oc = overlayRef.current;
      if (oc) {
        const octx = oc.getContext("2d");
        octx.clearRect(0, 0, W, H);
        octx.fillStyle = "rgba(0,0,0,0.45)";
        octx.fillRect(0, 0, W, H);
        octx.clearRect(cropBox.x, cropBox.y, cropBox.w, cropBox.h);
        octx.strokeStyle = GOLD;
        octx.lineWidth = 2;
        octx.setLineDash([6, 3]);
        octx.strokeRect(cropBox.x, cropBox.y, cropBox.w, cropBox.h);
        octx.setLineDash([]);
      }
    } else {
      const oc = overlayRef.current;
      if (oc) oc.getContext("2d").clearRect(0, 0, W, H);
    }
  }, [brightness, contrast, scale, rotation, offset, cropBox]);

  useEffect(() => {
    if (imageLoaded) render();
  }, [render, imageLoaded]);

  // Canvas coords
  const getPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const scaleX = W / rect.width;
    const scaleY = H / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  const onMouseDown = (e) => {
    const pos = getPos(e);
    if (tool === "eraser") {
      setIsDrawing(true);
      erase(pos);
    } else if (tool === "move") {
      setDragging(true);
      setDragStart({ x: pos.x - offset.x, y: pos.y - offset.y });
    } else if (tool === "crop") {
      setCropStart(pos);
      setCropBox(null);
    }
  };

  const onMouseMove = (e) => {
    const pos = getPos(e);
    if (tool === "eraser" && isDrawing) {
      erase(pos);
    } else if (tool === "move" && dragging) {
      setOffset({ x: pos.x - dragStart.x, y: pos.y - dragStart.y });
    } else if (tool === "crop" && cropStart) {
      const x = Math.min(cropStart.x, pos.x);
      const y = Math.min(cropStart.y, pos.y);
      const w = Math.abs(pos.x - cropStart.x);
      const h = Math.abs(pos.y - cropStart.y);
      setCropBox({ x, y, w, h });
    }
  };

  const onMouseUp = () => {
    setIsDrawing(false);
    setDragging(false);
    if (tool === "crop") setCropStart(null);
  };

  const erase = (pos) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.save();
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, eraserSize / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  const applyCrop = () => {
    if (!cropBox || cropBox.w < 5 || cropBox.h < 5) return;
    const src = canvasRef.current;
    const tmp = document.createElement("canvas");
    tmp.width = cropBox.w;
    tmp.height = cropBox.h;
    tmp.getContext("2d").drawImage(src, cropBox.x, cropBox.y, cropBox.w, cropBox.h, 0, 0, cropBox.w, cropBox.h);
    // Replace canvas content
    const ctx = src.getContext("2d");
    ctx.clearRect(0, 0, W, H);
    ctx.drawImage(tmp, (W - cropBox.w) / 2, (H - cropBox.h) / 2);
    setCropBox(null);
    setTool("move");
  };

  const handleSave = () => {
    onSave(canvasRef.current.toDataURL("image/png"));
  };

  const TOOLS = [
    { id: "move",   label: "Move",   icon: MousePointer },
    { id: "eraser", label: "Eraser", icon: Eraser },
    { id: "crop",   label: "Crop",   icon: Crop },
  ];

  const cursor =
    tool === "eraser" ? "none" :
    tool === "crop"   ? "crosshair" :
    dragging          ? "grabbing" : "grab";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="rounded-2xl border overflow-hidden w-full max-w-3xl flex flex-col"
        style={{ background: "#0a0800", borderColor: `${GOLD}35`, maxHeight: "95vh" }}>

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: `${GOLD}20` }}>
          <span className="text-xs font-black uppercase tracking-widest" style={{ color: GOLD }}>Image Editor</span>
          <button onClick={onCancel} className="p-1.5 rounded-lg hover:bg-white/5 transition">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-2 px-4 py-2 border-b flex-wrap" style={{ borderColor: `${GOLD}15` }}>
          {/* Tool buttons */}
          <div className="flex gap-1">
            {TOOLS.map(t => {
              const Icon = t.icon;
              return (
                <button key={t.id} onClick={() => setTool(t.id)}
                  title={t.label}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-[10px] font-bold transition-all"
                  style={tool === t.id
                    ? { background: `${GOLD}18`, borderColor: `${GOLD}50`, color: GOLD }
                    : { background: "transparent", borderColor: `${GOLD}15`, color: "rgba(201,168,76,0.45)" }}>
                  <Icon className="w-3.5 h-3.5" /> {t.label}
                </button>
              );
            })}
          </div>

          <div className="w-px h-5 bg-white/10 mx-1" />

          {/* Rotate */}
          <button onClick={() => setRotation(r => r - 90)} title="Rotate left"
            className="p-1.5 rounded-lg border transition hover:opacity-80"
            style={{ borderColor: `${GOLD}15`, color: `${GOLD}70` }}>
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => setRotation(r => r + 90)} title="Rotate right"
            className="p-1.5 rounded-lg border transition hover:opacity-80"
            style={{ borderColor: `${GOLD}15`, color: `${GOLD}70` }}>
            <RotateCw className="w-3.5 h-3.5" />
          </button>

          <div className="w-px h-5 bg-white/10 mx-1" />

          {/* Zoom */}
          <button onClick={() => setScale(s => Math.min(s + 0.1, 4))} title="Zoom in"
            className="p-1.5 rounded-lg border transition hover:opacity-80"
            style={{ borderColor: `${GOLD}15`, color: `${GOLD}70` }}>
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => setScale(s => Math.max(s - 0.1, 0.1))} title="Zoom out"
            className="p-1.5 rounded-lg border transition hover:opacity-80"
            style={{ borderColor: `${GOLD}15`, color: `${GOLD}70` }}>
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-[9px] font-mono" style={{ color: `${GOLD}50` }}>{Math.round(scale * 100)}%</span>

          {/* Crop apply */}
          {cropBox && cropBox.w > 5 && (
            <button onClick={applyCrop}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-[10px] font-bold ml-auto transition"
              style={{ background: `${GOLD}18`, borderColor: `${GOLD}50`, color: GOLD }}>
              <Check className="w-3.5 h-3.5" /> Apply Crop
            </button>
          )}
        </div>

        {/* Sliders row */}
        <div className="flex items-center gap-4 px-4 py-2 border-b text-[9px] flex-wrap" style={{ borderColor: `${GOLD}15` }}>
          <label className="flex items-center gap-2" style={{ color: `${GOLD}70` }}>
            <Sun className="w-3 h-3" /> Brightness
            <input type="range" min={10} max={200} value={brightness}
              onChange={e => setBrightness(Number(e.target.value))}
              className="w-24 accent-yellow-500" />
            <span className="font-mono w-7">{brightness}</span>
          </label>
          <label className="flex items-center gap-2" style={{ color: `${GOLD}70` }}>
            <Contrast className="w-3 h-3" /> Contrast
            <input type="range" min={10} max={200} value={contrast}
              onChange={e => setContrast(Number(e.target.value))}
              className="w-24 accent-yellow-500" />
            <span className="font-mono w-7">{contrast}</span>
          </label>
          {tool === "eraser" && (
            <label className="flex items-center gap-2" style={{ color: `${GOLD}70` }}>
              <Eraser className="w-3 h-3" /> Eraser Size
              <input type="range" min={5} max={100} value={eraserSize}
                onChange={e => setEraserSize(Number(e.target.value))}
                className="w-24 accent-yellow-500" />
              <span className="font-mono w-7">{eraserSize}px</span>
            </label>
          )}
        </div>

        {/* Canvas */}
        <div className="flex-1 flex items-center justify-center overflow-hidden p-3 relative"
          style={{ background: "#111" }}>
          <div className="relative" style={{ width: W, maxWidth: "100%" }}>
            <canvas ref={canvasRef} width={W} height={H}
              className="block rounded-xl w-full"
              style={{ cursor, background: "repeating-conic-gradient(#1a1a1a 0% 25%, #222 0% 50%) 0 0 / 20px 20px" }}
              onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp}
              onTouchStart={onMouseDown} onTouchMove={onMouseMove} onTouchEnd={onMouseUp}
            />
            {/* Overlay for crop darkening */}
            <canvas ref={overlayRef} width={W} height={H}
              className="absolute inset-0 pointer-events-none w-full rounded-xl"
              style={{ top: 0, left: 0 }} />
            {/* Eraser cursor indicator */}
            {tool === "eraser" && (
              <style>{`canvas { cursor: none !important; }`}</style>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-3 border-t" style={{ borderColor: `${GOLD}20` }}>
          <p className="text-[9px] text-muted-foreground">
            {tool === "move" && "Drag to reposition · Zoom buttons to resize"}
            {tool === "eraser" && "Click/drag to erase pixels · Adjust eraser size above"}
            {tool === "crop" && "Drag to select area · Click Apply Crop to confirm"}
          </p>
          <div className="flex gap-2">
            <button onClick={onCancel}
              className="px-4 py-1.5 rounded-lg border text-[10px] font-bold transition hover:opacity-80"
              style={{ borderColor: `${GOLD}20`, color: "rgba(201,168,76,0.5)" }}>
              Cancel
            </button>
            <button onClick={handleSave}
              className="px-4 py-1.5 rounded-lg border text-[10px] font-bold transition hover:opacity-80"
              style={{ background: `${GOLD}18`, borderColor: `${GOLD}50`, color: GOLD }}>
              ✓ Save Image
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}