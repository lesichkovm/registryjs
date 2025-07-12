# RegistryJS

A lightweight key-value store for the browser with encryption, namespacing,
and expiration functionality.

## Introduction

RegistryJS provides a simple interface for storing and retrieving data
in the browser's localStorage with added features like:

- **Encryption** - All stored values are encrypted for security
- **Namespacing** - Isolate your data from other applications
- **Expiration** - Set time-based expiration for stored values
- **Automatic cleanup** - Expired values are automatically removed

## Install

### Via CDN

```html
<!-- Latest version (recommended) -->
<script src="https://cdn.jsdelivr.net/gh/lesichkovm/registryjs/dist/registry.min.js"></script>

<!-- Specific version -->
<script src="https://cdn.jsdelivr.net/gh/lesichkovm/registryjs@0.3.0/dist/registry.min.js"></script>
```

### Via npm

```bash
npm install registryjs
```

Then import it in your project:

```js
// ES Module import
import Registry from 'registryjs';

// CommonJS require
const Registry = require('registryjs');
```

### Available Builds in dist/

The library provides different builds for various use cases:

- `registry.js` - UMD build for browsers and Node.js (unminified)
- `registry.min.js` - Minified UMD build for production use
- `registry.esm.js` - ES Module build for modern bundlers

## Usage

```js
// Create a new registry instance with default namespace (based on current domain)
const registry = new Registry();

// Or with a custom namespace to isolate your data
const appRegistry = new Registry('my-app');
```

## Building from Source

To build the distribution files from source:

```bash
# Install dependencies
npm install

# Build all distribution files
npm run build
```

This will generate the files in the `dist/` directory.

## API Documentation

### Constructor

```js
new Registry([namespace])
```

- **namespace** (optional): String - A custom namespace for isolating stored values. If not provided, the current domain is used as the namespace.

### Methods

#### set(key, value, [expires])

Stores a value in the registry.

- **key**: String - The key to store the value under
- **value**: Any - The value to store (will be JSON serialized)
- **expires**: Number (optional) - Time in seconds until the value expires. Default is a very large number (effectively never expires).

```js
// Store a simple value
registry.set("username", "john_doe");

// Store an object
registry.set("user", {
    name: "John Doe",
    email: "john@example.com",
    preferences: {
        theme: "dark",
        notifications: true
    }
});

// Store a value that expires in 1 hour (3600 seconds)
registry.set("session", "abc123", 3600);

// Store a value that expires in 1 day
registry.set("rememberMe", true, 86400);
```

#### get(key)

Retrieves a value from the registry.

- **key**: String - The key to retrieve
- **Returns**: The stored value, or null if not found or expired

```js
// Get a stored value
const username = registry.get("username");

// Get an object
const user = registry.get("user");
if (user) {
    console.log(`Hello, ${user.name}!`);
    
    // Access nested properties
    if (user.preferences.theme === "dark") {
        // Apply dark theme
    }
}

// Check for expired values
const session = registry.get("session");
if (!session) {
    // Session has expired or doesn't exist
    redirectToLogin();
}
```

#### remove(key)

Removes a value from the registry.

- **key**: String - The key to remove

```js
// Remove a specific value
registry.remove("username");

// Remove a session on logout
function logout() {
    registry.remove("session");
    registry.remove("user");
    redirectToLogin();
}
```

#### empty()

Removes all values in the current namespace.

```js
// Clear all data in this namespace
registry.empty();

// Example: Reset all user data
function resetUserData() {
    registry.empty();
    showNotification("All data has been cleared");
}
```

## Advanced Usage

### Using Multiple Namespaces

You can create multiple registry instances with different namespaces to isolate data:

```js
// User settings namespace
const userSettings = new Registry("user-settings");

// Application cache namespace
const appCache = new Registry("app-cache");

// Store data in different namespaces
userSettings.set("theme", "dark");
appCache.set("apiData", responseData);

// Clear only the cache
appCache.empty(); // Only clears the app-cache namespace
```

### Storing Complex Data

The registry can store any JSON-serializable data:

```js
// Store arrays
registry.set("recentSearches", ["query1", "query2", "query3"]);

// Store nested objects
registry.set("formData", {
    personal: {
        name: "John Doe",
        email: "john@example.com"
    },
    address: {
        street: "123 Main St",
        city: "Anytown",
        zip: "12345"
    },
    preferences: [
        { id: 1, enabled: true },
        { id: 2, enabled: false }
    ]
});
```

### Security Considerations

While RegistryJS encrypts stored data, it's important to note that client-side encryption has limitations:

- Don't store highly sensitive data like passwords or API keys
- The encryption is primarily to prevent casual inspection of localStorage
- For truly sensitive data, always use secure server-side storage
