// prevent redeclaration when tab reloaded
if (typeof selectedPlugin === 'undefined') {
    var selectedPlugin = null; // Variable to track the selected plugin
}

// prevent redeclaration when tab reloaded
if (typeof logsInterval === 'undefined') {
    var logsInterval = null;   // Variable to store the logs fetch interval
}

// prevent redeclaration when tab reloaded
if (typeof pluginIntervalId === 'undefined') {
    var pluginIntervalId = null; // Variable to store the plugin status interval
}

window.activeIntervals = window.activeIntervals || new Set();

// Function to fetch and update plugin statuses
function updatePluginStatus()  {
    const rows = document.querySelectorAll('tbody tr');
    rows.forEach(row => {
        const pluginName = row.id.split('-')[1];
        fetch(`/api/admin/plugin/${pluginName}/info`)
            .then(response => response.json())
            .then(data => {
                row.querySelector('.status').innerText = data.status || 'Unknown';
            })
            .catch(error => {
                console.error(`Error fetching status for ${pluginName}:`, error);
            });
    });
};

// Call updatePluginStatus every 500ms
pluginIntervalId = setInterval(updatePluginStatus, 500);
window.activeIntervals.add(pluginIntervalId);

// Function to fetch and display logs for the selected plugin
function updateLogs(pluginName) {
    fetch(`/api/admin/plugin/${pluginName}/logs`)
        .then(response => response.json())
        .then(data => {
            const logsTextarea = document.querySelector('textarea.bordered');
            logsTextarea.value = data.logs.join('\n');  // Display logs in textarea
        })
        .catch(error => {
            console.error(`Error fetching logs for ${pluginName}:`, error);
        });
};

// Attach event listeners to Start, Stop, and Select buttons
document.querySelectorAll('tbody tr').forEach(row => {
    const pluginName = row.id.split('-')[1];

    // Start button listener
    row.querySelector('.start').addEventListener('click', () => {
        fetch(`/api/admin/plugin/${pluginName}/start`)
            .then(response => response.json())
            .then(data => {
                console.log(`Start response for ${pluginName}:`, data);
                row.querySelector('.status').innerText = data.status || 'Unknown';
            })
            .catch(error => {
                console.error(`Error starting ${pluginName}:`, error);
            });
    });

    // Stop button listener
    row.querySelector('.stop').addEventListener('click', () => {
        fetch(`/api/admin/plugin/${pluginName}/stop`)
            .then(response => response.json())
            .then(data => {
                console.log(`Stop response for ${pluginName}:`, data);
                row.querySelector('.status').innerText = data.status || 'Unknown';
            })
            .catch(error => {
                console.error(`Error stopping ${pluginName}:`, error);
            });
    });

    // Select button listener
    row.querySelector('.select').addEventListener('click', () => {
        if (logsInterval) {
            clearInterval(logsInterval);  // Clear the previous logs interval if any
        }

        selectedPlugin = pluginName;  // Update the selected plugin
        document.getElementById('selected-name').innerText = pluginName; // Update selected plugin name in the UI

        // Fetch logs every 500ms for the selected plugin
        logsInterval = setInterval(() => updateLogs(pluginName), 500);
        window.activeIntervals.add(logsInterval);
    });
});
