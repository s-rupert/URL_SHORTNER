require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());




//Project code begin from here.....

const dns = require('dns');
const url = require('url');
//urlencoder
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Database connected!');
  })
  .catch((err) => {
    console.error('Error connecting to the database:', err);
  });

  
app.use(express.urlencoded({ extended: true }));

const urlSchema = new mongoose.Schema({
  originalURL: { type: String, required: true },
  shortURL: { type: Number, required: true },
});

let UrlModel = mongoose.model('UrlModel', urlSchema);


app.post("/api/shorturl", async (req, res) => {
  const urls = req.body.url;
  const dnslookup = dns.lookup(new URL(urls).hostname, async (err, address) => {
    if (err || !address) {
    res.json({error: "Invalid URL"})
    }else{

  try {
    // Count the number of documents
    const count = await UrlModel.countDocuments({});

    // Create and save the new URL document
    const newURL = new UrlModel({
      originalURL: urls,
      shortURL: count, // Increment count for the new short URL
    });

    await newURL.save();

    // Respond with the saved data
    res.json({ original_url: newURL.originalURL, short_url: newURL.shortURL });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "An error occurred while processing your request." });
  }
}
});
});

app.get("/api/shorturl/:shortURL", async (req, res) => {
  const shortURL = req.params.shortURL;  // Get shortURL from the URL parameters

  try {
    // Find the document that matches the shortURL
    const urlDoc = await UrlModel.findOne({ shortURL: shortURL });

    if (urlDoc) {
      // Redirect to the original URL
      console.log(urlDoc.originalURL)
      res.redirect(urlDoc.originalURL);
    } else {
      // If no document is found, send a 404 error
      res.status(404).json({ error: "No URL found for the given shortURL" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "An error occurred while retrieving the URL." });
  }
});




//Project code ends before here.....


app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
