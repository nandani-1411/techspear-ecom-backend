import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

const uploadOnCloudinary = async (fileBuffer, fileName) => {
    try {
        if (!fileBuffer) {
            console.log("File buffer is missing.");
            return null;
        }

        // Upload the buffer to Cloudinary
        const response = await cloudinary.uploader.upload_stream(
            {
                resource_type: "auto",  // Automatically detect the file type (image, video, etc.)
                public_id: fileName,    // Optional: set the public ID if needed
            },
            (error, result) => {
                if (error) {
                    console.error("Cloudinary upload error:", error);
                    return null;
                }
                return result;
            }
        );

        response.end(fileBuffer); // Send the file buffer to Cloudinary

        console.log("File uploaded to Cloudinary:", response.url);
        return response;
    } catch (error) {
        console.log("Error uploading file to Cloudinary:", error);
        return null;
    }
};
export { uploadOnCloudinary }

//localhost : => use that

// // import {v2 as cloudinary} from "cloudinary"
// import dotenv from "dotenv"
// dotenv.config()
// import { v2 as cloudinary } from "cloudinary"
// import fs from "fs"

// // Check if .env variables are correctly loaded
// // console.log("Cloudinary Environment Variables:");
// // console.log("CLOUDINARY_CLOUD_NAME:", process.env.CLOUDINARY_CLOUD_NAME);
// // console.log("CLOUDINARY_API_KEY:", process.env.CLOUDINARY_API_KEY ? "Exists" : "Missing");
// // console.log("CLOUDINARY_API_SECRET:", process.env.CLOUDINARY_API_SECRET ? "Exists" : "Missing");



// cloudinary.config({
//     cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
//     api_key:process.env.CLOUDINARY_API_KEY,
//     api_secret:process.env.CLOUDINARY_API_SECRET,
//     secure:true,

// });

// // console.log("Cloudinary Config:", cloudinary.config());


// const uploadOnCloudinary = async (localFilePath) => {
//     try {

//         if (!localFilePath || !fs.existsSync(localFilePath)) {
//             console.log("File not found or undefined:", localFilePath);
//             return null;
//         }
//         //upload the file on cloudinary

//         const response = await cloudinary.uploader.upload(localFilePath, {
//             resource_type: "auto"
//         }).catch((err)=>{
//             console.log(err)
//         })
//         console.log("url consoled clodunary")
//         console.log(response.url)


//         // file has been uploaded successfull
//         //console.log("file is uploaded on cloudinary ", response.url);

//         // if (fs.existsSync(localFilePath)) {
//         //     fs.unlinkSync(localFilePath);
//         //     console.log("Local file deleted successfully.");
//         // }

//         return response;

//     } catch (error) {
//         if (fs.existsSync(localFilePath)) {
//             fs.unlinkSync(localFilePath);
//             console.log("Local file deleted after failure.");
//         }
     
//         console.log(error)
//         return null
//     }
// }

// export { uploadOnCloudinary }