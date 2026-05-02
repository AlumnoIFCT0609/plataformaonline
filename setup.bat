@echo off
echo ============================================
echo COURSE PLATFORM - Setup para Windows
echo ============================================
echo.

REM Verificar Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js no esta instalado
    echo Por favor instala Node.js desde: https://nodejs.org/
    pause
    exit /b 1
)

echo [OK] Node.js instalado
node --version
echo.

REM Verificar Docker
where docker >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ADVERTENCIA] Docker no esta instalado
    echo Para usar Docker, instala Docker Desktop: https://www.docker.com/products/docker-desktop
    echo.
    set /p continue="Deseas continuar sin Docker? (S/N): "
    if /i "%continue%" NEQ "S" exit /b 1
) else (
    echo [OK] Docker instalado
    docker --version
)
echo.

REM Instalar dependencias del backend
echo ============================================
echo Instalando dependencias del BACKEND...
echo ============================================
cd backend
if not exist "node_modules" (
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Fallo la instalacion del backend
        pause
        exit /b 1
    )
    echo [OK] Dependencias del backend instaladas
) else (
    echo [INFO] Dependencias del backend ya instaladas
)
cd ..
echo.

REM Instalar dependencias del frontend
echo ============================================
echo Instalando dependencias del FRONTEND...
echo ============================================
cd frontend
if not exist "node_modules" (
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Fallo la instalacion del frontend
        pause
        exit /b 1
    )
    echo [OK] Dependencias del frontend instaladas
) else (
    echo [INFO] Dependencias del frontend ya instaladas
)
cd ..
echo.

REM Configurar .env
echo ============================================
echo Configurando variables de entorno...
echo ============================================
if not exist ".env" (
    if exist ".env.example" (
        copy .env.example .env
        echo [OK] Archivo .env creado
        echo [IMPORTANTE] Edita el archivo .env con tus credenciales
    ) else (
        echo [ERROR] No se encontro .env.example
    )
) else (
    echo [INFO] Archivo .env ya existe
)
echo.

REM Crear archivo .env para backend si no existe
if not exist "backend\.env" (
    if exist "backend\.env.example" (
        copy backend\.env.example backend\.env
    ) else (
        (
            echo DATABASE_URL=postgresql://admin:password@localhost:5432/course_platform
            echo JWT_SECRET=your_jwt_secret_key_change_this
            echo REFRESH_SECRET=your_refresh_secret_key_change_this
            echo PORT=3000
            echo NODE_ENV=development
        ) > backend\.env
    )
    echo [OK] Archivo backend/.env creado
)

echo.
echo ============================================
echo INSTALACION COMPLETADA
echo ============================================
echo.
echo Proximos pasos:
echo.
echo 1. Edita el archivo .env con tus credenciales
echo 2. Inicia PostgreSQL (manual o con Docker)
echo 3. Ejecuta: npm run dev (en backend y frontend)
echo.
echo --- Con Docker ---
echo docker-compose up -d
echo.
echo --- Sin Docker (desarrollo local) ---
echo Backend:  cd backend  y  npm run dev
echo Frontend: cd frontend y  npm run dev
echo.
pause