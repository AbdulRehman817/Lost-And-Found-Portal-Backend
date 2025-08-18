import ImageKit from "imagekit";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config();

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

export const uploadImageToImageKit = (filePath) => {
  return new Promise((resolve, reject) => {
    const fileStream = fs.readFileSync(filePath);
    const fileName = `user_${Date.now()}.jpg`;

    imagekit.upload(
      {
        file: fileStream, // required
        fileName: fileName, // required
        folder: "/uploads",
      },
      function (error, result) {
        if (error) {
          console.error("❌ ImageKit Upload Error:", error);
          reject(error);
        } else {
          console.log("📷 Uploaded to ImageKit:", result.url);
          resolve(result.url);
        }
      }
    );
  });
};
