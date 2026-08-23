# WoodCraft Carpentry & Custom Furniture Platform

> **Live Web Application URL**: [https://ais-dev-zsa6mwefqduaoht4bgfblg-1027008311211.asia-southeast1.run.app](https://ais-dev-zsa6mwefqduaoht4bgfblg-1027008311211.asia-southeast1.run.app)

---

## 🪵 Project Overview

**WoodCraft Carpentry** is a full-stack, enterprise-grade e-commerce and on-demand carpentry platform tailored for premium handcrafted solid timber furniture, bespoke joinery quotations, on-site carpenter service bookings, and production telemetry tracking.

All currency amounts across the entire application are formatted in **Indian Rupees (₹ - INR)** using localized formatting (e.g. `₹48,500`), integrated with GST (12%) calculations and realistic Indian workshop logistics.

---

## ✨ Key Features & Capabilities

### 1. 🛋️ Solid Hardwood Furniture Catalog
- Handcrafted collections in **Burma Teak, American White Oak, Walnut, Indian Sheesham (Rosewood), Mahogany, and Pine**.
- Multi-image product galleries, wood species specification tags, finish selection (PU Polish, Natural Matte Oil, Raw Waxed), custom dimension preview, and real-time inventory counts.
- Dynamic filtering by category, wood species, price slider in ₹, and search.

### 2. 📐 Custom Furniture Builder & Quotation Engine
- Step-by-step 3D-inspired builder: Select category (Dining Tables, Beds, Sofas, Wardrobes, TV Units, Doors/Windows).
- Custom dimensional inputs (Length, Width, Height in inches/cm), wood species selector, edge styles (Live Edge, Chamfer, Roundover, Bullnose), and hardware options.
- Instant estimated cost breakdown with real-time bill of materials calculations.
- Direct quotation submission to workshop masters for administrative review and quote responses.

### 3. 🔨 On-Site Carpenter Service Booking
- Real-time carpenter booking for:
  - **Furniture Repair & Joinery Tightening** (₹499)
  - **Re-Polishing & PU Painting** (₹1,499)
  - **Modular Kitchen & Wardrobe Fitting** (₹999)
  - **Door Lock, Hinge & Latch Installation** (₹349)
  - **Custom Woodwork & Site Measurements** (₹299)
- Date picker, time slot selection, address auto-fill (Bengaluru & pan-India), and assigned carpenter dispatch notifications.

### 4. 🛰️ Live Workshop Production Tracking & Tax Invoices
- 7-stage live telemetry stepper: *Order Placed ➔ Confirmed ➔ In Production ➔ Quality Check ➔ Ready ➔ Shipped ➔ Delivered*.
- Milestone updates with inspection photos and joiner notes.
- Printable official **Tax Invoice Modal** with GSTIN, itemized breakups, and structural warranty stamp.

### 5. 🧑‍💼 Multi-Role Portals & Management
- **Customer Dashboard**: Track orders, custom quotation submissions, service bookings, and warranty certificates.
- **Master Admin Dashboard**:
  - Executive revenue metrics in ₹, active production pipelines, and low stock warnings.
  - Full product catalog manager with photo upload, camera snapshot capture, and **AI Craftsmanship Description Generator**.
  - Custom quotation reviewer with lumber, labor, finish, and delivery costing tools.
  - Workshop raw materials & lumber inventory tracking with safety thresholds.
- **Carpenter Worker Portal**: Dedicated workbench for field carpenters and joiners to update milestone progress and inspect tasks.

### 6. 🤖 AI Wood Doctor & Species Advisor
- AI-powered species recommendation engine analyzing room type, daily family usage intensity, humidity/sun exposure, and aesthetic preferences to match the optimal timber and protective finish.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Lucide React Icons, Motion (`motion/react`)
- **Backend & API**: Express.js REST API with Vite middleware
- **Database & Auth**: Cloud Firestore persistent database & Google Firebase Authentication
- **AI Intelligence**: Gemini 2.5 API for AI Wood Advisor & automated craftsmanship description generation

---

## 🚀 Live Link

- **Production URL**: [https://ais-dev-zsa6mwefqduaoht4bgfblg-1027008311211.asia-southeast1.run.app](https://ais-dev-zsa6mwefqduaoht4bgfblg-1027008311211.asia-southeast1.run.app)
