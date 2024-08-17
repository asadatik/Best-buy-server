const express = require('express');
const app = express();
require('dotenv').config();

// const jwt = require('jsonwebtoken');

// const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY)

const cors = require('cors');
const port = process.env.PORT || 5000;


// middleware
app.use(cors());
app.use(express.json());


const { MongoClient, ServerApiVersion } = require('mongodb');
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


    const ProductCollection = client.db('JOB-TASK').collection('shopSort')
    // get all product
     
     app.get('/allPro', async (req, res) => {
      const result = await ProductCollection.find().toArray()

      res.send(result)
    }) 





    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    
  }
}
run().catch(console.dir);





app.get('/', (req, res) => {
  res.send('Selling is Starting')
})

app.listen(port, () => {
  console.log(` Selling   is sitting on port ${port}`);
})
