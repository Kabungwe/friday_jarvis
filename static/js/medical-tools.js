/**
 * Dr. Kay - Medical Education Tools
 * Handles quiz generation, study plans, calculators, and other medical education features
 */

class MedicalTools {
    constructor() {
        this.currentQuiz = null;
        this.currentStudyPlan = null;
        this.calculatorResults = [];
        
        this.initializeEventListeners();
    }
    
    initializeEventListeners() {
        // Modal controls
        document.getElementById('closeModal')?.addEventListener('click', () => {
            this.closeModal();
        });
        
        // Specialty selection
        document.querySelectorAll('.specialty-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.selectSpecialty(e.target.closest('.specialty-btn'));
            });
        });
        
        // Close modal when clicking outside
        document.getElementById('toolModal')?.addEventListener('click', (e) => {
            if (e.target.id === 'toolModal') {
                this.closeModal();
            }
        });
        
        // Escape key to close modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
            }
        });
    }
    
    // =============================================================================
    // QUIZ GENERATOR
    // =============================================================================
    
    openQuizGenerator() {
        const modalContent = `
            <div class="tool-form">
                <h4><i class="fas fa-question-circle medical-accent"></i> Medical Quiz Generator</h4>
                <p>Generate MBChB-style questions for any medical topic or specialty.</p>
                
                <div class="form-group">
                    <label for="quizTopic">Topic / Specialty:</label>
                    <select id="quizTopic" class="form-control">
                        <option value="">Select a topic...</option>
                        <option value="cardiology">Cardiology</option>
                        <option value="respiratory">Respiratory Medicine</option>
                        <option value="gastroenterology">Gastroenterology</option>
                        <option value="neurology">Neurology</option>
                        <option value="endocrinology">Endocrinology</option>
                        <option value="infectious-diseases">Infectious Diseases</option>
                        <option value="pharmacology">Pharmacology</option>
                        <option value="anatomy">Anatomy</option>
                        <option value="physiology">Physiology</option>
                        <option value="pathology">Pathology</option>
                        <option value="obgyn">OBGYN</option>
                        <option value="pediatrics">Pediatrics</option>
                        <option value="emergency">Emergency Medicine</option>
                        <option value="surgery">Surgery</option>
                    </select>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="quizDifficulty">Difficulty Level:</label>
                        <select id="quizDifficulty" class="form-control">
                            <option value="beginner">Beginner (Medical Student)</option>
                            <option value="intermediate" selected>Intermediate (Resident)</option>
                            <option value="advanced">Advanced (Specialist)</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="questionType">Question Type:</label>
                        <select id="questionType" class="form-control">
                            <option value="multiple_choice" selected>Multiple Choice</option>
                            <option value="clinical_vignette">Clinical Vignette</option>
                            <option value="short_answer">Short Answer</option>
                            <option value="true_false">True/False</option>
                        </select>
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="numQuestions">Number of Questions:</label>
                    <input type="range" id="numQuestions" min="1" max="10" value="5" class="form-control">
                    <span id="questionCount">5 questions</span>
                </div>
                
                <div class="form-actions">
                    <button onclick="medicalTools.generateQuiz()" class="btn btn-primary">
                        <i class="fas fa-magic"></i> Generate Quiz
                    </button>
                    <button onclick="medicalTools.closeModal()" class="btn btn-secondary">Cancel</button>
                </div>
            </div>
        `;
        
        this.openModal('Quiz Generator', modalContent);
        
        // Update question count display
        document.getElementById('numQuestions').addEventListener('input', (e) => {
            document.getElementById('questionCount').textContent = `${e.target.value} questions`;
        });
    }
    
    async generateQuiz() {
        const topic = document.getElementById('quizTopic').value;
        const difficulty = document.getElementById('quizDifficulty').value;
        const questionType = document.getElementById('questionType').value;
        const numQuestions = document.getElementById('numQuestions').value;
        
        if (!topic) {
            this.showAlert('Please select a topic first', 'warning');
            return;
        }
        
        try {
            this.showLoading('Generating quiz questions...');
            
            const response = await fetch(`/api/quiz-generator?topic=${encodeURIComponent(topic)}&difficulty=${difficulty}&question_type=${questionType}&num_questions=${numQuestions}`);
            const quizData = await response.json();
            
            this.currentQuiz = quizData;
            this.displayQuizResults(quizData);
            
        } catch (error) {
            console.error('Quiz generation error:', error);
            this.showAlert('Failed to generate quiz. Please try again.', 'error');
        }
    }
    
    displayQuizResults(quiz) {
        const resultsContent = `
            <div class="quiz-results">
                <h4><i class="fas fa-clipboard-list medical-accent"></i> Generated Quiz: ${quiz.topic}</h4>
                <div class="quiz-info">
                    <span class="badge">Difficulty: ${quiz.difficulty}</span>
                    <span class="badge">Type: ${quiz.question_type}</span>
                    <span class="badge">${quiz.questions.length} Questions</span>
                </div>
                
                <div class="questions-container">
                    ${quiz.questions.map((q, index) => `
                        <div class="question-card">
                            <h5>Question ${q.id}</h5>
                            <p class="question-text">${q.question}</p>
                            
                            ${q.options ? `
                                <div class="options">
                                    ${q.options.map(option => `
                                        <div class="option">${option}</div>
                                    `).join('')}
                                </div>
                                <div class="answer">
                                    <strong>Correct Answer:</strong> ${q.correct_answer}
                                </div>
                            ` : ''}
                            
                            <div class="explanation">
                                <strong>Explanation:</strong> ${q.explanation}
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                <div class="quiz-actions">
                    <button onclick="medicalTools.startQuizPractice()" class="btn btn-primary">
                        <i class="fas fa-play"></i> Start Practice Session
                    </button>
                    <button onclick="medicalTools.exportQuiz()" class="btn btn-secondary">
                        <i class="fas fa-download"></i> Export Quiz
                    </button>
                    <button onclick="medicalTools.openQuizGenerator()" class="btn btn-secondary">
                        <i class="fas fa-plus"></i> Generate New Quiz
                    </button>
                </div>
            </div>
        `;
        
        this.updateModalContent('Quiz Results', resultsContent);
    }
    
    // =============================================================================
    // STUDY PLANNER
    // =============================================================================
    
    openStudyPlanner() {
        const modalContent = `
            <div class="tool-form">
                <h4><i class="fas fa-calendar-alt medical-accent"></i> Medical Study Planner</h4>
                <p>Create a personalized study schedule for your medical education.</p>
                
                <div class="form-group">
                    <label for="studySpecialty">Primary Specialty:</label>
                    <select id="studySpecialty" class="form-control">
                        <option value="">Select specialty...</option>
                        <option value="Internal Medicine">Internal Medicine</option>
                        <option value="OBGYN">Obstetrics & Gynecology</option>
                        <option value="Pediatrics">Pediatrics</option>
                        <option value="Pharmacology">Pharmacology</option>
                        <option value="Surgery">Surgery</option>
                        <option value="Emergency Medicine">Emergency Medicine</option>
                        <option value="Cardiology">Cardiology</option>
                        <option value="Neurology">Neurology</option>
                        <option value="Psychiatry">Psychiatry</option>
                        <option value="Radiology">Radiology</option>
                    </select>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="studyDuration">Study Period:</label>
                        <select id="studyDuration" class="form-control">
                            <option value="7">1 Week</option>
                            <option value="14" selected>2 Weeks</option>
                            <option value="30">1 Month</option>
                            <option value="60">2 Months</option>
                            <option value="90">3 Months</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="dailyHours">Hours per Day:</label>
                        <select id="dailyHours" class="form-control">
                            <option value="1">1 hour</option>
                            <option value="2" selected>2 hours</option>
                            <option value="3">3 hours</option>
                            <option value="4">4 hours</option>
                            <option value="6">6 hours</option>
                            <option value="8">8 hours</option>
                        </select>
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="focusAreas">Focus Areas (optional):</label>
                    <div class="checkbox-group" id="focusAreas">
                        <label><input type="checkbox" value="diagnostics"> Diagnostic Skills</label>
                        <label><input type="checkbox" value="pathophysiology"> Pathophysiology</label>
                        <label><input type="checkbox" value="pharmacology"> Drug Therapy</label>
                        <label><input type="checkbox" value="procedures"> Clinical Procedures</label>
                        <label><input type="checkbox" value="guidelines"> Treatment Guidelines</label>
                        <label><input type="checkbox" value="case-studies"> Case Studies</label>
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="studyStyle">Preferred Learning Style:</label>
                    <select id="studyStyle" class="form-control">
                        <option value="mixed" selected>Mixed (Reading + Practice + Video)</option>
                        <option value="reading">Reading-focused</option>
                        <option value="practice">Practice-focused</option>
                        <option value="visual">Visual/Video-focused</option>
                        <option value="interactive">Interactive/Discussion</option>
                    </select>
                </div>
                
                <div class="form-actions">
                    <button onclick="medicalTools.createStudyPlan()" class="btn btn-primary">
                        <i class="fas fa-calendar-plus"></i> Create Study Plan
                    </button>
                    <button onclick="medicalTools.closeModal()" class="btn btn-secondary">Cancel</button>
                </div>
            </div>
        `;
        
        this.openModal('Study Planner', modalContent);
    }
    
    async createStudyPlan() {
        const specialty = document.getElementById('studySpecialty').value;
        const duration = parseInt(document.getElementById('studyDuration').value);
        const dailyHours = parseInt(document.getElementById('dailyHours').value);
        const studyStyle = document.getElementById('studyStyle').value;
        
        // Get selected focus areas
        const focusAreas = Array.from(document.querySelectorAll('#focusAreas input:checked'))
            .map(input => input.value);
        
        if (!specialty) {
            this.showAlert('Please select a specialty first', 'warning');
            return;
        }
        
        try {
            this.showLoading('Creating your personalized study plan...');
            
            const response = await fetch('/api/study-plan', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    specialty,
                    duration_days: duration,
                    study_hours_per_day: dailyHours,
                    focus_areas: focusAreas,
                    study_style: studyStyle
                })
            });
            
            const studyPlan = await response.json();
            this.currentStudyPlan = studyPlan;
            this.displayStudyPlan(studyPlan);
            
        } catch (error) {
            console.error('Study plan creation error:', error);
            this.showAlert('Failed to create study plan. Please try again.', 'error');
        }
    }
    
    displayStudyPlan(plan) {
        const planContent = `
            <div class="study-plan-results">
                <h4><i class="fas fa-graduation-cap medical-accent"></i> Study Plan: ${plan.specialty}</h4>
                
                <div class="plan-overview">
                    <div class="stat-card">
                        <div class="stat-value">${plan.duration_days}</div>
                        <div class="stat-label">Days</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${plan.daily_hours}</div>
                        <div class="stat-label">Hours/Day</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${plan.total_hours}</div>
                        <div class="stat-label">Total Hours</div>
                    </div>
                </div>
                
                <div class="focus-areas">
                    <h5>Focus Areas:</h5>
                    <div class="tags">
                        ${plan.focus_areas.map(area => `<span class="tag">${area}</span>`).join('')}
                    </div>
                </div>
                
                <div class="daily-schedule">
                    <h5>Daily Schedule:</h5>
                    <div class="schedule-container">
                        ${plan.daily_schedule.map(day => `
                            <div class="day-card">
                                <h6>Day ${day.day}</h6>
                                <div class="day-topics">
                                    ${day.topics.map(topic => `<div class="topic">${topic}</div>`).join('')}
                                </div>
                                <div class="day-activities">
                                    ${day.activities.map(activity => `<span class="activity">${activity}</span>`).join('')}
                                </div>
                                <div class="day-hours">${day.hours} hours</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="plan-actions">
                    <button onclick="medicalTools.startStudySession()" class="btn btn-primary">
                        <i class="fas fa-play"></i> Start Study Session
                    </button>
                    <button onclick="medicalTools.exportStudyPlan()" class="btn btn-secondary">
                        <i class="fas fa-download"></i> Export Plan
                    </button>
                    <button onclick="medicalTools.setStudyReminders()" class="btn btn-secondary">
                        <i class="fas fa-bell"></i> Set Reminders
                    </button>
                </div>
            </div>
        `;
        
        this.updateModalContent('Your Study Plan', planContent);
    }
    
    // =============================================================================
    // MEDICAL CALCULATORS
    // =============================================================================
    
    openCalculators() {
        const modalContent = `
            <div class="tool-form">
                <h4><i class="fas fa-calculator medical-accent"></i> Medical Calculators</h4>
                <p>Clinical calculations for medical practice and education.</p>
                
                <div class="calculator-grid">
                    <button onclick="medicalTools.openGFRCalculator()" class="calc-btn">
                        <i class="fas fa-kidneys"></i>
                        <span>GFR Calculator</span>
                        <small>Glomerular Filtration Rate</small>
                    </button>
                    
                    <button onclick="medicalTools.openBMICalculator()" class="calc-btn">
                        <i class="fas fa-weight"></i>
                        <span>BMI Calculator</span>
                        <small>Body Mass Index</small>
                    </button>
                    
                    <button onclick="medicalTools.openDosageCalculator()" class="calc-btn">
                        <i class="fas fa-pills"></i>
                        <span>Drug Dosage</span>
                        <small>Medication Calculations</small>
                    </button>
                    
                    <button onclick="medicalTools.openCardiacCalculator()" class="calc-btn">
                        <i class="fas fa-heartbeat"></i>
                        <span>Cardiac Risk</span>
                        <small>CHADS2, Wells Score</small>
                    </button>
                    
                    <button onclick="medicalTools.openFluidCalculator()" class="calc-btn">
                        <i class="fas fa-tint"></i>
                        <span>Fluid Balance</span>
                        <small>IV Fluid Calculations</small>
                    </button>
                    
                    <button onclick="medicalTools.openPregnancyCalculator()" class="calc-btn">
                        <i class="fas fa-baby"></i>
                        <span>Pregnancy</span>
                        <small>Due Date, Gestational Age</small>
                    </button>
                </div>
            </div>
        `;
        
        this.openModal('Medical Calculators', modalContent);
    }
    
    openGFRCalculator() {
        const calculatorContent = `
            <div class="calculator-form">
                <h4><i class="fas fa-kidneys medical-accent"></i> GFR Calculator</h4>
                <p>Calculate estimated Glomerular Filtration Rate using MDRD equation.</p>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="creatinine">Serum Creatinine:</label>
                        <div class="input-group">
                            <input type="number" id="creatinine" step="0.1" placeholder="1.0" class="form-control">
                            <span class="unit">mg/dL</span>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label for="age">Age:</label>
                        <div class="input-group">
                            <input type="number" id="age" placeholder="40" class="form-control">
                            <span class="unit">years</span>
                        </div>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="gender">Gender:</label>
                        <select id="gender" class="form-control">
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="race">Race:</label>
                        <select id="race" class="form-control">
                            <option value="non-african">Non-African American</option>
                            <option value="african">African American</option>
                        </select>
                    </div>
                </div>
                
                <div class="calculator-actions">
                    <button onclick="medicalTools.calculateGFR()" class="btn btn-primary">
                        <i class="fas fa-calculator"></i> Calculate GFR
                    </button>
                    <button onclick="medicalTools.openCalculators()" class="btn btn-secondary">Back</button>
                </div>
                
                <div id="gfrResult" class="calculation-result hidden"></div>
            </div>
        `;
        
        this.updateModalContent('GFR Calculator', calculatorContent);
    }
    
    async calculateGFR() {
        const creatinine = parseFloat(document.getElementById('creatinine').value);
        const age = parseInt(document.getElementById('age').value);
        const gender = document.getElementById('gender').value;
        const race = document.getElementById('race').value;
        
        if (!creatinine || !age) {
            this.showAlert('Please enter creatinine and age values', 'warning');
            return;
        }
        
        try {
            const response = await fetch(`/api/calculators?type=gfr&creatinine=${creatinine}&age=${age}&gender=${gender}&race=${race}`);
            const result = await response.json();
            
            const resultDiv = document.getElementById('gfrResult');
            resultDiv.innerHTML = `
                <div class="result-card">
                    <h5>GFR Calculation Result</h5>
                    <div class="result-value">
                        <span class="value">${result.result.gfr}</span>
                        <span class="unit">${result.result.unit}</span>
                    </div>
                    <div class="interpretation ${result.result.interpretation.toLowerCase().replace(' ', '-')}">
                        Interpretation: ${result.result.interpretation}
                    </div>
                    <div class="clinical-note">
                        <strong>Clinical Note:</strong> GFR values should be interpreted in clinical context. 
                        Consider additional factors like proteinuria, hypertension, and diabetes.
                    </div>
                </div>
            `;
            resultDiv.classList.remove('hidden');
            
        } catch (error) {
            console.error('GFR calculation error:', error);
            this.showAlert('Calculation failed. Please check your inputs.', 'error');
        }
    }
    
    // =============================================================================
    // SYMPTOM CHECKER
    // =============================================================================
    
    openSymptomChecker() {
        const modalContent = `
            <div class="tool-form">
                <h4><i class="fas fa-search medical-accent"></i> Educational Symptom Analysis</h4>
                <div class="disclaimer">
                    <i class="fas fa-exclamation-triangle"></i>
                    <strong>EDUCATIONAL PURPOSE ONLY</strong> - This tool is for learning differential diagnosis, 
                    not for actual patient care. Always consult healthcare providers for medical advice.
                </div>
                
                <div class="form-group">
                    <label for="symptoms">Symptoms (comma-separated):</label>
                    <textarea id="symptoms" placeholder="e.g., chest pain, shortness of breath, fatigue" 
                              class="form-control" rows="3"></textarea>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="patientAge">Patient Age (optional):</label>
                        <input type="number" id="patientAge" placeholder="e.g., 45" class="form-control">
                    </div>
                    
                    <div class="form-group">
                        <label for="patientGender">Gender (optional):</label>
                        <select id="patientGender" class="form-control">
                            <option value="">Not specified</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                        </select>
                    </div>
                </div>
                
                <div class="form-actions">
                    <button onclick="medicalTools.analyzeSymptoms()" class="btn btn-primary">
                        <i class="fas fa-stethoscope"></i> Analyze Symptoms
                    </button>
                    <button onclick="medicalTools.closeModal()" class="btn btn-secondary">Cancel</button>
                </div>
            </div>
        `;
        
        this.openModal('Symptom Analysis', modalContent);
    }
    
    async analyzeSymptoms() {
        const symptoms = document.getElementById('symptoms').value.trim();
        const age = document.getElementById('patientAge').value;
        const gender = document.getElementById('patientGender').value;
        
        if (!symptoms) {
            this.showAlert('Please enter at least one symptom', 'warning');
            return;
        }
        
        try {
            this.showLoading('Analyzing symptoms for educational purposes...');
            
            const response = await fetch('/api/symptom-checker', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    symptoms: symptoms.split(',').map(s => s.trim()),
                    patient_age: age ? parseInt(age) : null,
                    patient_gender: gender || null
                })
            });
            
            const analysis = await response.json();
            this.displaySymptomAnalysis(analysis);
            
        } catch (error) {
            console.error('Symptom analysis error:', error);
            this.showAlert('Analysis failed. Please try again.', 'error');
        }
    }
    
    displaySymptomAnalysis(analysis) {
        const analysisContent = `
            <div class="symptom-analysis">
                <h4><i class="fas fa-clipboard-check medical-accent"></i> Educational Differential Analysis</h4>
                
                <div class="analysis-disclaimer">
                    <i class="fas fa-info-circle"></i>
                    ${analysis.disclaimer}
                </div>
                
                <div class="symptoms-summary">
                    <h5>Presented Symptoms:</h5>
                    <div class="symptom-tags">
                        ${analysis.symptoms.map(symptom => `<span class="symptom-tag">${symptom}</span>`).join('')}
                    </div>
                    ${analysis.patient_context.age || analysis.patient_context.gender ? `
                        <div class="patient-context">
                            ${analysis.patient_context.age ? `Age: ${analysis.patient_context.age} years` : ''}
                            ${analysis.patient_context.gender ? ` | Gender: ${analysis.patient_context.gender}` : ''}
                        </div>
                    ` : ''}
                </div>
                
                <div class="differential-analysis">
                    <div class="analysis-section">
                        <h5><i class="fas fa-list-ul"></i> Common Differentials to Consider:</h5>
                        <ul>
                            ${analysis.educational_analysis.common_differentials.map(diff => `<li>${diff}</li>`).join('')}
                        </ul>
                    </div>
                    
                    <div class="analysis-section">
                        <h5><i class="fas fa-lightbulb"></i> Key Learning Points:</h5>
                        <ul>
                            ${analysis.educational_analysis.learning_points.map(point => `<li>${point}</li>`).join('')}
                        </ul>
                    </div>
                    
                    <div class="analysis-section">
                        <h5><i class="fas fa-route"></i> Suggested Next Steps:</h5>
                        <ul>
                            ${analysis.educational_analysis.next_steps.map(step => `<li>${step}</li>`).join('')}
                        </ul>
                    </div>
                </div>
                
                <div class="analysis-actions">
                    <button onclick="medicalTools.generateSymptomQuiz('${analysis.symptoms.join(',')}')" class="btn btn-primary">
                        <i class="fas fa-question-circle"></i> Generate Practice Questions
                    </button>
                    <button onclick="medicalTools.openSymptomChecker()" class="btn btn-secondary">
                        <i class="fas fa-plus"></i> New Analysis
                    </button>
                </div>
            </div>
        `;
        
        this.updateModalContent('Symptom Analysis Results', analysisContent);
    }
    
    // =============================================================================
    // DOCUMENT ANALYZER
    // =============================================================================
    
    openDocumentAnalyzer() {
        const modalContent = `
            <div class="tool-form">
                <h4><i class="fas fa-file-medical medical-accent"></i> Medical Document Analyzer</h4>
                <p>Upload and analyze medical documents, research papers, or images for educational purposes.</p>
                
                <div class="upload-area" id="uploadArea">
                    <div class="upload-content">
                        <i class="fas fa-cloud-upload-alt"></i>
                        <h5>Drop files here or click to browse</h5>
                        <p>Supported: PDF, DOC, JPG, PNG (Max 10MB)</p>
                        <input type="file" id="documentFile" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" multiple hidden>
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="analysisType">Analysis Type:</label>
                    <select id="analysisType" class="form-control">
                        <option value="summary">Summary & Key Points</option>
                        <option value="flashcards">Generate Flashcards</option>
                        <option value="quiz_generation">Create Quiz Questions</option>
                        <option value="key_points">Extract Key Concepts</option>
                        <option value="terminology">Medical Terminology</option>
                    </select>
                </div>
                
                <div class="form-actions">
                    <button onclick="medicalTools.analyzeDocument()" class="btn btn-primary" disabled id="analyzeBtn">
                        <i class="fas fa-microscope"></i> Analyze Document
                    </button>
                    <button onclick="medicalTools.closeModal()" class="btn btn-secondary">Cancel</button>
                </div>
            </div>
        `;
        
        this.openModal('Document Analyzer', modalContent);
        this.setupFileUpload();
    }
    
    setupFileUpload() {
        const uploadArea = document.getElementById('uploadArea');
        const fileInput = document.getElementById('documentFile');
        const analyzeBtn = document.getElementById('analyzeBtn');
        
        uploadArea.addEventListener('click', () => fileInput.click());
        
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('drag-over');
        });
        
        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('drag-over');
        });
        
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('drag-over');
            const files = e.dataTransfer.files;
            this.handleFileSelection(files);
        });
        
        fileInput.addEventListener('change', (e) => {
            this.handleFileSelection(e.target.files);
        });
    }
    
    handleFileSelection(files) {
        if (files.length > 0) {
            const file = files[0];
            const uploadContent = document.querySelector('.upload-content');
            
            uploadContent.innerHTML = `
                <i class="fas fa-file-check"></i>
                <h5>${file.name}</h5>
                <p>Size: ${(file.size / 1024 / 1024).toFixed(2)} MB</p>
            `;
            
            document.getElementById('analyzeBtn').disabled = false;
        }
    }
    
    async analyzeDocument() {
        const fileInput = document.getElementById('documentFile');
        const analysisType = document.getElementById('analysisType').value;
        
        if (!fileInput.files.length) {
            this.showAlert('Please select a file first', 'warning');
            return;
        }
        
        try {
            this.showLoading('Analyzing document...');
            
            const formData = new FormData();
            formData.append('file', fileInput.files[0]);
            formData.append('analysis_type', analysisType);
            
            const response = await fetch('/api/upload-document', {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            this.displayDocumentAnalysis(result);
            
        } catch (error) {
            console.error('Document analysis error:', error);
            this.showAlert('Analysis failed. Please try again.', 'error');
        }
    }
    
    displayDocumentAnalysis(analysis) {
        const analysisContent = `
            <div class="document-analysis">
                <h4><i class="fas fa-file-alt medical-accent"></i> Document Analysis Results</h4>
                
                <div class="file-info">
                    <div class="info-item">
                        <strong>File:</strong> ${analysis.filename}
                    </div>
                    <div class="info-item">
                        <strong>Type:</strong> ${analysis.analysis_type}
                    </div>
                    <div class="info-item">
                        <strong>Size:</strong> ${(analysis.size_bytes / 1024).toFixed(1)} KB
                    </div>
                </div>
                
                <div class="analysis-results">
                    <div class="result-section">
                        <h5><i class="fas fa-clipboard-list"></i> Summary:</h5>
                        <p>${analysis.summary}</p>
                    </div>
                    
                    <div class="result-section">
                        <h5><i class="fas fa-key"></i> Key Points:</h5>
                        <ul>
                            ${analysis.key_points.map(point => `<li>${point}</li>`).join('')}
                        </ul>
                    </div>
                    
                    ${analysis.generated_flashcards ? `
                        <div class="result-section">
                            <h5><i class="fas fa-cards-blank"></i> Generated Flashcards:</h5>
                            <div class="flashcards">
                                ${analysis.generated_flashcards.map(card => `
                                    <div class="flashcard">
                                        <div class="card-front">${card.front}</div>
                                        <div class="card-back">${card.back}</div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}
                </div>
                
                <div class="analysis-actions">
                    <button onclick="medicalTools.exportAnalysis()" class="btn btn-primary">
                        <i class="fas fa-download"></i> Export Results
                    </button>
                    <button onclick="medicalTools.openDocumentAnalyzer()" class="btn btn-secondary">
                        <i class="fas fa-plus"></i> Analyze New Document
                    </button>
                </div>
            </div>
        `;
        
        this.updateModalContent('Document Analysis', analysisContent);
    }
    
    // =============================================================================
    // RESEARCH SEARCH
    // =============================================================================
    
    openResearchSearch() {
        const modalContent = `
            <div class="tool-form">
                <h4><i class="fas fa-microscope medical-accent"></i> Medical Research Search</h4>
                <p>Search for current medical research, guidelines, and evidence-based information.</p>
                
                <div class="form-group">
                    <label for="researchQuery">Research Topic or Question:</label>
                    <input type="text" id="researchQuery" placeholder="e.g., hypertension guidelines 2024, COVID-19 treatment" class="form-control">
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="sourceType">Source Type:</label>
                        <select id="sourceType" class="form-control">
                            <option value="general" selected>General Medical Research</option>
                            <option value="pubmed">PubMed Articles</option>
                            <option value="guidelines">Clinical Guidelines</option>
                            <option value="reviews">Systematic Reviews</option>
                            <option value="trials">Clinical Trials</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="timeFrame">Time Frame:</label>
                        <select id="timeFrame" class="form-control">
                            <option value="any">Any time</option>
                            <option value="1year" selected>Past year</option>
                            <option value="5years">Past 5 years</option>
                            <option value="current">Current/Recent</option>
                        </select>
                    </div>
                </div>
                
                <div class="form-actions">
                    <button onclick="medicalTools.searchResearch()" class="btn btn-primary">
                        <i class="fas fa-search"></i> Search Research
                    </button>
                    <button onclick="medicalTools.closeModal()" class="btn btn-secondary">Cancel</button>
                </div>
            </div>
        `;
        
        this.openModal('Research Search', modalContent);
    }
    
    // =============================================================================
    // UTILITY METHODS
    // =============================================================================
    
    openModal(title, content) {
        const modal = document.getElementById('toolModal');
        const modalTitle = document.getElementById('modalTitle');
        const modalBody = document.getElementById('modalBody');
        
        modalTitle.textContent = title;
        modalBody.innerHTML = content;
        modal.classList.remove('hidden');
    }
    
    updateModalContent(title, content) {
        const modalTitle = document.getElementById('modalTitle');
        const modalBody = document.getElementById('modalBody');
        
        modalTitle.textContent = title;
        modalBody.innerHTML = content;
    }
    
    closeModal() {
        const modal = document.getElementById('toolModal');
        modal.classList.add('hidden');
    }
    
    showLoading(message) {
        const modalBody = document.getElementById('modalBody');
        modalBody.innerHTML = `
            <div class="loading-container">
                <div class="spinner"></div>
                <p>${message}</p>
            </div>
        `;
    }
    
    showAlert(message, type = 'info') {
        // Create a simple alert notification
        const alert = document.createElement('div');
        alert.className = `alert alert-${type}`;
        alert.innerHTML = `
            <i class="fas fa-${type === 'warning' ? 'exclamation-triangle' : type === 'error' ? 'times-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(alert);
        
        setTimeout(() => {
            alert.remove();
        }, 5000);
    }
    
    selectSpecialty(button) {
        // Remove active class from all buttons
        document.querySelectorAll('.specialty-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Add active class to selected button
        button.classList.add('active');
        
        const specialty = button.dataset.specialty;
        
        // Notify LiveKit integration about specialty selection
        if (window.drKayLiveKit) {
            window.drKayLiveKit.setSpecialty(specialty);
        }
    }
    
    // Export functions (simplified implementations)
    exportQuiz() {
        if (this.currentQuiz) {
            const dataStr = JSON.stringify(this.currentQuiz, null, 2);
            const dataBlob = new Blob([dataStr], {type: 'application/json'});
            
            const link = document.createElement('a');
            link.href = URL.createObjectURL(dataBlob);
            link.download = `dr_kay_quiz_${this.currentQuiz.topic}_${Date.now()}.json`;
            link.click();
        }
    }
    
    exportStudyPlan() {
        if (this.currentStudyPlan) {
            const dataStr = JSON.stringify(this.currentStudyPlan, null, 2);
            const dataBlob = new Blob([dataStr], {type: 'application/json'});
            
            const link = document.createElement('a');
            link.href = URL.createObjectURL(dataBlob);
            link.download = `dr_kay_study_plan_${this.currentStudyPlan.specialty}_${Date.now()}.json`;
            link.click();
        }
    }
}

// Global functions for onclick handlers
function openQuizGenerator() {
    window.medicalTools.openQuizGenerator();
}

function openStudyPlanner() {
    window.medicalTools.openStudyPlanner();
}

function openCalculators() {
    window.medicalTools.openCalculators();
}

function openSymptomChecker() {
    window.medicalTools.openSymptomChecker();
}

function openDocumentAnalyzer() {
    window.medicalTools.openDocumentAnalyzer();
}

function openResearchSearch() {
    window.medicalTools.openResearchSearch();
}

// Initialize Medical Tools when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.medicalTools = new MedicalTools();
    console.log('Dr. Kay Medical Tools initialized');
});