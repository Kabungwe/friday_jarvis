/**
 * Dr. Kay - LiveKit WebRTC Integration
 * Handles real-time voice and video communication with medical education features
 */

class DrKayLiveKit {
    constructor() {
        this.room = null;
        this.localParticipant = null;
        this.isConnected = false;
        this.isVideoEnabled = true;
        this.isAudioEnabled = true;
        this.transcriptBuffer = [];
        
        // Medical education state
        this.medicalMode = false;
        this.currentSpecialty = null;
        this.sessionStartTime = null;
        
        this.initializeEventListeners();
    }
    
    initializeEventListeners() {
        // Main interface controls
        document.getElementById('startSession')?.addEventListener('click', () => {
            this.startSession();
        });
        
        document.getElementById('toggleVideo')?.addEventListener('click', () => {
            this.toggleVideo();
        });
        
        document.getElementById('toggleAudio')?.addEventListener('click', () => {
            this.toggleAudio();
        });
        
        document.getElementById('closeWidget')?.addEventListener('click', () => {
            this.endSession();
        });
        
        document.getElementById('medicalMode')?.addEventListener('click', () => {
            this.toggleMedicalMode();
        });
        
        // Chat functionality
        document.getElementById('sendMessage')?.addEventListener('click', () => {
            this.sendChatMessage();
        });
        
        document.getElementById('chatInput')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendChatMessage();
            }
        });
        
        // Wake word detection (simulated)
        this.initializeWakeWordDetection();
    }
    
    async startSession() {
        try {
            this.showWidget();
            this.updateStatus('Connecting to Dr. Kay...', 'warning');
            
            // Request microphone and camera permissions
            const constraints = {
                audio: true,
                video: this.isVideoEnabled
            };
            
            const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
            
            // Initialize LiveKit room
            await this.connectToRoom(mediaStream);
            
            this.sessionStartTime = new Date();
            this.updateStatus('Connected to Dr. Kay', 'success');
            this.addChatMessage('system', 'Session started. Dr. Kay is ready to help!');
            
        } catch (error) {
            console.error('Failed to start session:', error);
            this.updateStatus('Connection failed', 'error');
            this.addChatMessage('system', 'Failed to connect. Please check your microphone/camera permissions.');
        }
    }
    
    async connectToRoom(mediaStream) {
        if (!window.livekitConfig?.url || !window.livekitConfig?.apiKey) {
            throw new Error('LiveKit configuration missing');
        }
        
        // Create LiveKit room
        this.room = new LiveKitClient.Room({
            // Audio settings optimized for medical education
            audio: {
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true
            },
            // Video settings
            video: {
                resolution: LiveKitClient.VideoPresets.h720.resolution,
                frameRate: 15
            }
        });
        
        // Set up event listeners
        this.setupRoomEventListeners();
        
        // Generate access token (in production, this should come from your backend)
        const token = await this.generateAccessToken();
        
        // Connect to room
        await this.room.connect(window.livekitConfig.url, token);
        
        // Publish local media
        await this.room.localParticipant.publishTrack(
            mediaStream.getVideoTracks()[0], 
            { source: LiveKitClient.Track.Source.Camera }
        );
        
        await this.room.localParticipant.publishTrack(
            mediaStream.getAudioTracks()[0], 
            { source: LiveKitClient.Track.Source.Microphone }
        );
        
        this.localParticipant = this.room.localParticipant;
        this.isConnected = true;
        
        // Set up local video
        this.setupLocalVideo(mediaStream);
    }
    
    setupRoomEventListeners() {
        // Participant joined
        this.room.on(LiveKitClient.RoomEvent.ParticipantConnected, (participant) => {
            console.log('Dr. Kay joined:', participant.identity);
            this.addChatMessage('system', 'Dr. Kay has joined the session');
        });
        
        // Track subscribed (Dr. Kay's audio/video)
        this.room.on(LiveKitClient.RoomEvent.TrackSubscribed, (track, publication, participant) => {
            if (track.kind === LiveKitClient.Track.Kind.Video) {
                this.setupRemoteVideo(track);
            } else if (track.kind === LiveKitClient.Track.Kind.Audio) {
                this.setupRemoteAudio(track);
            }
        });
        
        // Data received (for medical tools integration)
        this.room.on(LiveKitClient.RoomEvent.DataReceived, (payload, participant) => {
            this.handleDataMessage(payload, participant);
        });
        
        // Connection quality
        this.room.on(LiveKitClient.RoomEvent.ConnectionQualityChanged, (quality, participant) => {
            this.updateConnectionQuality(quality);
        });
        
        // Disconnection
        this.room.on(LiveKitClient.RoomEvent.Disconnected, () => {
            this.handleDisconnection();
        });
        
        // Speaking detection
        this.room.on(LiveKitClient.RoomEvent.ActiveSpeakersChanged, (speakers) => {
            this.updateSpeakingIndicator(speakers);
        });
    }
    
    setupLocalVideo(mediaStream) {
        const localVideo = document.getElementById('localVideo');
        if (localVideo && mediaStream.getVideoTracks().length > 0) {
            localVideo.srcObject = mediaStream;
        }
    }
    
    setupRemoteVideo(track) {
        const participantVideo = document.getElementById('participantVideo');
        if (participantVideo) {
            participantVideo.srcObject = new MediaStream([track.mediaStreamTrack]);
            participantVideo.onloadedmetadata = () => {
                participantVideo.play();
            };
        }
    }
    
    setupRemoteAudio(track) {
        // Create audio element for Dr. Kay's voice
        const audioElement = document.createElement('audio');
        audioElement.srcObject = new MediaStream([track.mediaStreamTrack]);
        audioElement.autoplay = true;
        audioElement.controls = false;
        document.body.appendChild(audioElement);
    }
    
    async toggleVideo() {
        if (!this.isConnected) return;
        
        this.isVideoEnabled = !this.isVideoEnabled;
        const videoTrack = this.localParticipant.getTrack(LiveKitClient.Track.Source.Camera);
        
        if (videoTrack) {
            await videoTrack.setEnabled(this.isVideoEnabled);
        }
        
        this.updateVideoButton();
        this.addChatMessage('system', `Video ${this.isVideoEnabled ? 'enabled' : 'disabled'}`);
    }
    
    async toggleAudio() {
        if (!this.isConnected) return;
        
        this.isAudioEnabled = !this.isAudioEnabled;
        const audioTrack = this.localParticipant.getTrack(LiveKitClient.Track.Source.Microphone);
        
        if (audioTrack) {
            await audioTrack.setEnabled(this.isAudioEnabled);
        }
        
        this.updateAudioButton();
        this.addChatMessage('system', `Microphone ${this.isAudioEnabled ? 'enabled' : 'disabled'}`);
    }
    
    toggleMedicalMode() {
        this.medicalMode = !this.medicalMode;
        const button = document.getElementById('medicalMode');
        
        if (this.medicalMode) {
            button.classList.add('active');
            button.innerHTML = '<i class="fas fa-stethoscope"></i> Medical Mode: ON';
            this.addChatMessage('system', 'Medical Mode activated. Dr. Kay will use clinical terminology and provide detailed medical education.');
            
            // Send medical mode activation to Dr. Kay
            this.sendDataMessage({
                type: 'medical_mode',
                enabled: true,
                specialty: this.currentSpecialty
            });
        } else {
            button.classList.remove('active');
            button.innerHTML = '<i class="fas fa-stethoscope"></i> Medical Mode';
            this.addChatMessage('system', 'Medical Mode deactivated. Returning to general education mode.');
            
            this.sendDataMessage({
                type: 'medical_mode',
                enabled: false
            });
        }
    }
    
    sendChatMessage() {
        const input = document.getElementById('chatInput');
        const message = input.value.trim();
        
        if (message && this.isConnected) {
            this.addChatMessage('user', message);
            
            // Send message to Dr. Kay via data channel
            this.sendDataMessage({
                type: 'chat_message',
                message: message,
                timestamp: new Date().toISOString()
            });
            
            input.value = '';
        }
    }
    
    sendDataMessage(data) {
        if (this.room && this.isConnected) {
            const payload = new TextEncoder().encode(JSON.stringify(data));
            this.room.localParticipant.publishData(payload, LiveKitClient.DataPacket_Kind.RELIABLE);
        }
    }
    
    handleDataMessage(payload, participant) {
        try {
            const data = JSON.parse(new TextDecoder().decode(payload));
            
            switch (data.type) {
                case 'chat_response':
                    this.addChatMessage('assistant', data.message);
                    break;
                    
                case 'quiz_question':
                    this.displayQuizQuestion(data.question);
                    break;
                    
                case 'medical_calculation':
                    this.displayCalculationResult(data.result);
                    break;
                    
                case 'study_plan':
                    this.displayStudyPlan(data.plan);
                    break;
                    
                default:
                    console.log('Unknown data message:', data);
            }
        } catch (error) {
            console.error('Error handling data message:', error);
        }
    }
    
    addChatMessage(sender, message) {
        const chatMessages = document.getElementById('chatMessages');
        if (!chatMessages) return;
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;
        
        const timestamp = new Date().toLocaleTimeString();
        
        messageDiv.innerHTML = `
            <div class="message-content">
                <p><strong>${sender === 'user' ? 'You' : sender === 'assistant' ? 'Dr. Kay' : 'System'}:</strong> ${message}</p>
                <span class="timestamp">${timestamp}</span>
            </div>
        `;
        
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        // Store in transcript buffer
        this.transcriptBuffer.push({
            sender,
            message,
            timestamp: new Date().toISOString()
        });
    }
    
    updateSpeakingIndicator(speakers) {
        const voiceIndicator = document.getElementById('voiceIndicator');
        if (voiceIndicator) {
            if (speakers.length > 0) {
                voiceIndicator.classList.add('active');
            } else {
                voiceIndicator.classList.remove('active');
            }
        }
    }
    
    updateConnectionQuality(quality) {
        const statusIndicator = document.querySelector('.status-indicator');
        if (statusIndicator) {
            statusIndicator.className = 'status-indicator';
            
            if (quality === LiveKitClient.ConnectionQuality.Excellent) {
                statusIndicator.classList.add('online');
            } else if (quality === LiveKitClient.ConnectionQuality.Poor) {
                statusIndicator.classList.add('warning');
            } else {
                statusIndicator.classList.add('offline');
            }
        }
    }
    
    updateStatus(message, type = 'info') {
        const statusText = document.querySelector('.status-text');
        if (statusText) {
            statusText.textContent = message;
            statusText.className = `status-text ${type}`;
        }
    }
    
    updateVideoButton() {
        const button = document.getElementById('toggleVideo');
        if (button) {
            const icon = button.querySelector('i');
            if (this.isVideoEnabled) {
                icon.className = 'fas fa-video';
                button.title = 'Turn off video';
            } else {
                icon.className = 'fas fa-video-slash';
                button.title = 'Turn on video';
            }
        }
    }
    
    updateAudioButton() {
        const button = document.getElementById('toggleAudio');
        if (button) {
            const icon = button.querySelector('i');
            if (this.isAudioEnabled) {
                icon.className = 'fas fa-microphone';
                button.title = 'Mute microphone';
            } else {
                icon.className = 'fas fa-microphone-slash';
                button.title = 'Unmute microphone';
            }
        }
    }
    
    showWidget() {
        const widget = document.getElementById('drKayWidget');
        const chatSidebar = document.getElementById('chatSidebar');
        
        if (widget) {
            widget.classList.remove('hidden');
            widget.classList.add('fade-in');
        }
        
        if (chatSidebar) {
            chatSidebar.classList.add('open');
        }
    }
    
    hideWidget() {
        const widget = document.getElementById('drKayWidget');
        const chatSidebar = document.getElementById('chatSidebar');
        
        if (widget) {
            widget.classList.add('hidden');
        }
        
        if (chatSidebar) {
            chatSidebar.classList.remove('open');
        }
    }
    
    async endSession() {
        if (this.room && this.isConnected) {
            await this.room.disconnect();
        }
        
        this.isConnected = false;
        this.hideWidget();
        this.updateStatus('Session ended', 'info');
        
        // Save session transcript
        this.saveSessionTranscript();
    }
    
    handleDisconnection() {
        this.isConnected = false;
        this.updateStatus('Disconnected from Dr. Kay', 'error');
        this.addChatMessage('system', 'Connection lost. Please try reconnecting.');
    }
    
    saveSessionTranscript() {
        if (this.transcriptBuffer.length > 0) {
            const transcript = {
                sessionId: `session_${Date.now()}`,
                startTime: this.sessionStartTime,
                endTime: new Date(),
                medicalMode: this.medicalMode,
                specialty: this.currentSpecialty,
                messages: this.transcriptBuffer
            };
            
            // Save to localStorage for now (could be sent to backend)
            localStorage.setItem(`dr_kay_transcript_${transcript.sessionId}`, JSON.stringify(transcript));
            console.log('Session transcript saved:', transcript.sessionId);
        }
    }
    
    // Simplified wake word detection (for demo purposes)
    initializeWakeWordDetection() {
        let isListening = false;
        
        document.addEventListener('keydown', (e) => {
            // Ctrl + K to simulate "Hey Dr. Kay"
            if (e.ctrlKey && e.key === 'k') {
                e.preventDefault();
                this.activateWakeWord();
            }
        });
        
        // Voice activation simulation
        if ('webkitSpeechRecognition' in window) {
            this.setupVoiceActivation();
        }
    }
    
    setupVoiceActivation() {
        const recognition = new webkitSpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';
        
        recognition.onresult = (event) => {
            const lastResult = event.results[event.results.length - 1];
            if (lastResult.isFinal) {
                const transcript = lastResult[0].transcript.toLowerCase();
                if (transcript.includes('hey dr kay') || transcript.includes('hey doctor kay')) {
                    this.activateWakeWord();
                }
            }
        };
        
        // Start listening when not connected
        if (!this.isConnected) {
            recognition.start();
        }
    }
    
    activateWakeWord() {
        const indicator = document.getElementById('wakeWordIndicator');
        if (indicator) {
            indicator.classList.remove('hidden');
            setTimeout(() => {
                indicator.classList.add('hidden');
                this.startSession();
            }, 2000);
        }
    }
    
    // Generate access token (simplified for demo - should be done on backend)
    async generateAccessToken() {
        // In production, this should call your backend to generate a proper JWT token
        return 'demo_token_' + Math.random().toString(36).substr(2, 9);
    }
    
    // Medical education specific methods
    displayQuizQuestion(question) {
        this.addChatMessage('assistant', `📝 Quiz Question: ${question.text}`);
        if (question.options) {
            question.options.forEach((option, index) => {
                this.addChatMessage('assistant', `${String.fromCharCode(65 + index)}) ${option}`);
            });
        }
    }
    
    displayCalculationResult(result) {
        this.addChatMessage('assistant', `🧮 Calculation Result: ${result.description} = ${result.value} ${result.unit || ''}`);
        if (result.interpretation) {
            this.addChatMessage('assistant', `💡 Clinical Interpretation: ${result.interpretation}`);
        }
    }
    
    displayStudyPlan(plan) {
        this.addChatMessage('assistant', `📚 Study Plan Created: ${plan.title}`);
        this.addChatMessage('assistant', `Duration: ${plan.duration}, Focus: ${plan.focus_areas.join(', ')}`);
    }
    
    // Set current medical specialty
    setSpecialty(specialty) {
        this.currentSpecialty = specialty;
        if (this.isConnected) {
            this.sendDataMessage({
                type: 'specialty_focus',
                specialty: specialty
            });
        }
        this.addChatMessage('system', `Specialty focus set to: ${specialty}`);
    }
}

// Initialize Dr. Kay LiveKit integration when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.drKayLiveKit = new DrKayLiveKit();
    console.log('Dr. Kay LiveKit integration initialized');
});