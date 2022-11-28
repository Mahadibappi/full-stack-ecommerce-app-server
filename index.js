const express = require('express');
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require("dotenv").config();
const port = process.env.PORT || 5000;
const cors = require("cors");
const stripe = require("stripe")(process.env.STRIPE_KEY);
const jwt = require('jsonwebtoken')

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

// verify jwt function
function verifyJWT(req, res, next) {
    console.log('token inside jwt', req.headers.authorization);
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send('unauthorized access')
    }
    const token = authHeader.split(' ')[1]

    jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'forbidden access' })
        }
        req.decoded = decoded;
        next();
    })


}


async function run() {

    try {
        // collections api 

        const userCollection = client.db("usedProduct").collection("users");
        const brandCollection = client.db("usedProduct").collection("brand");

        const productCollection = client.db("usedProduct").collection("product");

        const ordersCollection = client.db("usedProduct").collection('orders')

        const sellerCollection = client.db("usedProduct").collection('sellers')
        const paymentsCollection = client.db("usedProduct").collection('payments')

        // verify admin
        const verifyAdmin = async (req, res, next) => {
            const decodedEmail = req.decoded.email;
            const query = { email: decodedEmail };
            const user = await userCollection.findOne(query);
            if (user?.role !== 'admin') {
                return res.status(403).send({ message: 'forbidden access' })
            }
            next()
        }


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
            // const decodedEmail = req.decoded.email;
            // if (email != decodedEmail) {
            //     return res.status(403).send({ message: 'forbidden access' })
            // }
            const query = { email: email };
            const orders = await ordersCollection.find(query).toArray()
            res.send(orders)
        })
        //get seller collection
        app.get("/seller", async (req, res) => {
            const query = {};
            const seller = await sellerCollection.find(query).toArray()
            res.send(seller)
        })


        // admin check
        app.get('/users/admin/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email };
            const user = await userCollection.findOne(query);
            res.send({ isAdmin: user?.role === 'admin' })
        })

        // get all users

        app.get('/users', async (req, res) => {
            const query = {}
            const result = await userCollection.find(query).toArray()
            res.send(result)

        })


        // get orders for payment

        app.get('/orders/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const order = await ordersCollection.findOne(query)
            res.send(order)
        })


        // POST orders  API
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

        // seller collection

        app.post('/seller', async (req, res) => {
            const seller = req.body;
            const result = await sellerCollection.insertOne(seller);
            res.send(result)
        })

        //delete buyers 
        app.delete('/users/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const result = await userCollection.deleteOne(filter);
            res.send(result)
        })
        app.post('/create-payment-intent', async (req, res) => {
            const orders = req.body;
            const price = orders.price;
            const amount = price * 100;
            const paymentIntent = await stripe.paymentIntents.create({
                currency: 'usd',
                amount: amount,
                "payment_method_types": [
                    "card"
                ]
            })
            res.send({
                clientSecret: paymentIntent.client_secret,
            });
        });

        // payment collection
        app.post('/payments', async (req, res) => {
            const payment = req.body;
            const result = await paymentsCollection.insertOne(payment);
            const id = payment.bookingId
            const filter = { _id: ObjectId(id) }
            const updateDoc = {
                $set: {
                    paid: true,
                    transactionId: payment.transactionId
                }
            }
            const updatedResult = ordersCollection
                .updateOne(filter, updateDoc)
            res.send(result)

        })





        // app.get('/users/:id', async (req, res) => {
        //     const id = req.params.id
        //     const filter = { _id: ObjectId(id) }
        //     const result = await userCollection.findOne(filter);
        //     res.send(result)
        // })






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