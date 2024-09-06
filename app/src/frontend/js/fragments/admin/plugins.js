const updatePluginStatus = () => {
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
setInterval(updatePluginStatus, 500);

// Attach event listeners to Start and Stop buttons
document.querySelectorAll('tbody tr').forEach(row => {
    const pluginName = row.id.split('-')[1];

    row.querySelector('.start').addEventListener('click', () => {
        fetch(`/api/admin/plugin/${pluginName}/start`)
            .then(response => response.json())
            .then(data => {
                console.log(`Start response for ${pluginName}:`, data);
                // Immediately update the status based on the response
                row.querySelector('.status').innerText = data.status || 'Unknown';
            })
            .catch(error => {
                console.error(`Error starting ${pluginName}:`, error);
            });
    });

    row.querySelector('.stop').addEventListener('click', () => {
        fetch(`/api/admin/plugin/${pluginName}/stop`)
            .then(response => response.json())
            .then(data => {
                console.log(`Stop response for ${pluginName}:`, data);
                // Immediately update the status based on the response
                row.querySelector('.status').innerText = data.status || 'Unknown';
            })
            .catch(error => {
                console.error(`Error stopping ${pluginName}:`, error);
            });
    });
});