#!/usr/bin/env python3
"""
Dr. Kay LiveKit Connection Test
Verifies that your LiveKit credentials are working correctly
"""

import os
import asyncio
import logging
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def test_environment_variables():
    """Test that all required environment variables are set"""
    print("🔍 Testing Environment Variables...")
    
    required_vars = {
        'LIVEKIT_URL': os.getenv('LIVEKIT_URL'),
        'LIVEKIT_API_KEY': os.getenv('LIVEKIT_API_KEY'),
        'LIVEKIT_API_SECRET': os.getenv('LIVEKIT_API_SECRET')
    }
    
    all_present = True
    for var, value in required_vars.items():
        if value:
            print(f"✅ {var}: {value[:20]}..." if len(value) > 20 else f"✅ {var}: {value}")
        else:
            print(f"❌ {var}: Not set")
            all_present = False
    
    return all_present

async def test_livekit_connection():
    """Test connection to LiveKit server"""
    try:
        from livekit import api
        
        print("\n🔗 Testing LiveKit Connection...")
        
        # Get credentials from environment
        url = os.getenv('LIVEKIT_URL')
        api_key = os.getenv('LIVEKIT_API_KEY')
        api_secret = os.getenv('LIVEKIT_API_SECRET')
        
        if not all([url, api_key, api_secret]):
            print("❌ Missing LiveKit credentials")
            return False
        
        # Create LiveKit API client
        lk_api = api.LiveKitAPI(url, api_key, api_secret)
        
        # Test by listing rooms (this will verify credentials)
        rooms = await lk_api.room.list_rooms()
        
        print(f"✅ LiveKit connection successful!")
        print(f"📍 Connected to: {url}")
        print(f"🏠 Active rooms: {len(rooms)}")
        
        return True
        
    except ImportError:
        print("❌ LiveKit SDK not installed. Run: pip install livekit-api")
        return False
    except Exception as e:
        print(f"❌ LiveKit connection failed: {str(e)}")
        return False

def test_google_ai_setup():
    """Test Google AI API key"""
    print("\n🤖 Testing Google AI Setup...")
    
    google_key = os.getenv('GOOGLE_API_KEY')
    if not google_key or google_key == 'your_google_api_key_here':
        print("⚠️  Google AI API key not configured")
        print("   Get your key from: https://ai.google.dev")
        print("   Add it to your .env file: GOOGLE_API_KEY=your_actual_key")
        return False
    else:
        print(f"✅ Google AI API key configured: {google_key[:10]}...")
        return True

def test_dependencies():
    """Test that all required dependencies are installed"""
    print("\n📦 Testing Dependencies...")
    
    dependencies = [
        ('livekit', 'LiveKit SDK'),
        ('livekit.agents', 'LiveKit Agents'),
        ('fastapi', 'FastAPI'),
        ('uvicorn', 'Uvicorn'),
        ('python-dotenv', 'Python DotEnv')
    ]
    
    all_installed = True
    for module, name in dependencies:
        try:
            __import__(module.replace('-', '_'))
            print(f"✅ {name}")
        except ImportError:
            print(f"❌ {name} - Not installed")
            all_installed = False
    
    if not all_installed:
        print("\n💡 Install missing dependencies:")
        print("   pip install -r requirements.txt")
    
    return all_installed

async def main():
    """Run all tests"""
    print("🩺 Dr. Kay - LiveKit Connection Test")
    print("=" * 50)
    
    # Test environment variables
    env_ok = test_environment_variables()
    
    # Test dependencies
    deps_ok = test_dependencies()
    
    # Test Google AI setup
    google_ok = test_google_ai_setup()
    
    # Test LiveKit connection
    livekit_ok = False
    if env_ok and deps_ok:
        livekit_ok = await test_livekit_connection()
    
    # Summary
    print("\n" + "=" * 50)
    print("📊 Test Summary:")
    print(f"   Environment Variables: {'✅' if env_ok else '❌'}")
    print(f"   Dependencies: {'✅' if deps_ok else '❌'}")
    print(f"   Google AI Setup: {'✅' if google_ok else '⚠️'}")
    print(f"   LiveKit Connection: {'✅' if livekit_ok else '❌'}")
    
    if env_ok and deps_ok and livekit_ok:
        print("\n🎉 All tests passed! Dr. Kay is ready to start!")
        print("\n🚀 Next steps:")
        print("   1. Configure Google AI API key (if not done)")
        print("   2. Run: python web_server.py")
        print("   3. Or run: python start_dr_kay.py")
        print("   4. Open: http://localhost:8000")
    else:
        print("\n⚠️  Some tests failed. Please fix the issues above before starting Dr. Kay.")
        
        if not env_ok:
            print("\n💡 Environment setup:")
            print("   1. Check your .env file exists")
            print("   2. Verify LiveKit credentials are correct")
            
        if not deps_ok:
            print("\n💡 Dependency setup:")
            print("   pip install -r requirements.txt")

if __name__ == "__main__":
    asyncio.run(main())