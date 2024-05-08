const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 5 },
  fileFilter: fileFilter,
});

const Product = require("../models/product");

router.get("/", async (req, res, next) => {
  //const id = req.params.productID;
  const docs = await Product.find().select("name price _id productImage");
  const result = {
    count: docs.length,
    produtcs: docs.map((doc) => {
      return {
        name: doc.name,
        price: doc.price,
        _id: doc._id,
        productImage: doc.productImage,
        request: {
          type: "GET",
          request: `http://localhost:4000/products/${doc._id}`,
        },
      };
    }),
  };

  res.status(200).json(result);
});

router.post("/", upload.single("productImage"), async (req, res, next) => {
  try {
    console.log(req.file);
    const product = new Product({
      _id: new mongoose.Types.ObjectId(),
      name: req.body.name,
      price: req.body.price,
      productImage: req.file.path,
    });
    const result = await product.save();
    res.status(201).json({
      name: result.name,
      price: result.price,
      productImage: result.productImage,
      _id: result._id,
      request: {
        type: "GET",
        request: `http://localhost:4000/products/${result._id}`,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/:productID", async (req, res, next) => {
  const id = req.params.productID;
  const result = await Product.findById(id).select(
    "name price _id productImage"
  );
  res.status(200).json({
    name: result.name,
    price: result.price,
    _id: result._id,
    request: {
      type: "GET",
      request: `http://localhost:4000/products/${result._id}`,
    },
  });
});
router.patch("/:productID", async (req, res, next) => {
  try {
    const id = req.params.productID;
    const updated = await Product.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true }
    );
    console.log("başarıyla güncellendi");
    res.status(200).json({
      message: "Başarıyla güncellendi",
      updated: updated,
      request: {
        type: "GET",
        request: `http://localhost:4000/products/${updated._id}`,
      },
    });
  } catch (err) {
    console.log(err);
  }
});
router.delete("/:productID", async (req, res, next) => {
  try {
    const id = req.params.productID;
    await Product.findByIdAndDelete(id);
    console.log("Başarıyla silindi");
    res.status(200).json({
      message: "Başarıyla Silindi",
    });
  } catch {
    console.log("Silinirken Hata oluştu");
  }
});

module.exports = router;
