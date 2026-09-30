# Mini Device Fleet Monitor

A small backend application that monitors a fleet of simulated devices.

Each registered device periodically sends a heartbeat. The application stores the latest heartbeat and automatically determines whether a device is ONLINE or OFFLINE.

The project also includes a simple web dashboard served directly by the Express server for viewing the current fleet status.

## Features

- Register devices
- Receive device heartbeats
- List all registered devices
- Get details of a single device
- Fleet status summary
- Automatic 30-second ONLINE/OFFLINE timeout
- Five-device simulator
- Ability to stop and restart individual simulated devices
- Simple web monitoring dashboard
- Automated tests
- Input validation
- In-memory storage

## Architecture

The application uses a simple layered structure:

```text
                    Browser / Simulator
                           |
                           v
                  Express.js Server
                    /           \
                   /             \
                  v               v
          REST API Routes     Web Dashboard
                  |
                  v
             DeviceStore
                  |
                  v
          In-memory Map
```

### Components

- **Express API** handles HTTP requests and responses.
- **DeviceStore** manages registered devices and their heartbeat information.
- **In-memory Map** stores device data during application runtime.
- **Simulator** registers five devices and periodically sends heartbeats.
- **Web Dashboard** displays device status and fleet summary.
- **Static files** are served by Express from the `static/` directory.

### Device Status Logic

The server records the time when a heartbeat is received.

- If the latest heartbeat was received within 30 seconds → `ONLINE`
- If more than 30 seconds have passed → `OFFLINE`

The timestamp supplied by the device is stored as heartbeat information, but the server's heartbeat reception time is used to determine the current status.

## Web Dashboard

The project includes a simple monitoring dashboard served directly by Express.

When the server is running, open:

```text
http://localhost:3000
```

The dashboard displays:

- Total number of devices
- Number of ONLINE devices
- Number of OFFLINE devices
- Device ID
- Device name
- Current device status
- Last heartbeat time
- Refresh button

The dashboard uses the existing backend APIs, so no separate frontend server or deployment is required.

### Dashboard Flow

```text
Web Dashboard
      |
      | GET /devices
      | GET /summary
      v
Express Backend
      |
      v
DeviceStore
      |
      v
In-memory Device Data
```

## Prerequisites

- Node.js 18 or later
- npm
- Git

## Installation

Clone the repository:

```bash
git clone <https://github.com/parambehera/mini-device-fleet-monitor.git>
cd mini-device-fleet-monitor
```

Install dependencies:

```bash
npm install
```

## Running the Server

Start the backend server:

```bash
npm start
```

The server runs on:

```text
http://localhost:3000
```

Open the URL in a browser to view the web dashboard.

## Running the Simulator

Open a second terminal and start the simulator:

```bash
node simulator/simulator.js
```

The simulator:

1. Registers five devices.
2. Sends an immediate heartbeat for each device.
3. Sends heartbeats every 5 seconds.
4. Allows individual devices to be stopped and restarted.

### Simulator Commands

```text
stop device-01
start device-01
status
exit
```

For example:

```text
stop device-03
```

After approximately 30 seconds without a heartbeat, `device-03` becomes `OFFLINE`.

Start it again:

```text
start device-03
```

After the next heartbeat, the device becomes `ONLINE` again.

You can observe these status changes from the web dashboard at:

```text
http://localhost:3000
```

## API Documentation

### 1. Register Device

```http
POST /devices
```

Request:

```json
{
  "id": "device-01",
  "name": "Lab Device 01"
}
```

Example response:

```json
{
  "id": "device-01",
  "name": "Lab Device 01",
  "status": "OFFLINE",
  "last_heartbeat": null
}
```

A duplicate device ID returns:

```text
409 Conflict
```

### 2. Send Heartbeat

```http
POST /devices/{id}/heartbeat
```

Example:

```http
POST /devices/device-01/heartbeat
```

Request:

```json
{
  "timestamp": "2026-09-30T10:00:00.000Z",
  "status": "OK"
}
```

Example response:

```json
{
  "message": "Heartbeat received",
  "device_id": "device-01",
  "status": "ONLINE",
  "last_heartbeat": "2026-09-30T10:00:00.000Z"
}
```

A heartbeat from an unknown device returns:

```text
404 Not Found
```

### 3. List All Devices

```http
GET /devices
```

Example response:

```json
[
  {
    "id": "device-01",
    "name": "Lab Device 01",
    "status": "ONLINE",
    "last_heartbeat": "2026-09-30T10:00:00.000Z"
  },
  {
    "id": "device-02",
    "name": "Lab Device 02",
    "status": "OFFLINE",
    "last_heartbeat": null
  }
]
```

### 4. Get Device Details

```http
GET /devices/{id}
```

Example:

```http
GET /devices/device-01
```

Returns details of the requested device.

If the device does not exist:

```text
404 Not Found
```

Example:

```json
{
  "error": "Device not found"
}
```

### 5. Fleet Summary

```http
GET /summary
```

Example response:

```json
{
  "total": 5,
  "online": 4,
  "offline": 1
}
```

## Input Validation

The API validates required input fields such as:

- Device ID
- Device name
- Heartbeat timestamp
- Heartbeat status

Invalid requests are rejected with an appropriate error response.

Heartbeat timestamps are also validated to ensure they contain a valid ISO-8601 timestamp.

## Testing

Run the automated test suite:

```bash
npm test
```

The test suite covers:

- Device registration
- Duplicate device registration
- Heartbeat handling
- Unknown device heartbeat
- Device ONLINE status after heartbeat
- Device OFFLINE status after more than 30 seconds
- Device ONLINE status at the 30-second boundary
- Listing registered devices
- Fleet summary

The complete test suite contains 9 tests.

All 9 tests were successfully executed during development.

## Manual Validation

The complete application was manually verified using the simulator and web dashboard.

The validation included:

1. Starting the backend server.
2. Opening the web dashboard.
3. Starting the five-device simulator.
4. Verifying that all five devices become ONLINE.
5. Stopping one simulated device.
6. Waiting for the 30-second timeout.
7. Verifying that the stopped device becomes OFFLINE.
8. Restarting the device.
9. Verifying that the device becomes ONLINE again after its next heartbeat.
10. Verifying the fleet summary before and after the status change.
11. Refreshing the dashboard and verifying that the displayed status matches the backend API.

## Assumptions

- Device IDs are unique.
- A device must be registered before sending a heartbeat.
- The server's heartbeat reception time is used to determine device status.
- A heartbeat received within 30 seconds keeps the device ONLINE.
- The current implementation uses in-memory storage.
- Restarting the server clears all registered device data.
- The simulator and backend are expected to run on the same machine during local testing.
- The web dashboard and backend API are served by the same Express server.

## Limitations

- Device data is not persisted to a database.
- Restarting the application clears all device data.
- The application currently runs as a single backend instance.
- The simulator communicates with the locally running server.
- Authentication and authorization are not implemented.
- The dashboard is intentionally simple and does not use a separate frontend framework.
- The current implementation is intended for a small fleet and local demonstration.

## Possible One-Day Improvements

With additional development time, the application could be extended with:

- Persistent database storage
- Authentication and authorization
- Device filtering and pagination
- Real-time dashboard updates using WebSockets
- Structured logging
- Prometheus metrics
- Docker support
- Horizontal scaling
- Shared persistent storage
- More comprehensive API validation
- Graceful server shutdown
- Environment-based configuration
- Device heartbeat history
- Alerting for devices that go OFFLINE

## AI Usage

I used ChatGPT during development to help with:

- API structure and implementation ideas
- Automated test case design
- Debugging
- Documentation
- Reviewing implementation approaches
- Improving the structure of the simple monitoring dashboard

One suggested approach was to introduce a database for persistent device storage. I rejected this approach because the assignment allowed a simple in-memory implementation and the available development time was limited.

I personally verified the implemented functionality by running the application, executing all 9 automated tests, running the five-device simulator, and manually checking that a stopped device becomes OFFLINE after 30 seconds and returns to ONLINE after being restarted.

I also manually verified that the web dashboard correctly displays the fleet summary and individual device statuses using the existing backend APIs.

## Project Structure

```text
mini-device-fleet-monitor/
│
├── src/
│   ├── app.js
│   └── deviceStore.js
│
├── simulator/
│   └── simulator.js
│
├── static/
│   ├── index.html
│   ├── app.js
│   └── style.css
│
├── tests/
│   └── app.test.js
│
├── package.json
├── package-lock.json
├── README.md
└── .gitignore
```

## Technology Stack

- Node.js
- Express.js
- JavaScript
- HTML
- CSS
- Node.js built-in HTTP module
- Node.js built-in test runner
- Supertest
- In-memory JavaScript Map

## Status

The project is implemented, tested, and manually validated.

- 9 automated tests passing
- Five-device simulator working
- Device heartbeat monitoring working
- 30-second ONLINE/OFFLINE rule verified
- Fleet summary verified
- Input validation implemented
- Simple web dashboard implemented
- Dashboard served directly by Express
- Dashboard manually verified with simulated devices
