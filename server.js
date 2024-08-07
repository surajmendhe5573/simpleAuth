const express = require('express');
const mongoose = require('mongoose');
const User = require('./models/UserModel');
const Product = require('./models/ProductModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());

mongoose.connect('mongodb://localhost:27017/simpleappp', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});


// Sign Up
app.post('/signup', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    console.log(err);
    
    res.status(500).json({ message: 'Error creating user', error });
  }
});

//  Sign In
app.post('/signin', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (user && await bcrypt.compare(password, user.password)) {
      const token = jwt.sign({ userId: user._id }, 'your_jwt_secret', { expiresIn: '1h' });
      res.json({ token });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error signing in', error });
  }
});

// Post API for Uploading Products
app.post('/products', async (req, res) => {
  try {
    const { name, description, price, stock } = req.body;
    const newProduct = new Product({ name, description, price, stock });
    await newProduct.save();
    res.status(201).json({ message: 'Product uploaded successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error uploading product', error });
  }
});

// Get API for Retrieving Products
app.get('/products', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving products', error });
  }
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
