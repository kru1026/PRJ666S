import React, { useState } from 'react';
import axios from 'axios';
const FileUpload = () => {
    const storedUser = JSON.parse(localStorage.getItem('user'));

    const [file, setFile] = useState(null);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!file) {
            alert("Please select a file first");
            return;
        }

        if (!file.name.endsWith(".png") && !file.name.endsWith(".jpg") && !file.name.endsWith(".pdf") && !file.name.endsWith(".docx")){
            alert("Please select a supported format");
            return;
        }

        // Create FormData object to send the file as multipart/form-data
        const formData = new FormData();
        formData.append("file", file);
        formData.append("fileName", file.originalname);
        formData.append("userId", storedUser._id);

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/upload/${storedUser._id}`, {
                method: 'POST',
                body: formData,
            });
            
            const data = await response.json();

            if (response.ok) {
                console.log("File uploaded successfully:", data);
                alert("File uploaded successfully!");
            } else {
                console.error("File upload failed:", data.message);
                alert("File upload failed. Please try again.");
            }
        } catch (error) {
            console.error("Error uploading file:", error);
            alert("An error occurred during file upload. Please try again.");
        }
    };

    return (
        <div>
            <h2>Upload Your File</h2>
            <p>
                Please follow these steps to upload your file:
            </p>
            <ul>
                <li>Click the "Choose File" button to select your file.</li>
                <li>Make sure the file is in an accepted format (Accepted Formats are: PNG, JPG, PDF, DOCX).</li>
                <li>Once you have selected a file, click the "Upload" button to submit it.</li>
                <li>Wait for the confirmation message to ensure the file has uploaded successfully.</li>
            </ul>

            <form onSubmit={handleSubmit}>
                <input type="file" onChange={handleFileChange} />
                <button type="submit">Upload</button>
            </form>
        </div>
    );
};

export default FileUpload;
