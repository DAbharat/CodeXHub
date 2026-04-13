import mongoose from 'mongoose';
import dotenv from "dotenv"
import { ApiError } from '../utils/ApiError.js';
import { DB_NAME } from './dbName.js';

dotenv.config();

const MAX_RETRIES = 4;
const RETRY_INTERVALS = 5000;

class DatabaseConnection {
  constructor() {
    this.retries = 0;
    this.isConnected = false;

    mongoose.set("strictQuery", true)

    mongoose.connection.on("connected", () => {
      this.isConnected = true;
      console.log("MONGODB CONNECTED SUCCESSFULLY!")
    })

    mongoose.connection.on("error", () => {
      this.isConnected = false;
      console.log("MONGODB CONNECTION ERROR! TRYING TO RECONNECT...")
    })

    mongoose.connection.on("disconnected", () => {
      this.isConnected = false;
      console.log("MONGODB DISCONNECTED!")
      this.handleDisconnection();
    })
  }

  async connect() {
    try {
      if(!process.env.MONGODB_URI) {
        throw new ApiError(500, "MONGODB_URI is not define in the environment variables")
      }

      const connectionOptions = {
        maxPoolSize: 10,
        socketTimeoutMS: 30000,
        serverSelectionTimeoutMS: 5000,
        family: 4
      }

      if(process.env.NODE_ENV === "development") {
        mongoose.set("debug", true)
      }

      await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`, connectionOptions)
    } catch (error) {
      console.error(error.message);
      await this.handleConnectionErrors();
    }
  }

  async handleConnectionErrors() {
    if(this.retries < MAX_RETRIES) {
      this.retries++;
      console.log(`MONGODB RECONNECT ATTEMPT ${this.retries} OF ${MAX_RETRIES}`)

      await new Promise(resolve => setTimeout(() => {
        resolve
      }, RETRY_INTERVALS))
      return this.connect();
    } else {
      console.error("MAXIMUM RECONNECT ATTEMPTS REACHED. EXITING PROCESS.")
      process.exit(1);
    }
  }

  async handleDisconnection() {
    if(!this.isConnected) {
      console.log("RECONNECTING...")
      this.connect();
    }
  }

  async handleAppTermination() {
    try {
      await mongoose.connection.close();
      console.log("CONNECTION CLOSED THROUGH APP TERMINATION");
      process.exit(0);
    } catch (error) {
      console.error("ERROR DURING APP TERMINATION", error.message)
      process.exit(1);
    }
  }
}

const connectDB = new DatabaseConnection();

export default connectDB.connect.bind(connectDB);
