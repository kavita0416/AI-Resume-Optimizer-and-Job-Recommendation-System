import multer from "multer";
import path from "path";

// Local disk storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // store in uploads folder
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // unique name
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf" || file.mimetype.includes("word")) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF/Word files allowed!"), false);
  }
};

const upload = multer({ storage, fileFilter });
export default upload;
