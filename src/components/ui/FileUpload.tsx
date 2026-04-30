'use client';

import { useState, useRef } from 'react';
import { Upload, X, Check, Image, File, Loader } from 'lucide-react';

interface FileUploadProps {
  onUpload?: (url: string) => void;
  accept?: string;
  maxSizeMB?: number;
}

export default function FileUpload({ onUpload, accept = 'image/*,.pdf', maxSizeMB = 10 }: FileUploadProps) {
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const API_BASE = typeof window !== 'undefined'
    ? window.location.hostname === 'localhost'
      ? 'http://localhost:8080/v2'
      : 'https://api.raddix.pro/v1'
    : '';

  const uploadFile = async (file: File) => {
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`El archivo excede el límite de ${maxSizeMB}MB`);
      return;
    }

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/upload`, {
        method: 'POST',
        body: formData,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Upload failed' }));
        throw new Error(err.error || 'Upload failed');
      }

      const data = await res.json();
      const fullUrl = `${API_BASE}${data.url}`;
      setUploadedUrl(fullUrl);
      onUpload?.(fullUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al subir archivo');
      setPreview(null);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) uploadFile(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
  };

  const handleClick = () => {
    if (!uploadedUrl) inputRef.current?.click();
  };

  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      {error && (
        <div style={{
          padding: '10px 14px', borderRadius: 10, marginBottom: 12,
          background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
          color: '#ef4444', fontSize: 13, fontWeight: 500,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span>{error}</span>
          <button onClick={() => setError(null)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
            <X size={14} />
          </button>
        </div>
      )}

      <div
        onClick={handleClick}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        style={{
          border: `2px dashed ${dragOver ? 'var(--p, #6b32e8)' : 'var(--br, #e5e7eb)'}`,
          borderRadius: 16,
          padding: uploadedUrl ? 16 : 40,
          textAlign: 'center',
          cursor: uploading ? 'wait' : (uploadedUrl ? 'default' : 'pointer'),
          background: dragOver ? 'color-mix(in srgb, var(--p, #6b32e8) 5%, transparent)' : 'var(--b, #f9fafb)',
          transition: 'all 0.2s',
          minHeight: 140,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
          opacity: uploading ? 0.6 : 1,
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleChange}
          style={{ display: 'none' }}
        />

        {uploading ? (
          <>
            <Loader size={32} style={{ color: 'var(--p, #6b32e8)', animation: 'spin 1s linear infinite' }} />
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--t, #111827)' }}>Subiendo...</div>
            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
          </>
        ) : uploadedUrl ? (
          <>
            {preview ? (
              <img
                src={preview}
                alt="Preview"
                style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 12, objectFit: 'contain' }}
              />
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: '#ecfdf5', borderRadius: 12, border: '1px solid #a7f3d0' }}>
                <Check size={18} style={{ color: '#10b981' }} />
                <div style={{ fontSize: 13, fontWeight: 600, color: '#065f46' }}>Archivo subido</div>
              </div>
            )}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setUploadedUrl(null);
                setPreview(null);
                if (inputRef.current) inputRef.current.value = '';
              }}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '6px 12px', borderRadius: 8, border: '1px solid var(--br, #e5e7eb)',
                background: 'var(--sf, #ffffff)', color: 'var(--t-s, #6b7280)',
                fontSize: 12, fontWeight: 600, cursor: 'pointer',
              }}
            >
              <X size={14} /> Eliminar
            </button>
          </>
        ) : (
          <>
            <div style={{
              width: 56, height: 56, borderRadius: 14,
              background: 'var(--sf, #ffffff)',
              border: '1px solid var(--br, #e5e7eb)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--t-s, #9ca3af)',
            }}>
              <Upload size={24} strokeWidth={2} />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--t, #111827)' }}>
                Arrastra un archivo o haz clic
              </div>
              <div style={{ fontSize: 12, color: 'var(--t-s, #6b7280)', marginTop: 4 }}>
                {accept.includes('image') ? 'Imágenes' : 'Archivos'} hasta {maxSizeMB}MB
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
