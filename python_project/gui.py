import tkinter as tk
from tkinter import messagebox, ttk
import customtkinter as ctk
import csv
import os
from datetime import datetime

# Import database and authenticator
from database import Database
from auth import Authenticator

# Configure CustomTkinter appearance
ctk.set_appearance_mode("Dark")  # Modes: "System" (standard), "Dark", "Light"
ctk.set_default_color_theme("blue")  # Themes: "blue", "green", "dark-blue"

class App(ctk.CTk):
    """
    Main Application class.
    Coordinates database connection, authenticator instance, window lifecycle, and frames switching.
    """
    def __init__(self):
        super().__init__()

        # Window Settings
        self.title("Python The World - Modern Inventory & Sales Manager")
        self.geometry("1100x680")
        self.minsize(950, 600)

        # Initialize SQLite database and authentication controller
        self.db = Database()
        self.auth = Authenticator(self.db)
        
        # User session container
        self.current_user = None

        # Base Container Frame where all screens reside
        self.container = ctk.CTkFrame(self)
        self.container.pack(side="top", fill="both", expand=True)
        self.container.grid_rowconfigure(0, weight=1)
        self.container.grid_columnconfigure(0, weight=1)

        # Dictionary of instantiated screen frames
        self.frames = {}
        
        # Start at the Login Screen
        self.show_frame("LoginFrame")

    def show_frame(self, frame_class_name):
        """Switches the display to the specified frame class name, destroying previous instances if needed."""
        # Clean existing frame of the same name to prevent stale user state
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
        """Session initializer called upon successful authentication."""
        self.current_user = user_info
        messagebox.showinfo("Login Success", f"Welcome back, {user_info['username']} ({user_info['role']})!")
        self.show_frame("DashboardFrame")

    def logout(self):
        """Session destruction and return to login panel."""
        if messagebox.askyesno("Logout", "Are you sure you want to log out?"):
            self.current_user = None
            self.show_frame("LoginFrame")


# =========================================================================
# LOGIN PANEL
# =========================================================================
class LoginFrame(ctk.CTkFrame):
    def __init__(self, parent, controller):
        super().__init__(parent)
        self.controller = controller

        # Center layout helper frame
        self.grid_rowconfigure(0, weight=1)
        self.grid_columnconfigure(0, weight=1)

        card = ctk.CTkFrame(self, width=400, height=500, corner_radius=15, border_width=1, border_color="#3B3B3B")
        card.grid(row=0, column=0, padx=20, pady=20)
        card.grid_propagate(False)

        # Title Block
        title_label = ctk.CTkLabel(card, text="Python The World", font=ctk.CTkFont(size=28, weight="bold"))
        title_label.pack(pady=(40, 5))
        subtitle_label = ctk.CTkLabel(card, text="Inventory & Sales Portal", text_color="gray", font=ctk.CTkFont(size=13))
        subtitle_label.pack(pady=(0, 30))

        # Inputs
        self.username_entry = ctk.CTkEntry(card, placeholder_text="Username", width=280, height=45, corner_radius=8)
        self.username_entry.pack(pady=12)

        self.password_entry = ctk.CTkEntry(card, placeholder_text="Password", show="*", width=280, height=45, corner_radius=8)
        self.password_entry.pack(pady=12)

        # Action Button
        login_btn = ctk.CTkButton(card, text="Login Securely", command=self.handle_login, width=280, height=45, corner_radius=8, font=ctk.CTkFont(weight="bold"))
        login_btn.pack(pady=(25, 15))

        # Switch screen link
        signup_link = ctk.CTkButton(card, text="Don't have an account? Sign Up", text_color="#1F6AA5", fg_color="transparent", hover=False, command=lambda: controller.show_frame("SignupFrame"))
        signup_link.pack()

    def handle_login(self):
        username = self.username_entry.get()
        password = self.password_entry.get()

        success, result = self.controller.auth.login(username, password)
        if success:
            self.controller.on_login_success(result)
        else:
            messagebox.showerror("Authentication Failed", result)


# =========================================================================
# REGISTRATION PANEL
# =========================================================================
class SignupFrame(ctk.CTkFrame):
    def __init__(self, parent, controller):
        super().__init__(parent)
        self.controller = controller

        self.grid_rowconfigure(0, weight=1)
        self.grid_columnconfigure(0, weight=1)

        card = ctk.CTkFrame(self, width=420, height=550, corner_radius=15, border_width=1, border_color="#3B3B3B")
        card.grid(row=0, column=0, padx=20, pady=20)
        card.grid_propagate(False)

        # Header
        title_label = ctk.CTkLabel(card, text="Create Account", font=ctk.CTkFont(size=26, weight="bold"))
        title_label.pack(pady=(35, 5))
        subtitle_label = ctk.CTkLabel(card, text="Sign up to access administrative controls", text_color="gray", font=ctk.CTkFont(size=12))
        subtitle_label.pack(pady=(0, 25))

        # Entries
        self.username_entry = ctk.CTkEntry(card, placeholder_text="Username", width=300, height=40, corner_radius=8)
        self.username_entry.pack(pady=8)

        self.password_entry = ctk.CTkEntry(card, placeholder_text="Password (Min 6 characters)", show="*", width=300, height=40, corner_radius=8)
        self.password_entry.pack(pady=8)

        self.confirm_password_entry = ctk.CTkEntry(card, placeholder_text="Confirm Password", show="*", width=300, height=40, corner_radius=8)
        self.confirm_password_entry.pack(pady=8)

        # Role Selector (only allowed to set as Admin or Staff)
        role_label = ctk.CTkLabel(card, text="Select Role:", font=ctk.CTkFont(size=12), text_color="gray")
        role_label.pack(pady=(5, 0), anchor="w", padx=60)
        self.role_combobox = ctk.CTkComboBox(card, values=["Staff", "Admin"], width=300, height=40, corner_radius=8)
        self.role_combobox.pack(pady=4)

        # Submit
        signup_btn = ctk.CTkButton(card, text="Register User", command=self.handle_signup, width=300, height=45, corner_radius=8, font=ctk.CTkFont(weight="bold"), fg_color="#2E7D32", hover_color="#1B5E20")
        signup_btn.pack(pady=(20, 15))

        login_link = ctk.CTkButton(card, text="Already registered? Log In", text_color="#1F6AA5", fg_color="transparent", hover=False, command=lambda: controller.show_frame("LoginFrame"))
        login_link.pack()

    def handle_signup(self):
        username = self.username_entry.get()
        password = self.password_entry.get()
        confirm_pwd = self.confirm_password_entry.get()
        role = self.role_combobox.get()

        success, result_message = self.controller.auth.register(username, password, confirm_pwd, role)
        if success:
            messagebox.showinfo("Success", "Account created successfully! You can now log in.")
            self.controller.show_frame("LoginFrame")
        else:
            messagebox.showerror("Registration Error", result_message)


# =========================================================================
# CORE APPLICATION DASHBOARD (MULTIPLE VIEWS IN A SIDEBAR TABS LAYOUT)
# =========================================================================
class DashboardFrame(ctk.CTkFrame):
    def __init__(self, parent, controller):
        super().__init__(parent)
        self.controller = controller
        
        # Configure layout: Sidebar + Core View Area
        self.grid_rowconfigure(0, weight=1)
        self.grid_columnconfigure(0, weight=2)  # Sidebar (weight 2)
        self.grid_columnconfigure(1, weight=10) # Content (weight 10)

        # Sidebar Panel
        self.sidebar = ctk.CTkFrame(self, corner_radius=0, border_width=1, border_color="#2B2B2B")
        self.sidebar.grid(row=0, column=0, sticky="nsew")
        self.sidebar.grid_rowconfigure(7, weight=1) # Spacer row

        # Brand Logo Section
        self.brand_label = ctk.CTkLabel(self.sidebar, text="Python The World", font=ctk.CTkFont(size=22, weight="bold"))
        self.brand_label.grid(row=0, column=0, padx=20, pady=(25, 5))
        self.user_badge = ctk.CTkLabel(
            self.sidebar, 
            text=f"● {controller.current_user['username']} ({controller.current_user['role']})", 
            text_color="#4CAF50" if controller.current_user['role'] == "Admin" else "#2196F3",
            font=ctk.CTkFont(size=12, weight="bold")
        )
        self.user_badge.grid(row=1, column=0, padx=20, pady=(0, 25))

        # Tab Navigation Buttons
        self.tab_buttons = {}
        tabs = [
            ("Inventory", "inventory_tab"),
            ("Record Sale", "sales_tab"),
            ("Sales History", "history_tab"),
            ("Analytics Reports", "reports_tab")
        ]

        for idx, (tab_name, tab_id) in enumerate(tabs):
            btn = ctk.CTkButton(
                self.sidebar, 
                text=tab_name, 
                fg_color="transparent", 
                text_color="white",
                anchor="w",
                height=40,
                corner_radius=6,
                hover_color="#2B2B2B",
                command=lambda tid=tab_id: self.switch_tab(tid)
            )
            btn.grid(row=idx + 2, column=0, padx=15, pady=6, sticky="ew")
            self.tab_buttons[tab_id] = btn

        # Logout at bottom
        self.logout_btn = ctk.CTkButton(
            self.sidebar, 
            text="Sign Out", 
            fg_color="#C62828", 
            hover_color="#B71C1C", 
            command=controller.logout,
            height=38,
            corner_radius=6,
            font=ctk.CTkFont(weight="bold")
        )
        self.logout_btn.grid(row=8, column=0, padx=20, pady=25, sticky="ew")

        # Container for sub-tabs
        self.content_container = ctk.CTkFrame(self, fg_color="transparent")
        self.content_container.grid(row=0, column=1, sticky="nsew", padx=20, pady=20)
        self.content_container.grid_rowconfigure(0, weight=1)
        self.content_container.grid_columnconfigure(0, weight=1)

        self.current_tab = None
        self.switch_tab("inventory_tab")

    def switch_tab(self, tab_id):
        """Toggle frame tab content area."""
        # Highlight current navigation button
        for tid, btn in self.tab_buttons.items():
            if tid == tab_id:
                btn.configure(fg_color="#1F6AA5", text_color="white")
            else:
                btn.configure(fg_color="transparent", text_color="white")

        # Clean existing tab
        if self.current_tab:
            self.current_tab.destroy()

        # Instantiate new tab view
        if tab_id == "inventory_tab":
            self.current_tab = InventoryTab(self.content_container, self.controller)
        elif tab_id == "sales_tab":
            self.current_tab = SalesTab(self.content_container, self.controller)
        elif tab_id == "history_tab":
            self.current_tab = HistoryTab(self.content_container, self.controller)
        elif tab_id == "reports_tab":
            self.current_tab = ReportsTab(self.content_container, self.controller)

        self.current_tab.grid(row=0, column=0, sticky="nsew")


# =========================================================================
# TAB VIEW: INVENTORY MANAGEMENT
# =========================================================================
class InventoryTab(ctk.CTkFrame):
    def __init__(self, parent, controller):
        super().__init__(parent, fg_color="transparent")
        self.controller = controller
        self.db = controller.db

        self.grid_rowconfigure(1, weight=1)
        self.grid_columnconfigure(0, weight=7) # Products Table side
        self.grid_columnconfigure(1, weight=3) # Product Form side

        # --- TOP HEADER & SEARCH ---
        top_bar = ctk.CTkFrame(self, height=60, fg_color="transparent")
        top_bar.grid(row=0, column=0, columnspan=2, sticky="ew", pady=(0, 15))

        title = ctk.CTkLabel(top_bar, text="Inventory Registry", font=ctk.CTkFont(size=20, weight="bold"))
        title.pack(side="left", padx=5)

        self.search_entry = ctk.CTkEntry(top_bar, placeholder_text="Search items...", width=200)
        self.search_entry.pack(side="left", padx=(30, 10))
        # Bind keyboard search input
        self.search_entry.bind("<KeyRelease>", lambda e: self.load_products_data())

        self.category_filter = ctk.CTkComboBox(top_bar, values=["All"], width=130, command=lambda v: self.load_products_data())
        self.category_filter.pack(side="left", padx=5)

        export_btn = ctk.CTkButton(top_bar, text="Export CSV", fg_color="#37474F", hover_color="#263238", command=self.export_to_csv, width=100)
        export_btn.pack(side="right", padx=5)

        # --- LEFT SIDE: PRODUCTS TABLE ---
        table_frame = ctk.CTkFrame(self)
        table_frame.grid(row=1, column=0, sticky="nsew", padx=(0, 10))
        table_frame.grid_rowconfigure(0, weight=1)
        table_frame.grid_columnconfigure(0, weight=1)

        # Use modern styled ttk Treeview for data listing
        style = ttk.Style()
        style.theme_use("clam")
        style.configure("Treeview", 
                        background="#212121", 
                        foreground="white", 
                        fieldbackground="#212121", 
                        rowheight=28,
                        borderwidth=0)
        style.map("Treeview", background=[("selected", "#1F6AA5")])
        style.configure("Treeview.Heading", background="#2B2B2B", foreground="white", font=('Helvetica', 10, 'bold'), borderwidth=0)

        cols = ("ID", "Name", "Category", "Qty", "Price", "Min Stock")
        self.tree = ttk.Treeview(table_frame, columns=cols, show="headings", selectmode="browse")
        
        widths = { "ID": 40, "Name": 180, "Category": 100, "Qty": 60, "Price": 70, "Min Stock": 80 }
        for col in cols:
            self.tree.heading(col, text=col)
            self.tree.column(col, width=widths[col], anchor="center" if col != "Name" else "w")

        self.tree.grid(row=0, column=0, sticky="nsew")
        
        # Scrollbar
        scrollbar = ttk.Scrollbar(table_frame, orient="vertical", command=self.tree.yview)
        self.tree.configure(yscrollcommand=scrollbar.set)
        scrollbar.grid(row=0, column=1, sticky="ns")

        self.tree.bind("<<TreeviewSelect>>", self.on_product_select)

        # --- RIGHT SIDE: INPUT FORM ---
        self.form_frame = ctk.CTkFrame(self, border_width=1, border_color="#3B3B3B")
        self.form_frame.grid(row=1, column=1, sticky="nsew", padx=(10, 0))
        
        form_title = ctk.CTkLabel(self.form_frame, text="Product Editor", font=ctk.CTkFont(size=15, weight="bold"))
        form_title.pack(pady=15)

        self.prod_id_label = ctk.CTkLabel(self.form_frame, text="Product ID: [New Item]", text_color="gray", font=ctk.CTkFont(size=12))
        self.prod_id_label.pack(pady=(0, 10))

        self.prod_name_entry = ctk.CTkEntry(self.form_frame, placeholder_text="Product Name", width=200)
        self.prod_name_entry.pack(pady=8)

        self.prod_cat_entry = ctk.CTkEntry(self.form_frame, placeholder_text="Category", width=200)
        self.prod_cat_entry.pack(pady=8)

        self.prod_qty_entry = ctk.CTkEntry(self.form_frame, placeholder_text="Quantity in Stock", width=200)
        self.prod_qty_entry.pack(pady=8)

        self.prod_price_entry = ctk.CTkEntry(self.form_frame, placeholder_text="Price per Unit", width=200)
        self.prod_price_entry.pack(pady=8)

        self.prod_min_entry = ctk.CTkEntry(self.form_frame, placeholder_text="Minimum Alert Level", width=200)
        self.prod_min_entry.pack(pady=8)

        # Action Buttons
        btn_frame = ctk.CTkFrame(self.form_frame, fg_color="transparent")
        btn_frame.pack(pady=15)

        self.save_btn = ctk.CTkButton(btn_frame, text="Add / Save", command=self.save_product, width=90, fg_color="#2E7D32", hover_color="#1B5E20")
        self.save_btn.grid(row=0, column=0, padx=5)

        self.clear_btn = ctk.CTkButton(btn_frame, text="Clear", command=self.clear_form, width=90, fg_color="#555555", hover_color="#333333")
        self.clear_btn.grid(row=0, column=1, padx=5)

        # Delete Action
        self.delete_btn = ctk.CTkButton(self.form_frame, text="Delete Product", command=self.delete_product, fg_color="#C62828", hover_color="#B71C1C", width=190)
        self.delete_btn.pack(pady=(5, 10))
        self.delete_btn.configure(state="disabled")

        # Load initial view data
        self.load_categories()
        self.load_products_data()

    def load_categories(self):
        """Fetch categories for combobox filter options."""
        categories = ["All"] + self.db.get_categories()
        self.category_filter.configure(values=categories)
        self.category_filter.set("All")

    def load_products_data(self):
        """Retrieve and print records onto UI Treeview."""
        # Clear existing table content
        for i in self.tree.get_children():
            self.tree.delete(i)

        search_query = self.search_entry.get()
        category_sel = self.category_filter.get()

        products = self.db.search_products(search_query, category_sel)
        for p in products:
            # Mark row yellow/red if product is low stock
            self.tree.insert("", "end", values=p)

    def on_product_select(self, event):
        """Populate the editor form when a row is clicked."""
        selected = self.tree.selection()
        if not selected:
            return

        values = self.tree.item(selected[0], "values")
        if values:
            self.prod_id_label.configure(text=f"Product ID: {values[0]}")
            self.prod_name_entry.delete(0, tk.END)
            self.prod_name_entry.insert(0, values[1])
            
            self.prod_cat_entry.delete(0, tk.END)
            self.prod_cat_entry.insert(0, values[2])
            
            self.prod_qty_entry.delete(0, tk.END)
            self.prod_qty_entry.insert(0, values[3])
            
            self.prod_price_entry.delete(0, tk.END)
            self.prod_price_entry.insert(0, values[4])
            
            self.prod_min_entry.delete(0, tk.END)
            self.prod_min_entry.insert(0, values[5])

            self.delete_btn.configure(state="normal")

    def clear_form(self):
        """Reset inputs."""
        self.prod_id_label.configure(text="Product ID: [New Item]")
        self.prod_name_entry.delete(0, tk.END)
        self.prod_cat_entry.delete(0, tk.END)
        self.prod_qty_entry.delete(0, tk.END)
        self.prod_price_entry.delete(0, tk.END)
        self.prod_min_entry.delete(0, tk.END)
        self.tree.selection_remove(self.tree.selection())
        self.delete_btn.configure(state="disabled")

    def save_product(self):
        """Validate, save new products, or update existing ones."""
        name = self.prod_name_entry.get()
        category = self.prod_cat_entry.get()
        quantity = self.prod_qty_entry.get()
        price = self.prod_price_entry.get()
        min_stock = self.prod_min_entry.get()

        if not name or not category or not quantity or not price:
            messagebox.showerror("Validation Error", "All fields except Min Stock are mandatory.")
            return

        if not min_stock:
            min_stock = 5

        # Try to identify if editing or creating
        title_text = self.prod_id_label.cget("text")
        
        if "New Item" in title_text:
            # Create
            success, message = self.db.add_product(name, category, quantity, price, min_stock)
        else:
            # Edit
            prod_id = title_text.replace("Product ID: ", "")
            success, message = self.db.update_product(prod_id, name, category, quantity, price, min_stock)

        if success:
            messagebox.showinfo("Success", message)
            self.clear_form()
            self.load_categories()
            self.load_products_data()
        else:
            messagebox.showerror("Error", message)

    def delete_product(self):
        """Remove a selected product."""
        title_text = self.prod_id_label.cget("text")
        if "New Item" in title_text:
            return

        prod_id = title_text.replace("Product ID: ", "")
        
        # Admin restriction check
        if self.controller.current_user['role'] != "Admin":
            messagebox.showerror("Authorization Error", "Only Admin users are permitted to delete inventory stock!")
            return

        if messagebox.askyesno("Confirm Delete", "Are you sure you want to permanently delete this product?"):
            success, message = self.db.delete_product(prod_id)
            if success:
                messagebox.showinfo("Deleted", message)
                self.clear_form()
                self.load_categories()
                self.load_products_data()
            else:
                messagebox.showerror("Error", message)

    def export_to_csv(self):
        """Export full inventory table to local CSV file."""
        try:
            filename = f"inventory_export_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
            products = self.db.get_all_products()
            
            with open(filename, 'w', newline='', encoding='utf-8') as f:
                writer = csv.writer(f)
                writer.writerow(["Product ID", "Product Name", "Category", "Stock Quantity", "Price", "Min Alert Quantity"])
                writer.writerows(products)
                
            messagebox.showinfo("Export Successful", f"Inventory exported safely to '{filename}'")
        except Exception as e:
            messagebox.showerror("Export Failed", f"An error occurred: {e}")


# =========================================================================
# TAB VIEW: RECORD SALES TRANSACTIONS
# =========================================================================
class SalesTab(ctk.CTkFrame):
    def __init__(self, parent, controller):
        super().__init__(parent, fg_color="transparent")
        self.controller = controller
        self.db = controller.db

        self.grid_rowconfigure(0, weight=1)
        self.grid_columnconfigure(0, weight=6) # Select panel
        self.grid_columnconfigure(1, weight=4) # Checkout panel

        # --- LEFT PANEL: PRODUCT SELECTOR ---
        left_frame = ctk.CTkFrame(self)
        left_frame.grid(row=0, column=0, sticky="nsew", padx=(0, 10))
        left_frame.grid_rowconfigure(1, weight=1)
        left_frame.grid_columnconfigure(0, weight=1)

        header_lbl = ctk.CTkLabel(left_frame, text="Select Item to Sell", font=ctk.CTkFont(size=18, weight="bold"))
        header_lbl.grid(row=0, column=0, sticky="w", padx=15, pady=15)

        # List treeview
        cols = ("ID", "Name", "Category", "Available Qty", "Price")
        self.tree = ttk.Treeview(left_frame, columns=cols, show="headings", selectmode="browse")
        
        widths = { "ID": 40, "Name": 180, "Category": 100, "Available Qty": 100, "Price": 80 }
        for col in cols:
            self.tree.heading(col, text=col)
            self.tree.column(col, width=widths[col], anchor="center" if col != "Name" else "w")

        self.tree.grid(row=1, column=0, sticky="nsew", padx=15, pady=(0, 15))
        
        scrollbar = ttk.Scrollbar(left_frame, orient="vertical", command=self.tree.yview)
        self.tree.configure(yscrollcommand=scrollbar.set)
        scrollbar.grid(row=1, column=1, sticky="ns", pady=(0, 15))

        self.tree.bind("<<TreeviewSelect>>", self.on_product_select)

        # --- RIGHT PANEL: CHECKOUT FORM ---
        self.checkout_frame = ctk.CTkFrame(self, border_width=1, border_color="#3B3B3B")
        self.checkout_frame.grid(row=0, column=1, sticky="nsew", padx=(10, 0))

        checkout_title = ctk.CTkLabel(self.checkout_frame, text="Sales Receipt", font=ctk.CTkFont(size=18, weight="bold"))
        checkout_title.pack(pady=20)

        self.selected_name_lbl = ctk.CTkLabel(self.checkout_frame, text="No Product Selected", font=ctk.CTkFont(size=15, weight="bold"), text_color="orange")
        self.selected_name_lbl.pack(pady=10)

        self.price_lbl = ctk.CTkLabel(self.checkout_frame, text="Unit Price: $0.00", font=ctk.CTkFont(size=13))
        self.price_lbl.pack(pady=5)

        self.stock_lbl = ctk.CTkLabel(self.checkout_frame, text="Available Stock: 0", font=ctk.CTkFont(size=13))
        self.stock_lbl.pack(pady=5)

        # Quantity Entry
        qty_lbl = ctk.CTkLabel(self.checkout_frame, text="Quantity to Sell:", text_color="gray")
        qty_lbl.pack(pady=(20, 5))

        self.qty_entry = ctk.CTkEntry(self.checkout_frame, placeholder_text="0", width=120, height=35, justify="center")
        self.qty_entry.pack()
        self.qty_entry.bind("<KeyRelease>", lambda e: self.update_total())

        # Total Price Label
        self.total_lbl = ctk.CTkLabel(self.checkout_frame, text="Total Price: $0.00", font=ctk.CTkFont(size=20, weight="bold"), text_color="#4CAF50")
        self.total_lbl.pack(pady=30)

        # Record Sale Button
        self.sell_btn = ctk.CTkButton(
            self.checkout_frame, 
            text="Confirm Sale & Print", 
            command=self.execute_sale, 
            width=200, 
            height=45, 
            corner_radius=8, 
            fg_color="#2E7D32", 
            hover_color="#1B5E20",
            font=ctk.CTkFont(weight="bold")
        )
        self.sell_btn.pack(pady=10)
        self.sell_btn.configure(state="disabled")

        self.selected_product = None
        self.load_products()

    def load_products(self):
        """Fetch clean items from DB."""
        for i in self.tree.get_children():
            self.tree.delete(i)
        
        products = self.db.get_all_products()
        for p in products:
            # values: (id, name, category, quantity, price, min_stock)
            # format columns: ID, Name, Category, Available Qty, Price
            self.tree.insert("", "end", values=(p[0], p[1], p[2], p[3], f"${p[4]:.2f}"))

    def on_product_select(self, event):
        """Handler for clicking items to prepare receipt."""
        selected = self.tree.selection()
        if not selected:
            return

        values = self.tree.item(selected[0], "values")
        if values:
            prod_id = values[0]
            name = values[1]
            category = values[2]
            qty = int(values[3])
            price = float(values[4].replace("$", ""))

            self.selected_product = {
                "id": prod_id,
                "name": name,
                "stock": qty,
                "price": price
            }

            self.selected_name_lbl.configure(text=name, text_color="white")
            self.price_lbl.configure(text=f"Unit Price: ${price:.2f}")
            self.stock_lbl.configure(text=f"Available Stock: {qty}")
            self.qty_entry.delete(0, tk.END)
            self.qty_entry.insert(0, "1")
            
            self.update_total()
            self.sell_btn.configure(state="normal" if qty > 0 else "disabled")

    def update_total(self):
        """Calculate live pricing totals based on input."""
        if not self.selected_product:
            return

        qty_str = self.qty_entry.get().strip()
        if not qty_str:
            self.total_lbl.configure(text="Total Price: $0.00")
            return

        try:
            qty = int(qty_str)
            if qty <= 0:
                self.total_lbl.configure(text="Total Price: $0.00")
                return
                
            total = self.selected_product["price"] * qty
            self.total_lbl.configure(text=f"Total Price: ${total:.2f}")
        except ValueError:
            self.total_lbl.configure(text="Total Price: $0.00")

    def execute_sale(self):
        """Commit invoice and subtract database stock levels."""
        if not self.selected_product:
            return

        qty_str = self.qty_entry.get().strip()
        if not qty_str:
            messagebox.showerror("Error", "Please input an export quantity.")
            return

        try:
            qty = int(qty_str)
            if qty <= 0:
                messagebox.showerror("Error", "Quantity must be greater than zero.")
                return

            if qty > self.selected_product["stock"]:
                messagebox.showerror("Insufficient Stock", f"Only {self.selected_product['stock']} units available.")
                return

            # Execute database record
            user_id = self.controller.current_user["id"]
            success, message = self.db.record_sale(self.selected_product["id"], qty, user_id)

            if success:
                messagebox.showinfo("Transaction Recorded", message)
                self.reset_checkout()
                self.load_products()
            else:
                messagebox.showerror("Error", message)

        except ValueError:
            messagebox.showerror("Error", "Quantity must be a valid integer.")

    def reset_checkout(self):
        """Revert states."""
        self.selected_product = None
        self.selected_name_lbl.configure(text="No Product Selected", text_color="orange")
        self.price_lbl.configure(text="Unit Price: $0.00")
        self.stock_lbl.configure(text="Available Stock: 0")
        self.qty_entry.delete(0, tk.END)
        self.total_lbl.configure(text="Total Price: $0.00")
        self.sell_btn.configure(state="disabled")


# =========================================================================
# TAB VIEW: TRANSACTION HISTORY LOGGER
# =========================================================================
class HistoryTab(ctk.CTkFrame):
    def __init__(self, parent, controller):
        super().__init__(parent, fg_color="transparent")
        self.controller = controller
        self.db = controller.db

        self.grid_rowconfigure(1, weight=1)
        self.grid_columnconfigure(0, weight=1)

        # --- HEADER ---
        top_bar = ctk.CTkFrame(self, fg_color="transparent")
        top_bar.grid(row=0, column=0, sticky="ew", pady=(0, 15))

        title = ctk.CTkLabel(top_bar, text="Sales Ledger Log", font=ctk.CTkFont(size=20, weight="bold"))
        title.pack(side="left", padx=5)

        export_btn = ctk.CTkButton(top_bar, text="Export Audit Log", fg_color="#37474F", hover_color="#263238", command=self.export_sales_log)
        export_btn.pack(side="right", padx=5)

        # --- LEDGER LIST ---
        table_frame = ctk.CTkFrame(self)
        table_frame.grid(row=1, column=0, sticky="nsew")
        table_frame.grid_rowconfigure(0, weight=1)
        table_frame.grid_columnconfigure(0, weight=1)

        cols = ("Tx ID", "Product Name", "Units Sold", "Revenue Received", "Date Timestamp", "Processed By")
        self.tree = ttk.Treeview(table_frame, columns=cols, show="headings")
        
        widths = { "Tx ID": 60, "Product Name": 200, "Units Sold": 90, "Revenue Received": 120, "Date Timestamp": 180, "Processed By": 110 }
        for col in cols:
            self.tree.heading(col, text=col)
            self.tree.column(col, width=widths[col], anchor="center" if col not in ["Product Name", "Date Timestamp"] else "w")

        self.tree.grid(row=0, column=0, sticky="nsew")

        scrollbar = ttk.Scrollbar(table_frame, orient="vertical", command=self.tree.yview)
        self.tree.configure(yscrollcommand=scrollbar.set)
        scrollbar.grid(row=0, column=1, sticky="ns")

        self.load_sales()

    def load_sales(self):
        """Fetch audit transactions lists."""
        for i in self.tree.get_children():
            self.tree.delete(i)

        sales = self.db.get_sales_history()
        for s in sales:
            # s values: (id, product_name, quantity, total_price, date, username)
            self.tree.insert("", "end", values=(s[0], s[1] or "Deleted Product", s[2], f"${s[3]:.2f}", s[4], s[5] or "System"))

    def export_sales_log(self):
        """Export sales log directly to a physical local CSV file."""
        try:
            filename = f"sales_ledger_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
            sales = self.db.get_sales_history()
            
            with open(filename, 'w', newline='', encoding='utf-8') as f:
                writer = csv.writer(f)
                writer.writerow(["Transaction ID", "Product Name", "Units Sold", "Total Revenue", "Date Timestamp", "Processed By Username"])
                for s in sales:
                    writer.writerow([s[0], s[1] or "Deleted Product", s[2], f"${s[3]:.2f}", s[4], s[5] or "System"])
                
            messagebox.showinfo("Export Successful", f"Sales ledger exported to '{filename}' successfully!")
        except Exception as e:
            messagebox.showerror("Export Failed", f"An error occurred: {e}")


# =========================================================================
# TAB VIEW: REPORTS & ANALYTICS
# =========================================================================
class ReportsTab(ctk.CTkFrame):
    def __init__(self, parent, controller):
        super().__init__(parent, fg_color="transparent")
        self.controller = controller
        self.db = controller.db

        self.grid_rowconfigure(1, weight=1)
        self.grid_columnconfigure(0, weight=1)

        # --- HEADER ---
        title = ctk.CTkLabel(self, text="Sales & Inventory Dashboard Reports", font=ctk.CTkFont(size=20, weight="bold"))
        title.grid(row=0, column=0, sticky="w", pady=(0, 20))

        # Core container
        container = ctk.CTkScrollableFrame(self, fg_color="transparent")
        container.grid(row=1, column=0, sticky="nsew")
        container.grid_columnconfigure((0, 1, 2, 3), weight=1)

        # Retrieve DB stats
        stats = self.db.get_sales_summary()

        # --- CARD 1: REVENUE ---
        c1 = ctk.CTkFrame(container, height=120, border_width=1, border_color="#3B3B3B")
        c1.grid(row=0, column=0, padx=8, pady=10, sticky="ew")
        c1.grid_propagate(False)
        ctk.CTkLabel(c1, text="TOTAL REVENUE", text_color="gray", font=ctk.CTkFont(size=11, weight="bold")).pack(pady=(15, 5))
        ctk.CTkLabel(c1, text=f"${stats['revenue']:.2f}", text_color="#4CAF50", font=ctk.CTkFont(size=22, weight="bold")).pack()

        # --- CARD 2: UNITS SOLD ---
        c2 = ctk.CTkFrame(container, height=120, border_width=1, border_color="#3B3B3B")
        c2.grid(row=0, column=1, padx=8, pady=10, sticky="ew")
        c2.grid_propagate(False)
        ctk.CTkLabel(c2, text="UNITS SOLD", text_color="gray", font=ctk.CTkFont(size=11, weight="bold")).pack(pady=(15, 5))
        ctk.CTkLabel(c2, text=str(stats['units_sold']), text_color="#FF9800", font=ctk.CTkFont(size=22, weight="bold")).pack()

        # --- CARD 3: TRANSACTIONS ---
        c3 = ctk.CTkFrame(container, height=120, border_width=1, border_color="#3B3B3B")
        c3.grid(row=0, column=2, padx=8, pady=10, sticky="ew")
        c3.grid_propagate(False)
        ctk.CTkLabel(c3, text="TRANSACTIONS", text_color="gray", font=ctk.CTkFont(size=11, weight="bold")).pack(pady=(15, 5))
        ctk.CTkLabel(c3, text=str(stats['transactions']), text_color="#00BCD4", font=ctk.CTkFont(size=22, weight="bold")).pack()

        # --- CARD 4: TOTAL PRODUCTS ---
        c4 = ctk.CTkFrame(container, height=120, border_width=1, border_color="#3B3B3B")
        c4.grid(row=0, column=3, padx=8, pady=10, sticky="ew")
        c4.grid_propagate(False)
        ctk.CTkLabel(c4, text="TOTAL PRODUCTS", text_color="gray", font=ctk.CTkFont(size=11, weight="bold")).pack(pady=(15, 5))
        ctk.CTkLabel(c4, text=str(stats['total_products']), text_color="#9C27B0", font=ctk.CTkFont(size=22, weight="bold")).pack()

        # --- SECOND ROW: LOW STOCK & CATEGORY SPLIT ---
        # Low stock frame
        low_stock_frame = ctk.CTkFrame(container, border_width=1, border_color="#3B3B3B")
        low_stock_frame.grid(row=1, column=0, columnspan=2, padx=8, pady=15, sticky="nsew")
        
        ctk.CTkLabel(low_stock_frame, text="⚠ Low Stock Inventory Alerts", font=ctk.CTkFont(size=14, weight="bold"), text_color="#E53935").pack(pady=10, anchor="w", padx=15)

        low_stock_cols = ("Product Name", "Stock Left", "Min Level")
        lst_tree = ttk.Treeview(low_stock_frame, columns=low_stock_cols, show="headings", height=6)
        for col in low_stock_cols:
            lst_tree.heading(col, text=col)
            lst_tree.column(col, width=120, anchor="center")
        lst_tree.pack(fill="both", expand=True, padx=15, pady=(0, 15))

        # Populate low stock list
        low_items = self.db.get_low_stock_products()
        for item in low_items:
            # item: (id, name, category, quantity, min_stock)
            lst_tree.insert("", "end", values=(item[1], item[3], item[4]))

        # Category sales frame
        cat_frame = ctk.CTkFrame(container, border_width=1, border_color="#3B3B3B")
        cat_frame.grid(row=1, column=2, columnspan=2, padx=8, pady=15, sticky="nsew")
        
        ctk.CTkLabel(cat_frame, text="📊 Sales Share by Category", font=ctk.CTkFont(size=14, weight="bold")).pack(pady=10, anchor="w", padx=15)

        cat_sales = self.db.get_category_sales()
        if not cat_sales:
            ctk.CTkLabel(cat_frame, text="No transactions recorded yet.", text_color="gray").pack(pady=40)
        else:
            cat_cols = ("Category", "Total Sales Revenue")
            cat_tree = ttk.Treeview(cat_frame, columns=cat_cols, show="headings", height=6)
            for col in cat_cols:
                cat_tree.heading(col, text=col)
                cat_tree.column(col, width=130, anchor="center")
            cat_tree.pack(fill="both", expand=True, padx=15, pady=(0, 15))

            for cs in cat_sales:
                cat_tree.insert("", "end", values=(cs[0], f"${cs[1]:.2f}"))
