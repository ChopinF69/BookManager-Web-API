const { MongoClient } = require("mongodb");
const Book = require('./domain');

class Repo {
  constructor() {
    this.client = new MongoClient("mongodb://127.0.0.1:27017/?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+2.2.12");
    this.db = null;
    this.collection = null;
  }

  async connect() {
    try {
      await this.client.connect();
      this.db = this.client.db('bookDB');
      this.collection = this.db.collection('books');
    } catch (error) {
      console.log("Error connecting to MongoDB: " + error.message);
    }
  }

  async close() {
    try {
      await this.client.close();
    } catch (error) {
      console.log("Error closing MongoDB connection: " + error.message);
    }
  }

  async repoAddBook(book) {
    try {
      const document = {
        Book: {
          id: parseInt(book.id, 10),
          title: book.title,
          author: book.author,
          pages: parseInt(book.pages, 10)
        }
      };
      const result = await this.collection.insertOne(document);
      console.log(`Book added with id: ${result.insertedId}`);
    } catch (error) {
      throw new Error("Error adding book: " + error.message);
    }
  }

  async repoRemoveBook(book) {
    try {

      const result = await this.collection.deleteOne({ "Book.id": book.id });

      if (result.deletedCount === 0) {
        throw new Error("The book that you want to remove doesn't exist");
      }
    } catch (error) {
      throw new Error("Error removing book: " + error.message);
    }
  }

  async repoUpdateBook(oldBook, newBook) {
    try {
      const result = await this.collection.updateOne(
        { "Book.id": oldBook.id },
        { $set: { "Book": newBook } }
      );

      if (result.matchedCount === 0) {
        throw new Error("The book you want to update doesn't exist");
      }
    } catch (error) {
      throw new Error("Error updating book: " + error.message);
    }
  }

  async repoFindBook(predicateFn) {
    const allBooks = await this.books.find().toArray();
    const books = allBooks.map((bookObj => newBook(
      bookObj.Book.id,
      bookObj.Book.title,
      bookObj.Book.author,
      bookObj.Book.pages
    )));
    return books.find(predicateFn);
  }

  async repoGetAll() {
    try {
      const allBooks = await this.collection.find().toArray();
      return allBooks.map((bookObj) => new Book(
        bookObj.Book.id,
        bookObj.Book.title,
        bookObj.Book.author,
        bookObj.Book.pages
      ))
    } catch (error) {
      throw new Error("Error getting all books: " + error.message);
    }
  }
}

class Collection {
  constructor(repo) {
    this.repo_ = repo;
    this.collectionBooks_ = [];
  }

  collectionAddBook(book) {
    let alreadyExists = false;
    for (let i = 0; i < this.collectionBooks_.length; i++) {
      if (book.getId() == this.collectionBooks_[i].getId()) {
        alreadyExists = true;
        break;
      }
    }
    if (alreadyExists) throw new Error("The book already exists in the collection !");
    if (book.getPages() < 0) throw new Error("Not a realistic number of pages");
    if (!book.getTitle()) throw new Error("Title cannot be empty");

    this.collectionBooks_.push(book);
  }

  collectionRemoveBook(book) {

    let bookRemoved = false;
    for (let i = 0; i < this.collectionBooks_.length; i++) {
      if (this.collectionBooks_[i].getId() == book.getId()) {
        this.collectionBooks_.splice(i, 1);
        bookRemoved = true;
        break;
      }
    }
    if (bookRemoved == false) throw new Error("The book that you want to remove doesn't exit in the collection");

  }

  collectionUpdateBook(oldBook, newBook) {
    const bookIndex = this.collectionBooks_.findIndex(bookFromCollection => bookFromCollection.getId() === oldBook.getId());
    if (bookIndex === -1) throw new Error("The book you want to update doesn't exist in the collection");

    this.collectionBooks_[bookIndex] = newBook;
  }
  collectionGetAll() {
    return this.collectionBooks_;
  }
}
module.exports = { Repo, Collection };
