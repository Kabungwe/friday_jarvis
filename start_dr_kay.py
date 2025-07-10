#!/usr/bin/env python3
"""
Dr. Kay - AI Medical Tutor Startup Script
Handles initialization, configuration validation, and startup procedures
"""

import os
import sys
import subprocess
import platform
from pathlib import Path
import argparse

def print_banner():
    """Display Dr. Kay startup banner"""
    banner = """
    ╔══════════════════════════════════════════════════════════════╗
    ║                    🩺 Dr. Kay - AI Medical Tutor             ║
    ║                                                              ║
    ║         AI-powered voice and video medical education         ║
    ║              Built with LiveKit WebRTC & FastAPI            ║
    ╚══════════════════════════════════════════════════════════════╝
    """
    print(banner)

def check_python_version():
    """Check if Python version is compatible"""
    if sys.version_info < (3, 8):
        print("❌ Error: Python 3.8 or higher is required")
        print(f"Current version: {platform.python_version()}")
        sys.exit(1)
    else:
        print(f"✅ Python {platform.python_version()} - Compatible")

def check_dependencies():
    """Check if required dependencies are installed"""
    required_packages = [
        'fastapi',
        'uvicorn', 
        'livekit-agents',
        'python-dotenv'
    ]
    
    missing_packages = []
    
    for package in required_packages:
        try:
            __import__(package.replace('-', '_'))
            print(f"✅ {package} - Installed")
        except ImportError:
            missing_packages.append(package)
            print(f"❌ {package} - Missing")
    
    if missing_packages:
        print(f"\n📦 Installing missing packages: {', '.join(missing_packages)}")
        try:
            subprocess.check_call([
                sys.executable, '-m', 'pip', 'install', 
                '--upgrade', *missing_packages
            ])
            print("✅ All dependencies installed successfully")
        except subprocess.CalledProcessError:
            print("❌ Failed to install dependencies")
            print("Please run: pip install -r requirements.txt")
            sys.exit(1)

def check_environment():
    """Check environment configuration"""
    env_file = Path('.env')
    env_example = Path('.env.example')
    
    if not env_file.exists():
        if env_example.exists():
            print("📝 Creating .env file from template...")
            import shutil
            shutil.copy(env_example, env_file)
            print("✅ .env file created")
            print("⚠️  Please edit .env file with your API keys before continuing")
            return False
        else:
            print("❌ No environment configuration found")
            print("Please create a .env file with your configuration")
            return False
    
    # Load and validate environment variables
    from dotenv import load_dotenv
    load_dotenv()
    
    required_vars = {
        'LIVEKIT_URL': 'LiveKit WebSocket URL',
        'LIVEKIT_API_KEY': 'LiveKit API Key',
        'GOOGLE_API_KEY': 'Google AI API Key'
    }
    
    missing_vars = []
    for var, description in required_vars.items():
        value = os.getenv(var)
        if not value or value.startswith('your_'):
            missing_vars.append(f"{var} ({description})")
            print(f"❌ {var} - Not configured")
        else:
            print(f"✅ {var} - Configured")
    
    if missing_vars:
        print("\n⚠️  Missing required environment variables:")
        for var in missing_vars:
            print(f"   - {var}")
        print("\nPlease update your .env file with proper values")
        return False
    
    return True

def create_directories():
    """Create necessary directories"""
    directories = [
        'uploads',
        'logs', 
        'static/uploads',
        'templates'
    ]
    
    for directory in directories:
        Path(directory).mkdir(parents=True, exist_ok=True)
        print(f"✅ Directory created: {directory}")

def check_ports():
    """Check if required ports are available"""
    import socket
    
    ports_to_check = [8000]  # Default Dr. Kay port
    
    for port in ports_to_check:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        result = sock.connect_ex(('localhost', port))
        sock.close()
        
        if result == 0:
            print(f"⚠️  Port {port} is already in use")
            return False
        else:
            print(f"✅ Port {port} is available")
    
    return True

def start_application(args):
    """Start the Dr. Kay application"""
    print("\n🚀 Starting Dr. Kay...")
    
    try:
        if args.docker:
            print("🐳 Starting with Docker...")
            subprocess.run(['docker-compose', 'up', '-d'], check=True)
            print("✅ Dr. Kay started successfully with Docker")
            print("🌐 Access at: http://localhost:8000")
        else:
            print("🐍 Starting with Python...")
            
            # Start the web server
            env = os.environ.copy()
            env['PYTHONPATH'] = str(Path.cwd())
            
            if args.debug:
                env['DEBUG'] = 'true'
                print("🔍 Debug mode enabled")
            
            if args.port:
                env['PORT'] = str(args.port)
                port = args.port
            else:
                port = int(os.getenv('PORT', 8000))
            
            print(f"🌐 Starting server on http://localhost:{port}")
            print("✨ Dr. Kay is ready for medical education!")
            print("\n📋 Quick Commands:")
            print("   • Ctrl+C - Stop the server")
            print("   • Ctrl+K - Activate Dr. Kay (in browser)")
            print("   • F1 - Help & Instructions (in browser)")
            
            # Run the web server
            subprocess.run([
                sys.executable, 'web_server.py'
            ], env=env)
            
    except KeyboardInterrupt:
        print("\n👋 Dr. Kay stopped by user")
    except subprocess.CalledProcessError as e:
        print(f"❌ Error starting Dr. Kay: {e}")
        sys.exit(1)
    except FileNotFoundError:
        print("❌ web_server.py not found")
        print("Please ensure you're in the correct directory")
        sys.exit(1)

def main():
    """Main startup function"""
    parser = argparse.ArgumentParser(description='Dr. Kay - AI Medical Tutor Startup')
    parser.add_argument('--docker', action='store_true', help='Start with Docker')
    parser.add_argument('--debug', action='store_true', help='Enable debug mode')
    parser.add_argument('--port', type=int, help='Specify port number')
    parser.add_argument('--skip-checks', action='store_true', help='Skip environment checks')
    
    args = parser.parse_args()
    
    print_banner()
    
    if not args.skip_checks:
        print("🔍 Performing startup checks...\n")
        
        # System checks
        check_python_version()
        check_dependencies()
        
        # Environment checks
        if not check_environment():
            print("\n💡 Setup Tips:")
            print("   1. Get LiveKit credentials: https://livekit.io")
            print("   2. Get Google AI API key: https://ai.google.dev")
            print("   3. Update .env file with your keys")
            print("   4. Run this script again")
            sys.exit(1)
        
        # Infrastructure checks
        create_directories()
        
        if not check_ports():
            print("⚠️  Some ports are in use. The application may fail to start.")
            response = input("Continue anyway? (y/N): ").lower()
            if response != 'y':
                sys.exit(1)
        
        print("\n✅ All checks passed!")
    
    # Start the application
    start_application(args)

if __name__ == "__main__":
    main()