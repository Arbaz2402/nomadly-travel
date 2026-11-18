import { Trip } from '../models/Trip.js';
import { TripDocument } from '../models/TripDocument.js';
import { logTripActivity as logActivity } from '../services/trip/tripService.js';

export const getTripDocuments = async (req, res) => {
  try {
    const trip = req.trip;
    // Omit large base64 fileData when listing documents for fast response
    const documents = await TripDocument.find({ trip: trip._id })
      .select('-fileData')
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, count: documents.length, data: documents });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const uploadTripDocument = async (req, res) => {
  try {
    const trip = req.trip;
    const { title, category, fileName, fileType, fileSize, fileData, notes } = req.body;

    if (!title || !fileName || !fileData) {
      return res.status(400).json({
        success: false,
        message: 'Title, file name, and file data payload are required.',
      });
    }

    // Limit document size to 10MB
    const MAX_BYTES = 10 * 1024 * 1024;
    if (fileSize && Number(fileSize) > MAX_BYTES) {
      return res.status(400).json({
        success: false,
        message: 'File size exceeds the 10MB maximum limit.',
      });
    }

    const newDoc = await TripDocument.create({
      trip: trip._id,
      title: title.trim(),
      category: category || 'other',
      fileName,
      fileType: fileType || 'application/octet-stream',
      fileSize: Number(fileSize) || fileData.length,
      fileData,
      uploadedBy: req.user._id,
      uploadedByName: req.user.displayName || 'You',
      notes: notes || '',
    });

    await logActivity(
      trip._id,
      req.user,
      'UPLOADED_DOCUMENT',
      `Uploaded document "${newDoc.title}" (${newDoc.category})`
    );

    // Return without full fileData
    const docObj = newDoc.toObject();
    delete docObj.fileData;

    return res.status(201).json({ success: true, data: docObj });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const downloadTripDocument = async (req, res) => {
  try {
    const trip = req.trip;
    const doc = await TripDocument.findOne({ _id: req.params.docId, trip: trip._id });

    if (!doc) {
      return res.status(404).json({ success: false, message: 'Document not found.' });
    }

    return res.status(200).json({
      success: true,
      data: {
        title: doc.title,
        fileName: doc.fileName,
        fileType: doc.fileType,
        fileSize: doc.fileSize,
        fileData: doc.fileData,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteTripDocument = async (req, res) => {
  try {
    const trip = req.trip;
    const doc = await TripDocument.findOneAndDelete({ _id: req.params.docId, trip: trip._id });

    if (!doc) {
      return res.status(404).json({ success: false, message: 'Document not found.' });
    }

    await logActivity(trip._id, req.user, 'DELETED_DOCUMENT', `Deleted document "${doc.title}"`);

    return res.status(200).json({ success: true, message: 'Document deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 8. TRIP ACTIVITY LOGS
// ==========================================
