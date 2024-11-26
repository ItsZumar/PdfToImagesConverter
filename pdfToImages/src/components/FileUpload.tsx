import { useState } from "react";
import axios from "axios";

interface UploadResponse {
  filePath: string;
}

interface ConvertResponse {
  images: string[];
}

const FileUpload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [imagePaths, setImagePaths] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    console.log("file: ", selectedFile);
    setError(null);
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file.");
      return;
    }

    const formData = new FormData();
    formData.append("pdf", file);

    setIsLoading(true);
    try {
      const response = await axios.post<UploadResponse>("http://localhost:3000/file/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      console.log(response.data);
      const { filePath } = response.data;
      convertPDFToImages(filePath);
    } catch (err) {
      console.error(err);
      setError("Failed to upload file.");
      setIsLoading(false);
    }
  };

  const convertPDFToImages = async (filePath: string) => {
    try {
      const response = await axios.post<ConvertResponse>("http://localhost:3000/file/convert", { filePath });
      setIsLoading(false);
      const { images } = response.data;
      setImagePaths(images);
    } catch (err) {
      console.error(err);
      setError("Failed to convert PDF to images.");
      setIsLoading(false);
    }
  };

  return (
    <div>
      <input type="file" accept=".pdf" onChange={handleFileChange} />
      <button onClick={handleUpload} disabled={isLoading}>
        {isLoading ? "Converting..." : "Upload and Convert"}
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {imagePaths.length > 0 && (
        <div>
          <h3>Converted Images:</h3>
          <ul>
            {imagePaths.map((imagePath, index) => (
              <li key={index}>
                <img src={`http://localhost:3000/${imagePath}`} alt={`page-${index + 1}`} width="200" />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
