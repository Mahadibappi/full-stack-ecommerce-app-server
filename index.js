const express = require('express');
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken')
require("dotenv").config();
const port = process.env.PORT || 5000;
const cors = require("cors");

// server used
const categories = require("./data/category.json")
const product = require("./data/product.json");
const { query } = require('express');

// middle ware
app.use(cors());
app.use(express.json())

app.get("/", (req, res) => {
    res.send("product server running")
})

// using local server 
// app.get("/brands", (req, res) => {
//     res.send(categories);
// });

app.get("/category/:id", (req, res) => {
    const id = req.params.id
    const categoryNews = product.filter((n) => n.category_id === id);
    res.send(categoryNews);

});
// server used

// MONGO DB
const uri = `mongodb+srv://${process.env.ADMIN_USER}:${process.env.ADMIN_PASS}@cluster0.guw4vbk.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run() {

    try {
        // collections api 

        const userCollection = client.db("usedProduct").collection("users");
        const brandCollection = client.db("usedProduct").collection("brand");

        const productCollection = client.db("usedProduct").collection("product");

        const ordersCollection = client.db("usedProduct").collection('orders')

        // get api

        app.get("/brands", async (req, res) => {
            const query = {};
            const brands = await brandCollection.find(query).toArray()
            res.send(brands)
        })

        app.get('/product/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const products = await productCollection.findOne(query)
            res.send(products)
        });

        app.get("/orders", async (req, res) => {
            const email = req.query.email
            const query = { email: email };
            const orders = await ordersCollection.find(query).toArray()
            res.send(orders)
        })


        // POST API
        app.post('/orders', async (req, res) => {
            const orders = req.body
            const result = ordersCollection.insertOne(orders);
            res.send(result)
        })


        app.post('/users', async (req, res) => {
            const user = req.body
            const result = await userCollection.insertOne(user)
            res.send(result)
        })

        // jwt token

        app.get('/jwt', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const user = await userCollection.findOne(query);
            if (user) {
                const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, { expiresIn: '1d' })
                return res.send({ accessToken: token })
            }

            res.status(403).send({ accessToken: "" })
        })









    }







    finally {

    }

}

run().catch(err => console.log(err))

app.listen(port, () => {
    console.log("server running", port);
})


// QECfFi55pmCHzvnS
// usedProduct