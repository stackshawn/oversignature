# OverSignature | Aeon
### Property of Zafrid - Closed Source

**OverSignature** is a self-hosted ERP & Network Management System designed for **Zafrid** under the **Aeon** brand identity. It provides a unified dashboard for workspace management, staff administration, and Minecraft server network monitoring.

---

## 🚀 Core Features

*   **Cyber-Industrial Interface:** A custom Dark Mode UI (`#0f0f13`) with Aeon Cyan and Deep Purple accents.
*   **Role-Based Access Control:** Hierarchical permissions (Owner > Executive > Admin > Moderator > Helper).
*   **Network Monitoring:** Real-time monitoring of Minecraft servers (Player count, Online status, MOTD) using `minecraft-server-util`.
*   **Self-Hosted & Secure:** Runs entirely on a single port (`24042`), utilizing local SQLite storage and JWT authentication.
*   **Production Ready:** Designed to be compiled into a single binary artifact for Linux environments.

---

## 🛠 Technical Architecture

### Stack
*   **Backend:** Node.js + Express.js
*   **Frontend:** React + Vite + Tailwind CSS
*   **Database:** SQLite (`oversignature.db`)
*   **Communication:** REST API (served on the same port as the UI)

### Storage Logic
The application dynamically determines where to store the database based on the environment:
*   **Development:** Stores `oversignature.db` in the project root.
*   **Production (Linux):** Stores data in `~/.oversignature/storage/` (User Home) or `/var/lib/oversignature/` (if running as root is configured effectively via HOME).

---

## 💻 Local Development

### Prerequisites
*   Node.js (v18+)
*   NPM

### Setup
1.  Clone the repository.
2.  Install dependencies for both server and client:
    ```bash
    npm install             # Root dependencies (concurrently)
    cd server && npm install # Backend dependencies
    cd ../client && npm install # Frontend dependencies
    ```

### Running the App
To run both the Backend and Frontend concurrently in development mode:

```bash
npm start
```

*   **Frontend:** `http://localhost:5173` (Proxies API requests to 24042)
*   **Backend:** `http://localhost:24042`

*Note: On the first launch, visit the web interface to complete the **One-Time Setup** process.*

---

## 📦 Production Deployment

OverSignature is designed to be deployed on a Linux VPS.

### 1. Build the Frontend
Before deploying or compiling, build the React application:

```bash
npm run build
```
*This command installs client dependencies and builds the static assets into `client/dist`.*

### 2. Run as a Node Process
You can run the application directly with Node.js in production mode. The server will serve the static frontend files.

```bash
export NODE_ENV=production
node server/server.js
```
Access the application at `http://<YOUR_IP>:24042`.

### 3. Systemd Service
A template `oversignature.service` file is provided in the root directory for auto-starting the application on boot.

1.  Copy to `/etc/systemd/system/oversignature.service`.
2.  Update the `User` and `ExecStart` paths in the file.
3.  Reload and enable:
    ```bash
    sudo systemctl daemon-reload
    sudo systemctl enable oversignature
    sudo systemctl start oversignature
    ```

### 4. Compilation (Optional)
To protect the source code, use `pkg` to compile the project into a binary.
*   Ensure `client/dist` is generated.
*   Configure `pkg` to include assets.
*   Run the resulting binary on the target Linux machine.

---

## ⚠️ Licensing

**Property of Zafrid - OverSignature. Closed Source.**
Copyright © 2024-2025. Unauthorized distribution prohibited.
