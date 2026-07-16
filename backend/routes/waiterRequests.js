import express from "express";
import WaiterRequest from "../models/WaiterRequest.js";
import Table from "../models/Table.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

// Helper to emit events to Socket.io rooms
const emitSocket = (req, room, event, data) => {
  const io = req.app.get("io");
  if (io) {
    io.to(room).emit(event, data);
  }
};

// POST /api/waiter-requests - Seated guest requests service
router.post("/", async (req, res) => {
  const { tableNumber, customerName } = req.body;

  if (!tableNumber) {
    return res.status(400).json({ message: "Table number is required" });
  }

  try {
    const request = await WaiterRequest.create({
      tableNumber: Number(tableNumber),
      customerName: customerName || "Guest",
      status: "pending",
    });

    // Update table status to needs_service
    await Table.findOneAndUpdate(
      { tableNumber: Number(tableNumber) },
      { status: "needs_service" }
    );

    // Notify all waiters in real-time
    const alertData = {
      id: request._id,
      type: "service_request",
      tableNumber: request.tableNumber,
      customerName: request.customerName,
      status: request.status,
      timestamp: request.createdAt,
      message: `Table ${request.tableNumber} (${request.customerName}) needs assistance`,
    };

    emitSocket(req, "role:waiter", "waiter:alert", alertData);
    emitSocket(req, `table:${tableNumber}`, "waiter:request_update", alertData);

    return res.status(201).json(request);

  } catch (error) {
    console.error("Error creating waiter request:", error);
    return res.status(500).json({ message: "Server error calling waiter" });
  }
});

// GET /api/waiter-requests/active - Get all active waiter requests
router.get("/active", auth(["waiter", "admin", "kitchen"]), async (req, res) => {
  try {
    const requests = await WaiterRequest.find({
      status: { $in: ["pending", "accepted", "on_the_way"] }
    }).sort({ createdAt: -1 });

    return res.json(requests);
  } catch (error) {
    console.error("Error fetching active waiter requests:", error);
    return res.status(500).json({ message: "Server error fetching waiter requests" });
  }
});

// PATCH /api/waiter-requests/:id/status - Update service request status
router.patch("/:id/status", auth(["waiter", "admin", "kitchen"]), async (req, res) => {
  const { status } = req.body;
  if (!["pending", "accepted", "on_the_way", "completed"].includes(status)) {
    return res.status(400).json({ message: "Invalid waiter request status" });
  }

  try {
    const request = await WaiterRequest.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!request) {
      return res.status(404).json({ message: "Service request not found" });
    }

    // Map status to customer updates
    let alertMessage = "";
    if (status === "accepted") {
      alertMessage = "Waiter accepted your call";
    } else if (status === "on_the_way") {
      alertMessage = "Waiter is on the way";
    } else if (status === "completed") {
      alertMessage = "Request completed";
    }

    const alertData = {
      id: request._id,
      type: "service_request",
      tableNumber: request.tableNumber,
      customerName: request.customerName,
      status: request.status,
      timestamp: request.updatedAt,
      message: alertMessage,
    };

    // If request completed, set table status back to occupied
    if (status === "completed") {
      await Table.findOneAndUpdate(
        { tableNumber: request.tableNumber, status: "needs_service" },
        { status: "occupied" }
      );
    }

    // Broadcast to waiters and specific table
    emitSocket(req, "role:waiter", "waiter:request_update", alertData);
    emitSocket(req, `table:${request.tableNumber}`, "waiter:request_update", alertData);

    return res.json(request);

  } catch (error) {
    console.error("Error updating waiter request status:", error);
    return res.status(500).json({ message: "Server error updating waiter request" });
  }
});

export default router;
