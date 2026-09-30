async function loadSummary() {
    try {
      const response = await fetch("/summary");
      const summary = await response.json();
  
      document.getElementById("total").textContent = summary.total;
      document.getElementById("online").textContent = summary.online;
      document.getElementById("offline").textContent = summary.offline;
  
    } catch (error) {
      console.error("Failed to load summary:", error);
    }
  }
  
  
  async function loadDevices() {
    try {
      const response = await fetch("/devices");
      const devices = await response.json();
  
      const table = document.getElementById("deviceTable");
  
      table.innerHTML = "";
  
      if (devices.length === 0) {
        table.innerHTML = `
          <tr>
            <td colspan="4">No devices registered</td>
          </tr>
        `;
        return;
      }
  
      devices.forEach((device) => {
  
        const row = document.createElement("tr");
  
        const statusClass =
          device.status === "ONLINE" ? "online" : "offline";
  
        const lastHeartbeat =
          device.last_heartbeat
            ? new Date(device.last_heartbeat).toLocaleString()
            : "Never";
  
        row.innerHTML = `
          <td>${device.id}</td>
          <td>${device.name}</td>
          <td>
            <span class="status ${statusClass}">
              ${device.status}
            </span>
          </td>
          <td>${lastHeartbeat}</td>
        `;
  
        table.appendChild(row);
      });
  
    } catch (error) {
      console.error("Failed to load devices:", error);
    }
  }
  
  
  async function loadDashboard() {
    await loadSummary();
    await loadDevices();
  }
  
  
  loadDashboard();
  
  
  // Refresh automatically every 5 seconds
  setInterval(loadDashboard, 5000);