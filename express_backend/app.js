const express = require('express');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const app = express();
const upload = multer({ dest: 'uploads/' }); // Temporary storage for uploaded files

// API route to handle image conversion
app.post('/convert/image', upload.single('file'), async (req, res) => {
    const file = req.file;
    const format = req.body.format;
  
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
  
    const formData = new FormData();
    formData.append('file', fs.createReadStream(file.path));
    formData.append('format', format);
  
    try {
      console.log('Forwarding request to Flask...'); // Log when the request is sent to Flask
  
      // Forward the request to the Flask backend
      const flaskResponse = await axios.post('http://127.0.0.1:5001/convert/image', formData, {
        headers: formData.getHeaders(),
        responseType: 'stream', // Handle binary data
      });
  
      console.log('Flask response received'); // Log when the Flask response is received
  
      // Set headers and pipe the response back to the client
      res.set(flaskResponse.headers);
      flaskResponse.data.pipe(res);
    } catch (error) {
      console.error("Error communicating with Flask:", error.message);
      console.error(error.response?.data || error); // Log full error details
      res.status(500).json({ error: 'Conversion failed' });
    } finally {
      fs.unlinkSync(file.path); // Clean up the uploaded file
    }
  });
  

app.listen(3000, () => {
  console.log('Express server running at http://127.0.0.1:3000/');
});
