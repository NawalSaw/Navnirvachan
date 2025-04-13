import { app } from "./app.js";
import dotenv from "dotenv";
import connectDB from "./db/connectDB.js";

dotenv.config();

connectDB()
  .then(() => {
    app.on("error", (error) => {
      console.log("Server error", error.message);
      throw error;
    });

    app.listen(process.env.PORT || 5000, () => {
      console.log(`Server is listening on port ${process.env.PORT}`);
    });
  })
  .catch((error) => {
    console.log("Error in connecting to MongoDB", error);
    process.exit(1);
  });
  