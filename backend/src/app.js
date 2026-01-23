const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const cors=require("cors")
const AppError = require("./utils/AppError");
const globalErrorhandler = require("./middleware/globalError");
const authRoutes = require("./routes/auth.routes");
const seedRoutes = require("./routes/seed.routes");

app.use(express.json());
app.use(cookieParser());

// request logger (dev)
  app.use(morgan("dev"));
  app.use(cors({
    origin: 'http://127.0.0.1:5500', // Change this to your frontend URL
    credentials: true // Required to send cookies/tokens
}));


// routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/seed", seedRoutes);

//error for unknown routes
app.all(/.*/, (req, res, next) => {
  next(new AppError(`cannot find ${req.originalUrl}`, 404));
});

//global error handler
app.use(globalErrorhandler);

module.exports = app;
