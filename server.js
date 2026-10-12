require("dotenv").config();

const express = require("express");
const connectDB = require("./config/db");

const cookieParser = require("cookie-parser");
const app = express();

app.use(express.json());
app.use(cookieParser());


const authRoutes = require("./routes/authRoutes");
const menuRoutes = require("./routes/menuRoutes");
const orderRoutes = require("./routes/orderRoutes");

app.use("/", authRoutes);
app.use("/menu", menuRoutes);
app.use("/order", orderRoutes);

const startServer = async () => {
    try {
        await connectDB();
       
        app.listen(process.env.PORT || 5000, () => {
            console.log("Server running");
        });
    } catch (error) {
        console.error("Startup failed:", error.message);
        process.exit(1);
    }
};

startServer();