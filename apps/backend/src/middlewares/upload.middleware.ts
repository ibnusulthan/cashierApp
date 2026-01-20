import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "@/utils/cloudinary";

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    return {
      folder: "pos-products",
      format: "webp",
      public_id: `${Date.now()}-${file.originalname.replace(/\s+/g, "-")}`,
    };
  },
});

export const uploadProductImage = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];

    if (!allowedTypes.includes(file.mimetype)) {
      cb(new Error("Only image files (jpg, jpeg, png, webp) are allowed"));
      return;
    }

    cb(null, true);
  },
});
