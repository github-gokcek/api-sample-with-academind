const express = require("express");
const app = express();
const morgan = require("morgan");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");

const productRoutes = require("./api/routes/products");
const orderRoutes = require("./api/routes/orders");

//sadece json verisi geleceğini varsayıyoruz.
// txt veri gelecek olsaydı böyle işlememiz gerkirdi.
// app.use(express.text()); aslında json içinde şu lazım
// app.use(express.json()); ancak buna gerek yok çünkü
//bodyparser ile json yaptık.
const password = "JYCF42yi3wTHBUN2";
const uri = `mongodb+srv://twthunderwawe:${password}@node-shop.zdrisrk.mongodb.net/?retryWrites=true&w=majority`;

mongoose.connect(
  uri
  //,{
  //useNewUrlParser: true,
  // useUnifiedTopology: true,
  //}
);

const handleConnectionEvents = () => {
  mongoose.connection.on("connected", () => {
    console.log("MongoDB bağlantısı başarıyla gerçekleşti");
  });

  mongoose.connection.on("error", (err) => {
    console.error("MongoDB bağlantı hatası:", err);
  });

  mongoose.connection.on("disconnected", () => {
    console.log("MongoDB bağlantısı kesildi");
  });
};
handleConnectionEvents();

// morgan gelen http requestlerini log unu tutuyor.
app.use(morgan("dev"));
app.use("/uploads", express.static("uploads"));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//CORS çözüm
/*
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*"); // * tüm siteler erişebilir demek. "https://elma.org" gibi sadece bu site erişsin de denebilir.
  res.header(
    "Access-Control-Allow-Headers",
    "Origin,X-Requested-With,Content-Type,Accept,Authorization"
  );
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Origin", "PUT,POST,PATCH,DELETE,GET");
    return res.status(200).json({});
  }
});
*/

app.use(cors());
app.use("/products", productRoutes);
app.use("/orders", orderRoutes);

app.use((req, res, next) => {
  const error = new Error("Not Found");
  error.status = 404;
  next(error);
});
app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message,
    },
  });
});

module.exports = app;
