# 📘 Guía de Implementación - Course Platform

## 🗂️ Mapeo de Artifacts a Archivos

### Artifact 1: `db_schema` → Database Schema
**Archivo:** `database/schema.sql` ok
```
Copiar TODO el contenido del artifact "Database Schema - PostgreSQL"
Este archivo contiene toda la estructura de la base de datos.
```

### Artifact 2: `api_design` → API Documentation
**Archivo:** `docs/api-documentation.yaml` (crear carpeta docs/) ok
```
Copiar el contenido del artifact "API Endpoints Documentation"
Usar como referencia para implementar los endpoints.
```

### Artifact 3: `auth_implementation` → Backend Auth
**Archivos a crear:**
- `backend/src/services/auth.service.ts` - Clase AuthService
- `backend/src/middleware/auth.middleware.ts` - Middlewares authenticate y authorize
- `backend/src/routes/auth.routes.ts` - Rutas de autenticación

**Cómo dividir el código:**
```typescript
// ===== ARCHIVO: backend/src/services/auth.service.ts =====
// Copiar SOLO la clase AuthService (líneas 1-150 aprox)

// ===== ARCHIVO: backend/src/middleware/auth.middleware.ts =====
// Copiar los middlewares authenticate y authorize (líneas 150-200 aprox)

// ===== ARCHIVO: backend/src/routes/auth.routes.ts =====
// Copiar las rutas del router (líneas 200-final)
```

### Artifact 4: `course_management` → Backend Courses
**Archivos a crear:**
- `backend/src/services/course.service.ts` - Clase CourseService
- `backend/src/services/module.service.ts` - Clases ModuleService y LessonService
- `backend/src/routes/course.routes.ts` - Rutas de cursos

### Artifact 5: `exam_system` → Backend Exams
**Archivos a crear:**
- `backend/src/services/exam.service.ts` - Clase ExamService
- `backend/src/routes/exam.routes.ts` - Rutas de exámenes

### Artifact 6: `forum_system` → Backend Forum
**Archivos a crear:**
- `backend/src/services/forum.service.ts` - Clase ForumService
- `backend/src/routes/forum.routes.ts` - Rutas del foro

### Artifact 7: `student_dashboard` → Frontend Component
**Archivo:** `frontend/src/components/dashboard/StudentDashboard.tsx`  ok
```
Copiar TODO el componente React
```

### Artifact 8: `video_player` → Frontend Component
**Archivo:** `frontend/src/components/video/VideoPlayer.tsx` ok
```
Copiar TODO el componente React del reproductor
```

### Artifact 9: `docker_config` → Docker Configuration
**Archivos a crear:**
- `docker-compose.yml` - Configuración principal (copiar la primera sección) ---ok pero parece incompleto
- `backend/Dockerfile` - Dockerfile del backend (buscar "# Backend Dockerfile")
- `frontend/Dockerfile` - Dockerfile del frontend (buscar "# Frontend Dockerfile")
- `nginx/nginx.conf` - Configuración de Nginx (buscar "# Nginx Configuration")
- `.env.example` - Variables de entorno (buscar "# Environment Variables Template")

---

## 🔧 Configuración de package.json

### Backend Package.json
**Archivo:** `backend/package.json`

```json
{
  "name": "course-platform-backend",
  "version": "1.0.0",
  "description": "Backend API for Course Management Platform",
  "main": "dist/index.js",
  "scripts": {
    "dev": "nodemon --exec ts-node src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "migrate": "node dist/scripts/migrate.js",
    "test": "jest"
  },
  "dependencies": {
    "express": "^4.18.2",
    "pg": "^8.11.3",
    "bcrypt": "^5.1.1",
    "jsonwebtoken": "^9.0.2",
    "dotenv": "^16.3.1",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "express-rate-limit": "^7.1.5",
    "slugify": "^1.6.6",
    "multer": "^1.4.5-lts.1",
    "aws-sdk": "^2.1498.0"
  },
  "devDependencies": {
    "@types/node": "^20.10.5",
    "@types/express": "^4.17.21",
    "@types/pg": "^8.10.9",
    "@types/bcrypt": "^5.0.2",
    "@types/jsonwebtoken": "^9.0.5",
    "@types/cors": "^2.8.17",
    "typescript": "^5.3.3",
    "ts-node": "^10.9.2",
    "nodemon": "^3.0.2",
    "jest": "^29.7.0",
    "@types/jest": "^29.5.11"
  }
}
```

### Frontend Package.json
**Archivo:** `frontend/package.json`

```json
{
  "name": "course-platform-frontend",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "next": "^14.0.4",
    "lucide-react": "^0.300.0",
    "axios": "^1.6.2",
    "zustand": "^4.4.7",
    "@tanstack/react-query": "^5.14.2"
  },
  "devDependencies": {
    "@types/node": "^20.10.5",
    "@types/react": "^18.2.45",
    "@types/react-dom": "^18.2.18",
    "typescript": "^5.3.3",
    "tailwindcss": "^3.4.0",
    "postcss": "^8.4.32",
    "autoprefixer": "^10.4.16",
    "eslint": "^8.56.0",
    "eslint-config-next": "^14.0.4"
  }
}
```

---

## 🏗️ Archivos de Configuración Adicionales

### Backend TypeScript Config
**Archivo:** `backend/tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "node",
    "types": ["node"]
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### Frontend TypeScript Config
**Archivo:** `frontend/tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### Frontend Tailwind Config
**Archivo:** `frontend/tailwind.config.js`

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

### Frontend Next.js Config
**Archivo:** `frontend/next.config.js`

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1',
  },
  images: {
    domains: ['localhost', 'your-s3-bucket.s3.amazonaws.com'],
  },
}

module.exports = nextConfig
```

---

## 🎯 Archivo Principal del Backend

**Archivo:** `backend/src/index.ts`

```typescript
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import courseRoutes from './routes/course.routes';
import examRoutes from './routes/exam.routes';
import forumRoutes from './routes/forum.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/courses', courseRoutes);
app.use('/api/v1/exams', examRoutes);
app.use('/api/v1/forum', forumRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    statusCode: err.status || 500,
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📝 API Documentation: http://localhost:${PORT}/api-docs`);
});

export default app;
```

---

## 🚀 Orden de Implementación Recomendado

### Fase 1: Setup Inicial (30 min)
1. ✅ Ejecutar `setup-project.sh`
2. ✅ Copiar `database/schema.sql`
3. ✅ Configurar `.env` con credenciales
4. ✅ Crear `docker-compose.yml`

### Fase 2: Backend Core (2-3 horas)
1. ✅ Configurar `backend/package.json`
2. ✅ Crear `backend/src/index.ts`
3. ✅ Implementar autenticación (artifact 3)
4. ✅ Implementar gestión de cursos (artifact 4)
5. ✅ Probar con Postman/Thunder Client

### Fase 3: Backend Features (2-3 horas)
1. ✅ Implementar sistema de exámenes (artifact 5)
2. ✅ Implementar foro (artifact 6)
3. ✅ Implementar inscripciones
4. ✅ Probar endpoints

### Fase 4: Frontend Setup (1 hora)
1. ✅ Configurar `frontend/package.json`
2. ✅ Configurar Tailwind y Next.js
3. ✅ Crear layout base

### Fase 5: Frontend Components (3-4 horas)
1. ✅ Implementar autenticación UI
2. ✅ Implementar dashboard de estudiante (artifact 7)
3. ✅ Implementar reproductor de video (artifact 8)
4. ✅ Crear páginas de cursos

### Fase 6: Docker & Deploy (1 hora)
1. ✅ Configurar Dockerfiles
2. ✅ Configurar Nginx
3. ✅ Probar con `docker-compose up`

---

## 🔍 Comandos Útiles

```bash
# Iniciar base de datos
docker-compose up -d postgres redis

# Ver logs
docker-compose logs -f backend

# Ejecutar migraciones
docker-compose exec backend npm run migrate

# Reiniciar servicios
docker-compose restart

# Limpiar todo
docker-compose down -v
```

---

## ✅ Checklist de Verificación

- [ ] Base de datos PostgreSQL funcionando
- [ ] Backend responde en `localhost:3000/health`
- [ ] Puedo registrar un usuario
- [ ] Puedo hacer login y recibo JWT
- [ ] Puedo crear un curso como tutor
- [ ] Frontend carga en `localhost:80`
- [ ] Dashboard de estudiante muestra datos
- [ ] Reproductor de video funciona

---

## 🆘 Solución de Problemas

### Error: "Cannot connect to database"
```bash
# Verificar que PostgreSQL esté corriendo
docker-compose ps

# Ver logs de PostgreSQL
docker-compose logs postgres
```

### Error: "Port already in use"
```bash
# Cambiar puerto en docker-compose.yml
# O detener el servicio que usa el puerto
sudo lsof -i :3000
```

### Error de permisos en Linux
```bash
# Dar permisos al script
chmod +x setup-project.sh

# Ejecutar con sudo si es necesario
sudo docker-compose up -d
```

# ✅ Checklist Completo de Archivos - Course Platform

## 📦 Backend

### ✅ Ya Tienes
- [x] `backend/src/index.ts`
- [x] `backend/src/config/database.ts`
- [x] `backend/src/middleware/auth.middleware.ts`
- [x] `backend/src/routes/auth.routes.ts`
- [x] `backend/src/routes/course.routes.ts`
- [x] `backend/src/routes/exam.routes.ts`
- [x] `backend/src/routes/forum.routes.ts`
- [x] `backend/src/services/auth.service.ts`
- [x] `backend/src/services/course.service.ts`
- [x] `backend/src/services/exam.service.ts`
- [x] `backend/src/services/forum.service.ts`
- [x] `backend/src/services/module.service.ts`
- [x] `backend/Dockerfile`
- [x] `backend/package.json`
- [x] `backend/tsconfig.json`

### ❌ Archivos que DEBES Crear

#### Controllers (Copiar de los artifacts que acabo de crear)
```
backend/src/controllers/
├── auth.controller.ts        ← Artifact: auth_controller
├── course.controller.ts      ← Artifact: course_controller
├── exam.controller.ts        ← Artifact: exam_controller
├── enrollment.controller.ts  ← Artifact: enrollment_controller
└── forum.controller.ts       ← CREAR (te lo doy abajo)
```

#### Routes (Actualizar/Crear)
```
backend/src/routes/
├── index.ts                  ← Artifact: routes_index
├── auth.routes.ts            ← Artifact: updated_auth_routes (REEMPLAZAR el tuyo)
├── enrollment.routes.ts      ← Artifact: enrollment_routes (NUEVO)
└── [los demás ya los tienes, pero hay que actualizarlos]
```

#### Services (Añadir métodos faltantes)
```
backend/src/services/
├── enrollment.service.ts     ← CREAR NUEVO (está en missing_service_methods)
└── [actualizar los existentes con métodos faltantes]
```

#### Middleware (Crear validadores)
```
backend/src/middleware/
├── validate.middleware.ts    ← CREAR (te lo doy abajo)
└── error.middleware.ts       ← CREAR (te lo doy abajo)
```

#### Tipos
```
backend/src/types/
└── index.ts                  ← CREAR (te lo doy abajo)
```

#### Configuración
```
backend/
├── .env                      ← Copiar de .env.example y configurar
└── .gitignore               ← CREAR (te lo doy abajo)
```

---

## 🎨 Frontend

### ✅ Ya Tienes
- [x] `frontend/app/auth/login/page.tsx`
- [x] `frontend/components/dashboard/StudentDashboard.tsx`
- [x] `frontend/components/video/VideoPlayer.tsx`
- [x] `frontend/Dockerfile`
- [x] `frontend/Package.json`
- [x] `frontend/tailwind.config.js`
- [x] `frontend/next.config.js`

### ❌ Archivos que DEBES Crear

#### Páginas principales
```
frontend/app/
├── layout.tsx                ← CREAR (te lo doy abajo) ok
├── page.tsx                  ← CREAR (página de inicio) ok
├── auth/
│   └── register/
│       └── page.tsx          ← CREAR   ----------------------------------------------
├── dashboard/
│   ├── student/
│   │   └── page.tsx          ← CREAR (usa StudentDashboard component) ---------------
│   ├── tutor/
│   │   └── page.tsx          ← CREAR ------------------------------------------------
│   └── admin/
│       └── page.tsx          ← CREAR ------------------------------------------------
└── courses/
    ├── page.tsx              ← CREAR (lista de cursos) -------------------------------
    └── [id]/
        └── page.tsx          ← CREAR (detalle del curso) -------------------------------
```

#### Componentes
```
frontend/components/
├── common/
│   ├── Navbar.tsx           ← CREAR  ---------------------------------------------------
│   ├── Footer.tsx           ← CREAR ----------------------------------------------------
│   └── LoadingSpinner.tsx   ← CREAR -----------------------------------------------------
└── ui/
    ├── Button.tsx           ← CREAR --------------------------------------------------------
    ├── Input.tsx            ← CREAR ---------------------------------------------------------
    └── Card.tsx             ← CREAR ------------------------------------------------------------
```

#### Utilidades
```
frontend/lib/
├── api.ts                   ← CREAR (funciones para llamar a la API)
└── utils.ts                 ← CREAR (funciones auxiliares) ----------------------------------
```

#### Tipos
```
frontend/types/
└── index.ts                 ← CREAR (interfaces TypeScript) ok
```

#### Configuración
```
frontend/
├── .env.local               ← CREAR  ----------------------------------------------
├── .gitignore              ← CREAR   ok
└── tsconfig.json           ← Ya lo tienes, verificar config -----------------------
```

---

## 🗄️ Database

### ✅ Ya Tienes
- [x] `database/scheme.sql` ok

### ✅ Verificar
- [ ] El archivo debe llamarse `schema.sql` (sin 'e')     ok
- [ ] Renombrar: `database/scheme.sql` → `database/schema.sql`     ok

### ❌ Seeds (Opcional pero recomendado)
```
database/seeds/
└── initial-data.sql         ← CREAR (datos iniciales para testing) ----------------------------
```

---

## 🐳 Docker & DevOps

### ✅ Ya Tienes
- [x] `docker-compose.yml` ok
- [x] `nginx/nginx.conf` ok, pero vacio -----------------------------------

### ❌ Verificar/Crear
```
.
├── .env                     ← Configurar con tus credenciales ------------------------
├── .env.example            ← Ya lo tienes
├── .gitignore              ← CREAR
└── README.md               ← CREAR/ACTUALIZAR
```

---

## 📝 Archivos de Documentación

```
docs/
├── api-documentation.yaml   ← Ya lo tienes
├── setup-guide.md          ← CREAR
└── user-manual.md          ← CREAR (opcional)
```

---

## 🎯 PRIORIDAD DE CREACIÓN

### Prioridad ALTA (necesarios para que funcione)

1. **backend/src/controllers/** - TODOS los controllers
2. **backend/src/routes/index.ts** - Router principal
3. **backend/src/routes/enrollment.routes.ts** - Rutas de inscripción
4. **backend/src/middleware/error.middleware.ts** - Manejo de errores
5. **backend/.env** - Variables de entorno
6. **frontend/app/layout.tsx** - Layout principal
7. **frontend/lib/api.ts** - Cliente API

### Prioridad MEDIA (mejoran la experiencia)

8. **backend/src/middleware/validate.middleware.ts** - Validaciones
9. **backend/src/types/index.ts** - Tipos TypeScript
10. **frontend/components/common/** - Navbar, Footer
11. **frontend/app/page.tsx** - Página de inicio
12. **frontend/types/index.ts** - Tipos del frontend

### Prioridad BAJA (opcionales)

13. **database/seeds/** - Datos de prueba
14. **frontend/components/ui/** - Componentes reutilizables
15. **docs/** - Documentación adicional

---

## 🚀 Comandos Rápidos de Verificación

```bash
# Verificar estructura del backend
cd backend
tree /f src

# Verificar estructura del frontend  
cd frontend
tree /f app

# Contar archivos TypeScript
dir /s /b *.ts | find /c ".ts"
dir /s /b *.tsx | find /c ".tsx"
```

---

## 📊 Progreso Actual

**Backend:** ~70% completo
- ✅ Servicios
- ✅ Configuración
- ❌ Controllers (faltantes)
- ❌ Middleware completo
- ❌ Tipos

**Frontend:** ~30% completo
- ✅ Componentes principales
- ✅ Configuración básica
- ❌ Páginas
- ❌ Utilidades
- ❌ Layout

**Database:** ~90% completo
- ✅ Schema
- ❌ Seeds

**DevOps:** ~80% completo
- ✅ Docker
- ✅ Nginx
- ❌ CI/CD (opcional)

---

## ⏭️ Próximos Pasos Inmediatos

1. Crear todos los **controllers** (copiar de artifacts)
2. Crear **backend/src/routes/index.ts**
3. Actualizar **backend/src/index.ts** para usar el router principal
4. Crear **backend/.env** con tus credenciales
5. Crear **frontend/app/layout.tsx**
6. Crear **frontend/lib/api.ts**
7. Probar con `npm install` en ambos directorios
8. Iniciar con `docker-compose up` o desarrollo local




***************************************************************************************************



# 🚀 Guía de Instalación - Course Platform

## ✅ TODAS LAS LIBRERÍAS SON GRATUITAS Y OPEN SOURCE

No necesitas pagar nada. Todo es gratis.

---

## 📋 Pre-requisitos

1. **Node.js 18+** instalado
   - Descargar desde: https://nodejs.org/
   - Verifica con: `node --version`

2. **PostgreSQL** (opcional si usas Docker)
   - Con Docker: se instala automáticamente
   - Sin Docker: https://www.postgresql.org/download/

3. **Docker Desktop** (recomendado para Windows)
   - Descargar desde: https://www.docker.com/products/docker-desktop

---

## 🔧 PASO 1: Configurar Archivos

### 1.1 Copiar configuraciones

```bash
# En la raíz del proyecto
copy .env.example .env

# En backend
copy backend\.env.example backend\.env

# En frontend (crear archivo nuevo)
notepad frontend\.env.local
```

### 1.2 Editar `.env` en la raíz
Abre `.env` y configura:

```env
DB_PASSWORD=password123
JWT_SECRET=mi_secreto_super_seguro_12345
REFRESH_SECRET=mi_refresh_super_seguro_67890
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
```

---

## 📦 PASO 2: Instalar Dependencias del BACKEND

```bash
cd backend
npm install
```

### Paquetes que se instalarán (TODOS GRATIS):

**Principales:**
- `express` - Framework web (MIT License)
- `pg` - Cliente PostgreSQL (MIT License)
- `bcrypt` - Encriptación de passwords (MIT License)
- `jsonwebtoken` - Autenticación JWT (MIT License)
- `dotenv` - Variables de entorno (BSD License)

**Seguridad:**
- `cors` - Control de acceso (MIT License)
- `helmet` - Seguridad HTTP (MIT License)
- `express-rate-limit` - Limitar peticiones (MIT License)

**Utilidades:**
- `slugify` - Crear URLs amigables (MIT License)
- `multer` - Subir archivos (MIT License)

**TypeScript:**
- `typescript` - Lenguaje (Apache License)
- `@types/node` - Tipos Node.js (MIT License)
- `@types/express` - Tipos Express (MIT License)
- `ts-node` - Ejecutar TS (MIT License)
- `nodemon` - Auto-reload en desarrollo (MIT License)

### Si hay errores de instalación:

```bash
# Limpiar caché
npm cache clean --force

# Reinstalar
rm -rf node_modules
rm package-lock.json
npm install
```

---

## 🎨 PASO 3: Instalar Dependencias del FRONTEND

```bash
cd frontend
npm install
```

### Paquetes que se instalarán (TODOS GRATIS):

**Framework:**
- `react` - Librería UI (MIT License)
- `react-dom` - React para web (MIT License)
- `next` - Framework React (MIT License)

**UI:**
- `tailwindcss` - CSS framework (MIT License)
- `lucide-react` - Iconos (ISC License)
- `postcss` - CSS processor (MIT License)
- `autoprefixer` - CSS prefijos (MIT License)

**HTTP:**
- `axios` - Cliente HTTP (MIT License)

**Estado:**
- `zustand` - State management (MIT License)
- `@tanstack/react-query` - Data fetching (MIT License)

**TypeScript:**
- `typescript` (Apache License)
- `@types/react` (MIT License)
- `@types/node` (MIT License)

---

## 🗄️ PASO 4: Configurar Base de Datos

### Opción A: Con Docker (RECOMENDADO)

```bash
# Desde la raíz del proyecto
docker-compose up -d postgres redis
```

Esto crea automáticamente:
- PostgreSQL en puerto 5432
- Redis en puerto 6379

### Opción B: PostgreSQL Manual

1. Instalar PostgreSQL
2. Crear base de datos:

```sql
CREATE DATABASE course_platform;
CREATE USER admin WITH PASSWORD 'password123';
GRANT ALL PRIVILEGES ON DATABASE course_platform TO admin;
```

3. Ejecutar el schema:

```bash
psql -U admin -d course_platform -f database/schema.sql
```

---

## 🚀 PASO 5: Iniciar en Modo Desarrollo

### Opción A: TODO con Docker

```bash
# Desde la raíz
docker-compose up -d
```

Espera 1-2 minutos y accede a:
- Frontend: http://localhost
- API: http://localhost:3000
- Base de datos: localhost:5432

### Opción B: Desarrollo Local (sin Docker)

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

**Terminal 3 - Base de datos (si no usas Docker):**
Ya debe estar corriendo PostgreSQL

---

## 🔍 PASO 6: Verificar Instalación

### 6.1 Verificar Backend

```bash
# Abrir en navegador o Postman
http://localhost:3000/api/v1/health

# Respuesta esperada:
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 6.2 Verificar Frontend

```bash
# Abrir en navegador
http://localhost:3001

# O si usas Docker:
http://localhost
```

### 6.3 Verificar Base de Datos

```bash
# Con Docker
docker exec -it course_platform_db psql -U admin -d course_platform

# Comando SQL para verificar tablas:
\dt
```

Deberías ver: users, courses, enrollments, exams, etc.

---

## ⚠️ Solución de Problemas Comunes

### Error: "Cannot find module..."

```bash
cd backend
npm install

cd ../frontend
npm install
```

### Error: "Port 3000 already in use"

```bash
# Windows: buscar proceso
netstat -ano | findstr :3000

# Matar proceso (reemplaza PID)
taskkill /PID <número> /F

# O cambiar puerto en .env
PORT=3001
```

### Error: "Cannot connect to database"

```bash
# Verificar que PostgreSQL está corriendo
docker ps

# Ver logs
docker logs course_platform_db

# Reiniciar contenedor
docker restart course_platform_db
```

### Error de TypeScript en VSCode

```bash
# Reiniciar TypeScript server en VSCode
Ctrl+Shift+P -> "TypeScript: Restart TS Server"

# O cerrar y reabrir VSCode
```

### Errores de importación en frontend

El frontend usa `src/` pero algunas rutas en los ejemplos dicen `app/`.

**Estructura correcta:**
```
frontend/
├── src/
│   └── app/
│       ├── layout.tsx
│       ├── page.tsx
│       └── ...
```

Si tus archivos están en `frontend/app/`, muévelos a `frontend/src/app/`:

```bash
cd frontend
mkdir src
move app src\
```

---

## 📊 Comandos Útiles

### Backend
```bash
cd backend

# Desarrollo (con auto-reload)
npm run dev

# Compilar TypeScript
npm run build

# Producción
npm start

# Ver logs
npm run logs
```

### Frontend
```bash
cd frontend

# Desarrollo
npm run dev

# Compilar
npm run build

# Producción
npm start
```

### Docker
```bash
# Iniciar todo
docker-compose up -d

# Ver logs de todos los servicios
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f backend

# Parar todo
docker-compose down

# Parar y eliminar volúmenes (CUIDADO: borra la BD)
docker-compose down -v

# Reiniciar un servicio
docker-compose restart backend

# Ver estado de servicios
docker-compose ps
```

---

## ✅ Checklist de Verificación

Antes de continuar, verifica:

- [x] Node.js instalado (`node --version`)
- [x] npm instalado (`npm --version`)
- [x] PostgreSQL corriendo (con Docker o manual)
- [x] Archivo `.env` configurado
- [ ] `npm install` ejecutado en backend (sin errores) 
- [ ] `npm install` ejecutado en frontend (sin errores)
- [ ] Backend responde en http://localhost:3000/api/v1/health -- no va
- [ ] Frontend carga en http://localhost:3001 -- no va  o http://localhost este va con el server de windows

---

## 🎯 ¿Qué sigue?

Una vez instalado todo:

1. **Crear usuario de prueba:**
   - Ir a http://localhost:3001/auth/register
   - Registrar un usuario con rol "student"

2. **Hacer login:**
   - Usar las credenciales creadas

3. **Explorar el dashboard:**
   - Serás redirigido al dashboard según tu rol

4. **Si eres desarrollador:**
   - Revisar el código en `backend/src/`
   - Customizar componentes en `frontend/src/`

---

## 📞 Soporte

Si tienes problemas:

1. Revisa los logs: `docker-compose logs -f`
2. Verifica que todos los puertos estén libres
3. Asegúrate de que `.env` esté configurado
4. Limpia caché: `npm cache clean --force`
5. Reinstala dependencias: `rm -rf node_modules && npm install`

---

## 💰 Costos

**DESARROLLO LOCAL: $0** ✅
Todo es gratis cuando desarrollas en tu máquina.

**PRODUCCIÓN (opcional):**
- Servidor: desde $5/mes (DigitalOcean, Railway)
- Base de datos: Gratis hasta 500MB (Supabase, Render)
- Almacenamiento: Gratis hasta 5GB (Cloudflare R2)

Pero para aprender y desarrollar: **TODO ES GRATIS** 🎉