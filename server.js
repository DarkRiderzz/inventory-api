// Load environment variables from .env file
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");
const csrf = require("csurf"); // Import CSRF protection middleware

// Import routes and middleware
const userRoute = require("./routes/userRoute");
const productRoute = require("./routes/productRoute");
const contactRoute = require("./routes/contactRoute");
const errorHandler = require("./middleWare/errorMiddleware");

const app = express();

// CSRF protection middleware
const csrfProtection = csrf({
  cookie: {
    httpOnly: true, // Ensures the cookie is sent only via HTTP(S)
    secure: process.env.NODE_ENV === "production", // Only sent over HTTPS in production
    sameSite: "None", // Required for cross-site cookies
  },
});

// CORS middleware (Allowing specific origins and credentials for cross-origin cookies)
app.use(
  cors({
    origin: ["http://localhost:3000", "https://invt-app.netlify.app"], // List of allowed origins
    credentials: true, // Allow credentials (cookies, etc.)
    methods: ["GET", "POST", "PATCH", "DELETE"], // Specify allowed methods
    allowedHeaders: ["Content-Type", "Authorization", "CSRF-Token"], // Specify allowed headers
  })
);

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Apply CSRF protection
app.use(csrfProtection);

// Route to send CSRF token to client
app.get("/api/csrf-token", (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

// Static folder for uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/users", userRoute);
app.use("/api/products", productRoute);
app.use("/api/contactus", contactRoute);

// Home route
app.get("/", (req, res) => {
  res.send("Home Page");
});

// Error middleware
app.use(errorHandler);

// Connect to the database and start the server
const PORT = process.env.PORT || 5000;
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server Running on port ${PORT}`);
    });
  })
  .catch((err) => console.error(err));
