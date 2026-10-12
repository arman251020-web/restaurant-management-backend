
const express = require("express");
const mongoose = require("mongoose");

const Order = require("../models/Order");
const OrderItem = require("../models/OrderItem");
const Menu = require("../models/Menu");

const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

const router = express.Router();

router.post("/", auth, async (req, res) => {
    try {
        const { items } = req.body;
        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                message: "Order must contain at least one item"
            });
        }

        const quantities = new Map();
        for (const item of items) {
            if (
                !item.food_id ||
                !mongoose.isValidObjectId(item.food_id) ||
                !Number.isInteger(item.quantity) ||
                item.quantity < 1
            ) {
                return res.status(400).json({
                    message: "Each item needs a valid food_id and positive integer quantity"
                });
            }
            const foodId = item.food_id.toString();
            quantities.set(
                foodId,
                (quantities.get(foodId) || 0) + item.quantity
            );

            if (quantities.get(foodId) > 100) {
                return res.status(400).json({
                    message: "Maximum quantity per food item is 100"
                });
            }
        }
        const foodIds = [...quantities.keys()];
        const menuItems = await Menu.find({
            _id: { $in: foodIds },
            is_available: true
        });
        if (menuItems.length !== foodIds.length) {
            return res.status(400).json({
                message: "One or more food items do not exist or are unavailable"
            });
        }
        let totalPrice = 0;
        const orderItems = [];
        for (const food of menuItems) {
            const quantity = quantities.get(food._id.toString());

            totalPrice += food.price * quantity;

            orderItems.push({
                food_id: food._id,
                quantity
            });
        }
        const order = await Order.create({
            user_id: req.user.id,
            total_price: totalPrice,
            status: "Pending"
        });
        const savedItems = await OrderItem.insertMany(
            orderItems.map((item) => ({
                ...item,
                order_id: order._id
            }))
        );
        return res.status(201).json({
            message: "Order placed successfully",
            order,
            items: savedItems
        });
    } catch (error) {
        console.error("Place order error:", error.message);
        return res.status(500).json({
            message: "Failed to place order"
        });
    }
});


router.get("/my-orders", auth, async (req, res) => {
    try {
        const orders = await Order.find({
            user_id: req.user.id
        }).sort({ createdAt: -1 });
        const result = await Promise.all(
            orders.map(async (order) => {
                const items = await OrderItem.find({
                    order_id: order._id
                }).populate("food_id", "name category price image_url");

                return {
                    ...order.toObject(),
                    items
                };
            })
        );
        return res.status(200).json({
            count: result.length,
            orders: result
        });
    } catch (error) {
        return res.status(500).json({
            message: "Failed to fetch order history"
        });
    }
});

router.get("/", auth, admin, async (req, res) => {
    try {
        const orders = await Order.find()
            .populate("user_id", "name email")
            .sort({ createdAt: 1 });

        const result = await Promise.all(
            orders.map(async (order) => {
                const items = await OrderItem.find({
                    order_id: order._id
                }).populate("food_id", "name category price image_url");

                return {
                    ...order.toObject(),
                    items
                };
            })
        );
        return res.status(200).json({
            count: result.length,
            orders: result
        });
    } catch (error) {
        return res.status(500).json({
            message: "Failed to fetch orders"
        });
    }
});


router.put("/:id/status", auth, admin, async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const allowedStatuses = [
            "Pending",
            "Preparing",
            "Out for delivery",
            "Delivered"
        ];
        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                message: "Invalid order ID"
            });
        }
        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                message: "Invalid order status",
                allowedStatuses
            });
        }
        const order = await Order.findByIdAndUpdate(
            id,
            { status },
            { new: true, runValidators: true }
        );
        if (!order) {
            return res.status(404).json({
                message: "Order not found"
            });
        }
        return res.status(200).json({
            message: "Order status updated successfully",
            order
        });
    } catch (error) {
        return res.status(500).json({
            message: "Failed to update order status"
        });
    }
});




module.exports = router;
