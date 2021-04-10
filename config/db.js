const mongoose = require("mongoose");
const config = require("config");
const db = config.get("mongoURI");
const connectDB = async () => {
  //ConnectDB is method that connect us with database using a global variale contains the URI of our database

  // try{

  //     await mongoose.connect(db,{useUnifiedTopology: true,useNewUrlParser: true, });
  //     console.log("Mongo DB Connected...");
  // }catch(err){
  //     console.error(err.message);
  //     //exit with failure
  //     process.exit(1);
  // }
  // }

  mongoose.connect(db, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true,
  });
  mongoose.connection.on("connected", () => {
    console.log("Mongo DB Connected...");
  });
};
module.exports = connectDB;
