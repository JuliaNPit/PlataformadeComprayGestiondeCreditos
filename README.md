# Plataforma de Compra y Gestión de Créditos Académicos — UPTC Sogamoso

Sistema web progresivo (PWA) para la gestión digital de créditos del servicio de restaurante de la Universidad Pedagógica y Tecnológica de Colombia, Seccional Sogamoso.

**Autores:** Juan Esteban León Cárdenas · Julian Leonardo Arias Pita  
**Asignatura:** Ingeniería del Software II — Primer Semestre 2026  
**Escuela de Ingeniería de Sistemas y Computación — UPTC Sogamoso**

---

## Funcionalidades

- Registro de estudiantes con validación contra el SIRA institucional
- Compra de créditos mediante pasarela de pagos (PSE, Nequi, Tarjeta)
- Transferencia de créditos entre estudiantes (operación atómica)
- Consulta de saldo e historial de transacciones con filtros
- Sistema de quejas y soporte (PQRS) con número de ticket único
- Notificaciones de eventos del sistema
- Panel administrativo con métricas, gestión de usuarios y transacciones

---

## Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | React 18 + Vite + Tailwind CSS + React Router 6 |
| Backend | Node.js + Express (monolito modular) |
| Base de datos | PostgreSQL 17 + Prisma ORM |
| Autenticación | JWT + bcryptjs |
| Contenedores | Docker + Docker Compose |

---

## Requisitos previos

- Node.js v20 o superior
- PostgreSQL 17
- Git

---

## Instalación y ejecución local

### 1. Clonar el repositorio

```bash
git clone https://github.com/JuliaNPit/PlataformadeComprayGestiondeCreditos.git
cd PlataformadeComprayGestiondeCreditos
```

### 2. Configurar el backend

```bash
cd backend
npm install
```

Crear el archivo `backend/.env` con el siguiente contenido:
DATABASE_URL="postgresql://postgres:admin123@localhost:5432/creditos_uptc"
JWT_SECRET="uptc_creditos_secret_2026"
JWT_EXPIRES_IN="30m"
PORT=3000
NODE_ENV=development
SIRA_ENABLED=true
Crear la base de datos `creditos_uptc` en PostgreSQL, luego ejecutar las migraciones:

```bash
npx prisma migrate dev --name init
```

Iniciar el backend:

```bash
node src/index.js
```

El servidor queda disponible en `http://localhost:3000`

### 3. Configurar el frontend

En otra terminal:

```bash
cd frontend
npm install
npm run dev
```

La aplicación queda disponible en `http://localhost:5173`

---

## Usuarios de prueba (SIRA simulado)

| Código | Nombre | Contraseña | Estado |
|--------|--------|-----------|--------|
| 202012345 | Juan Esteban León Cárdenas | 123456 | Activo |
| 202054321 | Julian Leonardo Arias Pita | 123456 | Activo |
| 202011111 | María García López | 123456 | Activo |
| 202022222 | Carlos Pérez Mora | 123456 | Activo |
| 202033333 | Ana Rodríguez Silva | 123456 | Activo |
| 202044444 | Luis Martínez Torres | 123456 | INACTIVO |

---

## Estructura del proyecto
plataforma-creditos-uptc/
├── backend/
│   ├── prisma/schema.prisma
│   └── src/
│       ├── adapters/        # SIRA simulado + pasarela de pagos
│       ├── middlewares/     # Autenticación JWT
│       └── modules/
│           ├── auth/        # RF01 — Registro y login
│           ├── wallet/      # RF04 — Saldo e historial
│           ├── transfers/   # RF03 — Transferencias
│           ├── payments/    # RF02 — Compra de créditos
│           ├── pqrs/        # RF05 — Quejas y soporte
│           ├── notifications/ # RF07 — Notificaciones
│           └── admin/       # RF06 — Panel administrativo
└── frontend/
└── src/
└── pages/
├── Login.jsx
├── Dashboard.jsx
├── Historial.jsx
├── Transferencias.jsx
├── Pagos.jsx
├── PQRS.jsx
└── Admin.jsx
---

## Cobertura de requisitos funcionales

| RF | Descripción | Estado |
|----|-------------|--------|
| RF01 | Registro de estudiantes con validación SIRA | ✅ |
| RF02 | Compra de créditos con pasarela simulada | ✅ |
| RF03 | Transferencias atómicas entre estudiantes | ✅ |
| RF04 | Consulta de saldo e historial con filtros | ✅ |
| RF05 | Sistema PQRS con número de ticket único | ✅ |
| RF06 | Panel administrativo con métricas | ✅ |
| RF07 | Notificaciones de eventos | ✅ |
| RF08 | Interfaces responsivas (móvil y escritorio) | ✅ |

---

## Nota sobre servicios simulados

Por tratarse de un proyecto académico, los servicios externos se implementan como módulos simulados:

- **Pasarela de pagos:** replica la interfaz de PSE/Nequi/Tarjeta sin contactar entidades bancarias reales.
- **SIRA:** replica la validación de matrícula con un conjunto de códigos estudiantiles de prueba.

En un entorno de producción, estos módulos se reemplazarían por integraciones reales sin modificar la lógica de negocio central.