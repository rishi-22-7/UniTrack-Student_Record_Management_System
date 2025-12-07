---

# 🏛️ UniTrack : UniversityStudent Management ERP System

## 📖 Project Overview

**UniTrack Pro** is a comprehensive Enterprise Resource Planning (ERP) system designed to digitize university administration. It streamlines the complex interactions between Administrators, Faculty, and Students through a unified, Role-Based Access Control (RBAC) interface.

The project is implemented in two versions:

**Web GUI:** A modern, responsive dashboard using HTML/CSS/JS with LocalStorage persistence.

**C++ Backend:** A robust console-based system using File Handling for data persistence.

---

## 🚀 Features

### 1\. 👑 Admin Portal (The Controller)

**360° Dashboard:** Real-time statistics on Enrollment, Hostel Occupancy, and Financial Health.

**Advanced Analysis Hub:**

**Financial:** Track total revenue, outstanding dues, and high-value defaulters.

**Academic:** View department-wise performance, toppers, and average CGPA.

**Logistics:** Detailed lists of students using Hostel, College Bus, or Own Transport.

**Finance Control:** Configure base fees for every department/facility. Add fines or process payments dynamically.

**User Management:** Admit new students and recruit faculty with specific department access.

**System Integrity:** View Audit Logs of all actions and download JSON Data Backups.

### 2\. 👨‍🏫 Faculty Portal (The Academic Manager)

**Department Locking:** Faculty can only access students within their assigned department (e.g., CSE faculty cannot edit ECE marks).

**Smart Gradebook:** Search, Sort, and Update student CGPA instantly.

**Class Analysis:** Auto-calculates Class Average, Topper, and identifies students needing improvement (\< 7.0 CGPA).

**Appeals Inbox:** Review academic requests from students and Approve/Reject them.

### 3\. 🎓 Student Portal (The User)

**Profile Management:** View personal details, academic status, and change password securely.

**Fee Payment:** View breakdown of Academic vs. Logistics fees. Pay fees (Partial or Full) via a simulated gateway.

**Communication:** Submit academic appeals to faculty and track their status (Pending/Accepted/Rejected).

**Alerts:** Receive notifications from the Admin regarding dues or announcements.

---

## 🛠️ Technology Stack

| **Component** | **Technology** | **Description** |
| --- | --- | --- |
| **Frontend GUI** | **HTML5, CSS3, JS** | Responsive Grid Layouts, Dynamic DOM Manipulation, CSS Variables for Theming. |
| **Data Persistence** | **LocalStorage / File I/O** | Browser storage for GUI version; `.txt` file handling for C++ version. |
| **Backend Logic** | **C++ (STL)** | Object-Oriented Programming (Classes for Admin, Faculty, Student). |
| **Design** | **Inter Font & SVG** | Professional typography and vector icons for a clean UI. |

---

## 💻 How to Run

### 1\. Running the Web Dashboard

Simply double-click `**index.html**` to open it in any modern web browser (Chrome, Edge, Safari).

**No installation required.**

The system includes pre-loaded dummy data for testing.

### 2\. Running the C++ Application

Open the .cpp file in VS Code or any C++ IDE.

Compile and run the source code. The system will automatically generate the required text files (unitrack\_students.txt, etc.) for storage.

---

## 🔑 Default Login Credentials

Use these credentials to test the different hierarchies in the system:

| **Role** | **Username** | **Password** |
| --- | --- | --- |
| **Admin** | `admin` | `admin123` |
| **Faculty (CSE)** | `prof_cse` | `123` |
| **Student** | `21CSE101` | `123` |

---

## 🧠 System Architecture

### Role-Based Access Control (RBAC)

The system strictly enforces permissions:

**Admin:** Read/Write Access to ALL data.

**Faculty:** Read/Write Access to THEIR Department's Academic Data only. No access to Financials.

**Student:** Read Only (Own Data). Write Access only for Appeals and Profile Updates.

### Data Logic

**Sorting & Searching:** Implemented efficient linear search and sorting algorithms (Bubble Sort/Quick Sort logic) to organize student directories by Roll No, Name, CGPA, or Dues.

**Financial Logic:** Fee = `Base Dept Fee` + `Logistics Fee` (Hostel/Bus). Payments are subtracted from `TotalDue`.

---

## 📸 Usage Guide

**Login:** Select your role (Admin/Faculty/Student) and enter credentials.

**Admin:** Go to "Finances" to set the fee structure. Go to "Add Student" to enroll new users. Use "Analysis" to generate reports.

**Faculty:** Login to view your class. Click "Update" to grade students. Check "Appeals" to resolve student requests.

**Student:** Check "Fee Status". If dues exist, click "Pay Now". Use "Appeals" if you have a grievance.

---

## 📝 Credits

Developed By: M. NagaSai Rishi

Course: Coding Skills - 1 (B.Tech 3rd Sem)

Submission Date: November 9th