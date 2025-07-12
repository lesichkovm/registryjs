# RegistryJS

A lightweight key-value store for the browser with encryption, namespacing, and expiration functionality.

## Install

### Via CDN

```html
<!-- Latest version (recommended) -->
<script src="https://cdn.jsdelivr.net/gh/lesichkovm/registryjs/dist/registry.min.js"></script>

<!-- Specific version -->
<script src="https://cdn.jsdelivr.net/gh/lesichkovm/registryjs@v0.2.0/Registry.js"></script>
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
// Create a new registry instance
const registry = new Registry();

// Or with a custom namespace
const appRegistry = new Registry('my-app');
```

## Setting Values
```js
// add a key with an object value to the registry
registry.set("user", {
    "name": "John Doe"
});

// add a key, which will expire in an hour
registry.set("token", "authtoken", 60*60);
```


## Getting Values
```js
registry.get("user");

registry.get("token");
```

## Removing Values
```js
registry.remove("user");

registry.remove("token");
```

## Empty All Values
```js
registry.empty();
```
