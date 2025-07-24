const category = require('../models/categoryModel');

exports.createCategory = async (req, res) => {
    try {
        const { name, type } = req.body;

        const existingCategory = await category.findOne({ name });
        if (existingCategory) {
            return res.status(409).json({ status: 409, message: "Category already exists." });
        }

        const newCategory = await category.create({
            name,
            type,
        });

        return res.status(200).json({
            status: 200,
            message: "Category created successfully..!",
            category: newCategory,
        });
    } catch (error) {
        return res.status(500).json({ status: 500, message: error.message });
    }
};

exports.getAllCategory = async (req, res) => {
    try {
        const categorydata = await category.find();
        if (!categorydata || categorydata.length === 0) {
            return res.status(404).json({ status: 404, message: "No category found." });
        }
        return res.status(200).json({
            status: 200,
            message: "All category fetched successfully..!",
            categorydata,
        });
    } catch (error) {
        return res.status(500).json({ status: 500, message: error.message });
    }
};

exports.getCategoryById = async (req, res) => {
    try {
        const categorydata = await category.findById(req.params.id);
        if (!categorydata) {
            return res.status(404).json({ status: 404, message: "Category not found." });
        }
        return res.status(200).json({
            status: 200,
            message: "Category fetched successfully.,.!",
            categorydata,
        });
    } catch (error) {
        return res.status(500).json({ status: 500, message: error.message });
    }
};

exports.updateCategory = async (req, res) => {
    try {
      const { name, type } = req.body;
  
      const updatedCategory = await category.findByIdAndUpdate(
        req.params.id,
        { name, type },
        { new: true, runValidators: true }
      );
  
      if (!updatedCategory) {
        return res.status(404).json({ status: 404, message: "Category not found." });
      }
  
      return res.status(200).json({
        status: 200,
        message: "Category updated successfully..!",
        category: updatedCategory,
      });
    } catch (error) {
      return res.status(500).json({ status: 500, message: error.message });
    }
  };

exports.deleteCategory = async (req, res) => {
    try {
        const categorydata = await category.findById(req.params.id);
        if (!categorydata) {
            return res.status(404).json({ status: 404, message: "Category not found." });
        }
        await category.findByIdAndDelete(req.params.id);
        return res.status(200).json({ status: 200, message: "Category deleted successfully..!" });
    } catch (error) {
        return res.status(500).json({ status: 500, message: error.message });
    }
};

