import React from 'react';
import { UploadCloud, FileText, Download, Trash2, Eye } from 'lucide-react';
import { ApiClient } from '../../../services/api';
import { useToast } from '../../../context/ToastContext';
import { formatDate } from '../../../utils/formatters';

export const DocumentsView = ({ trip, documents, canEdit, onRefresh, onOpenUpload }) => {
  const { showToast } = useToast();

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
      <div className="flex items-center justify-between bg-ink-900/60 p-4 rounded-2xl border border-white/5">
        <div>
          <h3 className="text-base font-bold text-white font-display">Private Travel Documents Locker</h3>
          <p className="text-xs text-slate-400">
            Securely store flight boarding passes, hotel confirmations, insurance policies, and receipts.
          </p>
        </div>

        {canEdit && (
          <button
            onClick={onOpenUpload}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-coral-500 to-coral-600 hover:from-coral-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-glow"
          >
            <Upload className="w-4 h-4" /> Upload Document
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {documents.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400 text-xs glass-panel rounded-3xl border border-white/10">
            No travel documents uploaded yet. Keep your tickets & vouchers safely backed up here.
          </div>
        ) : (
          documents.map((doc) => (
            <div
              key={doc._id}
              className="p-5 rounded-2xl bg-ink-900/80 border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between space-y-4"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-ink-950 border border-white/10 text-coral-400 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-teal-400">
                    {doc.category?.replace('_', ' ')}
                  </span>
                  <h4 className="text-sm font-bold text-white truncate">{doc.title}</h4>
                  <p className="text-[11px] text-slate-400 truncate">{doc.fileName}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-white/5 text-xs">
                <button
                  onClick={() => handleDownload(doc._id, doc.fileName)}
                  className="text-teal-400 hover:underline flex items-center gap-1 font-semibold"
                >
                  <Download className="w-3.5 h-3.5" /> Download
                </button>

                {canEdit && (
                  <button
                    onClick={() => handleDelete(doc._id, doc.title)}
                    className="text-slate-500 hover:text-rose-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// =========================================================
// SUB-COMPONENT: COLLABORATION & MEMBERS
// =========================================================