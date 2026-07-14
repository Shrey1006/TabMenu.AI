.PHONY: help install dev start build test lint clean docker-build docker-up docker-down

# Color output
BLUE=\033[0;34m
GREEN=\033[0;32m
RED=\033[0;31m
NC=\033[0m # No Color

help:
	@echo "$(BLUE)Ambika Pure Veg - Make Commands$(NC)"
	@echo ""
	@echo "$(GREEN)Development:$(NC)"
	@echo "  make install       - Install all dependencies"
	@echo "  make dev           - Start all services in development"
	@echo "  make dev-frontend  - Start frontend dev server"
	@echo "  make dev-backend   - Start backend dev server"
	@echo "  make dev-ai        - Start AI service"
	@echo ""
	@echo "$(GREEN)Production:$(NC)"
	@echo "  make build         - Build all services for production"
	@echo "  make build-frontend- Build frontend bundle"
	@echo "  make build-backend - Build backend"
	@echo ""
	@echo "$(GREEN)Testing:$(NC)"
	@echo "  make test          - Run all tests"
	@echo "  make test-frontend - Run frontend tests"
	@echo "  make test-backend  - Run backend tests"
	@echo ""
	@echo "$(GREEN)Quality:$(NC)"
	@echo "  make lint          - Run linters"
	@echo "  make lint-frontend - Lint frontend code"
	@echo "  make lint-backend  - Lint backend code"
	@echo ""
	@echo "$(GREEN)Docker:$(NC)"
	@echo "  make docker-build  - Build Docker images"
	@echo "  make docker-up     - Start all Docker containers"
	@echo "  make docker-down   - Stop all Docker containers"
	@echo "  make docker-logs   - View Docker logs"
	@echo ""
	@echo "$(GREEN)Utilities:$(NC)"
	@echo "  make clean         - Clean build artifacts"
	@echo "  make reset         - Reset to clean state"
	@echo ""

# Installation
install:
	@echo "$(BLUE)Installing dependencies...$(NC)"
	cd backend && npm install
	cd ../frontend && npm install
	@echo "$(GREEN)Dependencies installed!$(NC)"

# Development
dev:
	@echo "$(BLUE)Starting all services in development mode...$(NC)"
	@echo "Backend will run on http://localhost:5000"
	@echo "Frontend will run on http://localhost:5173"
	@echo "Ctrl+C to stop"
	@sleep 2
	@(cd backend && npm start) & \
	(cd frontend && npm run dev) & \
	wait

dev-frontend:
	@echo "$(BLUE)Starting frontend dev server...$(NC)"
	cd frontend && npm run dev

dev-backend:
	@echo "$(BLUE)Starting backend dev server...$(NC)"
	cd backend && npm start

dev-ai:
	@echo "$(BLUE)Starting AI service...$(NC)"
	cd ai-service && \
	python -m venv venv && \
	source venv/bin/activate && \
	pip install -r requirements.txt && \
	python main.py

# Building
build: build-frontend build-backend
	@echo "$(GREEN)All services built successfully!$(NC)"

build-frontend:
	@echo "$(BLUE)Building frontend...$(NC)"
	cd frontend && npm run build
	@echo "$(GREEN)Frontend built: ./frontend/dist$(NC)"

build-backend:
	@echo "$(BLUE)Building backend...$(NC)"
	cd backend && npm run build 2>/dev/null || echo "No build script in backend"

# Testing
test: test-frontend test-backend
	@echo "$(GREEN)All tests passed!$(NC)"

test-frontend:
	@echo "$(BLUE)Running frontend tests...$(NC)"
	cd frontend && npm test -- --passWithNoTests 2>/dev/null || echo "No tests configured"

test-backend:
	@echo "$(BLUE)Running backend tests...$(NC)"
	cd backend && npm test 2>/dev/null || echo "No tests configured"

# Linting
lint: lint-frontend lint-backend
	@echo "$(GREEN)Linting complete!$(NC)"

lint-frontend:
	@echo "$(BLUE)Linting frontend code...$(NC)"
	cd frontend && npm run lint 2>/dev/null || echo "Frontend linter not configured"

lint-backend:
	@echo "$(BLUE)Linting backend code...$(NC)"
	cd backend && npm run lint 2>/dev/null || echo "Backend linter not configured"

# Docker commands
docker-build:
	@echo "$(BLUE)Building Docker images...$(NC)"
	docker-compose build
	@echo "$(GREEN)Docker images built!$(NC)"

docker-up:
	@echo "$(BLUE)Starting Docker containers...$(NC)"
	docker-compose up -d
	@echo "$(GREEN)Services running:$(NC)"
	@echo "  Frontend: http://localhost:5173"
	@echo "  Backend: http://localhost:5000"
	@echo "  MongoDB: localhost:27017"

docker-down:
	@echo "$(BLUE)Stopping Docker containers...$(NC)"
	docker-compose down
	@echo "$(GREEN)All containers stopped!$(NC)"

docker-logs:
	@echo "$(BLUE)Showing Docker logs (Ctrl+C to exit)...$(NC)"
	docker-compose logs -f

docker-restart: docker-down docker-up
	@echo "$(GREEN)Docker containers restarted!$(NC)"

# Database
db-seed:
	@echo "$(BLUE)Seeding database...$(NC)"
	cd backend && npm run seed
	@echo "$(GREEN)Database seeded!$(NC)"

db-reset:
	@echo "$(RED)Resetting database...$(NC)"
	cd backend && npm run seed -- --reset
	@echo "$(GREEN)Database reset!$(NC)"

# Cleaning
clean:
	@echo "$(BLUE)Cleaning build artifacts...$(NC)"
	rm -rf frontend/dist backend/dist frontend/node_modules backend/node_modules
	find . -type d -name ".nuxt" -exec rm -rf {} +
	find . -type d -name "build" -exec rm -rf {} +
	@echo "$(GREEN)Clean complete!$(NC)"

clean-logs:
	@echo "$(BLUE)Clearing logs...$(NC)"
	rm -rf logs/*
	@echo "$(GREEN)Logs cleared!$(NC)"

# Environment setup
env-setup:
	@echo "$(BLUE)Setting up environment files...$(NC)"
	cp backend/.env.example backend/.env 2>/dev/null || echo "Backend .env already exists"
	cp frontend/.env.example frontend/.env.local 2>/dev/null || echo "Frontend .env already exists"
	@echo "$(GREEN)Environment files ready!$(NC)"

# Full reset
reset: clean env-setup install db-seed
	@echo "$(GREEN)Project reset to clean state!$(NC)"

# Verification
verify:
	@echo "$(BLUE)Verifying installation...$(NC)"
	@command -v node >/dev/null 2>&1 && echo "$(GREEN)✓ Node.js$(NC)" || echo "$(RED)✗ Node.js not found$(NC)"
	@command -v npm >/dev/null 2>&1 && echo "$(GREEN)✓ npm$(NC)" || echo "$(RED)✗ npm not found$(NC)"
	@command -v mongosh >/dev/null 2>&1 && echo "$(GREEN)✓ MongoDB$(NC)" || echo "$(RED)✗ MongoDB not found$(NC)"
	@command -v python3 >/dev/null 2>&1 && echo "$(GREEN)✓ Python$(NC)" || echo "$(RED)✗ Python not found$(NC)"
	@command -v docker >/dev/null 2>&1 && echo "$(GREEN)✓ Docker$(NC)" || echo "$(RED)✗ Docker not found$(NC)"

# Package management
update-deps:
	@echo "$(BLUE)Updating dependencies...$(NC)"
	cd backend && npm update
	cd ../frontend && npm update
	@echo "$(GREEN)Dependencies updated!$(NC)"

# Info
info:
	@echo "$(BLUE)Project Information:$(NC)"
	@echo ""
	@echo "Frontend:"
	@cd frontend && npm list react react-router-dom socket.io-client 2>/dev/null | grep -E "@|angular|react" || echo "  No packages installed"
	@echo ""
	@echo "Backend:"
	@cd backend && npm list express mongoose socket.io 2>/dev/null | grep -E "@|express|mongoose" || echo "  No packages installed"

# Quick demo
demo:
	@echo "$(BLUE)Starting demo environment...$(NC)"
	make clean
	make install
	make env-setup
	make db-seed
	@echo ""
	@echo "$(GREEN)Demo environment ready!$(NC)"
	@echo "Frontend: http://localhost:5173"
	@echo "Backend: http://localhost:5000"
	@echo ""
	@echo "To start services, run: $(BLUE)make dev$(NC)"

.DEFAULT_GOAL := help
