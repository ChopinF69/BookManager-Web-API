
class Service {
  constructor(repo, collection) {
    this.repo_ = repo;
    this.collection_ = collection;
  }

  /// CRUD operations for simple repo
  async serviceAddBook(book) {
    try {
      await this.repo_.repoAddBook(book);
    }
    catch (error) {
      console.error("Error adding book : ", error.message);
    }
  }
  async serviceRemoveBook(book) {
    try {
      await this.repo_.repoRemoveBook(book);
    }
    catch (error) {
      console.error("Error removing book : ", error.message);
    }
  }

  async serviceUpdateBook(oldBook, newBook) {
    try {
      await this.repo_.repoUpdateBook(oldBook, newBook);
    }
    catch (error) {
      console.error("Error updating book : ", error.message);
    }
  }

  async serviceFindBook(predicateFn) {
    const books = await this.serviceGetAll();
    return books.find(predicateFn);
  }

  async serviceGetAll() {
    const books = await this.repo_.repoGetAll();
    return books;
  }

  async serviceFilterBooks(filterFn) {
    const books = await this.repo_.repoGetAll();
    return books.filter(filterFn);
  }

  async serviceSortBooks(compareFn) {
    const books = await this.repo_.repoGetAll();
    return books.sort(compareFn);
  }

  /// CRUD for Collection repo - colectie / cos
  async serviceCollectionAdd(book) {
    try {
      this.collection_.collectionAddBook(book);
    }
    catch (error) {
      console.error("Error adding to collection : ", error.message);
    }
  }

  async serviceCollectionRemove(book) {
    try {
      this.collection_.collectionRemoveBook(book);
    }
    catch (error) {
      console.error("Error removing from the collection : ", error.message);
    }
  }

  async serviceCollectionUpdate(oldBook, newBook) {
    try {
      this.collection_.collectionUpdateBook(oldBook, newBook);
    }
    catch (error) {
      console.error("Error updating the collection : ", error.message);
    }
  }

  async serviceCollectionFindBook(predicateFn) {
    return this.collection_.collectionFindBook(predicateFn);
  }

  async serviceCollectionGetAll() {
    return this.collection_.collectionGetAll();
  }

  async serviceCollectionAddRandom(number) {
    this.collection_.generateNumberOfBooks(number);
  }
}

module.exports = Service;
