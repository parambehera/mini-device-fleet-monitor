class DeviceStore {
  constructor() {
    this.devices = new Map();
  }

  register(device) {
    if (this.devices.has(device.id)) {
      return null;
    }

    const newDevice = {
      id: device.id,
      name: device.name,
      lastHeartbeat: null,
      lastHeartbeatReceivedAt: null,
      lastStatus: null
    };

    this.devices.set(device.id, newDevice);

    return newDevice;
  }

  getById(id) {
    return this.devices.get(id) || null;
  }

  getAll() {
    return Array.from(this.devices.values());
  }

  updateHeartbeat(id, heartbeat) {
    const device = this.devices.get(id);

    if (!device) {
      return null;
    }

    device.lastHeartbeat = heartbeat.timestamp;
    device.lastHeartbeatReceivedAt = Date.now();
    device.lastStatus = heartbeat.status;

    return device;
  }

  calculateStatus(device, timeoutMs = 30000) {
    if (!device.lastHeartbeatReceivedAt) {
      return "OFFLINE";
    }

    const elapsed = Date.now() - device.lastHeartbeatReceivedAt;

    return elapsed <= timeoutMs ? "ONLINE" : "OFFLINE";
  }

  getDeviceWithStatus(device) {
    return {
      id: device.id,
      name: device.name,
      status: this.calculateStatus(device),
      last_heartbeat: device.lastHeartbeat
    };
  }

  getAllWithStatus() {
    return this.getAll().map((device) => {
      return this.getDeviceWithStatus(device);
    });
  }

  getSummary() {
    const devices = this.getAllWithStatus();

    let online = 0;
    let offline = 0;

    for (const device of devices) {
      if (device.status === "ONLINE") {
        online++;
      } else {
        offline++;
      }
    }

    return {
      total: devices.length,
      online,
      offline
    };
  }
}

module.exports = DeviceStore;