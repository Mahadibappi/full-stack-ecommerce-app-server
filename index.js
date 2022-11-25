const express = require('express');
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require("dotenv").config();
const port = process.env.PORT || 5000;
const cors = require("cors");

const categories = require("./data/category.json")
const news = require("./data/product.json")

// middle ware
app.use(cors());
app.use(express.json())

app.get("/", (req, res) => {
    res.send("product server running")
})

app.get("/brands", (req, res) => {
    res.send(categories);
});


app.get("/category/:id", (req, res) => {
    const id = req.params.id
    const categoryNews = news.filter((n) => n.category_id === id);
    res.send(categoryNews);

});


































// MONGO DB

const uri = `mongodb+srv://${process.env.ADMIN_USER}:${process.env.ADMIN_PASS}@cluster0.guw4vbk.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run() {

    try {

        const brandCollection = client.db("usedProduct").collection("brand");

        const productCollection = client.db("usedProduct").collection("products")



        // get api

        // app.get("/brands", async (req, res) => {
        //     const query = {};
        //     const brands = await brandCollection.find(query).toArray()
        //     res.send(brands)
        // })

        // app.get('/category/:id', (req, res) => {
        //     const id = req.params.id;
        //     const productCategory = product.filter((product) => product.category_id === id);
        //     res.send(productCategory)
        // })


    }







    finally {

    }

}

run().catch(err => console.log(err))







// QECfFi55pmCHzvnS
// usedProduct


app.listen(port, () => {
    console.log("server running", port);
})