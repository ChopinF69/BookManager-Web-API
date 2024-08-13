
class Book {
  constructor(id_, title_, author_, pages_) {
    this.id = id_;
    this.title = title_;
    this.author = author_;
    this.pages = pages_;
  };

  getId() { return this.id; }
  getTitle() { return this.title; }
  getAuthor() { return this.author; }
  getPages() { return this.pages; }

  setId(id_) { this.id = id_; }
  setTitle(title_) { this.title = title_; }
  setAuthor(author_) { this.author = author_; }
  setPages(pages_) { this.pages = pages_; }

  toString() {
    return `${this.title} by ${this.author} has ${this.pages} pages`;
  }
}

module.exports = Book;
