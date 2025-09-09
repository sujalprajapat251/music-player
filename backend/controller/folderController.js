const newfolder = require('../models/folderModel'); // Adjust path as needed
// const jwt = require('jsonwebtoken');
const mongoose = require("mongoose");


const createNewFolder = async (req, res) => {
    try {
      // console.log("req", req.body);
      const { folderName } = req.body;
    //   const photo = req.file ? req.file.path : "";
  
      if (!folderName ) {
        return res
          .status(400)
          .json({ message: "Folder Name is required" });
      }
  
      // Create a deep copy of the default flow diagram to avoid reference issues
      const newFolderData = {
        userId: req.user._id,
       folderName
      };
  
      // console.log("newFolderData: ", newFolderData);
     
  
      const newAddFolder = await newfolder.create(newFolderData);
      res.status(201).json({
        success: true,
        message: "New Folder created successfully..!",
        newfolder: newAddFolder,
      });
    } catch (error) {
      console.error("Error creating New Folder:", error);
      res.status(500).json({
        success: false,
        message: "Error creating New Folder",
        error: error.message,
      });
    }
  };

  const getFolderByUserId = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!userId) {
          return res.status(400).json({
            success: false,
            message: "UserId is required",
          });
        }

    const newAddFolder = await newfolder.find({ userId });

    res.status(200).json({
      success: true,
      message: "Folders retrieved successfully..!",
      newAddFolder,
    });
  } catch (error) {
    console.error("Error fetching Folders:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching Folders",
      error: error.message,
    });
    }
  };


  const updateFolderName = async (req, res) => {
    try {
      const folderId = req.params.id;
      const { folderName } = req.body;
  
      // Validate input
      if (!folderName) {
        return res.status(400).json({
          success: false,
          message: "Folder name is required"
        });
      }
  
      // Find the folder by ID (corrected the query)
      const folder = await newfolder.findById(folderId);
      
      if (!folder) {
        return res.status(404).json({
          success: false,
          message: "Folder not found"
        });
      }
  
      // Check if user has permission to update this folder
      if (folder.userId.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to update this folder"
        });
      }
  
      // Update the folder name
      folder.folderName = folderName.trim();
      await folder.save();
  
      res.status(200).json({
        success: true,
        message: "Folder updated successfully..!",
        folder,
      });
    } catch (error) {
      console.error("Error updating folder:", error);
      res.status(500).json({
        success: false,
        message: "Error updating folder",
        error: error.message,
      });
    }
  };
  
  const deleteFolderById = async (req, res) => {
    try {
      const folderId = req.params.id;
  
      // Find the folder by ID
      const folder = await newfolder.findById(folderId);
      
      if (!folder) {
        return res.status(404).json({
          success: false,
          message: "Folder not found"
        });
      }
  
      // Check if user has permission to delete this folder
      // if (folder.userId.toString() !== req.user._id.toString()) {
      //   return res.status(403).json({
      //     success: false,
      //     message: "Not authorized to delete this folder"
      //   });
      // }
  
      // Delete the folder
      await newfolder.findByIdAndDelete(folderId);
  
      res.status(200).json({
        success: true,
        message: "Folder deleted successfully..!",
      });
    } catch (error) {
      console.error("Error deleting folder:", error);
      res.status(500).json({
        success: false,
        message: "Error deleting folder",
        error: error.message,
      });
    }
  };

  module.exports = {
    createNewFolder,
    getFolderByUserId,
    updateFolderName,
    deleteFolderById
  }

