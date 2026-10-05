# Scrap Saathi Chatbot Knowledge Base (Detailed Version)

# Navigation and Navbar Guide

Scrap Saathi features a responsive, role-based navigation system through a top Navbar that adapts based on user login and role.

## How to Navigate the Site

### The Three-Line Menu (☰)

In the top-right corner of every page, you'll see a **three-line menu icon (☰)**. Tap or click this icon to access all key sections of the website.

This menu shows different options **depending on whether you're logged in and what role you have selected**.

---

## Before Login

Before logging in, the ☰ menu includes:

- Home
- About
- Services
- Contact
- Login / Signup
- Learning
- Donate for Environment

---

## After Login

Once logged in, the ☰ menu will dynamically show:

- Your **name** at the top
- A **Dashboard** specific to your role
- **Profile** view/edit
- **Waste Collector Request** or **Raise Demand** (based on role)
- Learning
- Donate for Environment
- Logout

---

## Role-Based Navigation

Depending on the user role, the ☰ menu shows:

### **Individual Users**

- Dashboard (your stats)
- Profile
- Waste Collector Request

### **Waste Collectors**

- Dashboard
- Requests (incoming pickups)
- Profile
- Register as Collector

### **Big Organizations**

- Dashboard (contracts, volume, etc.)
- Waste Collector Request
- Profile

### ➤ **Recycle Companies**

- Dashboard (supply/demand analytics)
- Raise Your Demand
- Profile

---

## Example User Flow

1. Open **Scrap Saathi** homepage.
2. Tap the **☰ menu** (top-right corner).
3. Select **Login / Signup** and register with your role.
4. After login, open the menu again.
5. Access your **Dashboard**, **Pickup Request**, or **Learning Centre**.

---

## Visual Elements in the Navbar

- Scrap Saathi brand name with a green-blue gradient
- Smooth hover and underline transitions
- Profile icon/avatar (after login)
- Stylish gradient buttons for Login / Signup
- Sidebar drawer with links for larger screens
- Mobile dropdown for small screen users

---

## Tips

- You can always return to the homepage by clicking **Scrap Saathi** logo in the top-left.
- If you get lost, just tap the ☰ menu to find your options.
- Features like **schedule pickup**, **view scrap price**, and **access dashboard** are **only available after login**.

---

## Homepage Overview

## Homepage – Scrap Saathi

Scrap Saathi is an eco-conscious platform built to help individuals, organizations, waste collectors, and recycling companies manage waste effectively. It offers digital tools to schedule pickups, track recycling, and promote green practices.

### Features on Homepage:

- **Schedule a Pickup**: Book a time slot for scrap collection.
- **View Dynamic Scrap Prices**: Keep updated with daily-changing scrap rates.
- **Track Your Rewards**: See how much you’ve earned by recycling.
- **Explore Learning Centre**: Learn how waste impacts the planet.
- **Choose Your Role**: Get tailored experience based on whether you’re an individual, business, waste collector, or recycling company.

---

## User Registration Flow

## User Registration Page – `/register`

Users register by selecting their role:

- Individual
- Big Organization
- Waste Collector
- Recycling Company

Each role shows a different form with role-specific fields.

### Common Fields:

- Name, Email, Phone, Password, Address

### Additional Role-Based Fields:

- **Big Organization**: `Company Name`, `Waste Type`, `Business License`
- **Waste Collector**: `Service Area`, `Collector ID`
- **Recycling Company**: `Recycling Capabilities`, `Certifications`

### Email Verification Flow:

- OTP is sent to the user’s email
- Must be verified before completing registration

---

## Login Page

## Login Page – `/login`

Users log in using their:

- Registered Email
- Password

### Flow:

1. On success, token is saved.
2. User is redirected to their role-based dashboard:
   - `/individual-dashboard`
   - `/organization-dashboard`
   - `/recycle-company-dashboard`
   - `/waste-collector-requests`

---

## Sell Waste

## Sell Waste – `/sellWaste`

This feature allows users to sell their scrap materials and request pickup.

### Inputs Required:

- Waste Type
- Subcategory
- Quantity
- Address
- Preferred Time Slot
- Optional: Upload image of waste

The request is sent to the backend, and available waste collectors are notified. You receive confirmation of the pickup schedule.

---

## Contact Support

## Contact Us – `/contact`

A contact form is provided for:

- Inquiries
- Feedback
- Support issues

### Features:

- Auto-fills name and email for logged-in users (read-only)
- Message field is editable
- Uses POST API to send data
- SweetAlert2 is used to show confirmation
- Redirects to homepage after successful submission

---

## Learning Centre

## Learning Centre – `/learning`

An interactive learning module with 4 tabs:

1. **Learn**: Basic concepts of recycling and waste management.
2. **App Guide**: Instructions on using Scrap Saathi features.
3. **Tips**: Practical eco-hacks and recycling tips.
4. **Impact**: Data on how your actions reduce waste and pollution.

Includes educational content with icons and grid layout for readability.

---

## Support Us

## Support Us – `/donate`

Users can support causes by donating money.

### Supported Causes:

- Tree Plantation
- Wildlife Protection
- Ocean Cleanup
- NGOs for Environment

Users can choose a donation amount:

- ₹100, ₹500, ₹1000
- Or a custom amount (min ₹10)

### Flow:

1. Select a cause
2. Choose/enter amount
3. Click 'Donate Now '
4. Success alert shown

---

## Big Organization Dashboard

## Big Organization Dashboard – `/organization-dashboard`

This dashboard allows enterprise users to:

- Monitor contracts
- Track volume & earnings
- View pickup status

### Features:

- **Contracts Table**: ID, Material, Volume, Status, Renewal Date
- **Volume Sold**: e.g., 23,000 kg
- **Earnings**: e.g., ₹1,200,000
- **Sales Trends (Chart.js)**: Line chart by month
- **Material Distribution**: Doughnut chart
- **Pickup Schedule**: List of upcoming pickups

---

## About Page

## About Page – `/about`

### Purpose:

To showcase Scrap Saathi’s mission, vision, and founding team.

### Content Includes:

- Our Mission: Reduce landfill waste, promote recycling, and enable a cleaner planet.
- Our Values: Sustainability, Innovation, Transparency, and Community.
  -🧑 Founders:
- Pranav Raj – Founder & CEO
- Aman Kumar – Co-Founder
- 📧 Contact: pranavraj0105@gmail.com / sbthelp123@gmail.com

---

## Advanced Dashboard

## Advanced Dashboard – `/AdvancedDashboard`

A general dashboard interface used based on role passed as prop (`userRole`).

### Features:

- Quick Stats: Scrap Recycled, Rewards, Scheduled & Completed Pickups
- Sidebar Menu: Dynamic options for:
  - Waste Collectors → Pickups
  - Big Organizations → Reports, Vendors
  - Recycle Companies → Inventory, Orders
- Chart Placeholder: Reserved space for future analytics
- Recent Activity List: Displays user-specific actions

---

## Edit Profile

## Edit Profile – `/editProfile`

### Overview:

Allows user to update personal and role-specific details with OTP verification.

### Key Fields:

- Name, Email, Phone, Address, Password
- OTP verification required for email changes
- Upload profile picture with live preview
- Role-specific fields (companyName, wasteType, etc.)

### Flow:

1. Fetch current profile
2. Allow edits
3. Send OTP
4. Verify OTP
5. Enable Save only after OTP confirmation

---

## Recycle Company Dashboard

## Recycle Company Dashboard – `/recycle-company-dashboard`

### Tabs:

- Dashboard: Summary stats of supply performance
- Supply: Incoming & Received waste shipments
- Performance: Revenue, capacity, and material charts

### Features:

- View deliveries with seller name, waste type, quantity, ETA
- View weekly charts using `react-chartjs-2`
- Switch by time filter: Today, Week, Month

---

## Service Page

## Services Page – `/services`

### Section 1: Our Services

1. **Sustainable Waste Management** – Custom schedules, eco-friendly disposal
2. **On-Demand Pickup** – Residential/commercial pickups, easy app booking
3. **Expert Recycling** – Sorted processing, partnerships, hazardous handling

### Section 2: Why Choose Us?

- Eco-Friendly
- Convenient
- Reliable (assumed from styling)

### UI:

- 3-card layout using Tailwind
- Icons for each service

---

## User Profile

## User Profile – `/profile`

### Layout:

- Gradient header with profile picture
- Grid layout displaying user data

### Fields:

- Name, Email, Phone, Address, Role
- Additional (if business): Company Name, License No., Capabilities

Includes **Edit Button** → redirects to `/editProfile`

---

## Waste Collector Dashboard

## Waste Collector Dashboard – `/waste-collector-requests`

### Overview:

Displays pickup requests for logged-in collectors.

### Key Actions:

- Accept Pickup → `POST /pickup/accept-request`
- Cancel Pickup → `POST /pickup/cancel-request`
- View location in Google Maps
- Call user directly

### UI:

- Sorted list with status highlighting
- Conditional button styling for accepted/pending

---
