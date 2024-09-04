fetch('/api/plugins')
    .then(response => response.json()) // Step 2: Parse the response as JSON
    .then(data => {
        const navigation = document.getElementById('navigation'); // Get the #navigation element

        // Step 3: Append each plugin name to the #navigation element
        data.plugins.forEach(plugin => {
            const item = document.createElement('a'); // Create a new list item element
            item.textContent = plugin; // Set the text content to the plugin name
            item.href = "/plugin/" + plugin;
            navigation.appendChild(item); // Append the list item to the #navigation element
        });
    })
    .catch(error => console.error('Error fetching plugins:', error)); // Handle any errors