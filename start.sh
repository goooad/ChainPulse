#!/bin/bash

echo "🚀 启动Web3Sentry项目..."

# 检查Node.js版本
echo "检查Node.js版本..."
node --version
npm --version

# 启动后端服务器
echo "启动后端服务器..."
cd backend
npm install
npm run dev &
BACKEND_PID=$!

# 等待后端启动
sleep 5

# 启动前端服务器
echo "启动前端服务器..."
cd ../frontend
npm install
npm run dev &
FRONTEND_PID=$!

echo "✅ 服务启动完成!"
echo "📱 前端地址: http://localhost:5173"
echo "🔧 后端地址: http://localhost:3001"
echo "🛡️ 浏览器扩展: 在Chrome中加载extension文件夹"

# 等待用户输入来停止服务
echo "按任意键停止所有服务..."
read -n 1

# 停止所有服务
echo "停止服务..."
kill $BACKEND_PID $FRONTEND_PID
echo "✅ 所有服务已停止"