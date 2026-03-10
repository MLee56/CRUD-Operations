const express = require("express");
const cors = require("cors");
const { MongoClient, ObjectId } = require("mongodb");

const app = express();

app.use(cors());
app.use(express.json());

require("dotenv").config();
const uri = process.env.MONGO_URI;
const PORT = process.env.PORT || 5000;
const client = new MongoClient(uri);
let db, itemsCollection;

async function connectDB() { // Connect to MongoDB and set up the database and collection references
    try {
        await client.connect();
        db = client.db("crud_db");
        itemsCollection = db.collection("items");
        console.log("Connected to MongoDB");
    } catch (err) {
        console.error("Failed to connect to MongoDB", err);
    }
}

connectDB();

function authenticate(req, res, next) { // Middleware to authenticate requests based on the "Authorization" header
    const token = req.headers["authorization"];
    if (!token) {
        return res.status(401).json({ error: "No token provided" });
    }
    if (!token.endsWith("-token")) {
        return res.status(401).json({ error: "Invalid token" });
    }
    req.username = token.slice(0, -6);
    next();
}

async function updateItemById(id, username, fields) { // Helper function to update an item by ID and username
    const update = Object.fromEntries(Object.entries(fields).filter(([_, value]) => value !== undefined));
    const result = await itemsCollection.findOneAndUpdate(
        { _id: new ObjectId(id), username: username },
        { $set: update },
        { returnDocument: "after" }
    );
    return result?.value ?? result;
}

app.post("/items", authenticate, async (req, res) => { // Create a new item for the authenticated user
    const {type, data} = req.body;
    if (!type || data === undefined) {
        return res.status(400).json({ error: "Request must include 'type' and 'data'" });
    }
    const item = { username: req.username, type, data };
    const result = await itemsCollection.insertOne(item);
    res.json({ message: "Item created", item: { id: result.insertedId, ...item } });
});

app.get("/items", authenticate, async (req, res) => { // Retrieve items for the authenticated user, optionally filtered by type
    const { type } = req.query;
    const query = { username: req.username };
    if (type) {
        query.type = type;
    }
    const userItems = await itemsCollection.find(query).toArray();
    res.json(userItems);
});

app.put("/items/:id", authenticate, async (req, res) => { // Update an existing item by ID for the authenticated user
    const id = req.params.id;
    const {type, data} = req.body;
    if (type === undefined && data === undefined) {
        return res.status(400).json({ error: "Request must include 'type' or 'data'" });
    }
    const doc = await updateItemById(id, req.username, { type, data });
    if (!doc) {
        return res.status(404).json({ error: "Item not found or not owned by user" });
    }
    res.json({ message: "Item updated", item: doc });
});

app.delete("/items/:id", authenticate, async (req, res) => { // Delete an item by ID for the authenticated user
    const id = req.params.id;
    const result = await itemsCollection.findOneAndDelete({ _id: new ObjectId(id), username: req.username });
    const doc = result?.value ?? result;
    if (!doc) {
        return res.status(404).json({ error: "Item not found or not owned by user" });
    }
    res.json({ message: "Item deleted", item: doc });
});

app.listen(PORT, () => {
    console.log(`CRUD service is running on port ${PORT}`);
});