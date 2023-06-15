# RegistryJS

## Install

```html
<script src="https://cdn.jsdelivr.net/gh/lesichkovm/RegistryJS@0.0.1/Registry.js"></script>
```

```js
const registry = new Registry();
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
