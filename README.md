# Hypotheek Calculator

A comprehensive Dutch mortgage calculator built with [Svelte 5](https://svelte.dev) and [Effect](https://effect.website). Features interactive sliders, real-time calculations, inflation-corrected values, and detailed visualizations.

## Features

- **Interactive mortgage calculations** with HRA (hypotheekrenteaftrek) tax benefits
- **Real-time updates** with sliders and text inputs
- **Inflation correction** showing both nominal and real values
- **Interactive charts** displaying monthly costs over time
- **Detailed data table** with expandable yearly/monthly breakdowns
- **Cross-browser compatible** styling for consistent experience

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

## Development

### Development Server

To start the development server with hot reloading:

```bash
nix run .#dev
```

This will install dependencies and start the Svelte development server.

### Development Shell

To enter a development shell with all necessary tools:

```bash
nix develop
```

This provides:

- Node.js and npm
- TypeScript language server
- Svelte language server
- Tailwind CSS language server
- Other development tools

### Formatting Code

Format all code in the project with:

```bash
nix fmt
```

This uses:

- Prettier to format TypeScript, JavaScript, JSON, Markdown, Svelte, HTML, and CSS files according to the project's configuration in `.prettierrc`
- nixpkgs-fmt to format Nix files
