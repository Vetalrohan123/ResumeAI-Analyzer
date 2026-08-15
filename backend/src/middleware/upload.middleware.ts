import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDir =
  path.resolve(
    process.cwd(),
    "uploads",
    "resumes"
  );

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(
    uploadDir,
    {
      recursive: true,
    }
  );
}

const storage =
  multer.diskStorage({
    destination: (
      req,
      file,
      cb
    ) => {
      cb(
        null,
        uploadDir
      );
    },

    filename: (
      req,
      file,
      cb
    ) => {
      const extension =
        path.extname(
          file.originalname
        );

      const filename =
        `${Date.now()}-${Math.round(
          Math.random() * 1e9
        )}${extension}`;

      cb(
        null,
        filename
      );
    },
  });

const fileFilter =
  (
    req: Express.Request,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback
  ) => {
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (
      allowedTypes.includes(
        file.mimetype
      )
    ) {
      cb(
        null,
        true
      );
    } else {
      cb(
        new Error(
          "Only PDF, DOC, and DOCX files are allowed."
        )
      );
    }
  };

export const uploadResume =
  multer({
    storage,
    fileFilter,
    limits: {
      fileSize:
        5 * 1024 * 1024,
    },
  });