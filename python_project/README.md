# Python The World - Modern Inventory & Sales Manager

A complete, high-fidelity Python desktop application built using **CustomTkinter** for a polished modern dark-themed interface and **SQLite** for secure local storage.

## Key Features

- **Secure Session Management**: Built-in User Login & Registration with local SHA-256 password hashing.
- **Role-Based Access**: Restricts sensitive operations (like deleting inventory) to `Admin` users.
- **Product Inventory Database**: Full search, category filtering, product creation, modifying, and safe deleting.
- **Integrated Sales Terminal**: Live stock checking, auto total calculation, single-click checkout transaction, and inventory decrementing.
- **Comprehensive Ledger Logs**: Displays historic records of unit sales, revenues, timestamps, and active clerk.
- **Low-Stock Warnings**: Real-time alerts highlighting products below required minimum alert levels.
- **Category Sales Analytics**: Quick reporting on total metrics (revenue, items sold, active inventory).
- **Physical Data Exporting**: Single-click downloads of complete inventory databases or transaction logs directly to standard CSV files.

---

## Installation & Setup

Ensure you have **Python 3.8 or newer** installed on your system.

### 1. Clone or Download Project
Place all files in a single directory on your machine (e.g., Windows computer):
```
/python_project
  ├── main.py
  ├── gui.py
  ├── auth.py
  ├── database.py
  ├── requirements.txt
  └── README.md
```

### 2. Create a Virtual Environment (Recommended)
Open your terminal or Windows PowerShell in this folder and run:
```bash
# Windows
python -m venv venv
.\venv\Scripts\activate

# macOS / Linux
python3 -m venv venv
source venv/bin/activate
```

### 3. Install Required Dependencies
Run the package manager inside your active virtual environment:
```bash
pip install -r requirements.txt
```

### 4. Run the Application
Start the desktop application:
```bash
python main.py
```

---

## Testing / Default Credentials

On the first startup, the application creates a safe database file `python_world.db` automatically and seeds a default administrative user:

- **Username**: `admin`
- **Password**: `admin123`
- **Role**: Admin

You can also use the **Register / Sign Up** screen within the app to create a new `Staff` or `Admin` user account.
