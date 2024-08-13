const express = require('express');
const path = require('path');
const app = express();
const port = 3002;
const methodOverride = require('method-override');
app.use(express.static(path.join(__dirname, 'public')));
const { Repo, Collection } = require('./repo');
const Service = require('./service');
const Book = require('./domain');

const repo = new Repo();
repo.connect().then(() => {
  const collection = new Collection(repo);
  const service = new Service(repo, collection);

  app.set('view engine', 'ejs');
  app.set('views', path.join(__dirname, 'views'));
  app.set(express.static(path.join(__dirname, 'public')));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(methodOverride('_method'));

  // Add a book
  app.post('/books', async (req, res) => {
    try {
      const { id, title, author, pages } = req.body;
      const newBook = new Book(id, title, author, pages);
      await service.serviceAddBook(newBook);
      res.status(201).send('Book added successfully');
    } catch (error) {
      res.status(400).send(error.message);
    }
  });

  // Get all books
  app.get('/books', async (req, res) => {
    try {
      const books = await service.serviceGetAll();
      res.render('allBooks', { books });
    } catch (error) {
      res.status(500).send(error.message);
    }
  });

  // Get a book by id
  app.get('/books/:id', async (req, res) => {
    try {
      const bookId = parseInt(req.params.id, 10);
      const books = await service.serviceGetAll();
      const book = await service.serviceFindBook(b => b.getId() == bookId);
      if (book) {
        res.render('bookDetails', { book });
      } else {
        res.status(404).send('Book not found');
      }
    } catch (error) {
      res.status(400).send(error.message);
    }
  });

  // Edit a book
  app.get('/books/:id/edit', async (req, res) => {
    try {
      const bookId = parseInt(req.params.id, 10);
      const book = await service.serviceFindBook(b => b.getId() === bookId);
      if (book) {
        res.render('editBook', { book });
      } else {
        res.status(404).send('Book not found');
      }
    } catch (error) {
      res.status(400).send(error.message);
    }
  });

  // Update a book
  app.put('/books/:id', async (req, res) => {
    try {
      const bookId = parseInt(req.params.id, 10);
      const { title, author, pages } = req.body;
      const bookToUpdate = await service.serviceFindBook(b => b.getId() === bookId);
      if (!bookToUpdate) {
        return res.status(404).send('Book not found');
      }
      const newBook = new Book(parseInt(bookId, 10), title, author, parseInt(pages, 10));
      await service.serviceUpdateBook(bookToUpdate, newBook);
      res.redirect('/books/' + bookId);
    } catch (error) {
      res.status(400).send(error.message);
    }
  });

  // Delete a book
  app.delete('/books/:id', async (req, res) => {
    try {
      const bookId = parseInt(req.params.id, 10);
      const bookToDelete = await service.serviceFindBook(b => b.getId() === bookId);
      if (!bookToDelete) {
        return res.status(404).send('Book not found');
      }
      await service.serviceRemoveBook(bookToDelete);
      res.redirect('/books');
    } catch (error) {
      res.status(400).send(error.message);
    }
  });

  // http://localhost:3002/filter?filter=title&var=t1
  app.get('/filter', async (req, res) => {
    try {
      const { filter, var: filterValue } = req.query;

      const filteredBooks = await service.serviceFilterBooks(book => {
        switch (filter) {
          case 'title':
            return book.title === filterValue;
          case 'author':
            return book.author === filterValue;
          case 'pages':
            return book.pages.toString() === filterValue;
          default:
            return false;
        }
      });
      //res.json(filteredBooks);
      res.render('filteredBooks', { books: filteredBooks });
    }
    catch (error) {
      res.status(500).send(error.message);
    }
  });

  // http://localhost:3002/sort?by=title&order=desc
  // http://localhost:3002/sort?by=pages&order=asc
  app.get('/sort', async (req, res) => {
    try {
      const { by, order = 'asc' } = req.query;
      const compareFn = (a, b) => {
        let comp = 0;
        switch (by) {
          case 'title':
            comp = a.title.localeCompare(b.title);
            break;
          case 'author':
            comp = a.author.localeCompare(b.author);
            break;
          case 'pages':
            comp = a.pages - b.pages;
            break;
          default:
            return 0;
        }
        return order === 'desc' ? -comp : comp;
      };

      const sortedBooks = await service.serviceSortBooks(compareFn);
      res.render('sortedBooks', { books: sortedBooks });
      //      res.json(sortedBooks);
    }
    catch (error) {
      res.status(500).send(error.message);
    }
  });

  /// Collection

  app.post('/collection', async (req, res) => {
    try {
      const { id, title, author, pages } = req.body;
      const book = new Book(id, title, author, pages);
      await service.serviceCollectionAdd(book);
      res.redirect('/collection/home');
      //      res.status(201).json({ message: 'Book added to collection!' });
    }
    catch (error) {
      res.status(400).send(error.message);
    }
  });

  app.delete('/collection/:id', async (req, res) => {
    try {
      const book = await service.serviceFindBook(b => b.id === parseInt(req.params.id));
      if (!book) throw new Error("Book not found");

      await service.serviceCollectionRemove(book);
      res.redirect('/collection/home');
      //      res.status(200).json({ message: 'Book removed from collection' });
    } catch (error) {
      res.status(400).send(error.message);
    }
  });

  app.get('/collection/check/:id', async (req, res) => {
    try {
      const bookId = parseInt(req.params.id, 10);
      const collectionBooks = await service.serviceCollectionGetAll();
      const bookInCollection = collectionBooks.some(book => book.getId() == bookId);
      //      res.send(bookInCollection ? 'Book in the collection' : 'Book not in the collection');
      res.render('checkBook', { bookId, bookInCollection });
    }
    catch (error) {
      res.status(500).send(error.message);
    }
  });

  app.put('/collection/:id', async (req, res) => {
    try {
      const oldBook = await service.serviceFindBook(b => b.id === parseInt(req.params.id));
      if (!oldBook) throw new Error("Book not found");

      const { id, title, author, pages } = req.body;
      const newBook = new Book(id, title, author, parseInt(pages, 10));
      await service.serviceCollectionUpdate(oldBook, newBook);
      res.status(200).json({ message: 'Book updated in collection' });
    }
    catch (error) {
      res.status(400).send(error.message);
    }
  });

  app.get('/collection', async (req, res) => {
    try {
      const books = await service.serviceCollectionGetAll();
      res.json(books);
    } catch (error) {
      res.status(500).send(error.message);
    }
  });

  app.get('/collection/home', async (req, res) => {
    try {
      const books = await service.serviceGetAll();
      res.render('collectionHome', { books });
    }
    catch (error) {
      res.status(500).send(error.message);
    }
  });

  app.get('/collection/view', async (req, res) => {
    try {
      const collectionBooks = await service.serviceCollectionGetAll();
      res.render('collectionView', { books: collectionBooks });
    } catch (error) {
      res.status(500).send(error.message);
    }
  })

  // Start the server
  app.listen(port, (error) => {
    if (error) {
      console.error("Failed to start the server: ", error);
    } else {
      console.log("Server is running at http://localhost:" + port);
    }
  });
}).catch(console.dir);

