import sys
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
    main()
