import multer from "multer";

// Set up memory storage for Multer
const storage = multer.memoryStorage(); // Using memory storage to keep files in memory

export const upload = multer({ 
    storage, 
});


//for localhost we can do that but in deployment use memory storage.

// import multer from "multer";

// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//       // console.log("check the logs from our middleware -> multer.....")
//       // console.log(req,file,cb)
//       cb(null, "./public/temp")
     
//     },
//     filename: function (req, file, cb) {
      
//       cb(null, file.originalname)
//     }
//   })
  
// export const upload = multer({ 
//     storage, 
// })