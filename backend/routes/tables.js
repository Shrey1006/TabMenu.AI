import express from "express";
import Table from "../models/Table.js";
import { generateTableToken, verifyTableToken } from "../utils/crypto.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

router.get("/", auth(["admin"]), async (_req, res) => {
  const tables = await Table.find().sort({ tableNumber: 1 });
  res.json(tables);
});

router.post("/", auth(["admin"]), async (req, res) => {
  const { tableNumber, capacity } = req.body;
  const qrToken = generateTableToken(tableNumber);
  const table = await Table.create({ tableNumber, capacity, qrToken });
  res.status(201).json(table);
});

router.get("/connect/:tableNumber", async (req, res) => {
  const table = await Table.findOne({
    tableNumber: Number(req.params.tableNumber),
  });
  if (!table) return res.status(404).json({ message: "Table not found" });
  res.json({
    tableNumber: table.tableNumber,
    status: table.status,
    token: table.qrToken,
  });
});

router.get("/verify/:token", async (req, res) => {
  const result = verifyTableToken(req.params.token);
  if (!result) return res.status(400).json({ message: "Invalid QR token" });

  const table = await Table.findOne({ tableNumber: result.tableNumber });
  if (!table) return res.status(404).json({ message: "Table not found" });

  res.json({
    tableNumber: table.tableNumber,
    status: table.status,
    token: table.qrToken,
  });
});

router.patch("/:id/status", auth(["waiter", "admin"]), async (req, res) => {
  const table = await Table.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status },
    { new: true },
  );
  if (!table) return res.status(404).json({ message: "Table not found" });
  res.json(table);
});

router.delete("/:id", auth(["admin"]), async (req, res) => {
  try {
    const table = await Table.findByIdAndDelete(req.params.id);
    if (!table) return res.status(404).json({ message: "Table not found" });
    res.json({ message: "Table deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error deleting table" });
  }
});

export default router;
