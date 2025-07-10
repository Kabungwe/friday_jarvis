/**
 * Dr. Kay - Main Application Controller
 * Coordinates all medical education features and manages application state
 */

class DrKayApp {
    constructor() {
        this.currentUser = null;
        this.sessionActive = false;
        this.currentSpecialty = null;
        this.studyMode = 'normal'; // 'normal', 'medical', 'focused'
        this.preferences = this.loadPreferences();
        
        this.initializeApp();
    }
    
    initializeApp() {
        this.setupEventListeners();
        this.loadUserSession();
        this.initializeUI();
        this.checkBrowserSupport();
        
        console.log('Dr. Kay Application initialized');
    }
    
    setupEventListeners() {
        // Navigation and main controls
        document.getElementById('minimizeWidget')?.addEventListener('click', () => {
            this.minimizeWidget();
        });
        
        document.getElementById('toggleChat')?.addEventListener('click', () => {
            this.toggleChatSidebar();
        });
        
        // Specialty buttons
        document.querySelectorAll('.specialty-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.selectSpecialty(e.target.closest('.specialty-btn').dataset.specialty);
            });
        });
        
        // Settings and preferences
        this.setupUserPreferences();
        
        // Keyboard shortcuts
        this.setupKeyboardShortcuts();
        
        // Session management
        window.addEventListener('beforeunload', () => {
            this.handlePageUnload();
        });
        
        // Auto-save functionality
        setInterval(() => {
            this.autoSave();
        }, 30000); // Auto-save every 30 seconds
    }
    
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + K: Activate Dr. Kay
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                this.activateDrKay();
            }
            
            // Ctrl/Cmd + Q: Quick quiz
            if ((e.ctrlKey || e.metaKey) && e.key === 'q') {
                e.preventDefault();
                openQuizGenerator();
            }
            
            // Ctrl/Cmd + P: Study planner
            if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
                e.preventDefault();
                openStudyPlanner();
            }
            
            // Ctrl/Cmd + C: Calculator
            if ((e.ctrlKey || e.metaKey) && e.key === 'c' && e.shiftKey) {
                e.preventDefault();
                openCalculators();
            }
            
            // F1: Help
            if (e.key === 'F1') {
                e.preventDefault();
                this.showHelp();
            }
        });
    }
    
    activateDrKay() {
        if (window.drKayLiveKit && !window.drKayLiveKit.isConnected) {
            window.drKayLiveKit.startSession();
        } else {
            this.showNotification('Dr. Kay is already active', 'info');
        }
    }
    
    selectSpecialty(specialty) {
        this.currentSpecialty = specialty;
        
        // Update UI
        document.querySelectorAll('.specialty-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        document.querySelector(`[data-specialty="${specialty}"]`)?.classList.add('active');
        
        // Save preference
        this.preferences.lastSpecialty = specialty;
        this.savePreferences();
        
        // Notify other components
        if (window.drKayLiveKit) {
            window.drKayLiveKit.setSpecialty(specialty);
        }
        
        this.showNotification(`Specialty focus set to: ${this.getSpecialtyName(specialty)}`, 'success');
    }
    
    getSpecialtyName(specialty) {
        const specialtyNames = {
            'obgyn': 'Obstetrics & Gynecology',
            'internal': 'Internal Medicine',
            'pediatrics': 'Pediatrics',
            'pharmacology': 'Pharmacology',
            'cardiology': 'Cardiology',
            'emergency': 'Emergency Medicine'
        };
        
        return specialtyNames[specialty] || specialty;
    }
    
    minimizeWidget() {
        const widget = document.getElementById('drKayWidget');
        if (widget) {
            widget.classList.toggle('minimized');
            
            const isMinimized = widget.classList.contains('minimized');
            const minimizeBtn = document.getElementById('minimizeWidget');
            
            if (minimizeBtn) {
                const icon = minimizeBtn.querySelector('i');
                icon.className = isMinimized ? 'fas fa-expand' : 'fas fa-minus';
                minimizeBtn.title = isMinimized ? 'Expand' : 'Minimize';
            }
        }
    }
    
    toggleChatSidebar() {
        const sidebar = document.getElementById('chatSidebar');
        const toggleBtn = document.getElementById('toggleChat');
        
        if (sidebar) {
            sidebar.classList.toggle('open');
            
            if (toggleBtn) {
                const icon = toggleBtn.querySelector('i');
                const isOpen = sidebar.classList.contains('open');
                icon.className = isOpen ? 'fas fa-chevron-right' : 'fas fa-chevron-left';
            }
        }
    }
    
    // =============================================================================
    // USER PREFERENCES AND SESSION MANAGEMENT
    // =============================================================================
    
    loadPreferences() {
        const saved = localStorage.getItem('drKayPreferences');
        const defaults = {
            theme: 'light',
            autoStartVideo: true,
            audioNotifications: true,
            lastSpecialty: null,
            studyMode: 'normal',
            reminderFrequency: 'daily'
        };
        
        return saved ? {...defaults, ...JSON.parse(saved)} : defaults;
    }
    
    savePreferences() {
        localStorage.setItem('drKayPreferences', JSON.stringify(this.preferences));
    }
    
    setupUserPreferences() {
        // Apply saved preferences
        this.applyTheme(this.preferences.theme);
        
        if (this.preferences.lastSpecialty) {
            this.selectSpecialty(this.preferences.lastSpecialty);
        }
    }
    
    applyTheme(theme) {
        document.body.className = document.body.className.replace(/theme-\w+/, '');
        document.body.classList.add(`theme-${theme}`);
        this.preferences.theme = theme;
        this.savePreferences();
    }
    
    loadUserSession() {
        const sessionData = sessionStorage.getItem('drKaySession');
        if (sessionData) {
            const session = JSON.parse(sessionData);
            this.currentUser = session.user;
            this.sessionActive = session.active;
        }
    }
    
    saveUserSession() {
        const sessionData = {
            user: this.currentUser,
            active: this.sessionActive,
            timestamp: new Date().toISOString()
        };
        
        sessionStorage.setItem('drKaySession', JSON.stringify(sessionData));
    }
    
    // =============================================================================
    // UI MANAGEMENT
    // =============================================================================
    
    initializeUI() {
        this.updateConnectionStatus();
        this.loadRecentActivity();
        this.setupProgressTracking();
        this.initializeNotifications();
    }
    
    updateConnectionStatus() {
        const statusElement = document.querySelector('.status-text');
        if (statusElement) {
            statusElement.textContent = 'Ready to connect';
        }
    }
    
    loadRecentActivity() {
        const recentSessions = this.getRecentSessions();
        if (recentSessions.length > 0) {
            this.displayRecentActivity(recentSessions);
        }
    }
    
    getRecentSessions() {
        const sessions = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('dr_kay_transcript_')) {
                try {
                    const session = JSON.parse(localStorage.getItem(key));
                    sessions.push(session);
                } catch (e) {
                    console.warn('Failed to parse session:', key);
                }
            }
        }
        
        return sessions.sort((a, b) => new Date(b.endTime) - new Date(a.endTime)).slice(0, 5);
    }
    
    displayRecentActivity(sessions) {
        // This could be implemented to show recent sessions in the UI
        console.log('Recent sessions:', sessions);
    }
    
    setupProgressTracking() {
        this.progressData = this.loadProgressData();
        this.updateProgressDisplay();
    }
    
    loadProgressData() {
        const saved = localStorage.getItem('drKayProgress');
        const defaults = {
            totalSessions: 0,
            totalStudyTime: 0,
            quizzesCompleted: 0,
            specialtiesStudied: [],
            achievements: []
        };
        
        return saved ? {...defaults, ...JSON.parse(saved)} : defaults;
    }
    
    saveProgressData() {
        localStorage.setItem('drKayProgress', JSON.stringify(this.progressData));
    }
    
    updateProgressDisplay() {
        // Update any progress indicators in the UI
        const totalSessions = document.querySelector('.stat-sessions');
        const totalTime = document.querySelector('.stat-time');
        const quizCount = document.querySelector('.stat-quizzes');
        
        if (totalSessions) totalSessions.textContent = this.progressData.totalSessions;
        if (totalTime) totalTime.textContent = Math.round(this.progressData.totalStudyTime / 60) + ' hours';
        if (quizCount) quizCount.textContent = this.progressData.quizzesCompleted;
    }
    
    recordActivity(type, data = {}) {
        switch (type) {
            case 'session_start':
                this.progressData.totalSessions++;
                break;
            case 'quiz_completed':
                this.progressData.quizzesCompleted++;
                break;
            case 'study_time':
                this.progressData.totalStudyTime += data.duration || 0;
                break;
            case 'specialty_studied':
                if (!this.progressData.specialtiesStudied.includes(data.specialty)) {
                    this.progressData.specialtiesStudied.push(data.specialty);
                }
                break;
        }
        
        this.saveProgressData();
        this.updateProgressDisplay();
        this.checkAchievements();
    }
    
    checkAchievements() {
        const achievements = [];
        
        if (this.progressData.totalSessions >= 10 && !this.progressData.achievements.includes('frequent_learner')) {
            achievements.push({
                id: 'frequent_learner',
                title: 'Frequent Learner',
                description: 'Completed 10 study sessions with Dr. Kay'
            });
        }
        
        if (this.progressData.quizzesCompleted >= 50 && !this.progressData.achievements.includes('quiz_master')) {
            achievements.push({
                id: 'quiz_master',
                title: 'Quiz Master',
                description: 'Completed 50 practice quizzes'
            });
        }
        
        if (this.progressData.specialtiesStudied.length >= 5 && !this.progressData.achievements.includes('well_rounded')) {
            achievements.push({
                id: 'well_rounded',
                title: 'Well-Rounded Student',
                description: 'Studied 5 different medical specialties'
            });
        }
        
        achievements.forEach(achievement => {
            this.progressData.achievements.push(achievement.id);
            this.showAchievement(achievement);
        });
        
        if (achievements.length > 0) {
            this.saveProgressData();
        }
    }
    
    showAchievement(achievement) {
        this.showNotification(`🏆 Achievement Unlocked: ${achievement.title}`, 'success', 5000);
    }
    
    // =============================================================================
    // NOTIFICATIONS
    // =============================================================================
    
    initializeNotifications() {
        this.notificationContainer = this.createNotificationContainer();
        
        // Request permission for browser notifications
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }
    
    createNotificationContainer() {
        let container = document.getElementById('notificationContainer');
        if (!container) {
            container = document.createElement('div');
            container.id = 'notificationContainer';
            container.className = 'notification-container';
            document.body.appendChild(container);
        }
        return container;
    }
    
    showNotification(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type} fade-in`;
        
        const iconMap = {
            'success': 'fas fa-check-circle',
            'error': 'fas fa-exclamation-circle',
            'warning': 'fas fa-exclamation-triangle',
            'info': 'fas fa-info-circle'
        };
        
        notification.innerHTML = `
            <i class="${iconMap[type]}"></i>
            <span class="notification-message">${message}</span>
            <button class="notification-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        this.notificationContainer.appendChild(notification);
        
        // Auto-remove notification
        setTimeout(() => {
            if (notification.parentElement) {
                notification.classList.add('fade-out');
                setTimeout(() => notification.remove(), 300);
            }
        }, duration);
        
        // Browser notification for important messages
        if (type === 'error' || type === 'success') {
            this.showBrowserNotification(message, type);
        }
    }
    
    showBrowserNotification(message, type) {
        if ('Notification' in window && Notification.permission === 'granted' && this.preferences.audioNotifications) {
            new Notification('Dr. Kay', {
                body: message,
                icon: '/static/images/dr-kay-icon.png',
                tag: 'dr-kay-notification'
            });
        }
    }
    
    // =============================================================================
    // UTILITY FUNCTIONS
    // =============================================================================
    
    checkBrowserSupport() {
        const features = {
            webrtc: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
            websockets: 'WebSocket' in window,
            speechRecognition: 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window,
            fileApi: 'FileReader' in window
        };
        
        const unsupported = Object.entries(features)
            .filter(([feature, supported]) => !supported)
            .map(([feature]) => feature);
        
        if (unsupported.length > 0) {
            this.showNotification(
                `Some features may not work: ${unsupported.join(', ')}. Please use a modern browser.`,
                'warning',
                10000
            );
        }
        
        console.log('Browser support check:', features);
    }
    
    autoSave() {
        if (this.sessionActive) {
            this.saveUserSession();
            this.saveProgressData();
        }
    }
    
    handlePageUnload() {
        if (this.sessionActive) {
            // Save current state
            this.saveUserSession();
            this.saveProgressData();
            
            // End any active sessions
            if (window.drKayLiveKit && window.drKayLiveKit.isConnected) {
                window.drKayLiveKit.endSession();
            }
        }
    }
    
    showHelp() {
        const helpContent = `
            <div class="help-content">
                <h4><i class="fas fa-question-circle medical-accent"></i> Dr. Kay Help</h4>
                
                <div class="help-section">
                    <h5>Getting Started</h5>
                    <ul>
                        <li>Click "Talk to Dr. Kay" to start a voice/video session</li>
                        <li>Use "Medical Mode" for clinical terminology</li>
                        <li>Select a specialty to focus your learning</li>
                    </ul>
                </div>
                
                <div class="help-section">
                    <h5>Keyboard Shortcuts</h5>
                    <ul>
                        <li><kbd>Ctrl/Cmd + K</kbd> - Activate Dr. Kay</li>
                        <li><kbd>Ctrl/Cmd + Q</kbd> - Quick Quiz</li>
                        <li><kbd>Ctrl/Cmd + P</kbd> - Study Planner</li>
                        <li><kbd>Ctrl/Cmd + Shift + C</kbd> - Calculator</li>
                        <li><kbd>F1</kbd> - Help</li>
                    </ul>
                </div>
                
                <div class="help-section">
                    <h5>Voice Commands</h5>
                    <ul>
                        <li>"Hey Dr. Kay" - Activate voice session</li>
                        <li>Natural language questions about medical topics</li>
                        <li>Request quizzes, calculations, or study plans</li>
                    </ul>
                </div>
                
                <div class="help-section">
                    <h5>Medical Tools</h5>
                    <ul>
                        <li><strong>Quiz Generator:</strong> Create practice questions</li>
                        <li><strong>Study Planner:</strong> Personalized study schedules</li>
                        <li><strong>Calculators:</strong> GFR, BMI, drug dosages</li>
                        <li><strong>Symptom Checker:</strong> Educational differential diagnosis</li>
                        <li><strong>Document Analyzer:</strong> Analyze medical PDFs and images</li>
                        <li><strong>Research Search:</strong> Find current medical research</li>
                    </ul>
                </div>
                
                <div class="disclaimer">
                    <i class="fas fa-exclamation-triangle"></i>
                    <strong>Important:</strong> Dr. Kay is for educational purposes only. 
                    Always consult healthcare providers for medical advice and patient care.
                </div>
            </div>
        `;
        
        if (window.medicalTools) {
            window.medicalTools.openModal('Help & Instructions', helpContent);
        }
    }
    
    exportUserData() {
        const userData = {
            preferences: this.preferences,
            progress: this.progressData,
            recentSessions: this.getRecentSessions(),
            exportDate: new Date().toISOString()
        };
        
        const dataStr = JSON.stringify(userData, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `dr_kay_data_export_${Date.now()}.json`;
        link.click();
        
        this.showNotification('User data exported successfully', 'success');
    }
    
    resetUserData() {
        if (confirm('Are you sure you want to reset all user data? This cannot be undone.')) {
            localStorage.removeItem('drKayPreferences');
            localStorage.removeItem('drKayProgress');
            sessionStorage.removeItem('drKaySession');
            
            // Remove all session transcripts
            for (let i = localStorage.length - 1; i >= 0; i--) {
                const key = localStorage.key(i);
                if (key && key.startsWith('dr_kay_transcript_')) {
                    localStorage.removeItem(key);
                }
            }
            
            location.reload();
        }
    }
    
    // Public API for other components
    getSessionState() {
        return {
            active: this.sessionActive,
            specialty: this.currentSpecialty,
            mode: this.studyMode,
            user: this.currentUser
        };
    }
    
    updateSessionState(updates) {
        Object.assign(this, updates);
        this.saveUserSession();
    }
}

// =============================================================================
// ADDITIONAL UTILITY CLASSES
// =============================================================================

class StudyTimer {
    constructor() {
        this.startTime = null;
        this.endTime = null;
        this.isRunning = false;
        this.totalTime = 0;
    }
    
    start() {
        this.startTime = new Date();
        this.isRunning = true;
    }
    
    stop() {
        if (this.isRunning) {
            this.endTime = new Date();
            this.totalTime += this.endTime - this.startTime;
            this.isRunning = false;
        }
    }
    
    getTotalTime() {
        let total = this.totalTime;
        if (this.isRunning && this.startTime) {
            total += new Date() - this.startTime;
        }
        return total;
    }
    
    getFormattedTime() {
        const totalMs = this.getTotalTime();
        const minutes = Math.floor(totalMs / 60000);
        const seconds = Math.floor((totalMs % 60000) / 1000);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
}

// =============================================================================
// CSS INJECTION FOR DYNAMIC STYLES
// =============================================================================

function injectAdditionalStyles() {
    const additionalCSS = `
        /* Notification System */
        .notification-container {
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10001;
            max-width: 350px;
        }
        
        .notification {
            background: white;
            border-radius: 8px;
            padding: 12px 16px;
            margin-bottom: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            display: flex;
            align-items: center;
            gap: 12px;
            border-left: 4px solid #0066cc;
        }
        
        .notification-success { border-left-color: #28a745; }
        .notification-error { border-left-color: #dc3545; }
        .notification-warning { border-left-color: #ffc107; }
        .notification-info { border-left-color: #17a2b8; }
        
        .notification-message {
            flex-grow: 1;
            font-size: 14px;
        }
        
        .notification-close {
            background: none;
            border: none;
            color: #666;
            cursor: pointer;
            padding: 4px;
            border-radius: 4px;
        }
        
        .notification-close:hover {
            background: #f8f9fa;
        }
        
        /* Loading Spinner */
        .loading-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 2rem;
            text-align: center;
        }
        
        .spinner {
            width: 40px;
            height: 40px;
            border: 4px solid #f3f3f3;
            border-top: 4px solid #0066cc;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-bottom: 1rem;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        /* Alert System */
        .alert {
            position: fixed;
            top: 80px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 8px;
            color: white;
            z-index: 10002;
            display: flex;
            align-items: center;
            gap: 8px;
            max-width: 300px;
            animation: slideInRight 0.3s ease;
        }
        
        .alert-info { background: #17a2b8; }
        .alert-success { background: #28a745; }
        .alert-warning { background: #ffc107; color: #333; }
        .alert-error { background: #dc3545; }
        
        @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        
        /* Progress Tracking */
        .progress-bar {
            height: 8px;
            background: #e9ecef;
            border-radius: 4px;
            overflow: hidden;
        }
        
        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #0066cc, #004499);
            border-radius: 4px;
            transition: width 0.3s ease;
        }
        
        /* Form Enhancements */
        .form-control {
            width: 100%;
            padding: 8px 12px;
            border: 1px solid #e9ecef;
            border-radius: 6px;
            font-size: 14px;
            transition: border-color 0.2s ease;
        }
        
        .form-control:focus {
            outline: none;
            border-color: #0066cc;
            box-shadow: 0 0 0 2px rgba(0, 102, 204, 0.1);
        }
        
        .form-group {
            margin-bottom: 1rem;
        }
        
        .form-row {
            display: flex;
            gap: 1rem;
        }
        
        .form-row .form-group {
            flex: 1;
        }
        
        label {
            display: block;
            margin-bottom: 4px;
            font-weight: 600;
            color: #333;
        }
        
        /* Badge System */
        .badge {
            display: inline-block;
            padding: 4px 8px;
            font-size: 12px;
            font-weight: 600;
            color: white;
            background: #0066cc;
            border-radius: 12px;
            margin-right: 4px;
        }
        
        /* Help Content */
        .help-content {
            max-width: 600px;
        }
        
        .help-section {
            margin-bottom: 1.5rem;
        }
        
        .help-section h5 {
            color: #0066cc;
            margin-bottom: 0.5rem;
        }
        
        .help-section ul {
            margin-left: 1rem;
        }
        
        .help-section li {
            margin-bottom: 0.25rem;
        }
        
        kbd {
            background: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 4px;
            padding: 2px 6px;
            font-family: monospace;
            font-size: 12px;
        }
    `;
    
    const style = document.createElement('style');
    style.textContent = additionalCSS;
    document.head.appendChild(style);
}

// =============================================================================
// INITIALIZATION
// =============================================================================

// Initialize Dr. Kay Application when page loads
document.addEventListener('DOMContentLoaded', () => {
    // Inject additional styles
    injectAdditionalStyles();
    
    // Initialize main application
    window.drKayApp = new DrKayApp();
    
    // Initialize study timer
    window.studyTimer = new StudyTimer();
    
    console.log('Dr. Kay Main Application loaded successfully');
});