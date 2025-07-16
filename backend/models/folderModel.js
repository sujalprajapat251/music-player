const mongoose = require('mongoose')

const folderSchema = mongoose.Schema({
    folderName: {
        type: String,
        require: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        require: true
    }
}, {
    timestamps: true,
    versionKey: false
});

module.exports = mongoose.model('newfolder', folderSchema)





const deleteFolder = async (req, res) => {
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
      if (folder.userId.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to delete this folder"
        });
      }
  
      // Delete the folder
      await newfolder.findByIdAndDelete(folderId);
  
      res.status(200).json({
        success: true,
        message: "Folder deleted successfully",
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