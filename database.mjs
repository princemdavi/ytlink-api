import mongoose from "mongoose";

const connectToDb = async () => {
  await mongoose.connect(
    "mongodb+srv://admin:admin@prince.vvfk7qh.mongodb.net/ytlink?retryWrites=true&w=majority"
  );
};

export default connectToDb;
