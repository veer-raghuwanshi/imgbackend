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
mongoose.connect('mongodb+srv://veer_raghuwanshi:Veer1234@imgtesting.hzhgtms.mongodb.net/photos', {
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



// Handle GET request to create a new image
app.get('/', async (req, res) => {
  res.send('Welcome to the image upload server!');
  try {
    // Create a new image document
    const image = new Image({
      profileImage: 'https://imgbackend.onrender.com/uploads/example.jpg' // Replace 'example.jpg' with the desired filename
    });

    // Save the document to the database
    await image.save();

    // Return the created image document as a JSON response
    res.json(image);
  } catch (error) {
    console.error('Error creating image:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Handle file uploads
app.post('/upload', upload.single('profileImage'), async (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  // Create a new document in the Image collection
  const image = new Image({
    profileImage: 'https://imgbackend.onrender.com/uploads/' + req.file.filename
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

// Start the server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
