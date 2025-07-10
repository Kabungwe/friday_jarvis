# � Dr. Kay - AI Medical Tutor & Educational Assistant

<div align="center">

**An AI-powered voice and video medical education platform built with LiveKit WebRTC**

[![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-green.svg)](https://fastapi.tiangolo.com)
[![LiveKit](https://img.shields.io/badge/LiveKit-WebRTC-purple.svg)](https://livekit.io)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

[🚀 Demo](#demo) • [📋 Features](#features) • [⚡ Quick Start](#quick-start) • [📖 Documentation](#documentation) • [🤝 Contributing](#contributing)

</div>

---

## 🎯 Overview

Dr. Kay is a comprehensive AI-powered medical education platform that provides real-time voice and video tutoring for medical students, nurses, and healthcare professionals. Built with modern web technologies and LiveKit WebRTC, Dr. Kay offers an interactive learning experience with specialized medical tools and educational features.

### 🎥 Key Capabilities

- **🗣️ Real-time Voice & Video Communication** - Natural conversation with AI tutor
- **📚 Medical Quiz Generation** - Create MBChB-style practice questions
- **📅 Personalized Study Plans** - Custom schedules for medical specialties  
- **🧮 Medical Calculators** - GFR, BMI, drug dosages, and clinical scores
- **🔍 Symptom Analysis** - Educational differential diagnosis learning
- **📄 Document Analysis** - AI-powered analysis of medical PDFs and images
- **🔬 Research Search** - Access to current medical literature and guidelines
- **🎙️ Wake Word Activation** - "Hey Dr. Kay" voice commands
- **📱 Responsive Design** - Works on desktop, tablet, and mobile devices

---

## 🌟 Features

### 🎓 Educational Tools

| Feature | Description | Status |
|---------|-------------|--------|
| **Quiz Generator** | Generate practice questions for any medical topic | ✅ Ready |
| **Study Planner** | Create personalized study schedules | ✅ Ready |
| **Medical Calculators** | Clinical calculations (GFR, BMI, etc.) | ✅ Ready |
| **Symptom Checker** | Educational differential diagnosis | ✅ Ready |
| **Document Analyzer** | Upload and analyze medical documents | ✅ Ready |
| **Research Search** | Search medical literature and guidelines | ✅ Ready |

### 🏥 Medical Specialties Supported

- **Internal Medicine** - Comprehensive internal medicine topics
- **OBGYN** - Obstetrics and gynecology education
- **Pediatrics** - Child and adolescent healthcare
- **Pharmacology** - Drug mechanisms and interactions
- **Cardiology** - Heart and cardiovascular system
- **Emergency Medicine** - Acute care and trauma
- **Surgery** - Surgical procedures and techniques
- **Neurology** - Nervous system disorders

### 🎮 Interactive Features

- **Voice Activation** - "Hey Dr. Kay" wake word detection
- **Medical Mode** - Switch to clinical terminology
- **Progress Tracking** - Track study time and achievements
- **Session Transcripts** - Save and review conversations
- **Achievement System** - Unlock badges for learning milestones
- **Specialty Focus** - Tailor learning to specific medical fields

---

## ⚡ Quick Start

### Prerequisites

- **Python 3.8+** - Programming language runtime
- **Node.js 16+** - For frontend dependencies (optional)
- **LiveKit Account** - For real-time communication ([Get Free Account](https://livekit.io))
- **Google AI API Key** - For voice processing ([Get API Key](https://ai.google.dev))

### 1. Clone & Setup

```bash
# Clone the repository
git clone https://github.com/your-org/dr-kay.git
cd dr-kay

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Environment Configuration

```bash
# Copy environment template
cp .env.example .env

# Edit .env file with your credentials
nano .env  # or use your preferred editor
```

**Required Environment Variables:**
```env
LIVEKIT_URL=wss://your-project.livekit.cloud
LIVEKIT_API_KEY=your_livekit_api_key
LIVEKIT_API_SECRET=your_livekit_api_secret
GOOGLE_API_KEY=your_google_api_key
```

### 3. Run Application

```bash
# Start the Dr. Kay web server
python web_server.py

# Alternative: Run with uvicorn directly
uvicorn web_server:app --reload --host 0.0.0.0 --port 8000
```

### 4. Access Dr. Kay

Open your browser and navigate to:
- **Main Interface**: `http://localhost:8000`
- **Embeddable Widget**: `http://localhost:8000/widget`
- **API Documentation**: `http://localhost:8000/docs`

---

## � Setup Guide

### LiveKit Configuration

1. **Create LiveKit Account**
   - Visit [livekit.io](https://livekit.io) and create a free account
   - Create a new project
   - Copy your API Key, Secret, and WebSocket URL

2. **Configure Environment**
   ```env
   LIVEKIT_URL=wss://your-project.livekit.cloud
   LIVEKIT_API_KEY=APIfxxxxxxxxxxxxxxx
   LIVEKIT_API_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

### Google AI Setup

1. **Get Google AI API Key**
   - Visit [Google AI Studio](https://ai.google.dev)
   - Create an API key for Gemini
   - Add to your environment configuration

2. **Configure Voice Settings**
   ```env
   GOOGLE_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   GOOGLE_PROJECT_ID=your-project-id
   ```

### Optional Integrations

#### Email Notifications
```env
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-app-password
```

#### Medical APIs
```env
MEDICAL_API_BASE=https://api.allstarmedics.com
MEDICAL_API_KEY=your-medical-api-key
```

---

## 🎪 Usage Examples

### Starting a Study Session

```javascript
// Voice activation
"Hey Dr. Kay, I want to study cardiology"

// Or click the interface button
document.getElementById('startSession').click();
```

### Using Medical Tools

```javascript
// Generate a quiz
openQuizGenerator();

// Create study plan
openStudyPlanner();

// Medical calculations
openCalculators();
```

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + K` | Activate Dr. Kay |
| `Ctrl/Cmd + Q` | Quick Quiz |
| `Ctrl/Cmd + P` | Study Planner |
| `Ctrl/Cmd + Shift + C` | Calculator |
| `F1` | Help & Instructions |

---

## 🏗️ Architecture

### System Components

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   AI Services   │
│                 │    │                 │    │                 │
│ • React/HTML5   │◄──►│ • FastAPI       │◄──►│ • Google AI     │
│ • LiveKit SDK   │    │ • WebSocket     │    │ • OpenAI (opt)  │
│ • WebRTC        │    │ • REST APIs     │    │ • Medical APIs  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   LiveKit       │
                    │   Cloud         │
                    │ • WebRTC        │
                    │ • Media Server  │
                    └─────────────────┘
```

### Key Technologies

- **Frontend**: HTML5, CSS3, JavaScript ES6+, LiveKit Client SDK
- **Backend**: Python, FastAPI, Uvicorn, WebSockets
- **AI/ML**: Google Gemini, LiveKit Agents, Speech Recognition
- **Real-time**: LiveKit WebRTC, WebSocket connections
- **Storage**: SQLite (default), PostgreSQL (production)

---

## 📚 API Documentation

### Medical Education Endpoints

#### Quiz Generation
```http
GET /api/quiz-generator?topic=cardiology&difficulty=intermediate&num_questions=5
```

#### Study Plan Creation
```http
POST /api/study-plan
Content-Type: application/json

{
  "specialty": "Internal Medicine",
  "duration_days": 14,
  "study_hours_per_day": 2,
  "focus_areas": ["diagnostics", "pharmacology"]
}
```

#### Medical Calculations
```http
GET /api/calculators?type=gfr&creatinine=1.2&age=45&gender=male
```

#### Document Analysis
```http
POST /api/upload-document
Content-Type: multipart/form-data

file: [medical_document.pdf]
analysis_type: summary
```

#### Symptom Analysis
```http
POST /api/symptom-checker
Content-Type: application/json

{
  "symptoms": ["chest pain", "shortness of breath"],
  "patient_age": 55,
  "patient_gender": "male"
}
```

### Health & Status
```http
GET /health              # Health check
GET /api/info           # Service information
```

---

## 🚀 Deployment

### Production Deployment

#### Using Docker
```bash
# Build Docker image
docker build -t dr-kay .

# Run container
docker run -p 8000:8000 --env-file .env dr-kay
```

#### Using Docker Compose
```yaml
version: '3.8'
services:
  dr-kay:
    build: .
    ports:
      - "8000:8000"
    env_file:
      - .env
    volumes:
      - ./uploads:/app/uploads
```

#### Manual Deployment
```bash
# Install production dependencies
pip install -r requirements.txt

# Run with production server
gunicorn web_server:app -w 4 -k uvicorn.workers.UvicornWorker
```

### Environment Configuration

**Production Environment Variables:**
```env
ENVIRONMENT=production
DEBUG=false
HOST=0.0.0.0
PORT=8000
DATABASE_URL=postgresql://user:pass@localhost:5432/dr_kay
ALLOWED_ORIGINS=https://allstarmedics.com,https://www.allstarmedics.com
```

---

## 🔌 Integration Guide

### Embedding in AllStarMedics.com

#### 1. Widget Integration
```html
<!-- Add to your website -->
<iframe src="https://drkai.allstarmedics.com/widget" 
        width="400" height="600" 
        frameborder="0">
</iframe>
```

#### 2. JavaScript Integration
```javascript
// Load Dr. Kay widget
<script src="https://drkai.allstarmedics.com/static/js/widget.js"></script>
<script>
  DrKayWidget.init({
    apiUrl: 'https://drkai.allstarmedics.com',
    position: 'bottom-right',
    theme: 'medical'
  });
</script>
```

#### 3. WordPress Integration
```php
// Add to functions.php
function add_dr_kay_widget() {
    wp_enqueue_script('dr-kay', 'https://drkai.allstarmedics.com/static/js/widget.js');
}
add_action('wp_enqueue_scripts', 'add_dr_kay_widget');
```

### Tutor LMS Integration

```php
// Connect with student progress
add_action('tutor_course_complete', function($course_id, $user_id) {
    // Notify Dr. Kay of course completion
    wp_remote_post('https://drkai.allstarmedics.com/api/progress', [
        'body' => json_encode([
            'user_id' => $user_id,
            'course_id' => $course_id,
            'event' => 'course_complete'
        ])
    ]);
});
```

---

## 🧪 Testing

### Running Tests
```bash
# Install test dependencies
pip install pytest pytest-asyncio pytest-cov

# Run all tests
pytest tests/ -v

# Run with coverage
pytest --cov=. tests/

# Run specific test categories
pytest tests/test_medical_tools.py -v
pytest tests/test_api.py -v
```

### Test Categories

- **Unit Tests** - Individual component testing
- **Integration Tests** - API endpoint testing
- **E2E Tests** - Full user journey testing
- **Load Tests** - Performance and scalability

---

## 🔒 Security & Privacy

### Data Protection
- **No PHI Storage** - Educational purposes only
- **Session Encryption** - All communications encrypted
- **GDPR Compliant** - Data retention policies
- **HIPAA Aware** - Security best practices

### Security Features
- **JWT Authentication** - Secure API access
- **Rate Limiting** - Prevent abuse
- **Input Validation** - Sanitize all inputs
- **CORS Protection** - Cross-origin security

---

## 📊 Monitoring & Analytics

### Performance Metrics
- Session duration and engagement
- Tool usage statistics
- Error rates and response times
- User satisfaction scores

### Health Monitoring
```bash
# Check application health
curl http://localhost:8000/health

# Monitor logs
tail -f logs/dr_kay.log

# View metrics dashboard
open http://localhost:8000/metrics
```

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup
```bash
# Clone and setup development environment
git clone https://github.com/your-org/dr-kay.git
cd dr-kay

# Install development dependencies
pip install -r requirements-dev.txt

# Setup pre-commit hooks
pre-commit install

# Run development server
python web_server.py
```

### Code Style
- **Python**: Follow PEP 8, use Black formatter
- **JavaScript**: ESLint with Airbnb config
- **Documentation**: Clear docstrings and comments

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🆘 Support & Help

### Getting Help
- **Documentation**: [Full Documentation](https://docs.drkai.com)
- **Issues**: [GitHub Issues](https://github.com/your-org/dr-kay/issues)
- **Discord**: [Community Chat](https://discord.gg/dr-kay)
- **Email**: support@allstarmedics.com

### Common Issues

#### "Connection Failed" Error
```bash
# Check LiveKit credentials
echo $LIVEKIT_URL
echo $LIVEKIT_API_KEY

# Verify network connectivity
curl -I $LIVEKIT_URL
```

#### "Google AI API Error"
```bash
# Verify API key
curl -H "Authorization: Bearer $GOOGLE_API_KEY" \
     https://generativelanguage.googleapis.com/v1/models
```

#### "Permission Denied" for Media
- Ensure HTTPS for production deployments
- Check browser permissions for microphone/camera
- Verify SSL certificate validity

---

## 🙏 Acknowledgments

- **LiveKit Team** - Amazing WebRTC platform
- **Google AI** - Powerful voice processing
- **Medical Community** - Educational guidance and feedback
- **Open Source Contributors** - Community support

---

<div align="center">

**🩺 Dr. Kay - Empowering Medical Education Through AI**

[Website](https://allstarmedics.com) • [Documentation](https://docs.drkai.com) • [Support](mailto:support@allstarmedics.com)

</div>

