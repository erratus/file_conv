const express = require('express');
const axios = require('axios');
const multer = require('multer');
const fs = require('fs');
const FormData = require('form-data');
const cors = require('cors'); 

const app = express();
app.use(cors()); // Enable CORS for all routes

// Route to test CORS
app.get('/api', (req, res) => {
    res.json({ message: "CORS enabled" });
});

// Set up Multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Route for image conversion
app.post('/convert/image', upload.single('file'), async (req, res) => {
    const file = req.file; // Uploaded file
    const format = req.body.format; // Desired format

    if (file) {
        const formData = new FormData();
        formData.append('file', fs.createReadStream(file.path));
        formData.append('format', format);

        try {
            // Forward the request to the Flask backend
            const flaskResponse = await axios.post('http://127.0.0.1:5001/convert/image', formData, {
                headers: formData.getHeaders(),
            });

            // Return Flask's response to the client
            res.set('Content-Type', flaskResponse.headers['content-type']);
            res.send(flaskResponse.data);
        } catch (error) {
            console.error('Error communicating with Flask:', error.message);
            res.status(500).json({ error: 'Conversion failed' });
        } finally {
            // Clean up the uploaded file
            fs.unlinkSync(file.path);
        }
    } else {
        res.status(400).json({ error: 'No file uploaded' });
    }
});

// Start the server on port 3000
app.listen(3000, () => {
    console.log('Express server running on http://127.0.0.1:3000');
});
