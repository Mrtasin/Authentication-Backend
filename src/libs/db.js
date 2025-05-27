import mongoose from "mongoose";

const db = () => {
  mongoose
    .connect(process.env.MONGO_URL)
    .then(() => {
      console.log("Mongo DB Connected");
    })
    .catch((err) => {
      console.log("Mongo DB Cannection Fail");
    });
};

export default db
