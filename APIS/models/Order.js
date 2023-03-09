const mongoose = require("mongoose");

const SingleOrderItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

  image: {
    type: String,
    required: true,
  },

  price: {
    type: Number,
    required: true,
  },

  amount: {
    type: Number,
    required: true,
  },

  product: {
    type: mongoose.Types.ObjectId,
    ref: "Product",
    required: [true, "Please provide userId"],
  },
});

const orderSchema = new mongoose.Schema(
  {
    tax: {
      type: Number,
      required: [true, "Please provide tax!!!"],
    },

    shippingFee: {
      type: Number,
      required: [true, "Please provide shippingFee!!!"],
    },

    subtotal: {
      type: Number,
      required: [true, "Please provide subtotal!!!"],
    },

    total: {
      type: Number,
      required: [true, "Please provide total!!!"],
    },

    orderItems: [SingleOrderItemSchema],

    // orderItems: {
    //     type: [Number],
    //     required: [true, "Please provide orderItems!!!"],
    // },

    status: {
      type: String,
      enum: ["pending", "failed", "paid", "delievered", "canceled"],
      default: "pending",
      required: [true, "Please provide status!!!"],
    },

    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: [true, "Please provide userId"],
    },

    clientSecret: {
      type: String,
      required: true,
    },

    paymentIntentId: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = new mongoose.model("Order", orderSchema);
