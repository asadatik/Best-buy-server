const express = require('express');
const app = express();
require('dotenv').config();

const { MongoClient, ServerApiVersion } = require('mongodb');
const cors = require('cors');
const port = process.env.PORT || 9000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection URI
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
    // Connect to MongoDB
    await client.connect();

    const productsCollection = client.db('JOB-TASK').collection('shopSort');
    const userCollection = client.db('JOB-TASK').collection('users');

    // Route to get all products
    app.get('/allPro', async (req, res) => {
      const result = await productsCollection.find().toArray();
      res.send(result);
    });

    // Route to post user info
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



    // Route for advanced filtering, sorting, and pagination
    app.get('/information', async (req, res) => {
      try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const sortField = req.query.sort || 'createdAt'; // Assuming you have a `createdAt` field
        const sortOrder = req.query.order === 'desc' ? -1 : 1;

        const searchQuery = req.query.search
          ? { name: { $regex: new RegExp(req.query.search, 'i') } }
          : {};

        const filters = {
          ...searchQuery,
          ...(req.query.brand && { brand: req.query.brand }),
          ...(req.query.category && { category: req.query.category }),
          ...(req.query.minPrice && { price: { $gte: parseFloat(req.query.minPrice) } }),
          ...(req.query.maxPrice && { price: { $lte: parseFloat(req.query.maxPrice) } }),
        };

        const totalDocuments = await productsCollection.countDocuments(filters);
        const data = await productsCollection
          .find(filters)
          .sort({ [sortField]: sortOrder })
          .skip(skip)
          .limit(limit)
          .toArray();

        res.send({
          data,
          currentPage: page,
          totalPages: Math.ceil(totalDocuments / limit),
          totalDocuments,
        });
      } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).send({ error: 'An error occurred while fetching data.' });
      }
    });

  } finally {
    // No need to close the connection because it will stay open as long as the app is running
  }
}

run().catch(console.dir);

// Basic route to check server status
app.get('/', (req, res) => {
  res.send('Selling is Starting');
});

// Start the server
app.listen(port, () => {
  console.log(`Selling is sitting on port ${port}`);
});
