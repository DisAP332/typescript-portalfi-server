import mongoose, { Connection } from "mongoose";

let baseConnection: Connection | undefined;

// one real connection at boot; every tenant afterward gets a cached
// per-database handle off of it via useDb(), not a fresh connection.
const connect = async () => {
  if (!baseConnection) {
    baseConnection = await mongoose
      .createConnection(`${process.env.DATABASE}?retryWrites=true&w=majority`)
      .asPromise();
  }
  return baseConnection;
};

const getConnection = (requestor?: string): Connection => {
  if (!requestor) {
    throw new Error("Please indicate who is connecting to the database");
  }
  if (!baseConnection) {
    throw new Error("Database connection has not been established yet");
  }
  return baseConnection.useDb(requestor, { useCache: true });
};

const DBMethods = {
  connect,
  getConnection,
};

export default DBMethods;
