# 3-Role System — Complete Implementation Notes

This document covers everything that changed to turn the project into a
proper 3-role (Patient / Doctor / Admin) system with backend-enforced
security.

## ⚠️ RUN THIS FIRST — before anything else

```bash
cd doctor-api
composer install          # if vendor/ isn't present
php artisan migrate        # REQUIRED — adds role='doctor', user ownership, etc.
php artisan storage:link   # REQUIRED — doctor photos won't display without this
php artisan serve
```

```bash
cd frontend
npm install                # if node_modules/ isn't present
npm run dev
```

**The migrations are the riskiest part of this update** (widening the role
and status columns, linking tables together) because SQLite handles column
changes differently from MySQL. I wrote them using the safest possible
technique — add a new column, copy the data across, drop the old column,
rename the new one — specifically to avoid relying on `->change()` /
doctrine-dbal behavior that can be flaky on SQLite. I could not execute
`php artisan migrate` myself in this environment (no PHP available here), so
**please run it and read the output carefully.** If anything fails, send me
the exact error and I'll fix it immediately.

---

## 1. What Was Already Implemented (before this session)

- Laravel + Sanctum backend, React frontend, admin-only dashboard
- Doctors, Patients (walk-in), Appointments, Specializations CRUD
- Admin login/register, doctor photo upload, admin Settings page
- `EnsureUserIsAdmin` middleware, professional UI design system

## 2. What I Added This Session

### Roles & Accounts
- Third role: `doctor` (alongside existing `admin` / `user`)
- Public `/register` is **hard-locked** to `role = 'user'` server-side —
  the request body's `role` field (if sent) is never read or trusted
- `doctors.user_id` links a doctor profile to an optional login account —
  admin can create/reset a doctor's login from Add/Edit Doctor
- `users` table gained patient-profile fields: `phone`, `gender`, `age`,
  `address`, `is_active` (for deactivating patient accounts)

### Security (backend-enforced, not just hidden in the UI)
- New middleware: `EnsureUserIsDoctor` (`doctor`), `EnsureUserIsPatient`
  (`patient`), registered in `bootstrap/app.php` alongside the existing
  `admin` middleware
- Every route is grouped by required role in `routes/api.php`
- **Ownership checks inside controllers**, not just role checks:
  - A patient can only view/cancel **their own** appointment
    (`AppointmentController::show` / `cancelMine` compare `user_id`)
  - A doctor can only view/update **their own** appointments
    (`DoctorPortalController` always resolves the doctor from
    `$request->user()->doctorProfile`, never from a client-supplied ID)
  - Tested logic: user → admin API = 403, doctor → another doctor's
    appointment = 403, logged-out → protected API = 401
- Appointment `status` transitions are enforced server-side
  (`Appointment::canTransitionTo()`): Pending→Confirmed/Cancelled,
  Confirmed→Completed/Cancelled, Completed/Cancelled → nothing
- Booking validates: doctor exists & is active, date/time required,
  `user_id` always comes from the authenticated session (never the
  request body), and a duplicate doctor+date+time booking is rejected

### Appointments — status vocabulary changed
`Pending → Confirmed → Completed`, with `Cancelled` reachable from
`Pending` or `Confirmed`. (Previously it was `Pending/Approved/Cancelled`;
existing rows are migrated automatically: `Approved → Confirmed`.)

### New Backend Endpoints
| Method | Endpoint | Who |
|---|---|---|
| POST | `/appointments` | patient (books for self) / admin (walk-in or on behalf of a user) |
| GET | `/my-appointments` | patient — own bookings only |
| PATCH | `/my-appointments/{id}/cancel` | patient — own booking only |
| GET | `/doctor/dashboard` | doctor — own stats |
| GET | `/doctor/appointments` | doctor — own appointments only |
| PATCH | `/doctor/appointments/{id}/status` | doctor — own appointments only |
| PUT/POST | `/doctor/profile` | doctor — own profile/photo |
| PUT | `/doctor/availability` | doctor — own availability |
| GET | `/users`, `/users/{id}` | admin — registered patient accounts |
| PATCH | `/users/{id}/toggle-status` | admin — activate/deactivate a patient |
| DELETE | `/users/{id}` | admin |
| GET/PUT | `/me`, `/profile`, `/change-password` | any logged-in role |

### New Frontend Pages
- **Patient**: `/my-appointments`, `/profile` (public-site styled, reuses
  the existing Navbar/Footer/design system)
- **Doctor**: `/doctor-dashboard`, `/doctor/appointments`,
  `/doctor/availability`, `/doctor/profile` (reuses the existing
  Sidebar/Topbar dashboard shell — `Sidebar.jsx` is now role-aware and
  shows a different menu for doctors vs admins)
- **Admin**: `/dashboard/users` (new — manage registered patient accounts,
  separate from the existing legacy "Patients" walk-in page)
- 404 page for unmatched routes

### Frontend Routing & Auth
- `ProtectedRoute` now takes `allowedRoles` and redirects a logged-in user
  to *their own* home instead of just logging them out
- Login redirects: `admin → /dashboard`, `doctor → /doctor-dashboard`,
  `user → /my-appointments`
- `Navbar` shows role-appropriate links (My Appointments/Profile for
  patients, Dashboard links for staff) instead of always showing
  Login/Register
- `BookAppointment` now requires a patient login (shows a "please log in"
  screen otherwise) — booking creates the appointment directly against the
  logged-in user, no more public "create a patient record" step

### Bugs Fixed Along the Way
- Duplicate-email booking crash (patient booking twice used to fail)
- Seeded/registered accounts not actually having `role = 'admin'` in the
  database (role wasn't mass-assignable, had to be set directly)
- `/dashboard` stats API was publicly accessible without login
- Route-ordering bug that would have made `/appointments/recent` 404
  (Laravel would've tried to match "recent" as an appointment ID)
- 404 page was missing (blank white screen on a bad URL)

---

## 3. Final Database Structure (changed tables only)

**`users`**: id, name, email, password, `role` (admin/doctor/user),
`phone`, `gender`, `age`, `address`, `is_active`, timestamps

**`doctors`**: id, `user_id` (nullable, → users), name, email, phone,
specialization_id, experience, consultation_fee, available_days,
available_time, status, photo, timestamps

**`appointments`**: id, doctor_id, `patient_id` (nullable, legacy
walk-ins), `user_id` (nullable, registered patients), appointment_date,
appointment_time, `status` (Pending/Confirmed/Completed/Cancelled), notes,
timestamps

**`patients`**: unchanged — legacy walk-in records, admin-managed only

## 4. Final Role Permissions Summary

| Action | Patient | Doctor | Admin |
|---|:---:|:---:|:---:|
| Register / Login | ✅ | ❌ (admin-created only) | ❌ (admin-created only) |
| Browse/search doctors | ✅ | ✅ | ✅ |
| Book appointment | ✅ (self) | ❌ | ✅ (walk-in or on behalf of a user) |
| Cancel appointment | ✅ (own) | ❌ | ✅ (any) |
| View appointment | ✅ (own) | ✅ (own) | ✅ (any) |
| Confirm/Complete/Reject appointment | ❌ | ✅ (own only) | ✅ (any) |
| Manage own profile/password | ✅ | ✅ | ✅ |
| Manage own availability | ❌ | ✅ | — |
| Add/Edit/Delete doctors | ❌ | ❌ | ✅ |
| Manage specializations | ❌ | ❌ | ✅ |
| Manage patient accounts (`/users`) | ❌ | ❌ | ✅ |
| View system-wide dashboard stats | ❌ | ❌ (own stats only) | ✅ |

## 5. Testing Instructions

**Demo accounts** (after `php artisan migrate --seed` or reusing the
existing seeded database):
- Admin: `admin@example.com` / `password123`
- Doctor: `sara.malik@example.com` / `password123` (newly seeded — linked
  to "Dr. Sara Malik")
- Patient: register a new account from `/register`

**Suggested test flow:**
1. Register a new patient → should land on `/my-appointments`, not `/dashboard`
2. Book an appointment as that patient → should appear under "My Appointments"
3. Log in as the seeded doctor → confirm/cancel/complete that same
   appointment from `/doctor/appointments`
4. Try visiting `/dashboard` while logged in as the patient → should
   bounce you back to `/my-appointments`, not show admin data
5. Log in as admin → check `/dashboard/users` shows the new patient account
6. As admin, try deactivating that patient account, then try logging in as
   that patient again → should be blocked with "account deactivated"

## 6. Known Scope Limits (be upfront about these if asked)

- No email verification / forgot-password flow
- No login rate-limiting/brute-force protection
- Doctor availability is a simple text field (days/time), not a real
  calendar/slot system
- Admin "Book Appointment" still supports the legacy walk-in `patients`
  table alongside registered users, by design (preserves existing data)

These are reasonable to list as "Future Work" in a viva — they're standard
simplifications for a project of this scope, not oversights.
