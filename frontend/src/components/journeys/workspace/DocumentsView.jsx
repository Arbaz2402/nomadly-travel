import React, { useState, useMemo } from 'react';
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
  User,
  Users,
  Lock,
  Calendar,
  Filter
} from 'lucide-react';
import { ApiClient } from '../../../services/api';
import { useToast } from '../../../context/ToastContext';
import { formatDate } from '../../../utils/formatters';
import { useAuthStore } from '../../../store/authStore';
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
  const { user } = useAuthStore();
  const [previewDoc, setPreviewDoc] = useState(null);
  const [selectedMemberFilter, setSelectedMemberFilter] = useState('ALL');

  // Check if current user is journey owner
  const isTripOwner = useMemo(() => {
    if (!user?._id) return false;
    const currentUserId = user._id.toString();
    const tripCreatorId = trip?.user?._id ? trip.user._id.toString() : trip?.user ? trip.user.toString() : '';
    if (tripCreatorId && tripCreatorId === currentUserId) return true;
    return Boolean(
      trip?.participants?.some(
        (p) => (p.user?._id?.toString() === currentUserId || p.user?.toString() === currentUserId) && p.role === 'owner'
      )
    );
  }, [trip, user]);

  // Check if a specific document can be deleted by the current user
  const canDeleteDoc = (doc) => {
    if (!canEdit) return false;
    if (isTripOwner) return true; // Owner can delete any document
    if (!user?._id) return false;

    const currentUserId = user._id.toString();
    const uploaderId = doc.uploadedBy?._id ? doc.uploadedBy._id.toString() : doc.uploadedBy ? doc.uploadedBy.toString() : '';
    if (uploaderId && uploaderId === currentUserId) return true; // Uploader can delete their own document

    if (doc.uploadedByName && user.displayName && doc.uploadedByName.toLowerCase() === user.displayName.toLowerCase()) {
      return true;
    }
    return false;
  };

  // Group / filter options by traveler
  const memberOptions = useMemo(() => {
    const counts = {};
    documents.forEach((d) => {
      const name = d.memberName && d.memberName.trim() !== '' ? d.memberName.trim() : 'All Travelers';
      counts[name] = (counts[name] || 0) + 1;
    });

    const list = Object.keys(counts).map((name) => ({
      name,
      count: counts[name],
    }));

    return list;
  }, [documents]);

  const filteredDocuments = useMemo(() => {
    if (selectedMemberFilter === 'ALL') return documents;
    return documents.filter((d) => {
      const name = d.memberName && d.memberName.trim() !== '' ? d.memberName.trim() : 'All Travelers';
      return name === selectedMemberFilter;
    });
  }, [documents, selectedMemberFilter]);

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
            Organized by traveler (Arbaz, Shahbaz, etc.) with universal access, uploader tracking, and owner-only deletion protection.
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

      {/* Traveler Organization Filter Pills */}
      {documents.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-bold mr-1 shrink-0">
            <Filter className="w-3.5 h-3.5 text-coral-400" />
            <span>Arrange by:</span>
          </div>

          <button
            onClick={() => setSelectedMemberFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
              selectedMemberFilter === 'ALL'
                ? 'bg-coral-500 text-white shadow-glow'
                : 'bg-ink-900/80 border border-white/5 text-slate-400 hover:text-white hover:border-white/20'
            }`}
          >
            <span>All Documents</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/20 font-mono">
              {documents.length}
            </span>
          </button>

          {memberOptions.map((opt) => {
            const isSelected = selectedMemberFilter === opt.name;
            const isShared = opt.name === 'All Travelers';
            return (
              <button
                key={opt.name}
                onClick={() => setSelectedMemberFilter(opt.name)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                  isSelected
                    ? 'bg-coral-500 text-white shadow-glow'
                    : 'bg-ink-900/80 border border-white/5 text-slate-400 hover:text-white hover:border-white/20'
                }`}
              >
                {isShared ? <Users className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                <span>{isShared ? 'Shared Group' : `${opt.name}'s`}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/20 font-mono">
                  {opt.count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Documents Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {filteredDocuments.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400 text-xs glass-panel rounded-3xl border border-white/10 flex flex-col items-center gap-2">
            <FileText className="w-8 h-8 text-slate-500" />
            <span className="font-semibold text-slate-300">
              {documents.length === 0
                ? 'No travel documents uploaded yet.'
                : `No documents found for ${selectedMemberFilter}.`}
            </span>
            <span>
              {documents.length === 0
                ? 'Upload tickets, vouchers, passport scans, or ID cards to preview and access them anywhere.'
                : 'Switch filters above or upload a document assigned to this traveler.'}
            </span>
          </div>
        ) : (
          filteredDocuments.map((doc) => {
            const ext = doc.fileName?.split('.').pop()?.toUpperCase() || 'DOC';
            const isShared = !doc.memberName || doc.memberName === 'All Travelers';
            const userCanDelete = canDeleteDoc(doc);

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

                {/* Member Assignment & Uploader Info Badge */}
                <div className="space-y-1 pt-1 border-t border-white/5 text-[11px]">
                  {/* Belongs to traveler */}
                  <div className="flex items-center gap-1.5 text-slate-300">
                    {isShared ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/5 text-slate-300 font-semibold text-[10px]">
                        <Users className="w-3 h-3 text-slate-400" /> Shared Group Document
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-coral-500/10 text-coral-300 font-semibold text-[10px] border border-coral-500/20">
                        <User className="w-3 h-3 text-coral-400" /> Belongs to {doc.memberName}
                      </span>
                    )}
                  </div>

                  {/* Uploaded By & Date */}
                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                    <span className="truncate">
                      Uploaded by <strong className="text-slate-300">{doc.uploadedByName || 'Traveler'}</strong>
                    </span>
                    {doc.createdAt && (
                      <span className="text-slate-500 shrink-0 ml-1">
                        {formatDate(doc.createdAt)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Footer Action Buttons */}
                <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs">
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

                  {/* Protected Delete: Only uploader or trip owner can delete */}
                  {userCanDelete ? (
                    <button
                      onClick={() => handleDelete(doc._id, doc.title)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Delete document (You uploaded this or own the trip)"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <span
                      className="p-1.5 rounded-lg text-slate-600 cursor-not-allowed"
                      title={`Protected: Only ${doc.uploadedByName || 'uploader'} or the journey owner can delete this`}
                    >
                      <Lock className="w-3.5 h-3.5" />
                    </span>
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
