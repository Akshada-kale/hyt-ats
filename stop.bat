@echo off
setlocal EnableDelayedExpansion
chcp 65001 >nul
title Stop HuntYourTribe (HYT ATS) Server

cd /d "%~dp0"
set "PORT=8000"
if not "%~1"=="" set "PORT=%~1"

echo [*] Searching for HYT ATS server running on port %PORT%...

set "OCCUPIED_PID="
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":%PORT% " ^| findstr "LISTENING"') do (
    set "OCCUPIED_PID=%%a"
)

if defined OCCUPIED_PID (
    echo [*] Terminating process on port %PORT% [PID: !OCCUPIED_PID!]...
    taskkill /F /PID !OCCUPIED_PID! >nul 2>&1
    echo [OK] Successfully stopped HYT ATS server [PID: !OCCUPIED_PID!].
) else (
    echo [INFO] No server is currently listening on port %PORT%.
)

ping -n 3 127.0.0.1 >nul 2>&1
