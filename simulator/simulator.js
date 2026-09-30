const http = require("http");

const BASE_URL = "http://localhost:3000";
const HEARTBEAT_INTERVAL = 5000;

const devices = [
  {
    id: "device-01",
    name: "Lab Device 01"
  },
  {
    id: "device-02",
    name: "Lab Device 02"
  },
  {
    id: "device-03",
    name: "Lab Device 03"
  },
  {
    id: "device-04",
    name: "Lab Device 04"
  },
  {
    id: "device-05",
    name: "Lab Device 05"
  }
];

const runningDevices = new Map();

function request(method, path, body) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);

    const data = body ? JSON.stringify(body) : null;

    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method,
      headers: {
        "Content-Type": "application/json"
      }
    };

    const req = http.request(options, (res) => {
      let responseData = "";

      res.on("data", (chunk) => {
        responseData += chunk;
      });

      res.on("end", () => {
        resolve({
          statusCode: res.statusCode,
          body: responseData
        });
      });
    });

    req.on("error", reject);

    if (data) {
      req.write(data);
    }

    req.end();
  });
}

async function registerDevice(device) {
  try {
    const response = await request(
      "POST",
      "/devices",
      device
    );

    if (response.statusCode === 201) {
      console.log(`Registered ${device.id}`);
    } else if (response.statusCode === 409) {
      console.log(`${device.id} already registered`);
    } else {
      console.log(
        `Failed to register ${device.id}: ${response.body}`
      );
    }
  } catch (error) {
    console.error(
      `Could not register ${device.id}:`,
      error.message
    );
  }
}

async function sendHeartbeat(device) {
  try {
    const timestamp = new Date().toISOString();

    const response = await request(
      "POST",
      `/devices/${device.id}/heartbeat`,
      {
        timestamp,
        status: "OK"
      }
    );

    if (response.statusCode === 200) {
      console.log(
        `${device.id} -> heartbeat ${timestamp}`
      );
    } else {
      console.log(
        `${device.id} -> heartbeat failed: ${response.body}`
      );
    }
  } catch (error) {
    console.error(
      `${device.id} -> heartbeat error:`,
      error.message
    );
  }
}

function startDevice(device) {
  if (runningDevices.has(device.id)) {
    console.log(`${device.id} is already running`);
    return;
  }

  sendHeartbeat(device);

  const interval = setInterval(() => {
    sendHeartbeat(device);
  }, HEARTBEAT_INTERVAL);

  runningDevices.set(device.id, interval);

  console.log(`${device.id} started`);
}

function stopDevice(deviceId) {
  const interval = runningDevices.get(deviceId);

  if (!interval) {
    console.log(`${deviceId} is already stopped`);
    return;
  }

  clearInterval(interval);
  runningDevices.delete(deviceId);

  console.log(
    `${deviceId} stopped. It should become OFFLINE after 30 seconds.`
  );
}

async function startSimulator() {
  console.log("Starting device simulator...\n");

  for (const device of devices) {
    await registerDevice(device);
    startDevice(device);
  }

  console.log("\nSimulator commands:");
  console.log("  stop device-01");
  console.log("  start device-01");
  console.log("  status");
  console.log("  exit\n");
}

process.stdin.setEncoding("utf8");

process.stdin.on("data", (input) => {
  const command = input.trim();

  const parts = command.split(/\s+/);

  if (parts[0] === "stop" && parts[1]) {
    stopDevice(parts[1]);
  } else if (parts[0] === "start" && parts[1]) {
    const device = devices.find(
      (item) => item.id === parts[1]
    );

    if (!device) {
      console.log(`Unknown device: ${parts[1]}`);
      return;
    }

    startDevice(device);
  } else if (command === "status") {
    console.log(
      `Running devices: ${Array.from(runningDevices.keys()).join(", ")}`
    );
  } else if (command === "exit") {
    console.log("Stopping simulator...");

    for (const interval of runningDevices.values()) {
      clearInterval(interval);
    }

    process.exit(0);
  } else {
    console.log(
      "Commands: stop <id>, start <id>, status, exit"
    );
  }
});

startSimulator();