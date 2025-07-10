#!/usr/bin/env python3
"""
Dr. Kay Startup Script
Automated startup for Dr. Kay AI Medical Tutor with LiveKit validation
"""

import os
import sys
import subprocess
import asyncio
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def print_banner():
    """Display Dr. Kay startup banner"""
    print("""
🩺 ══════════════════════════════════════════════════════════════════════════════════════ 🩺
   ██████╗ ██████╗      ██╗  ██╗ █████╗ ██╗   ██╗
   ██╔══██╗██╔══██╗     ██║ ██╔╝██╔══██╗╚██╗ ██╔╝
   ██║  ██║██████╔╝     █████╔╝ ███████║ ╚████╔╝ 
   ██║  ██║██╔══██╗     ██╔═██╗ ██╔══██║  ╚██╔╝  
   ██████╔╝██║  ██║     ██║  ██╗██║  ██║   ██║   
   ╚═════╝ ╚═╝  ╚═╝     ╚═╝  ╚═╝╚═╝  ╚═╝   ╚═╝   
                                                    
   🎓 AI-Powered Voice & Video Medical Tutor and Educational Assistant
   🌐 Powered by LiveKit WebRTC + Google AI
   🏥 Designed for AllStarMedics.com Integration
🩺 ══════════════════════════════════════════════════════════════════════════════════════ 🩺
""")

def check_environment():
    """Check that all required environment variables are set"""
    print("🔍 Checking Environment Configuration...")
    
    required_vars = {
        'LIVEKIT_URL': os.getenv('LIVEKIT_URL'),
        'LIVEKIT_API_KEY': os.getenv('LIVEKIT_API_KEY'), 
        'LIVEKIT_API_SECRET': os.getenv('LIVEKIT_API_SECRET')
    }
    
    # Check your specific LiveKit credentials
    expected_url = "wss://dr-kay-v1-xwp5fagv.livekit.cloud"
    expected_key = "APIjf3x3Bume4tU"
    
    missing_vars = []
    for var, value in required_vars.items():
        if not value:
            missing_vars.append(var)
            print(f"❌ {var}: Not set")
        elif var == 'LIVEKIT_URL' and value == expected_url:
            print(f"✅ {var}: {value}")
        elif var == 'LIVEKIT_API_KEY' and value == expected_key:
            print(f"✅ {var}: {value}")
        elif var == 'LIVEKIT_API_SECRET':
            print(f"✅ {var}: {value[:10]}...{value[-10:]}")
        else:
            print(f"✅ {var}: {value[:20]}...")
    
    # Check Google AI (optional but recommended)
    google_key = os.getenv('GOOGLE_API_KEY')
    if not google_key or google_key == 'your_google_api_key_here':
        print("⚠️  GOOGLE_API_KEY: Not configured (optional)")
        print("   Get your key from: https://ai.google.dev")
    else:
        print(f"✅ GOOGLE_API_KEY: {google_key[:10]}...")
    
    if missing_vars:
        print(f"\n❌ Missing required environment variables: {missing_vars}")
        print("Please check your .env file and ensure all LiveKit credentials are set")
        return False
    
    print("✅ All required environment variables are configured!")
    return True

def check_dependencies():
    """Check that all required Python packages are installed"""
    print("\n📦 Checking Python Dependencies...")
    
    required_packages = [
        'livekit',
        'livekit-agents', 
        'fastapi',
        'uvicorn',
        'python-dotenv',
        'google-generativeai',
        'Pillow',
        'PyPDF2'
    ]
    
    missing_packages = []
    for package in required_packages:
        try:
            __import__(package.replace('-', '_'))
            print(f"✅ {package}")
        except ImportError:
            missing_packages.append(package)
            print(f"❌ {package}: Not installed")
    
    if missing_packages:
        print(f"\n❌ Missing packages: {missing_packages}")
        print("Installing missing dependencies...")
        try:
            subprocess.check_call([
                sys.executable, "-m", "pip", "install", 
                "--upgrade", *missing_packages
            ])
            print("✅ Dependencies installed successfully!")
            return True
        except subprocess.CalledProcessError:
            print("❌ Failed to install dependencies")
            print("Please run manually: pip install -r requirements.txt")
            return False
    
    print("✅ All dependencies are installed!")
    return True

def create_required_directories():
    """Create required directories for Dr. Kay"""
    print("\n� Creating Required Directories...")
    
    directories = [
        'uploads',
        'logs',
        'static/uploads',
        'templates'
    ]
    
    for directory in directories:
        Path(directory).mkdir(parents=True, exist_ok=True)
        print(f"✅ {directory}/")
    
    print("✅ All directories created!")

async def test_livekit_connection():
    """Test connection to LiveKit server"""
    print("\n🔗 Testing LiveKit Connection...")
    
    try:
        from livekit import api
        
        url = os.getenv('LIVEKIT_URL')
        api_key = os.getenv('LIVEKIT_API_KEY')
        api_secret = os.getenv('LIVEKIT_API_SECRET')
        
        # Create LiveKit API client
        lk_api = api.LiveKitAPI(url, api_key, api_secret)
        
        # Test connection by listing rooms
        rooms = await lk_api.room.list_rooms()
        
        print(f"✅ LiveKit connection successful!")
        print(f"📍 Connected to: {url}")
        print(f"🏠 Active rooms: {len(rooms)}")
        
        return True
        
    except Exception as e:
        print(f"❌ LiveKit connection failed: {str(e)}")
        print("Please verify your LiveKit credentials are correct")
        return False

def start_web_server():
    """Start the Dr. Kay web server"""
    print("\n🚀 Starting Dr. Kay Web Server...")
    
    try:
        # Start the FastAPI server
        subprocess.run([
            sys.executable, "web_server.py"
        ])
    except KeyboardInterrupt:
        print("\n👋 Dr. Kay shut down gracefully")
    except Exception as e:
        print(f"❌ Failed to start web server: {str(e)}")

def start_agent_only():
    """Start only the Dr. Kay agent (for LiveKit Cloud)"""
    print("\n🤖 Starting Dr. Kay Agent...")
    
    try:
        subprocess.run([
            sys.executable, "agent.py"
        ])
    except KeyboardInterrupt:
        print("\n👋 Dr. Kay agent shut down gracefully")
    except Exception as e:
        print(f"❌ Failed to start agent: {str(e)}")

async def main():
    """Main startup function"""
    print_banner()
    
    # Step 1: Check environment
    if not check_environment():
        print("\n💡 Setup instructions:")
        print("1. Copy .env.example to .env")
        print("2. Add your LiveKit credentials to .env file")
        print("3. Run this script again")
        return
    
    # Step 2: Check dependencies
    if not check_dependencies():
        print("\n💡 Please install dependencies and try again")
        return
    
    # Step 3: Create directories
    create_required_directories()
    
    # Step 4: Test LiveKit connection
    if not await test_livekit_connection():
        print("\n⚠️  LiveKit connection failed, but proceeding anyway...")
        print("   (Connection will be tested again when agent starts)")
    
    # Step 5: Start Dr. Kay
    print("\n" + "="*80)
    print("🎉 Dr. Kay is ready to start!")
    print("\nSelect startup mode:")
    print("1. Full Web Application (Recommended)")
    print("2. Agent Only (for LiveKit Cloud deployment)")
    print("3. Run Connection Test Only")
    
    try:
        choice = input("\nEnter your choice (1-3): ").strip()
        
        if choice == "1":
            print("\n🌐 Starting Full Web Application...")
            print("   � Web Interface: http://localhost:8000")
            print("   🔗 API Docs: http://localhost:8000/docs")
            print("   🔗 Widget Demo: http://localhost:8000/widget")
            start_web_server()
            
        elif choice == "2":
            print("\n🤖 Starting Agent Only...")
            start_agent_only()
            
        elif choice == "3":
            print("\n🧪 Running Connection Test...")
            subprocess.run([sys.executable, "test_livekit_connection.py"])
            
        else:
            print("❌ Invalid choice. Please run again and select 1, 2, or 3.")
            
    except KeyboardInterrupt:
        print("\n\n👋 Goodbye! Dr. Kay is ready when you are.")

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n👋 Startup cancelled")
    except Exception as e:
        print(f"❌ Startup failed: {str(e)}")
        print("Please check the error above and try again")