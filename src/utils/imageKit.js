import ImageKit from "imagekit";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config();

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

<<<<<<< HEAD
// Upload image to ImageKit
=======
>>>>>>> c98c04b94a323ab741b146da6f3eb122c98e203c
export const uploadImageToImageKit = (filePath) => {
  return new Promise((resolve, reject) => {
    const fileStream = fs.readFileSync(filePath);
    const fileName = `user_${Date.now()}.jpg`;

    imagekit.upload(
      {
<<<<<<< HEAD
        file: fileStream,
        fileName: fileName,
        folder: "/uploads",
      },
      async function (error, result) {
=======
        file: fileStream, // required
        fileName: fileName, // required
        folder: "/uploads",
      },
      function (error, result) {
>>>>>>> c98c04b94a323ab741b146da6f3eb122c98e203c
        if (error) {
          console.error("❌ ImageKit Upload Error:", error);
          reject(error);
        } else {
          console.log("📷 Uploaded to ImageKit:", result.url);
<<<<<<< HEAD

          // Automatically delete the uploaded image
          try {
            await imagekit.deleteFile(result.fileId);
            console.log("🗑️ Image deleted automatically:", result.fileId);
          } catch (deleteError) {
            console.error("❌ Error deleting uploaded image:", deleteError);
          }

=======
>>>>>>> c98c04b94a323ab741b146da6f3eb122c98e203c
          resolve(result.url);
        }
      }
    );
  });
};
