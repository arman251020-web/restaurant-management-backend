
const express = require("express");
const mongoose = require("mongoose");

const Menu = require("../models/Menu");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

const router = express.Router();

router.post("/", auth, admin, async (req, res) => {
    try {
        const {
            name,
            category,
            price,
            description,
            image_url,
            is_available
        } = req.body;
        if (!name || !category || price === undefined || !description) {
            return res.status(400).json({
                message: "Name, category, price and description are required"
            });
        }
        const menuItem = await Menu.create({
            name,
            category,
            price,
            description,
            image_url,
            is_available
        });
        return res.status(201).json({
            message: "Food item added successfully",
            menuItem
        });
    } catch (error) {
        if (error.name === "ValidationError") {
            return res.status(400).json({
                message: error.message
            });
        }
        return res.status(500).json({
            message: "Failed to add food item"
        });
    }
});


router.get("/", async (req, res) => {
    try {
        const { search, category } = req.query;
        const filter = {
            is_available: true
        };
        if (category) {
            filter.category = category;
        }
        if (search) {
            filter.name = {
                $regex: search,
                $options: "i"
            };
        }
        const menuItems = await Menu.find(filter).sort({
            createdAt: -1
        });
        return res.status(200).json({
            count: menuItems.length,
            menuItems
        });
    } catch (error) {
        return res.status(500).json({
            message: "Failed to fetch menu"
        });
    }
});

router.put("/:id", auth, admin, async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                message: "Invalid menu item ID"
            });
        }
        const allowedFields = [
            "name",
            "category",
            "price",
            "description",
            "image_url",
            "is_available"
        ];

        const updates = {};
        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        }
        if (Object.keys(updates).length === 0) {
            return res.status(400).json({
                message: "Provide at least one valid field to update"
            });
        }
        const menuItem = await Menu.findByIdAndUpdate(
            id,
            { $set: updates },
            {
                new: true,
                runValidators: true
            }
        );
        if (!menuItem) {
            return res.status(404).json({
                message: "Food item not found"
            });
        }
        return res.status(200).json({
            message: "Food item updated successfully",
            menuItem
        });
    } catch (error) {
        if (error.name === "ValidationError") {
            return res.status(400).json({
                message: error.message
            });
        }
        return res.status(500).json({
            message: "Failed to update food item"
        });
    }
});


router.delete("/:id", auth, admin, async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                message: "Invalid menu item ID"
            });
        }
        const menuItem = await Menu.findByIdAndDelete(id);
        if (!menuItem) {
            return res.status(404).json({
                message: "Food item not found"
            });
        }
  return res.status(200).json({
            message: "Food item deleted successfully"
        });
    } catch (error) {
        return res.status(500).json({
            message: "Failed to delete food item"
        });
    }
});




module.exports = router;
