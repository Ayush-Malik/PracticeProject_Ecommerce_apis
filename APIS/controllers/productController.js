const { StatusCodes } = require("http-status-codes");
const Product = require("../models/Product");
const customError = require("../errors");
const cloudinary = require("cloudinary").v2;
const fs = require("fs");

const createProduct = async (req, res, next) => {
  req.body.user = req.user.userId;
  const product = await Product.create(req.body);
  res.status(StatusCodes.CREATED).json({ product });
};

const getAllProducts = async (req, res, next) => {
  const products = await Product.find().populate({
    path: "user",
    select: "name",
  });
  res.status(StatusCodes.OK).json({ count: products.length, products });
};

const getSingleProduct = async (req, res, next) => {
  const { id: productId } = req.params;
  const product = await Product.findOne({ _id: productId }).populate("reviews");

  if (!product)
    throw new customError.NotFoundError(
      `No product exists with id => ${productId}`
    );

  res.status(StatusCodes.OK).json({ product });
};

const updateProduct = async (req, res, next) => {
  const { id: productId } = req.params;
  const product = await Product.findOneAndUpdate({ _id: productId }, req.body, {
    new: true,
    runValidators: true,
  });

  if (!product)
    throw new customError.NotFoundError(
      `No product exists with id => ${productId}`
    );

  res.status(StatusCodes.OK).json({ msg: "Product Updated Successfully!!!" });
};

const deleteProduct = async (req, res, next) => {
  const { id: productId } = req.params;
  const product = await Product.findOne({ _id: productId });

  if (!product)
    throw new customError.NotFoundError(
      `No product exists with id => ${productId}`
    );

  await product.remove();
  res.status(StatusCodes.OK).json({ msg: "Product Deleted Successfully" });
};

const uploadImage = async (req, res, next) => {
  if (!req.files) {
    throw new customError.BadRequestError("No file uploaded");
  }

  const productImage = req.files.image;

  // check format
  if (!productImage.mimetype.startsWith("image")) {
    throw new customError.BadRequestError("Please upload an image");
  }

  // check size
  const maxSize = 1024 * 1024;
  if (productImage.size > maxSize) {
    throw new customError.BadRequestError(
      `Please upload image not greater than ${maxSize} bytes`
    );
  }

  const result = await cloudinary.uploader.upload(productImage.tempFilePath, {
    use_filename: true,
    folder: "images_of_products",
  });

  // removing temp files
  fs.unlinkSync(productImage.tempFilePath);

  res.status(StatusCodes.OK).json({
    image: {
      src: result.secure_url,
    },
  });
};

module.exports = {
  createProduct,
  getAllProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  uploadImage,
};
