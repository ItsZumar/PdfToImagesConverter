import "./App.css";
import FileUpload from "./components/FileUpload";

function App() {
  return (
    <div className="App">
      <h1>PDF to Image Converter</h1>
      <FileUpload /> {/* Use the FileUpload component */}
    </div>
  );
}

export default App;
