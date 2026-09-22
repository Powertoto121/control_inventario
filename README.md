# 🛒 Control de Inventario y Mermas ("Mi Tiendita")

Sistema web desarrollado para la gestión integral de inventarios, control de caducidades (PEPS), registro rápido de mermas y análisis de pérdidas económicas en tiendas de abarrotes y comercio minorista.

---

## 🛠️ Tecnologías Utilizadas
* **Backend:** Laravel (PHP 8.5)
* **Frontend:** React, TypeScript, Tailwind CSS
* **Empaquetado y Entorno:** Docker & Laravel Sail
* **Base de Datos:** PostgreSQL

---

## ⚙️ Requisitos Previos
Antes de clonar e iniciar el proyecto, asegúrate de tener instalado en tu equipo:
1. [Docker Desktop](https://www.docker.com/) (corriendo en segundo plano).
2. WSL 2 (en caso de estar usando Windows).

---

## 🚀 Guía de Instalación y Ejecución Local

Si es la primera vez que descargas y configuras el proyecto en tu equipo, sigue estos pasos:

### 1. Clonar el repositorio y entrar al directorio
```bash
git clone <url-de-tu-repositorio>
cd control-inventario

2. Configurar el archivo de entorno (.env)
Copia el archivo de configuración de ejemplo de Laravel:
cp .env.example .env

3. Instalar dependencias de PHP (a través de Docker temporal)
Si no tienes PHP instalado localmente, puedes usar una imagen temporal de Composer para preparar los paquetes:
docker run --rm \
    -u "$(id -u):$(id -g)" \
    -v "$(pwd):/var/www/html" \
    -w /var/www/html \
    laravelsail/php84-composer:latest \
    composer install

4. Levantar los contenedores con Laravel Sail
Inicia el entorno de Docker en segundo plano:

./vendor/bin/sail up -d

5. Instalar dependencias de Node.js y compilar assets (Vite)
Instala los paquetes de Node dentro del entorno:
./vendor/bin/sail npm install

6. Ejecutar migraciones de base de datos
Crea las tablas necesarias en la base de datos PostgreSQL:
./vendor/bin/sail artisan migrate

🖥️ Acceso a la Aplicación
Una vez completados los pasos anteriores, abre tu navegador web y accede a:

URL Principal: http://localhost:8081

🔑 Credenciales de Acceso:
Administrador / Dueño: admin (Clave: 1234) — Control total, analíticas y gestión de personal.

Operador / Cajero: carlos (Clave: 123) — Módulo ágil de stock y registro express de mermas.

📌 Estado del Proyecto
Interfaz gráfica en React y TypeScript 100% responsiva y optimizada.

Módulos funcionales de Inventario, Alertas de Reabastecimiento, Merma Express y Accesos por Roles.

