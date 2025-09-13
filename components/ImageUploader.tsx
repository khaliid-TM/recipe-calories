import React, { useState, useRef } from 'react';

interface ImageUploaderProps {
  onImageUpload: (file: File) => void;
  onAnalyze: () => void;
  onClear: () => void;
  hasImage: boolean;
  isLoading: boolean;
}

const UploadIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
  </svg>
);

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload, onAnalyze, onClear, hasImage, isLoading }) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      onImageUpload(file);
    }
  };

  const handleClearClick = () => {
    setImagePreview(null);
    if(fileInputRef.current) {
        fileInputRef.current.value = "";
    }
    onClear();
  }

  const handleDrop = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const file = event.dataTransfer.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      onImageUpload(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  return (
    <div className="w-full max-w-xl bg-slate-800 rounded-2xl shadow-xl p-6 transition-all duration-300">
      <input
        type="file"
        id="imageUpload"
        ref={fileInputRef}
        className="hidden"
        accept="image/png, image/jpeg, image/webp"
        onChange={handleFileChange}
        disabled={isLoading}
      />
      {!imagePreview ? (
        <label
          htmlFor="imageUpload"
          className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-slate-600 rounded-lg cursor-pointer hover:bg-slate-700/50 transition-colors"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <UploadIcon />
          <p className="mt-2 text-lg font-semibold text-slate-300">Click to upload or drag & drop</p>
          <p className="text-sm text-slate-500">PNG, JPG, or WEBP</p>
        </label>
      ) : (
        <div className="w-full h-64 relative group">
          <img src={imagePreview} alt="Food preview" className="w-full h-full object-contain rounded-lg" />
        </div>
      )}

      <div className="mt-6 flex flex-col sm:flex-row gap-4">
        <button
          onClick={onAnalyze}
          disabled={!hasImage || isLoading}
          className="flex-grow w-full text-lg font-semibold bg-cyan-500 hover:bg-cyan-600 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed text-white py-3 px-6 rounded-lg transition-all duration-300 shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-cyan-500"
        >
          {isLoading ? 'Analyzing...' : 'Estimate Calories'}
        </button>
        <button
          onClick={handleClearClick}
          disabled={!hasImage || isLoading}
          className="w-full sm:w-auto bg-slate-600 hover:bg-slate-700 disabled:bg-slate-700/50 disabled:text-slate-500 disabled:cursor-not-allowed text-white py-3 px-6 rounded-lg transition-all duration-300"
        >
          Clear
        </button>
      </div>
    </div>
  );
};
