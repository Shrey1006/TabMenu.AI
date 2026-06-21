# TabMenu.AI 🍽️🤖

TabMenu.AI is a next-generation, production-grade full-stack restaurant automation ecosystem. By scanning dynamic, table-specific cryptographic QR codes, customers can instantly browse menus, place orders, make seamless payments, and page floor staff in real time. The platform features an AI-driven text sentiment engine that processes post-dining feedback to alert administrators of critical operational issues instantly.

---

## 📌 Project Architecture & Multi-Role Ecosystem

The system utilizes an advanced **Role-Based Access Control (RBAC)** architecture to isolate workflows and optimize restaurant floor dynamics through four core dashboards:

* **📱 Customer Interface:** Triggered via dynamic QR scans mapping explicit table numbers. Handles cart operations, persistent WebSocket waiter attention calls, real-time order tracking, digital checkouts, and post-dining text reviews.
* **👨‍🍳 Kitchen Dashboard:** Receives live order tickets instantly through WebSocket pipelines. Features state transitions (`Pending` ➡️ `In Progress` ➡️ `Ready for Dispatch`) with automated order sequence timers.
* **💼 Waiter Portal:** Displays real-time flash notifications for active tables requiring physical service or payment assistance, linked directly to WebSocket broadcast rings.
* **📊 Admin Management Center:** High-level dashboard for inventory data modifications, menu price scheduling, multi-role account provisions, and live visualization of the NLP sentiment analysis system.

---

## 🚀 Key Features

* **🔗 Cryptographic Table Routing:** Dynamically generates and processes unique QR codes to isolate distinct table index numbers securely, eliminating faulty manual ordering configurations.
* **⚡ Bidirectional Real-Time Synchronization:** Powered by **Socket.io** to bridge asynchronous communications instantly across Customers, Waiters, and the Kitchen staff.
* **🧠 PyTorch NLP Feedback Classifier:** Built a text-classification pipeline that automatically scans customer feedback strings to isolate negative sentiment flags and alert Admins for rapid service recovery.
* **💳 Transactional Order-to-Payment Pipelines:** Features atomic database state machines mapping successful checkouts to distinct order sheets with zero synchronization slip.
* **🔒 Granular Token Authentication:** Secures sensitive api routes across Kitchen, Admin, and Waiter dashboards using robust server-validated **JSON Web Tokens (JWT)**.

---

## 🛠️ Tech Stack

### Frontend
* **React.js** – Component-driven architecture with clean, responsive contextual hook states.
* **Tailwind CSS** – High-performance utility-first styling for mobile, tablet, and desktop viewports.

### Backend & AI Infrastructure
* **Node.js & Express.js** – Event-driven, scalable application server layer routing core transactions.
* **FastAPI** – High-performance asynchronous Python gateway running machine learning validation threads.
* **PyTorch & Scikit-learn** – Core model building, token optimization, and sentiment text classification.
* **Socket.io** – Low-latency WebSockets for multi-role instantaneous event broadcasts.

### Database
* **MongoDB & Mongoose** – Document-oriented data modeling utilizing strict relational validation schemas and ACID-compliant transaction controls.

---

## 📂 Project Structure

```text
TabMenu.AI/
├── frontend/                  # React.js SPA Dashboard Views
│   ├── src/
│   │   ├── components/        # Reusable UI Element Cards (Cart, QR Scanner)
│   │   ├── context/           # Global State Management (Auth, Socket rings)
│   │   └── pages/             # Customer, Waiter, Kitchen, Admin dashboards
├── backend/                   # Node.js Enterprise REST API Gateway
│   ├── controllers/           # Transactional API Handler Logic
│   ├── middleware/            # JWT Authorization & Route Guards
│   ├── models/                # Schema definitions (Users, Orders, Tables)
│   └── routes/                # WebSocket & REST endpoints
├── ai-service/                # Python FastAPI Machine Learning Workspace
│   ├── models/                # Saved Weights for Text Sentiment Classifier
│   ├── pipeline/              # Preprocessing text vectors & NLP Tokenization
│   └── main.py                # REST gateway connecting to the Node.js server
└── README.md
```

## ▶️ Local Deployment Setup

### 1. Clone the repository
```bash
git clone [https://github.com/Shrey1006/MenuQR.git](https://github.com/Shrey1006/MenuQR.git)
cd MenuQR
```

## 👤 Author

**Shreyansh Mojidra** Computer Engineering Student  
*Veermata Jijabai Technological Institute (VJTI)*, Mumbai, India  

📬 **Connect with me:** [![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=flat&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/shreyansh-mojidra-8b2119252/)  
[![GitHub](https://img.shields.io/badge/GitHub-100000?style=flat&logo=github&logoColor=white)](https://github.com/Shrey1006)
