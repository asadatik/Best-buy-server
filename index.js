const express = require('express');
const app = express();
require('dotenv').config();

const { MongoClient, ServerApiVersion } = require('mongodb');


const cors = require('cors');
const port = process.env.PORT || 9000;

// Middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ldjypij.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    await client.connect();

    const productsCollection = client.db('JOB-TASK').collection('shopSort');
    const userCollection = client.db('JOB-TASK').collection('users');
    const priceCollection = client.db('JOB-TASK').collection('price');

    // Get all products
    app.get('/allPro', async (req, res) => {
      const result = await productsCollection.find().toArray();
      res.send(result);
    });

      
    // Post user info
    app.post('/users', async (req, res) => {
      const user = req.body;
      console.log(user);
      const query = { email: user.email };
      const existingUser = await userCollection.findOne(query);
      if (existingUser) {
        return res.send({ message: 'User already exists', insertedId: null });
      }
      const result = await userCollection.insertOne(user);
      res.send(result);
    });

  
       
      
    app.get("/products", async (req, res) => {
      const page = parseInt(req.query.page);
      const testData = JSON.parse(req.query.testData);
      console.log(testData);
      let query = {};
      if (testData.search) {
        query = { name: { $regex: testData.search, $options: "i" } };
      }
      if (testData.brand.length > 0) {
        query.brand = { $in: testData.brand };
      }
      if (testData.category.length > 0) {
        query.category = { $in: testData.category };
      }

      if (testData.priceSelected.length === 2) {
        query.price = {
          $gte: Number(testData.priceSelected[0]),
          $lte: Number(testData.priceSelected[1]),
        };
      }

      let sortPrice = {};

      if (testData.sortPrice === "low") {
        sortPrice.price = 1;
      } else if (testData.sortPrice === "high") {
        sortPrice.price = -1;
      }

      if (testData.dateSort) {
        sortPrice.time = -1;
    } else if (testData.dateSort === false) {
      sortPrice.time = 1;
    }

    const totalClasses = await productsCollection.countDocuments(query);

      const result = await productsCollection
        .find(query)
        .sort(sortPrice)
        .skip(page * 6)
        .limit(6)
        .toArray();
      res.send({ result, totalClasses });
    });

    app.get("/filter", async (req, res) => {
      const brands = await productsCollection
        .aggregate([{ $group: { _id: "$brand" } }, { $sort: { _id: 1 } }])
        .toArray();

      res.send(brands);
    });
    app.get("/filter2", async (req, res) => {
      const categories = await productsCollection
        .aggregate([{ $group: { _id: "$category" } }, { $sort: { _id: 1 } }])
        .toArray();

      res.send(categories);
    });
    app.get("/filter3", async (req, res) => {
      const categories = await priceCollection
        .aggregate([{ $group: { _id: "$price" } }, { $sort: { _id: 1 } }])
        .toArray();
      res.send(categories);
    });





    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // No need to close the connection because it will stay open as long as the app is running
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Selling is Starting');
});

app.listen(port, () => {
  console.log(`Selling is sitting on port ${port}`);
});
