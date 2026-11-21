import { createPortal } from 'react-dom';
import React, { useState, useEffect } from 'react';
import {
  X,
  Download,
  ExternalLink,
  ZoomIn,
  ZoomOut,
  RotateCw,
  RotateCcw,
  FileText,
  Loader2,
  AlertCircle,
  FileCheck,
  Maximize2
} from 'lucide-react';
import { ApiClient } from '../../../services/api';
import { useToast } from '../../../context/ToastContext';

export const DocumentPreviewModal = ({ trip, doc, isOpen, onClose }) => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [fileDetails, setFileDetails] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    if (!isOpen || !doc) {
      setFileDetails(null);
      setZoom(1);
      setRotation(0);
      return;
    }

    let isMounted = true;
    const fetchDocData = async () => {
      try {
        setLoading(true);
        const res = await ApiClient.downloadTripDocument(trip._id, doc._id);
        if (isMounted) {
          if (res.success && res.data) {
            setFileDetails(res.data);
          } else {
            showToast('Unable to load document preview', 'error');
          }
        }
      } catch (err) {
        if (isMounted) {
          showToast(err.message || 'Failed to load document preview', 'error');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchDocData();

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      isMounted = false;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, doc, trip]);

  if (!isOpen || !doc) return null;

  const fileName = fileDetails?.fileName || doc.fileName || 'document';
  const fileType = fileDetails?.fileType || doc.fileType || '';
  const fileData = fileDetails?.fileData || '';
  const ext = fileName.split('.').pop()?.toLowerCase() || '';

  const isImage =
    fileType.startsWith('image/') ||
    ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg', 'bmp'].includes(ext);

  const isPdf =
    fileType === 'application/pdf' ||
    ext === 'pdf' ||
    (typeof fileData === 'string' && fileData.startsWith('data:application/pdf'));

  const isText =
    fileType.startsWith('text/') ||
    ['txt', 'csv', 'json', 'md', 'log'].includes(ext);

  const handleDownload = () => {
    if (!fileData) return;
    const link = document.createElement('a');
    link.href = fileData;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Download started', 'success');
  };

  const handleOpenInNewTab = () => {
    if (!fileData) return;
    try {
      const win = window.open();
      if (win) {
        if (isPdf) {
          win.document.write(
            `<iframe src="${fileData}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`
          );
        } else if (isImage) {
          win.document.write(
            `<body style="margin:0; background:#0b132b; display:flex; justify-content:center; align-items:center; min-height:100vh;"><img src="${fileData}" style="max-width:100%; max-height:100vh; object-fit:contain;" /></body>`
          );
        } else {
          win.location.href = fileData;
        }
      }
    } catch {
      window.open(fileData, '_blank');
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const modal = (
    <div
      className="fixed inset-0 z-[9999] overflow-y-auto bg-ink-950/90 backdrop-blur-md p-3 sm:p-6 flex flex-col justify-center animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="relative w-full max-w-4xl max-h-[92vh] rounded-3xl bg-ink-900 border border-white/10 shadow-2xl flex flex-col overflow-hidden m-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header Bar */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between gap-3 bg-ink-950/80">
          <div className="flex items-center gap-3 truncate">
            <div className="w-10 h-10 rounded-xl bg-coral-500/10 text-coral-400 border border-coral-500/20 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="truncate">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white truncate font-display">
                  {doc.title}
                </h3>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20">
                  {doc.category?.replace('_', ' ')}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate flex items-center gap-2 mt-0.5">
                <span>{fileName}</span>
                {doc.fileSize && (
                  <>
                    <span>•</span>
                    <span className="font-mono">{formatFileSize(doc.fileSize)}</span>
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Image zoom & rotate controls */}
            {isImage && !loading && (
              <div className="hidden sm:flex items-center gap-1 bg-ink-900 rounded-xl p-1 border border-white/10 mr-1">
                <button
                  onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-[10px] font-mono text-slate-400 px-1 min-w-[36px] text-center">
                  {Math.round(zoom * 100)}%
                </span>
                <button
                  onClick={() => setZoom((z) => Math.min(3, z + 0.25))}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setRotation((r) => (r + 90) % 360)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                  title="Rotate 90° Clockwise"
                >
                  <RotateCw className="w-4 h-4" />
                </button>
                {(zoom !== 1 || rotation !== 0) && (
                  <button
                    onClick={() => {
                      setZoom(1);
                      setRotation(0);
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-coral-400 hover:bg-white/5 transition-colors"
                    title="Reset Zoom & Rotation"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}

            <button
              onClick={handleOpenInNewTab}
              disabled={loading || !fileData}
              className="p-2 rounded-xl bg-ink-900 hover:bg-ink-800 border border-white/10 text-slate-300 hover:text-white transition-colors"
              title="Open in new window / tab"
            >
              <ExternalLink className="w-4 h-4" />
            </button>

            <button
              onClick={handleDownload}
              disabled={loading || !fileData}
              className="px-3 py-1.5 rounded-xl bg-teal-500 hover:bg-teal-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-glow transition-all"
              title="Download file"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Download</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
              title="Close (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Content Body */}
        <div className="relative flex-1 overflow-auto p-4 sm:p-6 bg-ink-950 flex items-center justify-center min-h-[50vh] max-h-[75vh]">
          {loading ? (
            <div className="flex flex-col items-center justify-center gap-3 text-slate-400 py-16">
              <Loader2 className="w-8 h-8 text-coral-500 animate-spin" />
              <p className="text-xs font-semibold">Loading secure document preview...</p>
            </div>
          ) : !fileData ? (
            <div className="text-center text-slate-400 py-12 flex flex-col items-center gap-2">
              <AlertCircle className="w-8 h-8 text-rose-400" />
              <p className="text-xs text-rose-300 font-semibold">Could not load document preview data.</p>
              <button
                onClick={handleDownload}
                className="mt-2 px-4 py-2 rounded-xl bg-ink-900 border border-white/10 text-xs text-white"
              >
                Download File Directly
              </button>
            </div>
          ) : isImage ? (
            /* Image Preview */
            <div className="w-full h-full flex items-center justify-center overflow-auto p-2">
              <img
                src={fileData}
                alt={doc.title}
                style={{
                  transform: `scale(${zoom}) rotate(${rotation}deg)`,
                  transition: 'transform 0.15s ease-out',
                }}
                className="max-w-full max-h-[68vh] object-contain rounded-xl shadow-2xl origin-center"
              />
            </div>
          ) : isPdf ? (
            /* PDF Preview */
            <div className="w-full h-[68vh] rounded-2xl overflow-hidden border border-white/10 bg-slate-900 shadow-inner">
              <object
                data={`${fileData}#toolbar=1&navpanes=0`}
                type="application/pdf"
                className="w-full h-full rounded-2xl"
              >
                {/* Fallback iframe */}
                <iframe
                  src={`${fileData}#toolbar=1`}
                  title={doc.title}
                  className="w-full h-full rounded-2xl border-0"
                >
                  <div className="p-8 text-center text-slate-400 text-xs">
                    <p>PDF preview is not supported directly in your browser.</p>
                    <button
                      onClick={handleDownload}
                      className="mt-3 px-4 py-2 rounded-xl bg-teal-500 text-white font-bold"
                    >
                      Download PDF
                    </button>
                  </div>
                </iframe>
              </object>
            </div>
          ) : isText ? (
            /* Text File Preview */
            <div className="w-full h-[65vh] p-4 rounded-2xl bg-ink-900 border border-white/10 overflow-auto font-mono text-xs text-slate-200 whitespace-pre-wrap selection:bg-coral-500/30">
              {atob(fileData.split(',')[1] || '')}
            </div>
          ) : (
            /* Word / Excel / Office / Other Document Preview Card */
            <div className="p-8 rounded-3xl bg-ink-900 border border-white/10 text-center max-w-md flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-coral-500/10 text-coral-400 border border-coral-500/20 flex items-center justify-center">
                <FileCheck className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white font-display mb-1">{fileName}</h4>
                <p className="text-xs text-slate-400">
                  {ext.toUpperCase()} Document ({formatFileSize(doc.fileSize)})
                </p>
                <p className="text-[11px] text-slate-500 mt-2">
                  This document type is formatted for external desktop and mobile viewers (such as Microsoft Office, Word, or Pages).
                </p>
              </div>

              <div className="flex items-center gap-3 mt-2">
                <button
                  onClick={handleDownload}
                  className="px-5 py-2.5 rounded-xl bg-coral-500 hover:bg-coral-600 text-white text-xs font-bold flex items-center gap-2 shadow-glow transition-all"
                >
                  <Download className="w-4 h-4" /> Download & View Document
                </button>
                <button
                  onClick={handleOpenInNewTab}
                  className="px-4 py-2.5 rounded-xl bg-ink-950 hover:bg-ink-800 border border-white/10 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" /> Open Tab
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Info */}
        <div className="px-6 py-3 bg-ink-950/80 border-t border-white/5 text-[11px] text-slate-400 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {doc.memberName && doc.memberName !== 'All Travelers' && (
              <span className="font-semibold text-coral-400">
                Belongs to {doc.memberName}
              </span>
            )}
            <span>
              Uploaded by <strong className="text-slate-300">{fileDetails?.uploadedByName || doc.uploadedByName || 'Traveler'}</strong>
            </span>
          </div>

          {doc.notes && (
            <div className="flex items-center gap-1.5 text-slate-400">
              <span className="font-semibold text-slate-300">Notes:</span>
              <span>{doc.notes}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modal, document.body) : modal;
};
