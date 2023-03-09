require("dotenv").config();
require("express-async-errors");

// file - upload[image]
const fileUpload = require("express-fileupload");
const cloudinary = require("cloudinary").v2;

// express
const express = require("express");
const app = express();

// rest of the packages
const morgan = require("morgan");
const cookieParser = require("cookie-parser");

// database
const connectDB = require("./db/connect");

// middlewares
const errorHandlerMiddleware = require("./middleware/error-handler");
const notFoundMiddleware = require("./middleware/not-found");

// routers
const authRouter = require("./routes/authRoutes");
const userRouter = require("./routes/userRoutes");
const productRouter = require("./routes/productRoutes");
const reviewRouter = require("./routes/reviewRoutes");
const orderRouter = require("./routes/orderRoutes");
// -------------------------------------------------------------------------------------------

// file - upload[image]
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});
app.use(fileUpload({ useTempFiles: true }));

app.use(morgan("tiny"));
app.use(express.json());
app.use(cookieParser(process.env.JWT_SECRET));
app.use(express.static("./static/"));

// routes
app.use("/api/v1", authRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/products", productRouter);
app.use("/api/v1/review", reviewRouter);
app.use("/api/v1/orders", orderRouter);

app.get("/", (req, res, next) => {
  console.log(req.signedCookies);
  res.send("COOL");
});

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 5000;
const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI).then(() =>
      console.log("Connected to DB...")
    );
    app.listen(port, console.log(`Server is listening at port = ${port}`));
  } catch (err) {
    console.log(err);
  }
};
start();
