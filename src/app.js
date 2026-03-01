import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import healthCheckRoutes from "./routes/healthcheck.routes.js";
import authRouter from "./routes/auth.routes.js";
const app = express();
const PORT = process.env.PORT || 3000;
// basic configuration for express server
app.use(express.json()); // what this does : it allows us to parse incoming JSON data in the request body. When a client sends a request with a JSON payload, this middleware will automatically parse it and make it available in the req.body property of the request object. This is essential for handling POST, PUT, or PATCH requests where the client is sending data to the server in JSON format.
app.use(express.urlencoded({ extended: true })); // what this does : it allows us to parse incoming URL-encoded data, which is typically sent from HTML forms. When a client submits a form with the application/x-www-form-urlencoded content type, this middleware will parse the data and make it available in the req.body property of the request object. The extended: true option allows for rich objects and arrays to be encoded into the URL-encoded format, using the qs library.
app.use(express.static("public")); // what this does : it serves static files from the "public" directory. This means that if you have any files (like HTML, CSS, JavaScript, images, etc.) in the "public" folder, they can be accessed directly via the URL. For example, if you have a file named "index.html" in the "public" directory, it can be accessed at http://localhost:PORT/index.html. This is useful for serving frontend assets or any other static content without needing to set up specific routes for each file.

// cors configuration
app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(",") || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
// use the routes
app.use("/api/v1/health", healthCheckRoutes);
app.use("/api/v1/auth", authRouter);
app.get("/", (req, res) => {
  res.send("Hello World!");
});
app.get("/instagram", (req, res) => {
  res.send("Welcome to Instagram!");
});

export default app;
