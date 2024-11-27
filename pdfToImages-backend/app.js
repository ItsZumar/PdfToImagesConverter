import fs from "fs";
import cors from "cors";
import path from "path";
import multer from "multer";
import express from "express";
import { pdf } from "pdf-to-img";
import { fileURLToPath } from "url";

const PORT = 3000;

const app = express();

app.use(express.json());
app.use(cors());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

app.post("/file/upload-and-convert", upload.single("pdf"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded." });
  }

  const filePath = req.file.path;
  const outputDir = path.join(__dirname, "converted", path.parse(filePath).name);

  try {
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const imageFiles = await pdf(filePath, outputDir);
    const images = [];

    for (let i = 1; i <= imageFiles.length; i++) {
      try {
        const pageImage = await imageFiles.getPage(i);
        const outputPath = path.join(outputDir, `page-${i}.png`);

        fs.writeFileSync(outputPath, pageImage);
        images.push(`/${path.relative(__dirname, outputPath)}`);
      } catch (err) {
        console.error(`Error processing page ${i}:`, err);
      }
    }

    res.json({
      message: "PDF uploaded and converted to images successfully.",
      images,
    });
  } catch (err) {
    console.error("Error converting PDF:", err);
    res.status(500).json({ error: "Failed to convert PDF to images." });
  } finally {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
});

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
