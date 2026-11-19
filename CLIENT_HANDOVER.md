# 🚲 RGPV Bhopal Bicycle Rental Platform
## Official Client Handover & Operation Guide

Welcome to the **RGPV Bhopal Campus Bicycle Rental System**! This document contains all the operational information, login credentials, and day-to-day management workflows for your campus bicycle fleet.

---

## 1. Quick Access Links & Default Credentials

| Portal | URL | Purpose |
|---|---|---|
| **Public Student Rental Portal** | `https://your-domain.com/` | Public storefront where students browse cycles, check availability, and initiate WhatsApp bookings. |
| **Student Booking Slip Lookup** | `https://your-domain.com/bookings` | Self-service page for students to pull up their digital pickup pass using their mobile number or voucher code. |
| **Secret Fleet Owner Console** | `https://your-domain.com/admin` | **Hidden management dashboard** (not linked anywhere on the public website) for managing cycles, rates, uploads, and reservations. |

### 🔐 Owner Login Credentials
- **User ID**: `admin`
- **Default Password**: `rgpvadmin@2026`

> **Note**: You can change both your User ID and Password at any time directly inside the **Settings** tab in `/admin`.

---

## 2. Daily Operations & Workflows

### A. How Students Book Cycles
1. The student opens the website on their mobile or laptop.
2. They select a cycle (e.g. *Hero Lectro C6E Electric Cycle*) and choose their rental hours (e.g. 2:00 PM – 5:00 PM).
3. They enter their **Name** and **10-Digit Mobile Number**.
4. The system validates the inputs and checks availability:
   - If that time slot is already booked, the system alerts them immediately.
   - If available, it blocks the slot in the database and clicks **"Book on WhatsApp"**.
5. WhatsApp opens automatically with a pre-formatted message sent directly to your phone:
   ```text
   🚲 RGPV Campus Bicycle Booking
   • Bicycle: Hero Lectro C6E Electric Cycle
   • Booking Code: BK-818250
   • Student Name: Rahul Sharma
   • Timing: 2:00 PM - 5:00 PM (3 hrs)
   • Rent: ₹60 (₹20/hr)
   • Deposit: ₹100 (Refundable)
   • Total Due at Cycle Stand: ₹160 (UPI / Cash)
   • Pickup Location: RGPV Main Gate Cycle Stand
   ```
6. The student receives a digital booking pass with a live countdown timer.

---

### B. Cycle Pickup & Payment at Stand
1. The student arrives at the designated **Cycle Stand** (e.g., RGPV Main Gate or UIT Academic Block).
2. They show their digital voucher code (e.g., `BK-818250`) or WhatsApp chat.
3. You collect the total amount (Rent + Security Deposit) via UPI QR code or Cash at the stand.
4. You hand over the cycle and key/lock.

---

### C. Cycle Return & Security Deposit Refund
1. When the student returns the cycle, open `/admin` -> **Returns & Check-Ins** tab.
2. Find the student's booking row and click **"Check-In"**.
3. Inspect the cycle condition (tires, brakes, gears).
4. Enter return notes (e.g., *"Returned in good condition. Deposit released."*).
5. Refund the security deposit (e.g. ₹50 or ₹100) back to the student via UPI or Cash.
6. The cycle status automatically returns to **Available** for next rental!

---

## 3. Fleet & Price Management

### A. Fast 1-Click Price Editing (No Form Refilling)
1. Go to `/admin` -> **Fleet Inventory** tab.
2. In the cycle table, click the green pencil icon next to any cycle's hourly rate or deposit.
3. Type the new price in ₹ (e.g. change ₹15 to ₹18/hr).
4. Click the checkmark `✓` — the price updates live on the website instantly!

### B. Adding a New Bicycle & Uploading Photos
1. In `/admin`, click the green **"+ Add New Bicycle"** button.
2. Fill in:
   - **Bicycle Model Name** (e.g., *Firefox Target 29D*)
   - **Brand & Model Code** (e.g., *Firefox*, *29D*)
   - **Category** (Electric, Mountain MTB, Campus Roadster, Hybrid)
   - **Hourly Rate (₹/hr)** and **Refundable Security Deposit (₹)**
   - **Gears, Frame Size**, and **Cycle Stand Location**
3. **Upload Photos**:
   - Drag and drop photo files into the upload box.
   - Click the **Star (★)** icon on the best photo to designate it as the **Cover Photo**.
4. Click **"Add to Fleet"** — the bicycle and all photos are instantly live for students to rent.

---

## 4. Settings & Number Management

Inside `/admin` -> **Settings** tab:
1. **Change WhatsApp Phone Number**:
   - Enter your new 10-digit mobile number.
   - Click **"Test Chat"** to verify that WhatsApp opens your chat properly.
   - Click **"Save WhatsApp Number"** — all future student booking buttons immediately redirect to your new number.
2. **Change User ID & Password**:
   - Change your login username or password securely by entering your current password to authorize.

---

## 5. Campus Cycle Stands Configured

The platform is pre-configured with the standard RGPV Bhopal locations:
1. **RGPV Main Gate Cycle Stand**
2. **UIT Academic Block Cycle Stand**
3. **Central Library Cycle Stand**
4. **Hostel Cluster Cycle Stand**
5. **Sports Complex Cycle Stand**

---
*Developed for RGPV Bhopal Campus • Ready for Full Operation*
