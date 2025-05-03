import mongoose from "mongoose";

const Connect_Db=async()=>{
   try{
       const connectionInstance= await mongoose.connect(process.env.MONGODB_URI)
       console.log(`MongoDb Connected !! DB Host : `+connectionInstance.connection.host)
    }
    catch(err){
        console.error("Mongodb Connection Failed : "+err)
        process.exit(1)
    }
}

export default Connect_Db