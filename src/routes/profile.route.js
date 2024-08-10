const express = require("express");

const router = express.Router();

const {
  createProfile,
  getProfile,
  updateProfile,
  deleteProfile,
  uploadProfileImage,
  getProfiles,
  searchProfiles,
} = require("../controllers/profile.controller");

const verifyToken = require("../functions/verifyToken.middleware");

const uploadImages = require("../functions/fileupload.middleware");

// Create a new profile
router.post("/", verifyToken, createProfile);

router.get("/search", verifyToken, searchProfiles);

// Get profile by user ID
router.get("/:userId", verifyToken, getProfile);

// Update profile
router.put("/:userId", verifyToken, updateProfile);

// Upload profile image
router.post("/:userId/upload-image", verifyToken, uploadImages, uploadProfileImage);

// Delete profile
router.delete("/:userId", verifyToken, deleteProfile);

router.get("/", verifyToken, getProfiles);

module.exports = router;
