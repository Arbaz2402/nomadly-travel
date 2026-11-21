import React, { useState } from 'react';
import {
  Upload,
  FileText,
  Download,
  Trash2,
  Eye,
  Plane,
  Building2,
  Train,
  Bus,
  ShieldCheck,
  Receipt,
  CreditCard,
  Image as ImageIcon
} from 'lucide-react';
import { ApiClient } from '../../../services/api';
import { useToast } from '../../../context/ToastContext';
import { formatDate } from '../../../utils/formatters';
import { DocumentPreviewModal } from '../modals/DocumentPreviewModal';

const getCategoryIcon = (category) => {
  switch (category) {
    case 'flight_ticket':
      return <Plane className="w-5 h-5 text-coral-400" />;
    case 'hotel_confirmation':
      return <Building2 className="w-5 h-5 text-teal-400" />;
    case 'train_ticket':
      return <Train className="w-5 h-5 text-amber-400" />;
    case 'bus_ticket':
      return <Bus className="w-5 h-5 text-emerald-400" />;
    case 'travel_insurance':
      return <ShieldCheck className="w-5 h-5 text-blue-400" />;
    case 'expense_receipt':
      return <Receipt className="w-5 h-5 text-purple-400" />;
    case 'passport_visa':
      return <CreditCard className="w-5 h-5 text-rose-400" />;
    default:
      return <FileText className="w-5 h-5 text-coral-400" />;
  }
};

export const DocumentsView = ({ trip, documents = [], canEdit, onRefresh, onOpenUpload }) => {
  const { showToast } = useToast();
  const [previewDoc, setPreviewDoc] = useState(null);

  const handleDownload = async (docId, fileName) => {
    try {
      const res = await ApiClient.downloadTripDocument(trip._id, docId);
      if (res.success && res.data?.fileData) {
        const link = document.createElement('a');
        link.href = res.data.fileData;
        link.download = fileName || 'document.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast('Document downloaded', 'success');
      }
    } catch (err) {
      showToast('Download failed: ' + err.message, 'error');
    }
  };

  const handleDelete = async (docId, title) => {
    if (!window.confirm(`Delete document "${title}"?`)) return;
    try {
      const res = await ApiClient.deleteTripDocument(trip._id, docId);
      if (res.success) {
        showToast('Document removed', 'info');
        onRefresh();
      }
    } catch (err) {
      showToast(err.message || 'Failed to delete document', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-ink-900/60 p-4 rounded-2xl border border-white/5">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-white font-display">Private Travel Documents Locker</h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20">
              Live Preview
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Preview, zoom, rotate, and securely download boarding passes, ID cards, passport scans, and vouchers.
          </p>
        </div>

        {canEdit && (
          <button
            onClick={onOpenUpload}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-coral-500 to-coral-600 hover:from-coral-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-glow transition-all shrink-0"
          >
            <Upload className="w-4 h-4" /> Upload Document
          </button>
        )}
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {documents.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400 text-xs glass-panel rounded-3xl border border-white/10 flex flex-col items-center gap-2">
            <FileText className="w-8 h-8 text-slate-500" />
            <span className="font-semibold text-slate-300">No travel documents uploaded yet.</span>
            <span>Upload tickets, vouchers, passport scans, or ID cards to preview and access them anywhere.</span>
          </div>
        ) : (
          documents.map((doc) => {
            const ext = doc.fileName?.split('.').pop()?.toUpperCase() || 'DOC';
            const isImage = ['JPG', 'JPEG', 'PNG', 'WEBP', 'GIF'].includes(ext);

            return (
              <div
                key={doc._id}
                className="group p-5 rounded-2xl bg-ink-900/80 border border-white/10 hover:border-white/25 transition-all flex flex-col justify-between space-y-4 hover:shadow-xl relative"
              >
                {/* Clickable Header for Instant Preview */}
                <div
                  onClick={() => setPreviewDoc(doc)}
                  className="flex items-start gap-3 cursor-pointer"
                >
                  <div className="w-11 h-11 rounded-xl bg-ink-950 border border-white/10 flex items-center justify-center shrink-0 group-hover:border-coral-500/40 transition-colors shadow-inner">
                    {getCategoryIcon(doc.category)}
                  </div>
                  <div className="truncate flex-1">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <span className="text-[10px] uppercase font-bold text-teal-400 truncate">
                        {doc.category?.replace('_', ' ')}
                      </span>
                      <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-white/5 text-slate-400 border border-white/5">
                        {ext}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-white truncate group-hover:text-coral-300 transition-colors">
                      {doc.title}
                    </h4>
                    <p className="text-[11px] text-slate-400 truncate">{doc.fileName}</p>
                  </div>
                </div>

                {/* Footer Action Buttons */}
                <div className="flex items-center justify-between pt-3 border-t border-white/5 text-xs">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPreviewDoc(doc)}
                      className="px-2.5 py-1 rounded-lg bg-coral-500/10 hover:bg-coral-500/20 text-coral-300 hover:text-white border border-coral-500/30 flex items-center gap-1 font-bold transition-all text-xs"
                      title="Preview document inline"
                    >
                      <Eye className="w-3.5 h-3.5" /> Preview
                    </button>

                    <button
                      onClick={() => handleDownload(doc._id, doc.fileName)}
                      className="text-slate-400 hover:text-teal-300 flex items-center gap-1 font-medium transition-colors"
                      title="Download file"
                    >
                      <Download className="w-3.5 h-3.5" /> Download
                    </button>
                  </div>

                  {canEdit && (
                    <button
                      onClick={() => handleDelete(doc._id, doc.title)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Delete document"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Document Live Preview Modal */}
      {previewDoc && (
        <DocumentPreviewModal
          trip={trip}
          doc={previewDoc}
          isOpen={Boolean(previewDoc)}
          onClose={() => setPreviewDoc(null)}
        />
      )}
    </div>
  );
};
