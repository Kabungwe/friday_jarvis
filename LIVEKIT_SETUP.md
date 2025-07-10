# 🔧 LiveKit Setup Guide for Dr. Kay

## Your LiveKit Credentials

✅ **Your LiveKit credentials have been configured in the `.env` file:**

- **Project URL**: `wss://dr-kay-v1-xwp5fagv.livekit.cloud`
- **API Key**: `APIjf3x3Bume4tU`
- **API Secret**: `Ei7fVPiESqK4AxN3F4byffNdXSsRjH6pVcMMgBmvaueB`
- **SIP URI**: `sip:2o3fi5u9lr9.sip.livekit.cloud`

## Quick Start

### 1. Test Connection
```bash
python test_livekit_connection.py
```

### 2. Start Dr. Kay
```bash
python start_dr_kay.py
```

### 3. Or start directly
```bash
# Start web application
python web_server.py

# Or start agent only
python agent.py
```

## Configuration Details

Your `.env` file is now configured with:

```env
# LiveKit Configuration (Your Credentials)
LIVEKIT_URL=wss://dr-kay-v1-xwp5fagv.livekit.cloud
LIVEKIT_API_KEY=APIjf3x3Bume4tU
LIVEKIT_API_SECRET=Ei7fVPiESqK4AxN3F4byffNdXSsRjH6pVcMMgBmvaueB
```

## Next Steps

1. **Get Google AI API Key** (optional but recommended):
   - Visit: https://ai.google.dev
   - Get your API key
   - Add to `.env`: `GOOGLE_API_KEY=your_actual_key`

2. **Start Dr. Kay**:
   - Run `python start_dr_kay.py`
   - Choose option 1 for full web application
   - Access at: http://localhost:8000

3. **Test Real-time Communication**:
   - Open the web interface
   - Click "Start Voice Chat" 
   - Say "Hey Dr. Kay" to activate
   - Ask medical education questions

## Deployment URLs

- **Web Interface**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Embeddable Widget**: http://localhost:8000/widget
- **Health Check**: http://localhost:8000/health

## Troubleshooting

### Connection Issues
```bash
# Test LiveKit connection
python test_livekit_connection.py

# Check environment variables
python -c "import os; from dotenv import load_dotenv; load_dotenv(); print('LIVEKIT_URL:', os.getenv('LIVEKIT_URL'))"
```

### Missing Dependencies
```bash
pip install -r requirements.txt
```

### Port Already in Use
```bash
# Use different port
PORT=8001 python web_server.py
```

## Integration with AllStarMedics.com

### Embed Widget
```html
<iframe 
  src="http://your-domain.com/widget" 
  width="400" 
  height="600"
  frameborder="0">
</iframe>
```

### JavaScript Integration
```javascript
// Load Dr. Kay widget
const drKay = new DrKayWidget({
  container: 'dr-kay-container',
  apiUrl: 'http://your-domain.com',
  livekitUrl: 'wss://dr-kay-v1-xwp5fagv.livekit.cloud'
});

drKay.init();
```

## Support

If you encounter any issues:
1. Check the logs in `logs/dr_kay.log`
2. Run the connection test script
3. Verify all environment variables are set
4. Ensure all dependencies are installed

Your Dr. Kay AI Medical Tutor is ready to provide voice and video medical education! 🩺✨