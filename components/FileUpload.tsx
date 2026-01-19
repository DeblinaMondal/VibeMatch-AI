import React, { useRef, useState } from 'react';
import { Upload, Image as ImageIcon, Plus } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (files: File[]) => void;
  disabled?: boolean;
  compact?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, disabled, compact }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      // Fix: Cast to File[] to avoid TS error "Property 'type' does not exist on type 'unknown'"
      const validFiles = (Array.from(e.dataTransfer.files) as File[]).filter(file => 
        file.type.startsWith('image/')
      );
      if (validFiles.length > 0) {
        onFileSelect(validFiles);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      // Fix: Cast to File[] to avoid TS error "Property 'type' does not exist on type 'unknown'"
      const validFiles = (Array.from(e.target.files) as File[]).filter(file => 
        file.type.startsWith('image/')
      );
      if (validFiles.length > 0) {
        onFileSelect(validFiles);
      }
    }
  };

  if (compact) {
    return (
       <div 
        onClick={() => !disabled && fileInputRef.current?.click()}
        className="w-full h-full min-h-[100px] flex flex-col items-center justify-center border-2 border-dashed border-slate-700 rounded-2xl hover:bg-slate-800/50 hover:border-indigo-500/50 cursor-pointer transition-all group"
       >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleInputChange}
            accept="image/*"
            multiple
            className="hidden"
            disabled={disabled}
          />
          <Plus className="w-8 h-8 text-slate-500 group-hover:text-indigo-400 mb-2" />
          <span className="text-xs text-slate-500 font-medium group-hover:text-slate-300">Add Images</span>
       </div>
    );
  }

  return (
    <div
      className={`relative group w-full max-w-xl mx-auto rounded-2xl border-2 border-dashed transition-all duration-300 ease-in-out cursor-pointer
        ${isDragging 
          ? 'border-indigo-500 bg-indigo-500/10 scale-[1.02]' 
          : 'border-slate-600 hover:border-indigo-400 hover:bg-slate-800/50 bg-slate-800/30'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => !disabled && fileInputRef.current?.click()}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleInputChange}
        accept="image/*"
        multiple
        className="hidden"
        disabled={disabled}
      />
      
      <div className="p-10 flex flex-col items-center justify-center text-center space-y-4">
        <div className={`p-4 rounded-full transition-colors duration-300 ${isDragging ? 'bg-indigo-500 text-white' : 'bg-slate-700 text-slate-300 group-hover:bg-indigo-500/20 group-hover:text-indigo-300'}`}>
          {isDragging ? <ImageIcon className="w-8 h-8" /> : <Upload className="w-8 h-8" />}
        </div>
        <div className="space-y-1">
          <p className="text-lg font-medium text-slate-200">
            {isDragging ? 'Drop images here' : 'Click to upload or drag and drop'}
          </p>
          <p className="text-sm text-slate-500">
            Upload one or multiple images
          </p>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;