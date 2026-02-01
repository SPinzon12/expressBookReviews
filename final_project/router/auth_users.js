const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
  return users.some(user => user.username === username);
}

const authenticatedUser = (username,password)=>{ //returns boolean
  const user = users.find(user => user.username === username);
  return user && user.password === password;
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(300).send(JSON.stringify({message: "Username and password are required"}, null, 4));
  }
  
  if (!isValid(username)) {
    return res.status(300).send(JSON.stringify({message: "User not found"}, null, 4));
  }
  
  if (!authenticatedUser(username, password)) {
    return res.status(300).send(JSON.stringify({message: "Invalid password"}, null, 4));
  }
  
  const token = jwt.sign({ username }, "access", { expiresIn: '1h' });
  
  res.status(200).send(JSON.stringify({
    message: "Login successful",
    token: token
  }, null, 4));
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const { review } = req.query;
  const username = req.user.username; // Extraído del JWT verificado en el middleware
  
  if (!review) {
    return res.status(300).send(JSON.stringify({message: "Review is required"}, null, 4));
  }
  
  if (!books[isbn]) {
    return res.status(300).send(JSON.stringify({message: "Book not found"}, null, 4));
  }
  
  // Inicializar reviews si no existe
  if (!books[isbn].reviews) {
    books[isbn].reviews = {};
  }
  
  const existingReview = books[isbn].reviews[username];
  
  // Agregar o modificar review del usuario
  books[isbn].reviews[username] = review;
  
  res.status(200).send(JSON.stringify({
    message: existingReview ? "Review modified successfully" : "Review added successfully",
    reviews: books[isbn].reviews
  }, null, 4));
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.user.username; // Extraído del JWT verificado en el middleware
  
  if (!books[isbn]) {
    return res.status(300).send(JSON.stringify({message: "Book not found"}, null, 4));
  }
  
  if (!books[isbn].reviews) {
    return res.status(300).send(JSON.stringify({message: "No reviews found for this book"}, null, 4));
  }
  
  // Verificar si el usuario tiene una reseña para este libro
  if (!books[isbn].reviews[username]) {
    return res.status(300).send(JSON.stringify({message: "No review found for this user"}, null, 4));
  }
  
  // Eliminar la reseña del usuario
  delete books[isbn].reviews[username];
  
  res.status(200).send(JSON.stringify({
    message: "Review deleted successfully",
    reviews: books[isbn].reviews
  }, null, 4));
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
