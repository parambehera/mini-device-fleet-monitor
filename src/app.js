const express = require("express");
const DeviceStore = require("./deviceStore");

const app = express();

app.use(express.json());


const deviceStore = new DeviceStore();

/*
 * Health check
 */
app.get("/", (req, res) => {
  res.json({
    message: "Mini Device Fleet Monitor is running"
  });
});

/*
 * Register a device
 * POST /devices
 */
app.post("/devices", (req, res) => {
  const { id, name } = req.body;

  if (!id || typeof id !== "string" || id.trim() === "") {
    return res.status(400).json({
      error: "Device id is required"
    });
  }

  if (!name || typeof name !== "string" || name.trim() === "") {
    return res.status(400).json({
      error: "Device name is required"
    });
  }

  const device = deviceStore.register({
    id: id.trim(),
    name: name.trim()
  });

  if (!device) {
    return res.status(409).json({
      error: "Device already exists"
    });
  }

  return res.status(201).json({
    id: device.id,
    name: device.name,
    status: "OFFLINE",
    last_heartbeat: null
  });
});

/*
 * Receive heartbeat
 * POST /devices/:id/heartbeat
 */
app.post("/devices/:id/heartbeat", (req, res) => {
  const { id } = req.params;
  const { timestamp, status } = req.body;

  const device = deviceStore.getById(id);

  if (!device) {
    return res.status(404).json({
      error: "Device not found"
    });
  }

  if (!timestamp || typeof timestamp !== "string") {
    return res.status(400).json({
      error: "timestamp is required"
    });
  }

  const parsedTimestamp = Date.parse(timestamp);

  if (Number.isNaN(parsedTimestamp)) {
    return res.status(400).json({
      error: "timestamp must be a valid ISO-8601 timestamp"
    });
  }

  if (!status || typeof status !== "string") {
    return res.status(400).json({
      error: "status is required"
    });
  }

  deviceStore.updateHeartbeat(id, {
    timestamp,
    status
  });

  return res.status(200).json({
    message: "Heartbeat received",
    device_id: id,
    status: "ONLINE",
    last_heartbeat: timestamp
  });
});

/*
 * List all devices
 * GET /devices
 */
app.get("/devices", (req, res) => {
  return res.status(200).json(deviceStore.getAllWithStatus());
});

/*
 * Get a single device
 * GET /devices/:id
 */
app.get("/devices/:id", (req, res) => {
  const device = deviceStore.getById(req.params.id);

  if (!device) {
    return res.status(404).json({
      error: "Device not found"
    });
  }

  return res.status(200).json(
    deviceStore.getDeviceWithStatus(device)
  );
});

/*
 * Fleet summary
 * GET /summary
 */
app.get("/summary", (req, res) => {
  return res.status(200).json(
    deviceStore.getSummary()
  );
});

module.exports = {
  app,
  deviceStore
};