import React from 'react';
import { AttachBookingModal } from '../AttachBookingModal';
import { AddActivityModal } from '../modals/AddActivityModal';
import { AddExpenseModal } from '../modals/AddExpenseModal';
import { SettleUpModal } from '../modals/SettleUpModal';
import { AddMemberModal } from '../modals/AddMemberModal';
import { UploadDocModal } from '../modals/UploadDocModal';
import { AIModifyActivityModal } from '../modals/AIModifyActivityModal';
import { EditActivityModal } from '../modals/EditActivityModal';

export const TripModalsManager = ({
  trip,
  itinerary,
  activeTab,
  attachModalOpen,
  setAttachModalOpen,
  addActivityOpen,
  setAddActivityOpen,
  addExpenseOpen,
  setAddExpenseOpen,
  editingExpense,
  setEditingExpense,
  settleUpModalOpen,
  setSettleUpModalOpen,
  settleUpData,
  setSettleUpData,
  addMemberOpen,
  setAddMemberOpen,
  uploadDocOpen,
  setUploadDocOpen,
  aiModifyModalOpen,
  setAiModifyModalOpen,
  aiModifyTargetItem,
  setAiModifyTargetItem,
  editActivityModalOpen,
  setEditActivityModalOpen,
  editTargetItem,
  setEditTargetItem,
  onTripDataRefresh,
  onTabRefresh,
}) => {
  return (
    <>
      {/* Attach Booking Modal */}
      <AttachBookingModal
        trip={trip}
        isOpen={attachModalOpen}
        onClose={() => setAttachModalOpen(false)}
        onAttached={() => {
          onTripDataRefresh();
          onTabRefresh(activeTab);
        }}
      />

      {/* Add Activity Modal */}
      {addActivityOpen && (
        <AddActivityModal
          trip={trip}
          isOpen={addActivityOpen}
          onClose={() => setAddActivityOpen(false)}
          onCreated={() => {
            onTripDataRefresh();
            onTabRefresh('itinerary');
          }}
        />
      )}

      {/* Add / Edit Expense Modal */}
      {(addExpenseOpen || Boolean(editingExpense)) && (
        <AddExpenseModal
          trip={trip}
          isOpen={Boolean(addExpenseOpen || editingExpense)}
          expenseToEdit={editingExpense}
          onClose={() => {
            setAddExpenseOpen(false);
            if (setEditingExpense) setEditingExpense(null);
          }}
          onCreated={() => {
            onTripDataRefresh();
            onTabRefresh('expenses');
            onTabRefresh('splitting');
            onTabRefresh('overview');
          }}
        />
      )}

      {/* Settle Up Debt Payment Modal */}
      {settleUpModalOpen && (
        <SettleUpModal
          trip={trip}
          isOpen={settleUpModalOpen}
          initialData={settleUpData}
          onClose={() => {
            setSettleUpModalOpen(false);
            if (setSettleUpData) setSettleUpData(null);
          }}
          onSettled={() => {
            onTripDataRefresh();
            onTabRefresh('expenses');
            onTabRefresh('splitting');
            onTabRefresh('overview');
          }}
        />
      )}

      {/* Add Member Modal */}
      {addMemberOpen && (
        <AddMemberModal
          trip={trip}
          isOpen={addMemberOpen}
          onClose={() => setAddMemberOpen(false)}
          onCreated={() => {
            onTripDataRefresh();
            onTabRefresh('members');
          }}
        />
      )}

      {/* Upload Document Modal */}
      {uploadDocOpen && (
        <UploadDocModal
          trip={trip}
          isOpen={uploadDocOpen}
          onClose={() => setUploadDocOpen(false)}
          onUploaded={() => {
            onTripDataRefresh();
            onTabRefresh('documents');
          }}
        />
      )}

      {/* AI Modify / Swap Activity Modal */}
      {aiModifyModalOpen && aiModifyTargetItem && (
        <AIModifyActivityModal
          trip={trip}
          item={aiModifyTargetItem}
          itinerary={itinerary}
          isOpen={aiModifyModalOpen}
          onClose={() => {
            setAiModifyModalOpen(false);
            setAiModifyTargetItem(null);
          }}
          onUpdated={() => {
            onTripDataRefresh();
            onTabRefresh('itinerary');
            onTabRefresh('map');
          }}
        />
      )}

      {/* Edit Activity Modal */}
      {editActivityModalOpen && editTargetItem && (
        <EditActivityModal
          trip={trip}
          item={editTargetItem}
          isOpen={editActivityModalOpen}
          onClose={() => {
            setEditActivityModalOpen(false);
            setEditTargetItem(null);
          }}
          onUpdated={() => {
            onTripDataRefresh();
            onTabRefresh('itinerary');
            onTabRefresh('map');
          }}
        />
      )}
    </>
  );
};
