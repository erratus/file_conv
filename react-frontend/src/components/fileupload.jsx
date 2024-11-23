import React, { useState } from "react";
import axios from "axios";

const FileUpload = () => {
    const [file, setFile] = useState(null);
    const [conversions, setConversions] = useState([]);
    const [format, setFormat] = useState("");
    const [downloadLink, setDownloadLink] = useState("");

    const handleFileChange = async (event) => {
        const uploadedFile = event.target.files[0];
        setFile(uploadedFile);
        setConversions([]); // Clear previous options
        setFormat(""); // Reset selected format

        // Fetch supported conversions
        if (uploadedFile) {
            const formData = new FormData();
            formData.append("file", uploadedFile);

            try {
                const response = await axios.post("http://127.0.0.1:5001/get-conversions", formData);
                setConversions(response.data.conversions || []);
            } catch (error) {
                console.error("Error fetching conversions:", error);
            }
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!file || !format) {
            alert("Please upload a file and select a format.");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);
        formData.append("format", format);

        try {
            const response = await axios.post("http://127.0.0.1:5001/convert", formData, {
                responseType: "blob", // Expecting a file in the response
            });

            const blob = new Blob([response.data]);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `converted_file.${format}`;
            link.click();
            window.URL.revokeObjectURL(url); // Clean up
        } catch (error) {
            console.error("Error during file conversion:", error);
        }
    };

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <input type="file" onChange={handleFileChange} />
                {conversions.length > 0 && (
                    <select value={format} onChange={(e) => setFormat(e.target.value)}>
                        <option value="">Select Format</option>
                        {conversions.map((conversion) => (
                            <option key={conversion} value={conversion}>
                                {conversion.toUpperCase()}
                            </option>
                        ))}
                    </select>
                )}
                <button type="submit" disabled={!format}>
                    Convert
                </button>
            </form>
            {downloadLink && (
                <a href={downloadLink} download>
                    Download Converted File
                </a>
            )}
        </div>
    );
};

export default FileUpload;
