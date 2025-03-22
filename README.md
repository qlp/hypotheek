# Svelte Effect Nix Template

This is a Nix-powered [Svelte](https://svelte.dev) template with [Effect](https://effect.website) integration. It builds an app fully reproducibly, including tests.

## Building and Running

### Building the App

To build the app, run:

```bash
nix build
```

This will:
1. Install all dependencies
2. Run the tests using Vitest
3. Build the application
4. Output the result to `./result`

### Previewing the App

To preview the built app in a browser, run:

```bash
nix run
```

This will:
1. Build the app if it hasn't been built already
2. Start a local server using miniserve
3. Serve the app on http://localhost:8080

The preview server uses SPA mode, so client-side routing will work correctly.

