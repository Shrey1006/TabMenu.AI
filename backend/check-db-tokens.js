import dotenv from "dotenv";
import mongoose from "mongoose";
import Table from "./models/Table.js";
import { verifyTableToken } from "./utils/crypto.js";

dotenv.config();

const check = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB");

  const tables = await Table.find();
  console.log(`Found ${tables.length} tables:`);
  
  for (let t of tables) {
    const verified = verifyTableToken(t.qrToken);
    console.log(`Table ${t.tableNumber}:`);
    console.log(`  Token: ${t.qrToken}`);
    console.log(`  Valid Signature: ${verified !== null}`);
    console.log(`  Decoded Data:`, verified);
  }

  await mongoose.disconnect();
};

check().catch(console.error);
