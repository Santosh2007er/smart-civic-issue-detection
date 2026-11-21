const ComplaintModel = require('../models/complaintModel');

exports.createComplaint = async (req, res) => {
  try {
    const {
      title,
      description,
      categoryId,
      categoryName,
      severity,
      aiDetectedCategory,
      aiConfidence,
      isAiCorrected,
      latitude,
      longitude,
      address,
      landmark,
      ward,
      postalCode,
      sampleImageUrl
    } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: 'Title and detailed issue description are required.'
      });
    }

    // Determine image URL
    let imageUrl = '/uploads/samples/pothole1.jpg';
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    } else if (sampleImageUrl) {
      imageUrl = sampleImageUrl;
    }

    const complaintData = {
      userId: req.user ? req.user.id : null,
      citizenName: req.user ? req.user.fullName : (req.body.citizenName || 'Concerned Citizen'),
      citizenEmail: req.user ? req.user.email : (req.body.citizenEmail || 'citizen@ritchennai.edu.in'),
      categoryId: parseInt(categoryId, 10) || 1,
      categoryName: categoryName || 'Potholes',
      title,
      description,
      imageUrl,
      severity: severity || 'Medium',
      aiDetectedCategory: aiDetectedCategory || categoryName || 'Potholes',
      aiConfidence: parseFloat(aiConfidence) || 95.0,
      isAiCorrected: isAiCorrected === 'true' || isAiCorrected === true || isAiCorrected === 1,
      latitude: parseFloat(latitude) || 13.0125,
      longitude: parseFloat(longitude) || 80.0041,
      address: address || 'Bangalore High Road, Chembarambakkam, Chennai',
      landmark: landmark || 'Near Rajalakshmi Institute of Technology',
      ward: ward || 'Ward 14',
      postalCode: postalCode || '600124'
    };

    const newComplaint = await ComplaintModel.create(complaintData);

    return res.status(201).json({
      success: true,
      message: 'Civic issue complaint registered successfully.',
      tracking_id: newComplaint.tracking_id,
      complaint: newComplaint
    });
  } catch (err) {
    console.error('Create Complaint Error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to record civic issue complaint.',
      error: err.message
    });
  }
};

exports.getComplaints = async (req, res) => {
  try {
    const { search, category, status, severity, userId } = req.query;
    const complaints = await ComplaintModel.getAll({ search, category, status, severity, userId });
    return res.status(200).json({
      success: true,
      count: complaints.length,
      data: complaints
    });
  } catch (err) {
    console.error('Get Complaints Error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch complaints list.',
      error: err.message
    });
  }
};

exports.getComplaintById = async (req, res) => {
  try {
    const { id } = req.params;
    const complaint = await ComplaintModel.getById(id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: `Complaint with tracking identifier '${id}' was not found.`
      });
    }

    return res.status(200).json({
      success: true,
      data: complaint
    });
  } catch (err) {
    console.error('Get Single Complaint Error:', err);
    return res.status(500).json({
      success: false,
      message: 'Error looking up complaint record.',
      error: err.message
    });
  }
};

exports.updateComplaintStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { statusId, adminNotes } = req.body;

    if (!statusId) {
      return res.status(400).json({
        success: false,
        message: 'Valid status ID (1: Submitted, 2: Under Review, 3: Work in Progress, 4: Resolved) is required.'
      });
    }

    const updated = await ComplaintModel.updateStatus(id, {
      statusId: parseInt(statusId, 10),
      adminNotes
    });

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Complaint record not found.'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Complaint status updated successfully.',
      data: updated
    });
  } catch (err) {
    console.error('Update Status Error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to update complaint status.',
      error: err.message
    });
  }
};

exports.getStats = async (req, res) => {
  try {
    const stats = await ComplaintModel.getStats();
    return res.status(200).json({
      success: true,
      data: stats
    });
  } catch (err) {
    console.error('Stats Error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to calculate civic statistics.',
      error: err.message
    });
  }
};
