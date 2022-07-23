const express = require('express');
var jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId} = require('mongodb');
const cors = require('cors');
require('dotenv').config();
const port = process.env.PORT || 5000;

const app = express();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

// use middleware
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ox2of.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


// function verifyJWT(req, res, next) {
//     const authHeader = req.headers.authorization;
//     if (!authHeader) {
//         return res.status(401).send({ message: 'Unauthorized access' })
//     }
//     const token = authHeader.split(' ')[1];
//     jwt.verify(token, process.env.SECRET_TOKEN, function (err, decoded) {
//         if (err) {
//             return res.status(403).send({ message: 'forbiddent access' })
//         }
//         req.decoded = decoded;
//         console.log(req.decoded);
//         next();
//     })
// }


async function run() {

    try {
        await client.connect();

        const productCollection = client.db('nursery_product').collection('products');
        const blogCollection = client.db('nursery_product').collection('blogs');
        const userCollection = client.db('nursery_product').collection('user');

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
        // //page work
        const page = parseInt(req.query.page);
        const size = parseInt(req.query.size);

        const query = {};
        const cursor = productCollection.find(query);

        let product;
        if (page || size){

            product = await cursor.skip(page*size).limit(size).toArray();
        }
        else{
            product = await cursor.toArray();
        }
        // const product = await cursor.toArray();
        res.send(product);
    });

    //stock product

    app.get('/stockProduct',async(req,res)=>{
        const query = {};
        const cursor = productCollection.find(query).project({stock:1});
        const stocks = await cursor.toArray();
        res.send(stocks);
    })

    app.get('/productCount',async(req,res)=>{
        const count = await productCollection.estimatedDocumentCount();
        res.send({count});
    });

// order quantity setup page wish

    app.post('/productByKeys',async(req,res)=>{
        const keys = req.body;
        console.log(keys);
        const ids = keys.map(id=>ObjectId(id));
        const query = {_id:{$in:ids}};
        const cursor = productCollection.find(query);
        const products = await cursor.toArray();
        res.send(products);
    });


     //User create and store Backend using put method

     app.put('/user/:email', async (req, res) => {
        const email = req.params.email;
        const user = req.body;
        const filter = { email: email };
        const options = { upsert: true };
        const updateDoc = {
            $set: user,
        };
        const result = await userCollection.updateOne(filter, updateDoc, options);
        // const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
        // res.send({ result });
        res.send(result);
    })
     //User collect and show in client server

     app.get('/user', async (req, res) => {
        const users = await userCollection.find().toArray();
        res.send(users);
    });

     //create Admin Role

     app.put('/user/admin/:email', async (req, res) => {
        const email = req.params.email;
            const filter = { email: email };
            const updateDoc = {
                $set: { role: 'admin' },
            };
            const result = await userCollection.updateOne(filter, updateDoc);
            res.send(result);
    });
    //  app.put('/user/admin/:email',verifyJWT, async (req, res) => {
    //     const email = req.params.email;
    //     const requester = req.decoded.email;
    //     const requesterAccount = await userCollection.findOne({ email: requester });
    //     if (requesterAccount.role === 'admin') {
    //         const filter = { email: email };
    //         const updateDoc = {
    //             $set: { role: 'admin' },
    //         };
    //         const result = await userCollection.updateOne(filter, updateDoc);
    //         res.send(result);
    //     }
    //     else {
    //         res.status(403).send({ message: 'forbiddent' })
    //     }

    // });

     // Resticted make addmin

     app.get('/admin/:email', async (req, res) => {
        const email = req.params.email;
        const user = await userCollection.findOne({ email: email });
        const isAdmin = user.role === 'admin';
        res.send({admin:isAdmin});
    });


    // Payment system
    app.post('/create-payment-intent',async (req,res)=>{
        const service = req.body;
        const grandTotal = service.grandTotal;
        const amount = grandTotal*100;
        const paymentIntent = await stripe.paymentIntents.create({
            amount:amount,
            currency:'usd',
            payment_method_types:['card']
        });
        res.send({clientSecret:paymentIntent.client_secret});
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