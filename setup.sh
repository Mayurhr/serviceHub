#!/bin/bash
echo "⚡ ServeEase Pro — Setup Script"
echo "================================"

if ! command -v node &> /dev/null; then echo "❌ Node.js required (v18+)"; exit 1; fi

echo "📦 Installing backend..."
cd backend && npm install
[ ! -f .env ] && cp .env.example .env && echo "✅ .env created"

echo "🌱 Seeding database..."
node data/seeder.js

echo "📦 Installing frontend..."
cd ../frontend && npm install

echo ""
echo "✅ Setup complete!"
echo ""
echo "Start the app:"
echo "  Terminal 1: cd backend  && npm run dev"
echo "  Terminal 2: cd frontend && npm run dev"
echo ""
echo "Open: http://localhost:5173"
echo "Admin: admin@servease.com / admin123"
