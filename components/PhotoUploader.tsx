"use client";
import { useRef, useState } from "react";

interface Props {
  urls: string[];
  onChange: (urls: string[]) => void;
}

export default function PhotoUploader({ urls, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    setError("");
    const newUrls: string[] = [];
    for (const file of Array.from(files)) {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload-photo", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Upload failed");
        setUploading(false);
        return;
      }
      newUrls.push(data.url);
    }
    onChange([...urls, ...newUrls]);
    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  function remove(idx: number) {
    onChange(urls.filter((_, i) => i !== idx));
  }

  return (
    <div className="space-y-3">
      {/* Preview grid */}
      {urls.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {urls.map((url, i) => (
            <div key={url} className="relative group rounded-lg overflow-hidden aspect-square bg-gray-100">
              <img src={url} alt="" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => remove(i)}
                className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity font-bold leading-none"
                title="Remove"
              >
                ×
              </button>
              {i === 0 && (
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs text-center py-0.5 font-semibold">
                  Main
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload button */}
      <div
        className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-blue-400 transition-colors"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        {uploading ? (
          <p className="text-blue-600 font-semibold">Uploading…</p>
        ) : (
          <>
            <div className="text-3xl mb-2">📷</div>
            <p className="text-sm font-semibold text-gray-600">
              Click or drag &amp; drop photos here
            </p>
            <p className="text-xs text-gray-400 mt-1">JPEG, PNG, WebP, GIF · max 10 MB each</p>
          </>
        )}
      </div>

      {error && (
        <p className="text-red-600 text-sm font-semibold">{error}</p>
      )}

      {/* Manual URL fallback */}
      <details className="text-xs text-gray-400">
        <summary className="cursor-pointer hover:text-gray-600">Or paste photo URLs manually</summary>
        <textarea
          rows={3}
          className="mt-2 w-full border border-gray-300 rounded-lg px-3 py-2 font-mono text-xs focus:outline-none focus:border-blue-400 text-gray-700"
          placeholder={"https://example.com/photo1.jpg\nhttps://example.com/photo2.jpg"}
          value={urls.join("\n")}
          onChange={(e) => {
            const parsed = e.target.value.split("\n").map((u) => u.trim()).filter(Boolean);
            onChange(parsed);
          }}
        />
      </details>
    </div>
  );
}
