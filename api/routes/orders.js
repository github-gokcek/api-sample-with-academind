const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const Order = require("../models/order");
const Product = require("../models/product");

router.get("/", async (req, res, next) => {
  try {
    const docs = await Order.find()
      .select("product quantity _id")
      .populate("product", "_id name price");
    const result = {
      count: docs.length,
      orders: docs.map((doc) => {
        return {
          _id: doc.id,
          product: doc.product,
          quantity: doc.quantity,
          request: {
            type: "GET",
            url: `http://localhost:4000/orders${doc._id}`,
          },
        };
      }),
    };
    res.status(200).json(result);
  } catch (err) {
    console.log(err);
    res.status(404).json({
      message: "Something went wrong",
    });
  }
  res.status(200).json({
    message: "Orders were fetched",
  });
});
router.post("/", async (req, res, next) => {
  try {
    const isNull = await Product.findById(req.body.productID);
    if (isNull._id != null || isNull._id != undefined) {
      const order = new Order({
        _id: new mongoose.Types.ObjectId(),
        product: req.body.productID,
        quantity: req.body.quantity,
      });

      await order.save();
      res.status(201).json({
        message: "Order was created",
        order: order,
      });
    } else {
      res.status(404).json({
        message: "Product bulunamadı.",
      });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Bir hata oluştu.",
    });
  }
});
router.get("/:orderID", async (req, res, next) => {
  try {
    const id = req.params.orderID;
    const result = await Order.findByID(id).select("product quantity _id");
    res.json(result);
  } catch (err) {
    console.log(err);
    res.status(404).json({
      message: "Bir hata oluştu",
    });
  }
});
router.delete("/:orderID", async (req, res, next) => {
  try {
    const id = req.params.orderID;
    await Order.findByIdAndDelete(id);
    console.log("Başarıyla silindi");
    res.status(200).json({
      message: "Başarıyla silindi",
    });
  } catch (err) {
    console.log(err);
    res.status(404).json({
      message: "Bir hata oluştu",
    });
  }
});

module.exports = router;
