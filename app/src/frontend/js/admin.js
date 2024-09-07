window.activeIntervals = window.activeIntervals || new Set();

// Function to handle tab selection, API requests, and dynamic JS injection
function setupTabNavigation(containerSelector, linkSelector, activeClass, contentContainerSelector) {
    const container = document.querySelector(containerSelector);
    const contentContainer = document.querySelector(contentContainerSelector);

    // Mapping tabs to their respective API endpoints
    const tabEndpoints = {
        'users': '/api/html/admin/users',
        'plugins': '/api/html/admin/plugins',
        'settings': '/api/html/admin/settings'
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

                    // Dynamically inject JavaScript for the selected tab
                    injectTabScript(tabId);
                } catch (error) {
                    console.error(error);
                    contentContainer.innerHTML = `<p>Error loading content for ${tabId}</p>`;
                }
            }
        }
    });
}

// Function to inject the script for the selected tab
function injectTabScript(tabId) {
    // Remove any previously injected script
    const existingScript = document.querySelector('script[data-injected="true"]');
    if (existingScript) {
        // TODO STOP SCHEDULED FUNCTIONS FROM existing script such as setInterval(updatePluginStatus, 500);
        existingScript.remove();
        stopAllIntervals();
    }

    // Create a new script element
    const script = document.createElement('script');
    script.src = `/static/js/fragments/admin/${tabId}.js`;
    script.async = true;
    script.setAttribute('data-injected', 'true'); // Mark this script as dynamically injected

    // Append the new script to the body
    document.body.appendChild(script);
}

function stopAllIntervals() {
    window.activeIntervals.forEach(intervalId => {
        clearInterval(intervalId);
    });
    window.activeIntervals.clear();  // Clear the set after stopping all intervals
}

// Initialize tab navigation
setupTabNavigation('.header', 'a', 'selected', '#canvas');
