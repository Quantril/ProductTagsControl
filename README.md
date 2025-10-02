# Product Tags Control

This is a Power Apps Component Framework (PCF) control that provides a product tags interface for Power Apps.

## Project Overview

The Product Tags Control is a custom PCF component designed to enhance the tagging functionality in Power Apps applications.

## Prerequisites

- Power Apps CLI
- Node.js
- npm (Node Package Manager)
- Visual Studio Code (recommended)

## Project Structure

- `ProductTagsControl/` - Contains the main component files
  - `ControlManifest.Input.xml` - Component manifest file
  - `index.ts` - Main TypeScript implementation file
  - `css/` - Contains component styles
  - `generated/` - Contains generated type definitions
  - `types/` - Contains custom type definitions

## Building the Project

1. Install dependencies:
```bash
npm install
```

2. Build the control:
```bash
npm run build
```

3. For development and testing:
```bash
npm start watch
```

## Deployment

The control can be deployed to your Power Apps environment using the Power Apps CLI:

```bash
pac pcf push
```

## Solution Information

This project is part of a Power Apps solution and includes:
- Component source code
- Solution files (`src/Other/`)
- Build configuration files (pcfconfig.json, tsconfig.json)

## Contributing

Please ensure any contributions follow the PCF development guidelines and include appropriate documentation.

## License

[Add your license information here]