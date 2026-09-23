# Integraly Ops

Herramienta interna de gestión de proyectos, tareas y archivos para Integraly
AI Solutions. Next.js + Supabase (base de datos, autenticación y
almacenamiento de archivos), pensada para desplegarse en Vercel.

- Cuentas individuales por email (enlace mágico, sin contraseñas)
- Cada proyecto tiene un encargado y developers asignados; los developers
  solo ven los proyectos donde están asignados — reforzado con Row Level
  Security en la base de datos, no solo en la interfaz
- Tareas, archivos y notas por proyecto
- Ficha de clientes
- Todo en tiempo real entre pestañas y personas (Supabase Realtime)

## 1. Crear el proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com) → **New project** (el plan
   gratuito es de sobra para este uso).
2. Cuando esté listo, abre **SQL Editor** → pega el contenido entero de
   [`supabase/schema.sql`](./supabase/schema.sql) → **Run**. Esto crea todas
   las tablas, los permisos (RLS) y el bucket de archivos.
3. En **Authentication → Providers → Email**, desactiva **"Allow new users to
   sign up"**. Así solo puede entrar quien haya sido invitado desde la propia
   app (pestaña Equipo) — nadie puede auto-registrarse.
4. En **Authentication → URL Configuration**, añade la URL donde vivirá la
   app (la de Vercel, más abajo) tanto en **Site URL** como en **Redirect
   URLs** (con `/auth/callback` al final, p. ej.
   `https://tu-app.vercel.app/auth/callback`). Mientras pruebas en local,
   añade también `http://localhost:3000/auth/callback`.

### Primer arranque: crear al primer administrador

Como el auto-registro está desactivado, la primera cuenta (probablemente la
tuya, Eloi) hay que crearla a mano una única vez:

1. **Authentication → Users → Add user → Create new user**. Pon tu email,
   marca **Auto Confirm User**, y crea el usuario. Copia el **User UID** que
   te muestra.
2. Vuelve a **SQL Editor** y ejecuta (sustituyendo el UID y tu nombre):
   ```sql
   insert into profiles (id, role, full_name)
   values ('PEGA-AQUI-EL-UID', 'admin', 'Eloi Navarro');
   ```
3. Ya puedes entrar en la app con ese email pidiendo un enlace mágico desde
   `/login`. Una vez dentro, desde **Equipo** puedes invitar a Francesc,
   Gerardo, Michelle y Emanuel por email — a ellos no hace falta crearles
   nada a mano, la app les manda la invitación.

### Claves de API que vas a necesitar

En **Project Settings → API**:

- `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
- `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `service_role secret` → `SUPABASE_SERVICE_ROLE_KEY` (**nunca** la pongas en
  una variable `NEXT_PUBLIC_*`, ni la subas a git — solo se usa en el
  servidor para enviar invitaciones)

## 2. Desarrollo en local

```bash
npm install
cp .env.example .env.local   # y rellena las 3 claves de arriba
npm run dev
```

Abre `http://localhost:3000`.

## 3. Subir a GitHub

```bash
git init
git add .
git commit -m "Integraly Ops"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/integraly-ops.git
git push -u origin main
```

(Crea antes el repositorio vacío en GitHub si no lo has hecho.)

## 4. Desplegar en Vercel

1. En [vercel.com](https://vercel.com) → **Add New → Project** → importa el
   repositorio de GitHub que acabas de crear.
2. En **Environment Variables**, añade las mismas 3 variables de
   `.env.example` con sus valores reales.
3. Deploy. Cuando termine, copia la URL que te da Vercel y vuelve al paso 1
   de Supabase para añadirla en **Site URL** / **Redirect URLs** (si no lo
   hiciste ya con la URL definitiva).
4. A partir de aquí, cada `git push` a `main` despliega una nueva versión
   automáticamente. Puedes seguir pidiéndome cambios aquí y te iré dando el
   código actualizado para hacer commit, o editarlo tú directamente.

## Estructura del proyecto

```
supabase/schema.sql        Esquema completo de la base de datos + permisos
src/lib/supabase/          Clientes de Supabase (browser, server, middleware)
src/lib/hooks/             Hooks de datos en tiempo real (proyectos, tareas…)
src/app/login, /onboarding, /auth/callback   Autenticación
src/app/(app)/...          Páginas autenticadas (dashboard, proyectos, clientes, equipo)
src/components/            Componentes de UI compartidos
```

## Notas sobre permisos

La app usa **Row Level Security** de Postgres: los permisos no dependen solo
de lo que la interfaz decide mostrar, sino de reglas en la propia base de
datos (`supabase/schema.sql`). Un developer que intente leer proyectos ajenos
directamente contra la API de Supabase, sin pasar por la interfaz, tampoco
podría — la base de datos se lo impide. Esto es más estricto que la primera
versión (el artifact de Claude), que solo filtraba en el cliente.
