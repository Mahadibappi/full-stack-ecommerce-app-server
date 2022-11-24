const express = require("express");
const cors = require("cors");
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());

//mongo db
const uri = `mongodb+srv://${process.env.ADMIN_USER}:${process.env.ADMIN_PASSWORD}@cluster0.guw4vbk.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverApi: ServerApiVersion.v1,
});

// crud operations
async function run() {
    try {
        const serviceCollection = client.db("laptopHub").collection("category");



        // get api
        app.get("/services", async (req, res) => {
            const query = {};
            const cursor = serviceCollection.find(query);
            const services = await cursor.toArray();
            res.send(services);
        });
        app.get("/services/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const service = await serviceCollection.findOne(query);
            res.send(service);
        });





    }


    finally {


    }
}
run().catch((err) => console.log(err));
app.get("/", (req, res) => {
    res.send("product server running");
});

app.listen(port, (req, res) => {
    console.log(`server running ${port}`);
});










