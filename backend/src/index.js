import dotenv from "dotenv"
import app from "./app.js"
import Connect_Db from "./Db/connectDb.js"

//import part se config file dotenv.
dotenv.config({
    path:'./.env'
})

//connection db...

console.log("Connecting....")

// Jyare db connect thse pchi j Server Listen thse...
Connect_Db().then(()=>{
    app.listen(process.env.PORT || 3000 ,()=>{
        console.log("Server is Running at port "+process.env.PORT)
    })

}).catch((err)=>{
    console.log(err)
})



