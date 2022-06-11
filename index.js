const express = require('express');
var jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
require('dotenv').config();
const port = process.env.PORT || 5000;

const app = express();

// use middleware
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ox2of.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
async function run() {

    try {
        await client.connect();

        const productCollection = client.db('nursery_product').collection('products');
        const blogCollection = client.db('nursery_product').collection('blogs');

    //     app.get('/product',async(req,res)=>{
    //         console.log('query',req.query);
    //         //page work
    //         const page = parseInt(req.query.page);
    //         const size = parseInt(req.query.size);

    //         const query = {};
    //         const cursor = productCollection.find(query);

    //         let product;
    //         if (page || size){

    //             product = await cursor.skip(page*size).limit(size).toArray();
    //         }
    //         else{
    //             product = await cursor.toArray();
    //         }
    //         res.send(product);
    //     });

    //     app.get('/productCount',async(req,res)=>{
    //         const count = await productCollection.estimatedDocumentCount();
    //         res.send({count});
    //     });

    // // order quantity setup page wish
    // app.post('/productByKeys',async(req,res)=>{
    //     const keys = req.body;
    //     const ids = keys.map(id=>ObjectId(id));
    //     const query = {_id: {$in: ids}};
    //     const cursor = productCollection.find(query);
    //     const products = await cursor.toArray();
    //     res.send(products);
    //     console.log(keys);
    // });

        // Product add
        app.post('/product', async (req, res) => {
            const newProduct = req.body;
            const result = await productCollection.insertOne(newProduct);
            res.send(result);
        });

        // Blog add
        app.post('/addBlog', async (req, res) => {
            const newBlog = req.body;
            const result = await blogCollection.insertOne(newBlog);
            res.send(result);
        });

        // Show Blog

        app.get('/addBlog', async(req,res)=>{
            const query = {};
            const cursor = blogCollection.find(query);
            const blog = await cursor.toArray();
            res.send(blog);
        })


    app.get('/product',async(req,res)=>{
        // console.log('query',req.query);
        // //page work
        // const page = parseInt(req.query.page);
        // const size = parseInt(req.query.size);

        const query = {};
        const cursor = productCollection.find(query);

        // let product;
        // if (page || size){

        //     product = await cursor.skip(page*size).limit(size).toArray();
        // }
        // else{
        //     product = await cursor.toArray();
        // }
        const product = await cursor.toArray();
        res.send(product);
    });

    app.get('/productCount',async(req,res)=>{
        const count = await productCollection.estimatedDocumentCount();
        res.send({count});
    });

// order quantity setup page wish
app.post('/productByKeys',async(req,res)=>{
    const keys = req.body;
    const ids = keys.map(id=>ObjectId(id));
    const query = {_id: {$in: ids}};
    const cursor = productCollection.find(query);
    const products = await cursor.toArray();
    res.send(products);
    console.log(keys);
});
       
    }
    finally {

    }
}


run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Nursery Server is Running');
})

app.listen(port, (req, res) => {
    console.log('server is running : ', port);
})