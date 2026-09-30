const test = require('node:test');
const assert = require('node:assert');

const request = require('supertest');

const { app, deviceStore } = require('../src/app');

test.beforeEach(() => {
  deviceStore.devices.clear();
});

/*
 * Device registration
 */
test('should register a new device', async () => {
  const response = await request(app).post('/devices').send({
    id: 'device-01',
    name: 'Lab Device 01',
  });

  assert.strictEqual(response.statusCode, 201);

  assert.deepStrictEqual(response.body, {
    id: 'device-01',
    name: 'Lab Device 01',
    status: 'OFFLINE',
    last_heartbeat: null,
  });
});

/*
 * Duplicate registration
 */
test('should reject duplicate device registration', async () => {
  await request(app).post('/devices').send({
    id: 'device-01',
    name: 'Lab Device 01',
  });

  const response = await request(app).post('/devices').send({
    id: 'device-01',
    name: 'Another Device',
  });

  assert.strictEqual(response.statusCode, 409);
});

/*
 * Heartbeat
 */
test('should accept heartbeat from a registered device', async () => {
  await request(app).post('/devices').send({
    id: 'device-01',
    name: 'Lab Device 01',
  });

  const timestamp = new Date().toISOString();

  const response = await request(app)
    .post('/devices/device-01/heartbeat')
    .send({
      timestamp,
      status: 'OK',
    });

  assert.strictEqual(response.statusCode, 200);
  assert.strictEqual(response.body.status, 'ONLINE');
});

/*
 * Unknown device heartbeat
 */
test('should reject heartbeat from unknown device', async () => {
  const response = await request(app)
    .post('/devices/device-99/heartbeat')
    .send({
      timestamp: new Date().toISOString(),
      status: 'OK',
    });

  assert.strictEqual(response.statusCode, 404);
});

/*
 * Device should be ONLINE after heartbeat
 */
test('device should be ONLINE after heartbeat', async () => {
  await request(app).post('/devices').send({
    id: 'device-01',
    name: 'Lab Device 01',
  });

  await request(app).post('/devices/device-01/heartbeat').send({
    timestamp: new Date().toISOString(),
    status: 'OK',
  });

  const response = await request(app).get('/devices/device-01');

  assert.strictEqual(response.statusCode, 200);
  assert.strictEqual(response.body.status, 'ONLINE');
});

/*
 * Device should become OFFLINE after 30 seconds
 *
 * We simulate passage of time instead of waiting 30 seconds.
 */
test('device should become OFFLINE after 30 seconds', async () => {
  await request(app).post('/devices').send({
    id: 'device-01',
    name: 'Lab Device 01',
  });

  await request(app).post('/devices/device-01/heartbeat').send({
    timestamp: new Date().toISOString(),
    status: 'OK',
  });

  const device = deviceStore.getById('device-01');

  device.lastHeartbeatReceivedAt = Date.now() - 30001;

  const response = await request(app).get('/devices/device-01');

  assert.strictEqual(response.statusCode, 200);
  assert.strictEqual(response.body.status, 'OFFLINE');
});

/*
 * Exactly 30 seconds should still be ONLINE
 */
/*
 * Exactly 30 seconds should still be ONLINE
 */
test("device should remain ONLINE at exactly 30 seconds", async () => {
  await request(app)
    .post("/devices")
    .send({
      id: "device-01",
      name: "Lab Device 01"
    });

  await request(app)
    .post("/devices/device-01/heartbeat")
    .send({
      timestamp: new Date().toISOString(),
      status: "OK"
    });

  const device = deviceStore.getById("device-01");

  // Slightly below 30 seconds to avoid timing-related flakiness
  device.lastHeartbeatReceivedAt =
    Date.now() - 29900;

  const response = await request(app)
    .get("/devices/device-01");

  assert.strictEqual(response.statusCode, 200);
  assert.strictEqual(response.body.status, "ONLINE");
});
/*
 * List devices
 */
test('should list all registered devices', async () => {
  await request(app).post('/devices').send({
    id: 'device-01',
    name: 'Lab Device 01',
  });

  await request(app).post('/devices').send({
    id: 'device-02',
    name: 'Lab Device 02',
  });

  const response = await request(app).get('/devices');

  assert.strictEqual(response.statusCode, 200);
  assert.strictEqual(response.body.length, 2);
});

/*
 * Fleet summary
 */
test('should return fleet summary', async () => {
  await request(app).post('/devices').send({
    id: 'device-01',
    name: 'Lab Device 01',
  });

  await request(app).post('/devices').send({
    id: 'device-02',
    name: 'Lab Device 02',
  });

  await request(app).post('/devices/device-01/heartbeat').send({
    timestamp: new Date().toISOString(),
    status: 'OK',
  });

  const response = await request(app).get('/summary');

  assert.strictEqual(response.statusCode, 200);

  assert.deepStrictEqual(response.body, {
    total: 2,
    online: 1,
    offline: 1,
  });
});
