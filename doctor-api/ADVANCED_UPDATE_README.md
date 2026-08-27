# Advance-Level Update / Naye Features

## ⚙️ Setup (Zaroori — pehle ye chalayein)

```bash
# Backend (project root mein)
composer install              # agar vendor/ nahi hai
php artisan migrate            # naya `photo` column doctors table mein add karega
php artisan storage:link       # doctor photos public dikhane ke liye zaroori
php artisan serve

# Frontend
cd frontend
npm install                    # agar node_modules/ nahi hai
npm run dev
```

`php artisan storage:link` na chalayi to doctor photo upload to ho jayega lekin
image broken/404 dikhegi — ye ek baar chalana kaafi hai.

---

## 🟢 Naye Features (Jo Pehle Kaam Nahi Kar Rahe Thay)

| Feature | Pehle | Ab |
|---|---|---|
| **Doctor Photo** | Har jagah generic icon | Real photo upload (Add/Edit Doctor), poori app mein asli tasveer dikhti hai — fallback icon agar photo na ho |
| **Sidebar → Settings** | Link tha, page nahi — blank screen | Poora Settings page: profile update (name/email) + password change |
| **Dashboard route protection** | `/dashboard` bina login ke bhi khulta tha | Ab login zaroori hai — bina token ke seedha `/login` per redirect |
| **Notification Bell** | Hamesha "3" dikhata tha, static | Real pending appointments count + dropdown list |
| **`alert()` / `confirm()` popups** | Browser ke purane jhatke wale alert box | Sleek in-app toast notifications (success/error) — professional apps jaisa |
| **Public doctor list** | Inactive (status = off) doctors bhi public site per dikhte thay | Ab sirf active doctors public ko dikhte hain; admin panel mein sab dikhte hain (Active/Inactive badge ke sath) |
| **Book Appointment page** | Sirf "Doctor ID: 3" likha hota tha | Doctor ka naam, photo, specialization, fee upar dikhta hai |
| **Doctors / Patients / Appointments tables** | Poori list ek hi page per, lamba scroll | Pagination add ki (8 per page) |
| **Recent Appointments (dashboard)** | View/Edit icons kuch nahi karte thay | "View All" link Appointments page per le jata hai, Delete kaam karta hai |

## 🟢 Backend Changes

- **`doctors` table** mein naya `photo` column (nullable string, file path).
- **`DoctorController`**: photo upload (`store`/`update`), purani photo delete hoti hai jab nayi upload ho, aur public request per sirf active doctors return hote hain (`auth('sanctum')` se pata chalta hai admin hai ya visitor).
- **`AuthController`**: `GET /me`, `PUT /profile`, `PUT /change-password` — Settings page ke liye.
- **`.env`**: `APP_URL` ko `http://127.0.0.1:8000` set kiya (pehle `localhost` tha jo photo URLs galat bana raha tha).

## 🟢 Frontend Architecture

- **`AuthContext`** — login state ab poori app mein centralized hai (`localStorage` ke sath sync).
- **`ToastContext`** — `useToast()` hook, `toast.success(...)` / `toast.error(...)`.
- **`ProtectedRoute`** — sab `/dashboard/*` routes ab isse wrapped hain.
- **`Pagination`** aur **`DoctorAvatar`** — reusable components.
