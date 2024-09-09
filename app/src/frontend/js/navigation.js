fetch('/api/navigation')
    .then(response => response.json()) // Step 2: Parse the response as JSON
    .then(data => {
        const navigation = document.getElementById('navigation'); // Get the #navigation element
        const currentUrl = window.location.pathname; // Get the current URL of the page
        console.log(currentUrl);

        // Step 3: Append each plugin name to the #navigation element
        data.plugins.forEach(plugin => {
            const item = document.createElement('a'); // Create a new anchor element
            item.textContent = plugin.name; // Set the text content to the plugin name
            item.href = plugin.url; // Set the href attribute to the plugin URL

            // Check if the current URL matches the plugin URL
            if (currentUrl === plugin.url) {
                item.classList.add('navigation-selected'); // Add the 'selected' class if it matches
            }

            navigation.appendChild(item); // Append the item to the #navigation element
        });
    })
    .catch(error => console.error('Error fetching plugins:', error)); // Handle any errors
