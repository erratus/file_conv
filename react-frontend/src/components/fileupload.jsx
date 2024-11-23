import React, { useState } from "react";
import axios from "axios";

const FileUpload = () => {
    const [file, setFile] = useState(null);
    const [format, setFormat] = useState("png");
    const [downloadLink, setDownloadLink] = useState("");

    const handleFileChange = (event) => {
        setFile(event.target.files[0]);
    };

    const handleFormatChange = (event) => {
        setFormat(event.target.value);
    };

    const handleSubmit = async (event) => {
      event.preventDefault();
      if (!file) {
          alert("Please upload a file.");
          return;
      }
  
      const formData = new FormData();
      formData.append("file", file);
      formData.append("format", format);
  
      try {
          const response = await axios.post("http://127.0.0.1:5001/convert/image", formData, {
              responseType: "blob", // Expecting a file in the response
          });
  
          const blob = new Blob([response.data]);
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = `converted_file.${format}`;
          link.click();
          window.URL.revokeObjectURL(url); // Clean up the URL object
      } catch (error) {
          console.error("Error during file conversion:", error);
      }
  };
  

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <input type="file" onChange={handleFileChange} />
                <select value={format} onChange={handleFormatChange}>
                    <option value="png">PNG</option>
                    <option value="jpg">JPG</option>
                    <option value="webp">WebP</option>
                    <option value="gif">GIF</option>
                </select>
                <button type="submit">Convert</button>
            </form>
            {downloadLink && (
                <a href={downloadLink} download="converted_file">
                    Download Converted File
                </a>
            )}
        </div>
    );
};

export default FileUpload;
