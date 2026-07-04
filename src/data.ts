// Mock database state for the live React simulator

export interface Product {
  id: number;
  name: string;
  category: string;
  quantity: number;
  price: number;
  min_stock: number;
}

export interface Sale {
  id: number;
  productName: string;
  quantity: number;
  totalPrice: number;
  date: string;
  username: string;
}

export interface User {
  id: number;
  username: string;
  role: 'Admin' | 'Staff';
  passwordHash: string;
}

export const INITIAL_PRODUCTS: Product[] = [
  { id: 101, name: "Ryzen 9 5900X CPU", category: "Processors", quantity: 12, price: 349.99, min_stock: 5 },
  { id: 102, name: "RTX 4070 Ti GPU", category: "Graphics Cards", quantity: 3, price: 799.99, min_stock: 4 },
  { id: 103, name: "32GB Corsair DDR5 RAM", category: "Memory", quantity: 25, price: 119.99, min_stock: 8 },
  { id: 104, name: "2TB Samsung 990 Pro SSD", category: "Storage", quantity: 18, price: 169.99, min_stock: 6 },
  { id: 105, name: "Corsair RM850x PSU", category: "Power Supplies", quantity: 2, price: 129.99, min_stock: 5 },
  { id: 106, name: "ASUS ROG Strix B650-A", category: "Motherboards", quantity: 8, price: 219.99, min_stock: 3 },
  { id: 107, name: "Lian Li O11 Dynamic Case", category: "Cases", quantity: 14, price: 149.99, min_stock: 4 },
];

export const INITIAL_USERS: User[] = [
  { id: 1, username: "admin", role: "Admin", passwordHash: "8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918" }, // hash of admin123
  { id: 2, username: "sarah_clerk", role: "Staff", passwordHash: "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8" }, // hash of password
];

export const INITIAL_SALES: Sale[] = [
  { id: 1001, productName: "RTX 4070 Ti GPU", quantity: 1, totalPrice: 799.99, date: "2026-07-03 14:23:10", username: "admin" },
  { id: 1002, productName: "32GB Corsair DDR5 RAM", quantity: 2, totalPrice: 239.98, date: "2026-07-03 16:45:22", username: "sarah_clerk" },
  { id: 1003, productName: "2TB Samsung 990 Pro SSD", quantity: 1, totalPrice: 169.99, date: "2026-07-04 09:12:05", username: "sarah_clerk" },
];

export const FILE_CONTENTS: Record<string, string> = {
  'main.py': `import sys
import os

# Ensure the workspace directory is in the import path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from gui import App

def main():
    """
    Main entry point for Python The World desktop inventory application.
    Instantiates the root GUI window and runs the event dispatcher.
    """
    try:
        print("Starting Python The World Desktop Application...")
        app = App()
        app.mainloop()
    except Exception as e:
        print(f"A fatal application error occurred: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()`,

  'gui.py': `import tkinter as tk
from tkinter import messagebox, ttk
import customtkinter as ctk
import csv
import os
from datetime import datetime

# Import database and authenticator
from database import Database
from auth import Authenticator

# Configure CustomTkinter appearance
ctk.set_appearance_mode("Dark")  # Modes: "System", "Dark", "Light"
ctk.set_default_color_theme("blue")  # Themes: "blue", "green", "dark-blue"

class App(ctk.CTk):
    def __init__(self):
        super().__init__()
        self.title("Python The World - Modern Inventory & Sales Manager")
        self.geometry("1100x680")
        self.minsize(950, 600)

        self.db = Database()
        self.auth = Authenticator(self.db)
        self.current_user = None

        self.container = ctk.CTkFrame(self)
        self.container.pack(side="top", fill="both", expand=True)
        self.container.grid_rowconfigure(0, weight=1)
        self.container.grid_columnconfigure(0, weight=1)

        self.frames = {}
        self.show_frame("LoginFrame")

    def show_frame(self, frame_class_name):
        if frame_class_name in self.frames:
            self.frames[frame_class_name].destroy()

        if frame_class_name == "LoginFrame":
            self.frames[frame_class_name] = LoginFrame(parent=self.container, controller=self)
        elif frame_class_name == "SignupFrame":
            self.frames[frame_class_name] = SignupFrame(parent=self.container, controller=self)
        elif frame_class_name == "DashboardFrame":
            self.frames[frame_class_name] = DashboardFrame(parent=self.container, controller=self)

        self.frames[frame_class_name].grid(row=0, column=0, sticky="nsew")
        self.frames[frame_class_name].tkraise()

    def on_login_success(self, user_info):
        self.current_user = user_info
        messagebox.showinfo("Login Success", f"Welcome back, {user_info['username']}!")
        self.show_frame("DashboardFrame")

    def logout(self):
        if messagebox.askyesno("Logout", "Are you sure you want to log out?"):
            self.current_user = None
            self.show_frame("LoginFrame")`,

  'database.py': `import sqlite3
import os
from datetime import datetime

class Database:
    def __init__(self, db_name="python_world.db"):
        self.db_name = db_name
        self.connect()
        self.create_tables()

    def connect(self):
        try:
            self.conn = sqlite3.connect(self.db_name)
            self.cursor = self.conn.cursor()
            self.cursor.execute("PRAGMA foreign_keys = ON;")
        except sqlite3.Error as e:
            print(f"Error connecting to database: {e}")

    def create_tables(self):
        self.cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                role TEXT NOT NULL DEFAULT 'Staff',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        self.cursor.execute("""
            CREATE TABLE IF NOT EXISTS products (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                category TEXT NOT NULL,
                quantity INTEGER NOT NULL CHECK (quantity >= 0),
                price REAL NOT NULL CHECK (price >= 0.0),
                min_stock INTEGER NOT NULL DEFAULT 5
            )
        """)
        self.cursor.execute("""
            CREATE TABLE IF NOT EXISTS sales (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                product_id INTEGER,
                quantity INTEGER NOT NULL,
                total_price REAL NOT NULL,
                date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                user_id INTEGER,
                FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE SET NULL,
                FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
            )
        """)
        self.conn.commit()
        self.seed_default_admin()`,

  'auth.py': `import hashlib
import re

class Authenticator:
    def __init__(self, db_instance):
        self.db = db_instance

    @staticmethod
    def hash_password(password):
        return hashlib.sha256(password.encode()).hexdigest()

    def login(self, username, password):
        if not username.strip() or not password:
            return False, "Username and password cannot be empty."
        hashed_pwd = self.hash_password(password)
        return self.db.authenticate_user(username, hashed_pwd)

    def register(self, username, password, confirm_password, role="Staff"):
        if not username.strip() or not password:
            return False, "Fields cannot be empty."
        if len(password) < 6:
            return False, "Password must be at least 6 characters."
        if password != confirm_password:
            return False, "Passwords do not match."
        return self.db.register_user(username, self.hash_password(password), role)`,

  'requirements.txt': `# Installation requirements for Python The World Inventory Application
customtkinter>=5.2.0
pillow>=10.0.0
matplotlib>=3.7.0`,

  'README.md': `# Python The World - Modern Inventory & Sales Manager

A complete, high-fidelity Python desktop application built using **CustomTkinter** for a polished modern dark-themed interface and **SQLite** for secure local storage.

## Installation & Setup
Ensure you have **Python 3.8 or newer** installed on your system.

1. Navigate to the \`/python_project\` folder.
2. Create and activate a virtual environment:
   \`\`\`bash
   python -m venv venv
   .\\venv\\Scripts\\activate
   \`\`\`
3. Install dependencies:
   \`\`\`bash
   pip install -r requirements.txt
   \`\`\`
4. Run the app:
   \`\`\`bash
   python main.py
   \`\`\``
};
