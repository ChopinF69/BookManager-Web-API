const { MongoClient } = require("mongodb");

// Replace the uri string with your connection string.
const uri = "mongodb://127.0.0.1:27017/?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+2.2.12";

const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();

    const database = client.db('bookDB');
    const collection = database.collection('books');

    const books = [
      {
        "id": "1",
        "title": "To Kill a Mockingbird",
        "author": "Harper Lee",
        "pages": "281"
      },
      {
        "id": "2",
        "title": "1984",
        "author": "George Orwell",
        "pages": "328"
      },
      {
        "id": "3",
        "title": "The Great Gatsby",
        "author": "F. Scott Fitzgerald",
        "pages": "180"
      },
      {
        "id": "4",
        "title": "Pride and Prejudice",
        "author": "Jane Austen",
        "pages": "279"
      },
      {
        "id": "5",
        "title": "The Catcher in the Rye",
        "author": "J.D. Salinger",
        "pages": "214"
      },
      {
        "id": "6",
        "title": "The Hobbit",
        "author": "J.R.R. Tolkien",
        "pages": "310"
      },
      {
        "id": "7",
        "title": "Fahrenheit 451",
        "author": "Ray Bradbury",
        "pages": "249"
      },
      {
        "id": "8",
        "title": "Brave New World",
        "author": "Aldous Huxley",
        "pages": "268"
      },
      {
        "id": "9",
        "title": "Moby-Dick",
        "author": "Herman Melville",
        "pages": "585"
      },
      {
        "id": "10",
        "title": "War and Peace",
        "author": "Leo Tolstoy",
        "pages": "1225"
      }
    ];

    // Convert pages and id fields to integers
    const formattedBooks = books.map((book) => ({
      Book: {
        id: parseInt(book.id, 10),
        title: book.title,
        author: book.author,
        pages: parseInt(book.pages, 10)
      }
    }));

    const result = await collection.insertMany(formattedBooks);
    console.log(`${result.insertedCount} books were inserted`);
  } finally {
    await client.close();
  }
}
run().catch(console.dir);
