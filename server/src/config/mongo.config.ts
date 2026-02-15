import { connect, connection, MongooseError } from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const DB_BASE_URL = process.env.DB_BASE_URL as string;

export const dbConnect = async (databaseName: string) => {
  // Connect to the specified database
  try {
    await connect(
      DB_BASE_URL +
        "/" +
        databaseName +
        "?retryWrites=true&w=majority&appName=Cluster0"
    );
    connection.on("connected", () => {
      console.log("Database connected succesfully");
    });
  } catch (err) {
    console.error(
      "Database connection failed, retrying...\nReason:",
      (err as MongooseError)?.message
    );
    // await errorHandler(err, "Database Connection");
    await retryDBConnect(databaseName);
  }
};

export const retryDBConnect = async (databaseName: string) => {
  const retryDelay = 5000;
  const maxRetries = 5;
  let retries = 0;

  const tryConnect = async () => {
    if (retries === maxRetries) {
      console.error("Max retries reached, could not connect to the database");
      return;
    }

    try {
      await connect(
        DB_BASE_URL
        //  +
        //   "/" +
        //   databaseName +
        //   "?retryWrites=true&w=majority&appName=Cluster0"
      );
      connection.on("connected", () => {
        console.log("Database connected succesfully");
      });
    } catch (err) {
      retries++;
      console.error(
        `Database connection failed, retrying... (${retries}/${maxRetries})\nReason:`,
        (err as MongooseError)?.message
      );
      setTimeout(tryConnect, retryDelay);
    }
  };

  await tryConnect();
};
