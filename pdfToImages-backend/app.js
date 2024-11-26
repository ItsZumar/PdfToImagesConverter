import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fromPath } from "pdf2pic";
import { PDFDocument } from "pdf-lib";
import cors from "cors";
import { fileURLToPath } from "url";

const app = express();

app.use(express.json());
app.use(cors());
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// app.use(express.static(path.join(__dirname, "converted")));
app.use("/converted", express.static(path.join(__dirname, "converted")));

const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const fileTypes = /pdf/;
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = fileTypes.test(file.mimetype);

    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed!"));
    }
  },
});

app.post("/file/upload", upload.single("pdf"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded." });
  }

  const filePath = req.file.path;
  res.json({ message: "PDF uploaded successfully.", filePath });
});

app.post("/file/convert", async (req, res) => {
  const { filePath } = req.body;
  if (!filePath || !fs.existsSync(filePath)) {
    return res.status(400).json({ error: "Invalid file path or file does not exist." });
  }

  const outputDir = `converted/${path.parse(filePath).name}`;
  try {
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const pdfBytes = fs.readFileSync(filePath);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const totalPages = pdfDoc.getPageCount();

    const convert = fromPath(filePath, { quality: 100, density: 300 });
    const imageFiles = [];

    for (let i = 1; i <= totalPages; i++) {
      const page = await convert(i);
      const imagePath = `${outputDir}/page-${i}.png`;
      fs.renameSync(page.path, imagePath);
      imageFiles.push(imagePath);
    }

    res.json({ message: "PDF converted to images successfully.", images: imageFiles });
  } catch (err) {
    console.error("Error converting PDF:", err);
    res.status(500).json({ error: "Failed to convert PDF to images." });
  } finally {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }
});

app.listen(3000, () => {
  console.log("Server started on port 3000");
});
