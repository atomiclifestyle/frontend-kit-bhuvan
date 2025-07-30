# Build on Bhuvan: Geospatial Toolkit

A developer-centric platform and SDK designed for GIS application development using **ISRO's Bhuvan Geoportal**. This project abstracts the complexities of geospatial services into a simple, powerful, and collaborative environment.

[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen?style=for-the-badge&logo=vercel)](https://buildonbhuvan.vercel.app/)
[![NPM Package](https://img.shields.io/npm/v/bhuvan-dev-env-client.svg?style=for-the-badge)](https://www.npmjs.com/package/bhuvan-dev-env-client)
[![License](https://img.shields.io/badge/license-red?style=for-the-badge)](https://github.com/atomiclifestyle/frontend-kit-bhuvan/blob/main/LICENSE)
---

## Core Features

* **NPM Package (`bhuvan-dev-env-client`)**: A lightweight JavaScript client to integrate Bhuvan services and your custom layers into any web project.
* **No Code Layer Creator**: An intuitive GUI to annotate, style, and save custom geospatial vector data layers and overlays without writing a single line of code.
* **Personal Geospatial Database**: Every user gets a private, secure PostGIS database to store and manage their custom layers.
* **Central Geospatial Database**: Every user has read-only access to the Central Database from where they can query sample data.
* **Bhuvan API Playground**: An interactive tool to explore Bhuvan's APIs, see live responses, and flatten the learning curve.

---

## Getting Started

1. Create Your Custom map layer, **Get your unique `user_id`** and Personal Database by signing up on the [Build on Bhuvan](https://buildonbhuvan.vercel.app/) platform. 

2.  **Install the client** in your project:
    ```bash
    npm install bhuvan-dev-env-client
    ```

3.  **Use it in your code**:
    ```javascript
    import { createBhuvanClient } from 'bhuvan-dev-env-client';

    // Initialize with your user ID
    const bhuvan = createBhuvanClient("[your_user_id]");

    // Example: Get routing data
    const route = await bhuvan.getRouting(17, 78, 18, 79);
    console.log("Route:", route);
    ```

---

## License

This project is **source-available** but **not open-source**. See [LICENSE](./LICENSE) for details.

---

## Acknowledgements

This platform was developed as part of an internship project at the **National Remote Sensing Centre (NRSC), ISRO**.
