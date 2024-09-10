// Function to draw plugin permissions
async function drawPermissions() {
    try {
        const response = await fetch('/api/admin/permissions');
        const plugins = await response.json();

        const selectionDiv = document.getElementById('permissions');
        selectionDiv.innerHTML = '';  // Clear previous content

        // Render plugins and their permissions
        plugins.forEach(plugin => {
            const pluginNameEl = document.createElement('a');
            pluginNameEl.className = 'bold';
            pluginNameEl.textContent = plugin.name;
            selectionDiv.appendChild(pluginNameEl);

            // Loop through each permission of the plugin
            plugin.permissions.forEach(permission => {
                const permissionDiv = document.createElement('div');
                permissionDiv.className = 'permission';

                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.className = 'check';
                checkbox.name = permission;
                checkbox.addEventListener('change', handlePermissionChange);

                const permissionLabel = document.createElement('a');
                permissionLabel.textContent = permission;

                permissionDiv.appendChild(checkbox);
                permissionDiv.appendChild(permissionLabel);
                selectionDiv.appendChild(permissionDiv);
            });
        });
    } catch (error) {
        console.error('Error fetching plugin permissions:', error);
    }
}

// Function to load and check user-specific permissions
async function loadPermissions(username) {
    try {
        // Disable the permissions section while loading
        const selectionDiv = document.getElementById('permissions');
        selectionDiv.style.pointerEvents = 'none';
        selectionDiv.style.opacity = '0.5';

        const response = await fetch(`/api/admin/user/${username}`);
        const userPermissions = await response.json();

        // Enable permissions after response is received
        selectionDiv.style.pointerEvents = 'auto';
        selectionDiv.style.opacity = '1';

        // Check the permissions for the user
        const checkboxes = document.querySelectorAll('#permissions input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.checked = userPermissions.permissions.includes(checkbox.name);
        });
    } catch (error) {
        console.error('Error loading user permissions:', error);
    }
}

// Handle checkbox state changes
async function handlePermissionChange(event) {
    const checkbox = event.target;
    const permissionName = checkbox.name;
    const isChecked = checkbox.checked;

    // Prevent immediate visual state change
    checkbox.checked = !isChecked;

    const action = isChecked ? 'added' : 'removed';

    // Disable permissions while the request is sent
    const selectionDiv = document.getElementById('permissions');
    selectionDiv.style.pointerEvents = 'none';
    selectionDiv.style.opacity = '0.5';

    // Prepare the body data
    const data = {
        permission: permissionName,
        action: action
    };

    // Get the selected username from the DOM
    const selectedUser = document.getElementById('selected-name').textContent;

    // If no user is selected, skip the permission update
    if (!selectedUser) {
        console.error('No user selected for permission update.');
        selectionDiv.style.pointerEvents = 'auto';
        selectionDiv.style.opacity = '1';
        return;
    }

    // Send data to the server
    try {
        const response = await fetch(`/api/admin/user/${selectedUser}/permission`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            console.error('Error updating permission:', response.statusText);
        } else {
            console.log(`Permission ${permissionName} ${action} for user ${selectedUser} successfully.`);
        }

        // After the response, reload permissions for the user
        await loadPermissions(selectedUser);
    } catch (error) {
        console.error('Error updating permission:', error);
    } finally {
        // Enable permissions after request is processed
        selectionDiv.style.pointerEvents = 'auto';
        selectionDiv.style.opacity = '1';
    }
}


// Function to search users based on input
async function searchUsers(searchTerm) {
    try {
        const response = await fetch('/api/admin/users/search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ search: searchTerm })
        });
        const users = await response.json();
        console.log(users);

        const tbody = document.querySelector('#wrapper-table tbody');
        tbody.innerHTML = '';  // Clear previous content

        // Render each user in the table
        users.forEach(user => {
            const userRow = document.createElement('tr');
            const userCell = document.createElement('td');
            userCell.textContent = user;
            userCell.addEventListener('click', () => selectUser(user));

            userRow.appendChild(userCell);
            tbody.appendChild(userRow);
        });
    } catch (error) {
        console.error('Error fetching users:', error);
    }
}

// Function to select a user and load their permissions
function selectUser(username) {
    const selectedNameEl = document.getElementById('selected-name');
    selectedNameEl.textContent = username;

    // Load user-specific permissions
    loadPermissions(username);
}

// Event listener for the search input
document.querySelector('input[type="text"]').addEventListener('input', (event) => {
    const searchTerm = event.target.value;
    searchUsers(searchTerm);
});

// Draw permissions once on page load
drawPermissions();
searchUsers("");
