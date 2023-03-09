const Product = require("../models/Product");
const Order = require("../models/Order");
const { StatusCodes } = require("http-status-codes");
const customError = require("../errors/");
const { checkPermissions } = require("../utils");

const fakeStripeAPI = async ({ amount, currency }) => {
  const client_secret = "someRandomValue";
  return { client_secret, amount };
};

const createOrder = async (req, res, next) => {
  const { items: cartItems, tax, shippingFee } = req.body;

  if (!cartItems || cartItems.length === 0) {
    throw new customError.BadRequestError("No cart items provided");
  }

  if (!tax || !shippingFee) {
    throw new customError.BadRequestError(
      "Please provide tax and shippingFee!!!"
    );
  }

  let orderItems = [];
  let subtotal = 0;
  for (const item of cartItems) {
    const dbProduct = await Product.findOne({ _id: item.product });
    if (!dbProduct) {
      throw new customError.NotFoundError(
        `No product with id = ${item.product}`
      );
    }

    const { name, price, image, _id } = dbProduct;
    const singleOrderItem = {
      amount: item.amount,
      name,
      price,
      image,
      product: _id,
    };

    // add item to orderItems which will be further added to ordre object
    orderItems.push(singleOrderItem);

    // calculating subtotal
    subtotal += singleOrderItem.amount * singleOrderItem.price;
  }

  // calculating total
  const total = tax + shippingFee + subtotal;

  // get client secret
  const paymentIntent = await fakeStripeAPI({
    amount: total,
    currency: "usd",
  });

  const order = await Order.create({
    orderItems,
    total,
    subtotal,
    tax,
    shippingFee,
    clientSecret: paymentIntent.client_secret,
    user: req.user.userId,
  });

  res
    .status(StatusCodes.CREATED)
    .json({ order, clientSecret: order.clientSecret });
};

const getAllOrders = async (req, res, next) => {
  const orders = await Order.find();
  res.status(StatusCodes.OK).json({ orders, count: orders.length });
};

const getSingleOrder = async (req, res, next) => {
  const { id: orderId } = req.params;
  const order = await Order.findOne({ _id: orderId });
  if (!order) {
    throw new customError.NotFoundError(`No order with id => ${orderId}`);
  }
  checkPermissions(req.user, order.user);
  res.status(StatusCodes.OK).json({ order });
};

const getCurrentUserOrders = async (req, res, next) => {
  const { userId } = req.user;
  const orders = await Order.find({ user: userId });
  res.status(StatusCodes.OK).json({ orders, count: orders.length });
};

const UpdateOrder = async (req, res, next) => {
  const { id: orderId } = req.params;
  const { paymentIntentId } = req.body;
  const order = await Order.findOne({ _id: orderId });

  if (!order) {
    throw new customError.NotFoundError(`No order with id : ${orderId}`);
  }

  checkPermissions(req.user, order.user);

  order.paymentIntentId = paymentIntentId;
  order.status = "paid";

  await order.save();

  res.status(StatusCodes.OK).json({ order });
};

module.exports = {
  createOrder,
  getAllOrders,
  getSingleOrder,
  getCurrentUserOrders,
  UpdateOrder,
};
