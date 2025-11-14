'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';

interface ImageUploadProps {
  onImageSelect: (file: File, preview: string) => void;
  onImageRemove: () => void;
  imagePreview?: string | null;
  loading?: boolean;
  disabled?: boolean;
}

export default function ImageUpload({
  onImageSelect,
  onImageRemove,
  imagePreview,
  loading = false,
  disabled = false,
}: ImageUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      alert('Format file harus JPG, PNG, atau WebP');
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      alert('Ukuran file maksimal 5MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      const preview = reader.result as string;
      onImageSelect(file, preview);
    };
    reader.readAsDataURL(file);
  };

  const handleClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="w-full">
      {!imagePreview ? (
        <div
          className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive
              ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
              : 'border-gray-300 dark:border-gray-600 hover:border-primary-400 dark:hover:border-primary-500'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={handleClick}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleChange}
            disabled={disabled}
          />

          <div className="flex flex-col items-center space-y-3">
            {/* Upload Icon */}
            <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-primary-600 dark:text-primary-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>

            <div>
              <p className="text-lg font-medium text-gray-900 dark:text-white">
                Upload Foto Keluhan Kulit
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Klik atau drag & drop gambar di sini
              </p>
            </div>

            <div className="text-xs text-gray-500 dark:text-gray-500 space-y-1">
              <p>Format: JPG, PNG, WebP</p>
              <p>Ukuran maksimal: 5MB</p>
            </div>

            {loading && (
              <div className="flex items-center space-x-2 text-primary-600 dark:text-primary-400">
                <div className="w-4 h-4 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm">Menganalisis gambar...</span>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="relative border-2 border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
          {/* Image Preview */}
          <div className="relative w-full h-64 bg-gray-100 dark:bg-gray-800">
            <Image
              src={imagePreview}
              alt="Preview"
              fill
              className="object-contain"
            />
          </div>

          {/* Remove Button */}
          <button
            type="button"
            onClick={onImageRemove}
            disabled={disabled || loading}
            className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white rounded-full p-2 shadow-lg transition-colors disabled:opacity-50"
            title="Hapus gambar"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          {/* Loading Overlay */}
          {loading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 flex items-center space-x-3">
                <div className="w-6 h-6 border-3 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  Menganalisis gambar dengan AI...
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
