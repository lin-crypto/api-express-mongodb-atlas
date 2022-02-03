const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();
const bcrypt = require("bcrypt");

const app = express();
const { MongoClient } = require("mongodb");
const url = `mongodb+srv://${process.env.MONGODB_USER_NAME}:${process.env.MONGODB_USER_PASSWORD}${process.env.MONGODB_CLUSTER}`;
const main = async () => {
  var corsOptions = {
    origin: "*",
  };

  app.use(cors(corsOptions));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  const client = new MongoClient(url);
  await client.connect();
  console.log("Connected to Mongodb");

  /////////// Router ///////////
  var router = require("express").Router();

  router.get("/funds", async (req, res) => {
    const cursor = client
      .db(process.env.MONGODB_DB_NAME)
      .collection("funds")
      .find();
    const result = await cursor.toArray();
    res.send(result);
  });

  router.get("/funds/:address", async (req, res) => {
    const address = req.params.address;
    const result = await client
      .db(process.env.MONGODB_DB_NAME)
      .collection("funds")
      .findOne({ address: address });
    res.send(result);
  });

  router.post("/funds/account", async (req, res) => {
    const address = req.body.address;
    const result = await client
      .db(process.env.MONGODB_DB_NAME)
      .collection("funds")
      .findOne({ address: address });
    res.send(result);
  });

  router.post("/funds", async (req, res) => {
    const result = await client
      .db(process.env.MONGODB_DB_NAME)
      .collection("funds")
      .insertOne(req.body);
    res.send(result);
  });

  router.post("/funds/addfund", async (req, res) => {
    console.log(req.body);
    const result = await client
      .db(process.env.MONGODB_DB_NAME)
      .collection("funds")
      .updateOne(
        { address: req.body.address },
        { $set: { funds: req.body.funds } }
      );
    res.send(result);
  });

  router.get("/users", async (req, res) => {
    const cursor = client
      .db(process.env.MONGODB_DB_NAME)
      .collection("users")
      .find();
    const result = await cursor.toArray();
    res.send(result);
  });

  router.post("/users/register", async (req, res) => {
    const result = await client
      .db(process.env.MONGODB_DB_NAME)
      .collection("users")
      .findOne({ email: req.body.email });
    if (result) {
      res.send("Email already Exists");
    } else {
      const salt = parseInt(process.env.BCRYPT_WORK_FACTOR);
      const hashedPassword = await bcrypt.hash(req.body.password, salt);
      const result = await client
        .db(process.env.MONGODB_DB_NAME)
        .collection("users")
        .insertOne({
          firstname: req.body.firstname,
          lastname: req.body.lastname,
          email: req.body.email,
          password: hashedPassword,
        });
      res.send(result);
    }
  });

  router.post("/users/signin", async (req, res) => {
    const result = await client
      .db(process.env.MONGODB_DB_NAME)
      .collection("users")
      .findOne({ email: req.body.email });
    const comp = await bcrypt.compare(req.body.password, result.password);
    comp ? res.send(result) : res.send(false);
  });

  app.use("/api", router);
};

main().then(() => {
  const PORT = process.env.PORT || 8080;
  app.listen(PORT, () => {
    console.log(`API Server is running on port ${PORT}.`);
  });
});
