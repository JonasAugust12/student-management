function displayLogs() {
    const logTableBody = document.querySelector("#logTable tbody");
    logTableBody.innerHTML = "";

    const logs = logManager.getLogs();

    if (logs.length === 0) {
        logTableBody.innerHTML = `<tr><td colspan="2" style="text-align:center;">Chưa có nhật ký</td></tr>`;
        return;
    }

    logs.forEach(log => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${new Date(log.timestamp).toLocaleString()}</td>
            <td><strong>${log.action}</strong></td>
        `;
        logTableBody.appendChild(row);
    });
}

function exportLogsToTxt() {
    const logs = JSON.parse(localStorage.getItem("logs")) || [];
    if (logs.length === 0) {
        alert("Không có log nào để xuất.");
        return;
    }

    let logContent = logs.map(log => `[${log.timestamp}] ${log.action}`).join("\n");
    let blob = new Blob([logContent], { type: "text/plain" });

    let a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "system_logs.txt";
    a.click();
}