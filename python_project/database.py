import sqlite3
import os
from datetime import datetime

class Database:
    """
    Database management class using SQLite.
    Handles user authentication, product inventory, and sales transactions.
    """
    def __init__(self, db_name="python_world.db"):
        self.db_name = db_name
        self.conn = None
        self.cursor = None
        self.connect()
        self.create_tables()

    def connect(self):
        """Establish a connection to the SQLite database."""
        try:
            self.conn = sqlite3.connect(self.db_name)
            self.cursor = self.conn.cursor()
            # Enable foreign key support
            self.cursor.execute("PRAGMA foreign_keys = ON;")
        except sqlite3.Error as e:
            print(f"Error connecting to database: {e}")

    def close(self):
        """Close the database connection safely."""
        if self.conn:
            self.conn.close()

    def create_tables(self):
        """Create database tables if they do not exist."""
        try:
            # Users Table
            self.cursor.execute("""
                CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    username TEXT UNIQUE NOT NULL,
                    password_hash TEXT NOT NULL,
                    role TEXT NOT NULL DEFAULT 'Staff',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)

            # Products (Inventory) Table
            self.cursor.execute("""
                CREATE TABLE IF NOT EXISTS products (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    category TEXT NOT NULL,
                    quantity INTEGER NOT NULL CHECK (quantity >= 0),
                    price REAL NOT NULL CHECK (price >= 0.0),
                    min_stock INTEGER NOT NULL DEFAULT 5,
                    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)

            # Sales Transactions Table
            self.cursor.execute("""
                CREATE TABLE IF NOT EXISTS sales (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    product_id INTEGER,
                    quantity INTEGER NOT NULL CHECK (quantity > 0),
                    total_price REAL NOT NULL,
                    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    user_id INTEGER,
                    FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE SET NULL,
                    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
                )
            """)

            self.conn.commit()
            
            # Seed a default admin user if the table is empty
            self.seed_default_admin()
        except sqlite3.Error as e:
            print(f"Error creating tables: {e}")

    def seed_default_admin(self):
        """Seed a default admin user (admin / admin123) for testing."""
        self.cursor.execute("SELECT COUNT(*) FROM users")
        if self.cursor.fetchone()[0] == 0:
            import hashlib
            # SHA-256 hash of 'admin123'
            pwd_hash = hashlib.sha256("admin123".encode()).hexdigest()
            try:
                self.cursor.execute(
                    "INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)",
                    ("admin", pwd_hash, "Admin")
                )
                self.conn.commit()
                print("Default admin user created: admin / admin123")
            except sqlite3.Error as e:
                print(f"Error seeding admin user: {e}")

    # ================= USER AUTHENTICATION =================

    def register_user(self, username, password_hash, role="Staff"):
        """Register a new user in the database."""
        try:
            self.cursor.execute(
                "INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)",
                (username.strip(), password_hash, role)
            )
            self.conn.commit()
            return True, "Registration successful!"
        except sqlite3.IntegrityError:
            return False, "Username already exists."
        except sqlite3.Error as e:
            return False, f"Database error: {e}"

    def authenticate_user(self, username, password_hash):
        """Authenticate user credentials."""
        try:
            self.cursor.execute(
                "SELECT id, username, role FROM users WHERE username = ? AND password_hash = ?",
                (username.strip(), password_hash)
            )
            user = self.cursor.fetchone()
            if user:
                return True, {"id": user[0], "username": user[1], "role": user[2]}
            return False, "Invalid username or password."
        except sqlite3.Error as e:
            return False, f"Database error: {e}"

    # ================= PRODUCT MANAGEMENT =================

    def add_product(self, name, category, quantity, price, min_stock):
        """Add a new product to the inventory."""
        try:
            self.cursor.execute(
                "INSERT INTO products (name, category, quantity, price, min_stock) VALUES (?, ?, ?, ?, ?)",
                (name.strip(), category.strip(), int(quantity), float(price), int(min_stock))
            )
            self.conn.commit()
            return True, "Product added successfully!"
        except ValueError:
            return False, "Invalid number inputs for quantity, price, or minimum stock."
        except sqlite3.Error as e:
            return False, f"Database error: {e}"

    def update_product(self, product_id, name, category, quantity, price, min_stock):
        """Update an existing product's details."""
        try:
            self.cursor.execute("""
                UPDATE products 
                SET name = ?, category = ?, quantity = ?, price = ?, min_stock = ?, last_updated = CURRENT_TIMESTAMP
                WHERE id = ?
            """, (name.strip(), category.strip(), int(quantity), float(price), int(min_stock), int(product_id)))
            self.conn.commit()
            if self.cursor.rowcount > 0:
                return True, "Product updated successfully!"
            return False, "Product not found."
        except ValueError:
            return False, "Invalid number inputs for quantity, price, or minimum stock."
        except sqlite3.Error as e:
            return False, f"Database error: {e}"

    def delete_product(self, product_id):
        """Delete a product from the database."""
        try:
            self.cursor.execute("DELETE FROM products WHERE id = ?", (int(product_id),))
            self.conn.commit()
            if self.cursor.rowcount > 0:
                return True, "Product deleted successfully!"
            return False, "Product not found."
        except sqlite3.Error as e:
            return False, f"Database error: {e}"

    def get_all_products(self):
        """Retrieve all products from the inventory."""
        try:
            self.cursor.execute("SELECT id, name, category, quantity, price, min_stock FROM products ORDER BY name ASC")
            return self.cursor.fetchall()
        except sqlite3.Error as e:
            print(f"Database error: {e}")
            return []

    def search_products(self, search_query, category_filter="All"):
        """Search products by name or category with filters."""
        try:
            sql = "SELECT id, name, category, quantity, price, min_stock FROM products WHERE 1=1"
            params = []

            if search_query.strip():
                sql += " AND (name LIKE ? OR category LIKE ?)"
                q = f"%{search_query.strip()}%"
                params.extend([q, q])

            if category_filter != "All":
                sql += " AND category = ?"
                params.append(category_filter)

            sql += " ORDER BY name ASC"
            self.cursor.execute(sql, params)
            return self.cursor.fetchall()
        except sqlite3.Error as e:
            print(f"Database error: {e}")
            return []

    def get_categories(self):
        """Retrieve unique categories of products."""
        try:
            self.cursor.execute("SELECT DISTINCT category FROM products ORDER BY category ASC")
            return [row[0] for row in self.cursor.fetchall() if row[0]]
        except sqlite3.Error as e:
            print(f"Database error: {e}")
            return []

    # ================= SALES & TRANSACTIONS =================

    def record_sale(self, product_id, quantity, user_id):
        """Record a sale transaction and decrement product quantity."""
        try:
            # Check current product stock
            self.cursor.execute("SELECT name, quantity, price FROM products WHERE id = ?", (int(product_id),))
            product = self.cursor.fetchone()
            
            if not product:
                return False, "Product not found."

            product_name, current_qty, price = product
            qty_to_sell = int(quantity)

            if current_qty < qty_to_sell:
                return False, f"Insufficient stock! Available: {current_qty}"

            total_price = price * qty_to_sell

            # Deduct inventory
            new_qty = current_qty - qty_to_sell
            self.cursor.execute("UPDATE products SET quantity = ? WHERE id = ?", (new_qty, int(product_id)))

            # Record sales transaction
            self.cursor.execute("""
                INSERT INTO sales (product_id, quantity, total_price, user_id)
                VALUES (?, ?, ?, ?)
            """, (int(product_id), qty_to_sell, total_price, int(user_id)))

            self.conn.commit()
            return True, f"Sale recorded! Total: ${total_price:.2f}"
        except ValueError:
            return False, "Invalid quantity value."
        except sqlite3.Error as e:
            self.conn.rollback()
            return False, f"Database error during transaction: {e}"

    def get_sales_history(self):
        """Get complete sales history joined with product details and user details."""
        try:
            self.cursor.execute("""
                SELECT s.id, p.name, s.quantity, s.total_price, s.date, u.username
                FROM sales s
                LEFT JOIN products p ON s.product_id = p.id
                LEFT JOIN users u ON s.user_id = u.id
                ORDER BY s.date DESC
            """)
            return self.cursor.fetchall()
        except sqlite3.Error as e:
            print(f"Database error: {e}")
            return []

    # ================= REPORTING & ANALYTICS =================

    def get_low_stock_products(self):
        """Get products that are below their minimum stock level."""
        try:
            self.cursor.execute("SELECT id, name, category, quantity, min_stock FROM products WHERE quantity <= min_stock")
            return self.cursor.fetchall()
        except sqlite3.Error as e:
            print(f"Database error: {e}")
            return []

    def get_sales_summary(self):
        """Get aggregated sales summary stats."""
        try:
            self.cursor.execute("SELECT SUM(total_price), SUM(quantity), COUNT(id) FROM sales")
            stats = self.cursor.fetchone()
            total_revenue = stats[0] if stats[0] is not None else 0.0
            total_units = stats[1] if stats[1] is not None else 0
            total_transactions = stats[2] if stats[2] is not None else 0
            
            self.cursor.execute("SELECT COUNT(*) FROM products")
            total_products = self.cursor.fetchone()[0]

            return {
                "revenue": total_revenue,
                "units_sold": total_units,
                "transactions": total_transactions,
                "total_products": total_products
            }
        except sqlite3.Error as e:
            print(f"Database error: {e}")
            return {"revenue": 0.0, "units_sold": 0, "transactions": 0, "total_products": 0}

    def get_category_sales(self):
        """Get total sales amount per category for chart rendering."""
        try:
            self.cursor.execute("""
                SELECT p.category, SUM(s.total_price)
                FROM sales s
                JOIN products p ON s.product_id = p.id
                GROUP BY p.category
                ORDER BY SUM(s.total_price) DESC
            """)
            return self.cursor.fetchall()
        except sqlite3.Error as e:
            print(f"Database error: {e}")
            return []
