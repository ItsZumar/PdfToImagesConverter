import React, { useState } from "react";
import axios from "axios";

const FileUploadAndConvert = () => {
  const [file, setFile] = useState<File | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] || null;
    setFile(selectedFile);
    setError(null);
  };

  const handleUploadAndConvert = async () => {
    if (!file) {
      setError("Please select a file to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("pdf", file);

    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post("http://localhost:3000/file/upload-and-convert", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setImages(response.data.images);
    } catch (err) {
      console.error(err);
      setError("Failed to upload and convert the file. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
      <input type="file" accept=".pdf" onChange={handleFileChange} />
      <button onClick={handleUploadAndConvert} disabled={isLoading || !file} style={{ marginLeft: "10px" }}>
        {isLoading ? "Converting..." : "Upload and Convert"}
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {images.length > 0 && (
        <div>
          <h3>Converted Images:</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: "10px" }}>
            {images.map((image, index) => (
              <div key={index} style={{ textAlign: "center" }}>
                <img
                  src={`http://localhost:3000${image}`}
                  alt={`Page ${index + 1}`}
                  style={{ width: "100%", maxWidth: "150px", border: "1px solid #ccc", borderRadius: "5px" }}
                />
                <p>Page {index + 1}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUploadAndConvert;
