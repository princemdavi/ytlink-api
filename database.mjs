import mongoose from "mongoose";

const connectToDb = async () => {
  await mongoose.connect(
    "mongodb://admin:admin@ac-sxa63ne-shard-00-00.kvqjxqm.mongodb.net:27017,ac-sxa63ne-shard-00-01.kvqjxqm.mongodb.net:27017,ac-sxa63ne-shard-00-02.kvqjxqm.mongodb.net:27017/pytvd?ssl=true&replicaSet=atlas-7vhiev-shard-0&authSource=admin&retryWrites=true&w=majority"
  );
};

export default connectToDb;
