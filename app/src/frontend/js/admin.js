// Function to handle tab selection and API requests
function setupTabNavigation(containerSelector, linkSelector, activeClass, contentContainerSelector) {
    const container = document.querySelector(containerSelector);
    const contentContainer = document.querySelector(contentContainerSelector);

    // Mapping tabs to their respective API endpoints
    const tabEndpoints = {
        'users': '/api/content/admin/users',
        'plugins': '/api/content/admin/plugins',
        'settings': '/api/content/admin/settings'
    };

    // Add click event to all matching links within the container
    container.addEventListener('click', async function (event) {
        const clickedElement = event.target;

        // Check if the clicked element matches the link selector
        if (clickedElement.matches(linkSelector)) {
            // Get the ID of the clicked tab
            const tabId = clickedElement.id;

            // Check if the tab has a mapped API endpoint
            if (tabEndpoints[tabId]) {
                // Remove active class from all links
                document.querySelectorAll(linkSelector).forEach(el => {
                    el.classList.remove(activeClass);
                });

                // Add active class to the clicked link
                clickedElement.classList.add(activeClass);

                // Fetch the HTML content from the server
                try {
                    const response = await fetch(tabEndpoints[tabId]);
                    if (!response.ok) {
                        throw new Error(`Failed to load content for ${tabId}`);
                    }
                    const htmlContent = await response.text();

                    // Update the content container with the fetched HTML
                    contentContainer.innerHTML = htmlContent;
                } catch (error) {
                    console.error(error);
                    contentContainer.innerHTML = `<p>Error loading content for ${tabId}</p>`;
                }
            }
        }
    });
}

// Initialize tab navigation
setupTabNavigation('.header', 'a', 'selected', '#content');