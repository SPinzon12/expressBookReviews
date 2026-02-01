const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');

public_users.post("/register", (req, res) => {
    const { username, password } = req.body;
    
    // Verificar que se proporcionaron username y password
    if (!username || !password) {
        return res.status(300).send(JSON.stringify({ message: "Username and password are required" }, null, 4));
    }
    
    // Verificar si el usuario ya existe
    if (users.some(user => user.username === username)) {
        return res.status(300).send(JSON.stringify({ message: "Username already exists" }, null, 4));
    }
    
    // Registrar nuevo usuario
    users.push({ username, password });
    
    res.status(200).send(JSON.stringify({ message: "User registered successfully" }, null, 4));
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {
    res.status(200).send(JSON.stringify(books, null, 4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
    const book = books[req.params.isbn];
    if (book) {
        res.status(200).send(JSON.stringify(book, null, 4));
    } else {
        res.status(300).send(JSON.stringify({ message: "Book not found" }, null, 4));
    }
});

// Get book details based on author
public_users.get('/author/:author', function (req, res) {
    // Convertir URL parameter (ej: "J.K.%20Rowling" a "J.K. Rowling")
    const authorName = decodeURIComponent(req.params.author);
    const booksByAuthor = {};
    
    for (const isbn in books) {
        if (books[isbn].author.trim().toLowerCase() === authorName.trim().toLowerCase()) {
            booksByAuthor[isbn] = books[isbn];
        }
    }
    
    if (Object.keys(booksByAuthor).length > 0) {
        res.status(200).send(JSON.stringify(booksByAuthor, null, 4));
    } else {
        res.status(300).send(JSON.stringify({ message: "No books found for this author" }, null, 4));
    }
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
    // Convertir URL parameter (ej: "The%20Great%20Gatsby" a "The Great Gatsby")
    const titleName = decodeURIComponent(req.params.title);
    const booksByTitle = {};
    
    for (const isbn in books) {
        if (books[isbn].title.trim().toLowerCase() === titleName.trim().toLowerCase()) {
            booksByTitle[isbn] = books[isbn];
        }
    }
    
    if (Object.keys(booksByTitle).length > 0) {
        res.status(200).send(JSON.stringify(booksByTitle, null, 4));
    } else {
        res.status(300).send(JSON.stringify({ message: "No books found with this title" }, null, 4));
    }
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
    const book = books[req.params.isbn];
    if (book) {
        res.status(200).send(JSON.stringify(book.reviews || {}, null, 4));
    } else {
        res.status(300).send(JSON.stringify({ message: "Book not found" }, null, 4));
    }
});


// Get list of books using async/await with Axios
public_users.get('/async/books', async (req, res) => {
    try {
        const response = await axios.get('http://localhost:5000/');
        res.status(200).send(JSON.stringify(response.data, null, 4));
    } catch (error) {
        res.status(300).send(JSON.stringify({ message: "Error fetching books" }, null, 4));
    }
});

// Get book by ISBN using async/await with Axios
public_users.get('/async/isbn/:isbn', async (req, res) => {
    try {
        const response = await axios.get(`http://localhost:5000/isbn/${req.params.isbn}`);
        res.status(200).send(JSON.stringify(response.data, null, 4));
    } catch (error) {
        res.status(300).send(JSON.stringify({ message: "Error fetching book" }, null, 4));
    }
});

// Get books by author using async/await with Axios
public_users.get('/async/author/:author', async (req, res) => {
    try {
        const response = await axios.get(`http://localhost:5000/author/${req.params.author}`);
        res.status(200).send(JSON.stringify(response.data, null, 4));
    } catch (error) {
        res.status(300).send(JSON.stringify({ message: "Error fetching books by author" }, null, 4));
    }
});

// Get books by title using async/await with Axios
public_users.get('/async/title/:title', async (req, res) => {
    try {
        const response = await axios.get(`http://localhost:5000/title/${req.params.title}`);
        res.status(200).send(JSON.stringify(response.data, null, 4));
    } catch (error) {
        res.status(300).send(JSON.stringify({ message: "Error fetching books by title" }, null, 4));
    }
});

module.exports.general = public_users;
