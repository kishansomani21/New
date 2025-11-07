'use client';

/**
 * Document Uploader Component
 *
 * Provides an easy-to-use interface for uploading financial documents
 * - Drag and drop support
 * - Camera capture support (mobile)
 * - File validation
 * - Upload progress
 */

import React, { useCallback, useState, useRef } from 'react';
import { useDropzone } from 'react-dropzone';

interface DocumentUploaderProps {
  onUploadComplete: (result: any) => void;
  onUploadError: (error: string) => void;
  taxYear?: string;
  quarter?: string;
}

export default function DocumentUploader({
  onUploadComplete,
  onUploadError,
  taxYear,
  quarter,
}: DocumentUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const uploadFile = async (file: File) => {
    setUploading(true);
    setProgress(0);
    setUploadStatus('Uploading document...');

    try {
      const formData = new FormData();
      formData.append('file', file);
      if (taxYear) formData.append('taxYear', taxYear);
      if (quarter) formData.append('quarter', quarter);

      setProgress(30);
      setUploadStatus('Storing in Google Drive...');

      const response = await fetch('/api/upload-document', {
        method: 'POST',
        body: formData,
      });

      setProgress(60);
      setUploadStatus('Analyzing document with AI...');

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const result = await response.json();

      setProgress(100);
      setUploadStatus('Complete!');

      setTimeout(() => {
        setUploading(false);
        setProgress(0);
        setUploadStatus('');
        onUploadComplete(result.data);
      }, 1000);
    } catch (error: any) {
      console.error('Upload error:', error);
      setUploading(false);
      setProgress(0);
      setUploadStatus('');
      onUploadError(error.message || 'Upload failed');
    }
  };

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        uploadFile(acceptedFiles[0]);
      }
    },
    [taxYear, quarter]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
      'application/pdf': ['.pdf'],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
    disabled: uploading,
  });

  const handleCameraCapture = () => {
    if (cameraInputRef.current) {
      cameraInputRef.current.click();
    }
  };

  const handleCameraChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      uploadFile(files[0]);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Main Upload Area */}
      <div
        {...getRootProps()}
        className={`
          border-4 border-dashed rounded-2xl p-12 text-center cursor-pointer
          transition-all duration-300 ease-in-out
          ${
            isDragActive
              ? 'border-purple-500 bg-purple-50'
              : 'border-gray-300 hover:border-purple-400 bg-white'
          }
          ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} />

        {uploading ? (
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-lg font-medium text-gray-700">{uploadStatus}</p>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-sm text-gray-500">{progress}%</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Upload Icon */}
            <svg
              className="w-20 h-20 mx-auto text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>

            <div>
              <p className="text-2xl font-semibold text-gray-800 mb-2">
                {isDragActive ? 'Drop your document here' : 'Upload your bank statement'}
              </p>
              <p className="text-base text-gray-600 mb-4">
                Drag and drop, or click to browse
              </p>
              <p className="text-sm text-gray-500">
                Supports: Bank statements, rental income statements
              </p>
              <p className="text-sm text-gray-500">
                Formats: JPG, PNG, WebP, PDF (Max 10MB)
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Camera Button (Mobile) */}
      {!uploading && (
        <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleCameraCapture}
            className="flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            Take a Photo
          </button>

          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleCameraChange}
            className="hidden"
          />
        </div>
      )}

      {/* Helper Text */}
      <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-xl">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">Tips for best results:</h3>
        <ul className="text-sm text-blue-800 space-y-2">
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-1">✓</span>
            <span>Ensure all text is clearly visible and not blurred</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-1">✓</span>
            <span>Include the full page showing dates, amounts, and descriptions</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-1">✓</span>
            <span>Good lighting helps - avoid shadows over the document</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-1">✓</span>
            <span>PDFs work best for multi-page statements</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
