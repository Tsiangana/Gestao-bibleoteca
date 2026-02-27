#!/bin/bash

# Kill background processes on exit
trap "exit" INT TERM
trap "kill 0" EXIT

echo "🚀 Iniciando Plataforma de Empréstimo de Livros..."

# Start Backend
echo "📦 Iniciando Backend (.NET 8)..."
cd Backend
dotnet run &
BACKEND_PID=$!
cd ..

# Start Frontend
echo "💻 Iniciando Frontend (React/Vite)..."
cd Frontend
npm run dev &
FRONTEND_PID=$!
cd ..

wait
