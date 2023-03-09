const mongoose = require("mongoose");
mongoose.set("strictQuery", true);
const connectDB = async(url) => {
    return mongoose.connect(url);
};

module.exports = connectDB;