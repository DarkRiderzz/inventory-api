// Load environment variables from .env file
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const csrf = require("csurf"); // Add csrf
const path = require("path");

// Import routes and middleware
const userRoute = require("./routes/userRoute");
const productRoute = require("./routes/productRoute");
const contactRoute = require("./routes/contactRoute");
const errorHandler = require("./middleWare/errorMiddleware");

const app = express();

// CORS middleware
app.use(
  cors({
    origin: ["http://localhost:3000", "https://invt-app.netlify.app"],
    credentials: true,
  })
);

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());

// CSRF protection middleware
const csrfProtection = csrf({
  cookie: true, // Store the token in a cookie
});

// Static folder for uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Apply CSRF protection for all routes that require it
app.use(csrfProtection);

// Route to send CSRF token to client
app.get("/api/csrf-token", (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

// Routes
app.use("/api/users", userRoute);
app.use("/api/products", productRoute);
app.use("/api/contactus", contactRoute);

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
      // console.log(`MONGO_URI: ${process.env.MONGO_URI}`);
    });
  })
  .catch((err) => console.error(err));
