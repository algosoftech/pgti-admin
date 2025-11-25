const express = require("express");
const cookieParser = require("cookie-parser");
const publicDir = require("path").join("../app/", "/public");

module.exports = (app) => {
  app.use(cookieParser());
  app.use(express.static(publicDir));
  //Common
  app.use("/v1/common/clip-art", require("../module/controllers/common").router);
  //Admin Routes
  app.use("/v1/admin/accounts", require("../module/controllers/admin/accounts").router);
  app.use("/v1/admin/users", require("../module/controllers/admin/users").router);
  app.use("/v1/admin/category", require("../module/controllers/admin/category").router);
  app.use("/v1/admin/sub-category", require("../module/controllers/admin/subCategory").router);
  app.use("/v1/admin/cms", require("../module/controllers/admin/cms").router);
  app.use("/v1/admin/products", require("../module/controllers/admin/products").router);
  app.use("/v1/admin/product-variants", require("../module/controllers/admin/productVariants").router);
  app.use("/v1/admin/promo-code", require("../module/controllers/admin/promoCodes").router);
  app.use("/v1/admin/orders", require("../module/controllers/admin/orders").router);
  app.use("/v1/admin/articles", require("../module/controllers/admin/articles").router);
  app.use("/v1/admin/events", require("../module/controllers/admin/events").router);
  
  //Frond Routes
  app.use("/v1/front/users", require("../module/controllers/front/users").router);
  app.use("/v1/front/cms", require("../module/controllers/front/cms").router);
  app.use("/v1/front/products", require("../module/controllers/front/products").router);
  app.use("/v1/front/cart", require("../module/controllers/front/cart").router);
  app.use("/v1/front/promo-codes", require("../module/controllers/front/promoCodes").router);
  app.use("/v1/front/orders", require("../module/controllers/front/orders").router);
  app.use("/v1/front/articles", require("../module/controllers/front/articles").router);

};
  