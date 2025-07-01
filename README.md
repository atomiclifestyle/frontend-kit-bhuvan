# Bhuvan API Frontend Development Kit

This project provides a development environment for building frontend applications that interact with Bhuvan APIs using helper functions and a proxy backend.

---

## Prerequisites

- [Docker](https://www.docker.com/get-started)
- [Docker Compose](https://docs.docker.com/compose/install/)
- Otherwise work on Github Codespaces for pre-installed docker env

---

## Getting Started

To build and run the project locally:
```bash
docker-compose up --build
```

### File Structure

```
/
├── backend/               # Express-based proxy backend
│   └── .env               # API token environment file
├── frontend/              # React frontend
├── docker-compose.yml     # Container configuration

```
### Environment Variables

```
ROUTING_TOKEN=your_token_here
GEOID_TOKEN=your_token_here
VILLAGE_GEOCODING_TOKEN=your_token_here
LULC_STATISTICS_TOKEN=your_token_here
LULC_AOI_TOKEN=your_token_here
```
