@echo off
setlocal EnableDelayedExpansion
chcp 65001 >nul
title HuntYourTribe (HYT ATS) - Unified Screening Engine ^& Web Platform

:: ============================================================================
:: Ensure working directory is the project root
:: ============================================================================
cd /d "%~dp0"

echo ==============================================================================
echo        HuntYourTribe (HYT) ATS - Unified Full-Stack Runner
echo ==============================================================================
echo   Frontend : Modern SPA Web Application (Candidate, Recruiter, Admin)
echo   Backend  : 10-Gate Deterministic AI Screening REST API ^& Pipeline
echo ==============================================================================
echo.

:: ============================================================================
:: Default Configuration
:: ============================================================================
set "PORT=8000"
set "HOST=127.0.0.1"
set "OPEN_BROWSER=1"
set "FORCE_RESTART=0"
set "RUN_CHECK=0"
set "DO_STOP=0"

:: ============================================================================
:: Parse Command Line Arguments
:: ============================================================================
:parse_args
if "%~1"=="" goto after_args

if /i "%~1"=="--no-browser" (
    set "OPEN_BROWSER=0"
    shift
    goto parse_args
)
if /i "%~1"=="--restart" (
    set "FORCE_RESTART=1"
    shift
    goto parse_args
)
if /i "%~1"=="restart" (
    set "FORCE_RESTART=1"
    shift
    goto parse_args
)
if /i "%~1"=="--kill" (
    set "FORCE_RESTART=1"
    shift
    goto parse_args
)
if /i "%~1"=="kill" (
    set "FORCE_RESTART=1"
    shift
    goto parse_args
)
if /i "%~1"=="stop" (
    set "DO_STOP=1"
    shift
    goto parse_args
)
if /i "%~1"=="--stop" (
    set "DO_STOP=1"
    shift
    goto parse_args
)
if /i "%~1"=="--check" (
    set "RUN_CHECK=1"
    shift
    goto parse_args
)
if /i "%~1"=="check" (
    set "RUN_CHECK=1"
    shift
    goto parse_args
)
if /i "%~1"=="test" (
    set "RUN_CHECK=1"
    shift
    goto parse_args
)

:: Check if the argument is a port number (all digits)
echo %~1| findstr /r "^[0-9][0-9]*$" >nul
if not errorlevel 1 (
    set "PORT=%~1"
    shift
    goto parse_args
)

shift
goto parse_args

:after_args

:: ============================================================================
:: Quick Stop Action
:: ============================================================================
if "%DO_STOP%"=="1" (
    echo [*] Checking for running HYT ATS servers on port %PORT%...
    set "PID_TO_STOP="
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":%PORT% " ^| findstr "LISTENING"') do (
        set "PID_TO_STOP=%%a"
    )
    if defined PID_TO_STOP (
        echo [*] Stopping process on port %PORT% [PID: !PID_TO_STOP!]...
        taskkill /F /PID !PID_TO_STOP! >nul 2>&1
        echo [OK] HYT ATS server stopped.
    ) else (
        echo [INFO] No process is currently listening on port %PORT%.
    )
    exit /b 0
)

:: ============================================================================
:: Step 1: Detect Python Environment
:: ============================================================================
echo [*] Checking Python runtime...
set "PYTHON_CMD="

if exist "%~dp0venv\Scripts\python.exe" (
    set "PYTHON_CMD=%~dp0venv\Scripts\python.exe"
    echo [OK] Using dedicated project virtual environment: venv\Scripts\python.exe
    if exist "%~dp0venv\Scripts\activate.bat" (
        call "%~dp0venv\Scripts\activate.bat" >nul 2>&1
    )
) else (
    where python >nul 2>&1
    if not errorlevel 1 (
        set "PYTHON_CMD=python"
        echo [!] Project venv not found at .\venv. Falling back to system Python.
    ) else (
        echo.
        echo [ERROR] Python was not found on your system or in your PATH!
        echo ------------------------------------------------------------------------------
        echo To run HuntYourTribe ATS:
        echo 1. Download and install Python 3.10+ from: https://www.python.org/downloads/
        echo 2. Check the box "Add python.exe to PATH" during installation.
        echo 3. Run: python -m venv venv ^&^& .\venv\Scripts\pip install -r requirements.txt
        echo.
        pause
        exit /b 1
    )
)

:: ============================================================================
:: Step 2: Validate Dependencies & Environment File
:: ============================================================================
if not exist "%~dp0.env" (
    echo [*] .env configuration file not found. Creating from .env.example...
    if exist "%~dp0.env.example" (
        copy "%~dp0.env.example" "%~dp0.env" >nul
        echo [OK] Created .env file. You can configure your GROQ / GEMINI / OLLAMA settings there.
    ) else (
        echo [!] Note: Neither .env nor .env.example found. Continuing with runtime defaults.
    )
)

:: Quick dependency sanity test
"%PYTHON_CMD%" -c "import pydantic, yaml" >nul 2>&1
if errorlevel 1 (
    echo [!] Missing core Python packages. Attempting automatic installation...
    "%PYTHON_CMD%" -m pip install -r "%~dp0requirements.txt"
    if errorlevel 1 (
        echo [ERROR] Failed to install requirements. Please run 'pip install -r requirements.txt' manually.
        pause
        exit /b 1
    )
)

:: Run Diagnostic Check if requested
if "%RUN_CHECK%"=="1" (
    echo.
    echo [*] Executing Full Backend Diagnostic Test Suite...
    "%PYTHON_CMD%" "%~dp0check_backend.py"
    echo.
    pause
    exit /b %errorlevel%
)

:: ============================================================================
:: Step 3: Check for Port Conflicts
:: ============================================================================
set "OCCUPIED_PID="
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":%PORT% " ^| findstr "LISTENING"') do (
    set "OCCUPIED_PID=%%a"
)

if defined OCCUPIED_PID (
    if "%FORCE_RESTART%"=="1" (
        echo [*] Stopping existing server process on port %PORT% [PID: !OCCUPIED_PID!]...
        taskkill /F /PID !OCCUPIED_PID! >nul 2>&1
        ping -n 2 127.0.0.1 >nul 2>&1
        goto start_server
    )

    echo.
    echo ------------------------------------------------------------------------------
    echo [INFO] Port %PORT% is currently occupied by process [PID: !OCCUPIED_PID!].
    echo        The HYT ATS server may already be running.
    echo ------------------------------------------------------------------------------
    echo   [1] Open existing Web UI in browser [Auto-selected in 5s]
    echo   [2] Terminate PID !OCCUPIED_PID! and restart a fresh server
    echo   [3] Start on alternative port [8080]
    echo   [4] Exit launcher
    echo.
    choice /C 1234 /N /T 5 /D 1 /M "Choose an option [1-4]: "
    if errorlevel 4 exit /b 0
    if errorlevel 3 (
        set "PORT=8080"
        goto start_server
    )
    if errorlevel 2 (
        echo [*] Terminating existing process [PID: !OCCUPIED_PID!]...
        taskkill /F /PID !OCCUPIED_PID! >nul 2>&1
        ping -n 2 127.0.0.1 >nul 2>&1
        goto start_server
    )
    if errorlevel 1 (
        echo [*] Opening existing Web Application at http://127.0.0.1:%PORT%/...
        start http://127.0.0.1:%PORT%/
        echo [OK] Browser launched. Server is active.
        pause
        exit /b 0
    )
)

:start_server
echo.
echo ==============================================================================
echo   LAUNCHING HUNTYOURTRIBE (HYT) UNIFIED PLATFORM
echo ==============================================================================
echo   Web Application (Frontend) : http://%HOST%:%PORT%/
echo   Interactive API Docs       : http://%HOST%:%PORT%/api/docs
echo   Backend REST Health Probe  : http://%HOST%:%PORT%/api/health
echo   Jobs Catalog Endpoint      : http://%HOST%:%PORT%/api/jobs
echo   Candidates Roster Endpoint : http://%HOST%:%PORT%/api/candidates
echo ==============================================================================
echo.

:: Automatically open browser once server socket is ready
if "%OPEN_BROWSER%"=="1" (
    echo [*] Opening Web Application in your default browser...
    start "" cmd /c "ping -n 3 127.0.0.1 >nul 2>&1 && start http://%HOST%:%PORT%/"
)

echo [*] Server is running. Press Ctrl+C in this terminal window to stop.
echo ------------------------------------------------------------------------------
echo.

"%PYTHON_CMD%" "%~dp0api_server.py" %PORT%

if errorlevel 1 (
    echo.
    echo [!] Server exited with an error code.
    pause
)
