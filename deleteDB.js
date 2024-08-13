const { MongoClient } = require("mongodb");

// Replace the uri string with your connection string.
const uri = "mongodb://127.0.0.1:27017/?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+2.2.12";

const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();

    const database = client.db('bookDB');

    // Get all collection names
    const collections = await database.collections();
    for (let collection of collections) {
      await collection.drop();
      console.log(`Dropped collection: ${collection.collectionName}`);
    }

    console.log("All collections dropped, database is now empty.");
  } finally {
    await client.close();
  }
}

run().catch(console.dir);

