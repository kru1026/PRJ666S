import React, { useState } from 'react';

const UploadImg = () => {
    const storedUser = JSON.parse(localStorage.getItem('user'));

    const [image, setImage] = useState(null);

    const handleFileChange = (e) => {
        setImage(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!image) {
            alert("Please select an image first.");
            return;
        }

        if (!image.name.endsWith(".png") && !image.name.endsWith(".jpg")){
            alert("Please select a supported format");
            return;
        }

        // Create FormData object to send the file as multipart/form-data
        const formData = new FormData();
        formData.append("file", image);
        formData.append("fileName", image.name);
        formData.append("userId", storedUser._id);

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/uploadImg/${storedUser._id}`, {
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
            <h2>Upload Your Photo</h2>
            <p>
                Please follow these steps to upload your Photo:
            </p>
            <ul>
                <li>Click the "Choose File" button to select your photo.</li>
                <li>Make sure the file is in an accepted format (Accepted Formats are: PNG, JPG).</li>
                <li>Once you have selected a photo, click the "Upload" button to submit it.</li>
                <li>Wait for the confirmation message to ensure the photo has uploaded successfully.</li>
            </ul>

            <form onSubmit={handleSubmit}>
                <input type="file" onChange={handleFileChange} />
                <button type="submit">Upload</button>
            </form>
        </div>
    );
};

export default UploadImg;
