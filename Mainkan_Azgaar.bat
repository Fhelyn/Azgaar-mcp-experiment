@off
echo 🚀 Menyalakan Server Azgaar di latar belakang...
cd /d C:\coding\map
start /b npm run dev
timeout /t 3 /nobreak >nul
echo 🌐 Membuka aplikasi Azgaar...
start http://localhost:5173/Fantasy-Map-Generator/
exit