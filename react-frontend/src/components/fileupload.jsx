import React, { useState } from "react";
import axios from "axios";

const fileUpload = () => {
  const [file, setFile] = useState(null);
  const [format, setFormat] = useState("");
  const [message, setMessage] = useState("");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleFormatChange = (e) => {
    setFormat(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file || !format) {
      setMessage("Please select a file and format.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("format", format);

    try {
      const response = await axios.post("http://localhost:3000/convert/image", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Create a download link for the converted file
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `converted.${format}`);
      document.body.appendChild(link);
      link.click();

      setMessage("File converted successfully!");
    } catch (error) {
      setMessage("File conversion failed. Please try again.");
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input type="file" onChange={handleFileChange} />
        <select value={format} onChange={handleFormatChange}>
          <option value="">Select Format</option>
          <option value="png">PNG</option>
          <option value="jpg">JPG</option>
          <option value="webp">WebP</option>
          <option value="gif">GIF</option>
        </select>
        <button type="submit">Convert</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default fileUpload;
