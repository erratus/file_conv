import React, { useState } from 'react';
import axios from 'axios';

const fileUploader = () => {
  const [file, setFile] = useState(null);
  const [format, setFormat] = useState('png');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleFormatChange = (e) => {
    setFormat(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      alert("Please upload a file.");
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('format', format);

    setIsProcessing(true);

    try {
      const response = await axios.post('http://127.0.0.1:3000/convert/image', formData, {
        responseType: 'blob', // To handle binary data
      });

      // Create a download link for the file
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `converted.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error during file conversion:", error);
      alert("File conversion failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>File Converter</h1>
      <form onSubmit={handleSubmit}>
        <input type="file" onChange={handleFileChange} />
        <select value={format} onChange={handleFormatChange}>
          <option value="png">PNG</option>
          <option value="jpg">JPG</option>
          <option value="webp">WEBP</option>
          <option value="gif">GIF</option>
          <option value="bmp">BMP</option>
        </select>
        <button type="submit" disabled={isProcessing}>
          {isProcessing ? "Converting..." : "Convert"}
        </button>
      </form>
    </div>
  );
};

export default fileUploader;
