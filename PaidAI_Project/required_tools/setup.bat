@echo off
echo Setting up Project H...

echo Installing Backend Dependencies...
cd ../website_files/backend
call npm install express cors dotenv openai stripe body-parser nodemon

echo Installing Frontend Dependencies...
cd ../frontend
call npm install lucide-react react-router-dom axios

echo Setup Complete!
pause
