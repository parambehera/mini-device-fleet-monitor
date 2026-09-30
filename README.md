# Mini Device Fleet Monitor

A small backend application that monitors a fleet of simulated devices.

Each registered device periodically sends a heartbeat. The application stores the latest heartbeat and automatically determines whether a device is ONLINE or OFFLINE.

## Features

- Register devices
- Receive device heartbeats
- List all registered devices
- Get details of a single device
- Fleet status summary
- Automatic 30-second timeout
- Five-device simulator
- Ability to stop and restart individual simulated devices
- Automated tests
- Input validation
- In-memory storage

## Architecture

The application uses a simple layered structure:

Client / Simulator
       |
       v
   Express API
       |
       v
   DeviceStore
       |
       v
  In-memory Map

### Components

- Express API handles HTTP requests and responses.
- DeviceStore manages registered devices and their heartbeat information.
- In-memory Map stores device data during application runtime.
- Simulator registers five devices and periodically sends heartbeats.

### Device Status Logic

The server records the time when a heartbeat is received.

- If the latest heartbeat was received within 30 seconds → ONLINE
- If more than 30 seconds have passed → OFFLINE

The timestamp supplied by the device is stored as heartbeat information, but the server's heartbeat reception time is used to determine the current status.

## Prerequisites

- Node.js 18 or later
- npm
- Git

## Installation

Clone the repository:

git clone <your-repository-url>
cd mini-device-fleet-monitor

Install dependencies:

npm install

## Running the Server

Start the backend server:

npm start

The server runs on:

http://localhost:3000

## Running the Simulator

Open a second terminal and start the simulator:

node simulator/simulator.js

The simulator:

1. Registers five devices.
2. Sends an immediate heartbeat for each device.
3. Sends heartbeats every 5 seconds.
4. Allows individual devices to be stopped and restarted.

### Simulator Commands

stop device-01
start device-01
status
exit

For example:

stop device-03

After approximately 30 seconds without a heartbeat, device-03 becomes OFFLINE.

Start it again:

start device-03

After the next heartbeat, the device becomes ONLINE again.

## API Documentation

### 1. Register Device

POST /devices

Request:

{
  "id": "device-01",
  "name": "Lab Device 01"
}

Example response:

{
  "id": "device-01",
  "name": "Lab Device 01",
  "status": "OFFLINE",
  "last_heartbeat": null
}

A duplicate device ID returns:

409 Conflict

### 2. Send Heartbeat

POST /devices/{id}/heartbeat

Example:

POST /devices/device-01/heartbeat

Request:

{
  "timestamp": "2026-09-30T10:00:00.000Z",
  "status": "OK"
}

Example response:

{
  "message": "Heartbeat received",
  "device_id": "device-01",
  "status": "ONLINE",
  "last_heartbeat": "2026-09-30T10:00:00.000Z"
}

A heartbeat from an unknown device returns:

404 Not Found

### 3. List All Devices

GET /devices

Example response:

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

### 4. Get Device Details

GET /devices/{id}

Example:

GET /devices/device-01

Returns details of the requested device.

If the device does not exist:

404 Not Found

Example:

{
  "error": "Device not found"
}

### 5. Fleet Summary

GET /summary

Example response:

{
  "total": 5,
  "online": 4,
  "offline": 1
}

## Input Validation

The API validates required input fields such as:

- Device ID
- Device name
- Heartbeat timestamp
- Heartbeat status

Invalid requests are rejected with an appropriate error response.

## Testing

Run the automated test suite:

npm test

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

The complete application was also manually verified using the simulator.

The validation included:

1. Starting the backend server.
2. Starting the five-device simulator.
3. Verifying that all five devices become ONLINE.
4. Stopping one simulated device.
5. Waiting for the 30-second timeout.
6. Verifying that the stopped device becomes OFFLINE.
7. Restarting the device.
8. Verifying that the device becomes ONLINE again after its next heartbeat.
9. Verifying the fleet summary before and after the status change.

## Assumptions

- Device IDs are unique.
- A device must be registered before sending a heartbeat.
- The server's heartbeat reception time is used to determine device status.
- A heartbeat received within 30 seconds keeps the device ONLINE.
- The current implementation uses in-memory storage.
- Restarting the server clears all registered device data.
- The simulator and backend are expected to run on the same machine during local testing.

## Limitations

- Device data is not persisted to a database.
- Restarting the application clears all device data.
- The application currently runs as a single backend instance.
- The simulator communicates with the locally running server.
- Authentication and authorization are not implemented.
- There is no frontend dashboard.
- The current implementation is intended for a small fleet and local demonstration.

## Possible One-Day Improvements

With additional development time, the application could be extended with:

- Persistent database storage
- Authentication and authorization
- Device filtering and pagination
- Web-based monitoring dashboard
- Structured logging
- Prometheus metrics
- Docker support
- Horizontal scaling
- Shared persistent storage
- More comprehensive API validation
- Graceful server shutdown
- Environment-based configuration

## AI Usage

## AI Usage

I used ChatGPT during development to help with:

- API structure and implementation ideas
- Automated test case design
- Debugging
- Documentation
- Reviewing implementation approaches

One suggested approach was to introduce a database for persistent device storage. I rejected this approach because the assignment allowed a simple in-memory implementation and the available development time was limited.

I personally verified the implemented functionality by running the application, executing all 9 automated tests, running the five-device simulator, and manually checking that a stopped device becomes OFFLINE after 30 seconds and returns to ONLINE after being restarted.

## Project Structure

mini-device-fleet-monitor/
│
├── src/
│   ├── app.js
│   └── deviceStore.js
│
├── simulator/
│   └── simulator.js
│
├── tests/
│   └── app.test.js
│
├── package.json
├── package-lock.json
└── README.md

## Technology Stack

- Node.js
- Express.js
- JavaScript
- Node.js built-in HTTP module
- Node.js built-in test runner
- Supertest
- In-memory JavaScript Map

## Status

The project is implemented and tested.

- 9 automated tests passing
- Five-device simulator working
- Device heartbeat monitoring working
- 30-second ONLINE/OFFLINE rule verified
- Fleet summary verified