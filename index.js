// index.js

const express = require('express');
const app = express();
const multer = require('multer');
const path = require('path');
const mongoose = require('mongoose');

const port = 3000;

// Multer configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Store uploaded files in the 'uploads' directory
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname); // Use current timestamp as the filename
  }
});
const upload = multer({ storage: storage });

// Connect to MongoDB
mongoose.connect('mongodb+srv://veer_raghuwanshi:1234@cluster1.vtznpbg.mongodb.net/imgaee', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((err) => {
  console.error('Error connecting to MongoDB:', err);
});

// Define a schema for the uploaded image data
const imageSchema = new mongoose.Schema({
  profileImage: String
});

// Create a model based on the schema
const Image = mongoose.model('Image', imageSchema);

app.get('/', async (req, res) => {
  res.send('Welcome to the image upload server!');

  try {
    // Retrieve all Image documents from the database
    const images = await Image.find();

    // Extract the profileImage URLs from the documents
    const imageUrls = images.map(image => image.profileImage);

    // Return the image URLs as a JSON response
    res.json(imageUrls);
  } catch (error) {
    console.error('Error retrieving images:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Define a route to handle file uploads
app.post('/upload', upload.single('profileImage'), async (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  // Create a new document in the Image collection
  const image = new Image({
    profileImage: 'http://localhost:3000/uploads/' + req.file.filename
  });

  try {
    // Save the document to the database
    await image.save();

    // Return the file path in the response
    res.json({
      profileImage: image.profileImage
    });
  } catch (error) {
    console.error('Error saving image:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Serve uploaded files statically

// Start the server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
