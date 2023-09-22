import mongoose, { createConnection } from "mongoose";

interface IRes {
  connected: boolean;
  message: any;
}

let response: IRes;

const Disconnect = async () => {
  await mongoose.connection.close().then(() => {
    response = { connected: false, message: "Disconnected from database" };
  });
  return response;
};

const makeConnection = async (requestor: string) => {
  if (!requestor) {
    response = {
      connected: false,
      message: "Please indicate who is connecting to the database",
    };
  } else {
    try {
      let URI: string;
      URI = process.env.DATABASE + `${requestor}?retryWrites=true&w=majority`;
      await mongoose.connect(URI).then(() => {
        response = {
          connected: true,
          message: `Connected to ${requestor} DATABASE successfully`,
        };
      });
    } catch (err) {
      response = {
        connected: false,
        message: err,
      };
    }
  }
  return response;
};

const Connect = async (requestor: string) => {
  await Disconnect();
  await makeConnection(requestor);
  return response;
};

const DBMethods = {
  Connect,
};

export default DBMethods;
