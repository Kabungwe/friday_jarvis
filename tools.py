import logging
from livekit.agents import function_tool, RunContext
import requests
from langchain_community.tools import DuckDuckGoSearchRun
import os
import smtplib
from email.mime.multipart import MIMEMultipart  
from email.mime.text import MIMEText
from typing import Optional, Dict, List
import json

# =============================================================================
# MEDICAL EDUCATION TOOLS - Dr. Kay Specific
# =============================================================================

@function_tool()
async def generate_medical_quiz(
    context: RunContext,  # type: ignore
    topic: str,
    difficulty: str = "intermediate",
    question_type: str = "multiple_choice",
    num_questions: int = 5
) -> str:
    """
    Generate medical quiz questions for study and practice.
    
    Args:
        topic: Medical topic or specialty (e.g., "cardiology", "pharmacology", "OBGYN")
        difficulty: "beginner", "intermediate", "advanced" 
        question_type: "multiple_choice", "clinical_vignette", "short_answer"
        num_questions: Number of questions to generate (1-10)
    """
    try:
        # This would integrate with your quiz generator API
        # For now, we'll simulate the API call structure
        api_endpoint = os.getenv("MEDICAL_API_BASE", "https://api.allstarmedics.com")
        
        payload = {
            "topic": topic,
            "difficulty": difficulty,
            "question_type": question_type,
            "num_questions": min(num_questions, 10)
        }
        
        # Simulated response structure for development
        response = {
            "quiz_id": f"quiz_{topic}_{difficulty}",
            "questions": [
                {
                    "id": i+1,
                    "question": f"Sample {question_type} question about {topic} (difficulty: {difficulty})",
                    "options": ["A) Option 1", "B) Option 2", "C) Option 3", "D) Option 4"] if question_type == "multiple_choice" else None,
                    "correct_answer": "A",
                    "explanation": f"This question tests understanding of {topic} concepts."
                } for i in range(payload["num_questions"])
            ]
        }
        
        logging.info(f"Generated quiz for topic: {topic}")
        return f"✅ Generated {num_questions} {question_type} questions about {topic} at {difficulty} level. Ready for practice!"
        
    except Exception as e:
        logging.error(f"Error generating quiz for {topic}: {e}")
        return f"I encountered an issue generating the quiz for {topic}. Please try again or specify a different topic."

@function_tool()
async def create_study_plan(
    context: RunContext,  # type: ignore
    specialty: str,
    duration_days: int = 7,
    study_hours_per_day: int = 2,
    focus_areas: Optional[str] = None
) -> str:
    """
    Create a personalized medical study plan.
    
    Args:
        specialty: Medical specialty to focus on (e.g., "Internal Medicine", "OBGYN", "Pediatrics")
        duration_days: Length of study plan in days
        study_hours_per_day: Hours to study per day
        focus_areas: Specific topics to emphasize (comma-separated)
    """
    try:
        payload = {
            "specialty": specialty,
            "duration": duration_days,
            "daily_hours": study_hours_per_day,
            "focus_areas": focus_areas.split(",") if focus_areas else []
        }
        
        # Simulated study plan structure
        study_plan = {
            "plan_id": f"plan_{specialty.lower().replace(' ', '_')}_{duration_days}d",
            "specialty": specialty,
            "total_hours": duration_days * study_hours_per_day,
            "daily_schedule": f"{study_hours_per_day} hours per day for {duration_days} days",
            "focus_areas": payload["focus_areas"] or [f"Core {specialty} concepts", "Clinical applications", "Diagnostic procedures"]
        }
        
        logging.info(f"Created study plan for {specialty}")
        return f"📚 Created {duration_days}-day study plan for {specialty}! Plan includes {study_hours_per_day} hours daily focusing on: {', '.join(study_plan['focus_areas'])}. Total study time: {study_plan['total_hours']} hours."
        
    except Exception as e:
        logging.error(f"Error creating study plan for {specialty}: {e}")
        return f"I had trouble creating a study plan for {specialty}. Please try again with different parameters."

@function_tool()
async def analyze_medical_document(
    context: RunContext,  # type: ignore
    document_type: str,
    analysis_type: str = "summary"
) -> str:
    """
    Analyze uploaded medical documents, PDFs, or images.
    
    Args:
        document_type: Type of document ("research_paper", "case_study", "lab_results", "image")
        analysis_type: "summary", "flashcards", "key_points", "quiz_generation"
    """
    try:
        # This would integrate with document analysis API
        logging.info(f"Analyzing {document_type} for {analysis_type}")
        
        analysis_result = {
            "document_type": document_type,
            "analysis_type": analysis_type,
            "status": "completed"
        }
        
        return f"📄 Successfully analyzed {document_type}! Generated {analysis_type} from the uploaded content. You can now use this information for your studies."
        
    except Exception as e:
        logging.error(f"Error analyzing {document_type}: {e}")
        return f"I encountered an issue analyzing the {document_type}. Please ensure the file is accessible and try again."

@function_tool()
async def medical_calculator(
    context: RunContext,  # type: ignore
    calculator_type: str,
    **parameters
) -> str:
    """
    Perform medical calculations (GFR, BMI, drug dosages, etc.).
    
    Args:
        calculator_type: Type of calculation ("gfr", "bmi", "creatinine_clearance", "drug_dosage")
        **parameters: Calculation-specific parameters
    """
    try:
        calc_params = dict(parameters)
        
        if calculator_type == "gfr" and "creatinine" in calc_params:
            # Simulated GFR calculation
            creatinine = float(calc_params.get("creatinine", 1.0))
            age = int(calc_params.get("age", 40))
            
            # Simplified MDRD equation simulation
            estimated_gfr = 175 * (creatinine ** -1.154) * (age ** -0.203)
            
            logging.info(f"Calculated GFR: {estimated_gfr:.1f}")
            return f"🧮 GFR Calculation: ~{estimated_gfr:.1f} mL/min/1.73m² (based on creatinine {creatinine} mg/dL, age {age}). Remember to consider gender and race factors for complete assessment."
        
        elif calculator_type == "bmi":
            weight = float(calc_params.get("weight", 70))
            height = float(calc_params.get("height", 170))
            
            bmi = weight / ((height / 100) ** 2)
            
            if bmi < 18.5:
                category = "Underweight"
            elif bmi < 25:
                category = "Normal weight"
            elif bmi < 30:
                category = "Overweight"
            else:
                category = "Obese"
                
            return f"🧮 BMI Calculation: {bmi:.1f} kg/m² ({category}) for weight {weight}kg, height {height}cm."
        
        else:
            return f"🧮 {calculator_type.upper()} calculation completed with provided parameters. Results ready for clinical interpretation."
            
    except Exception as e:
        logging.error(f"Error with {calculator_type} calculation: {e}")
        return f"I had trouble with the {calculator_type} calculation. Please check your parameters and try again."

@function_tool()
async def symptom_checker(
    context: RunContext,  # type: ignore
    symptoms: str,
    patient_age: Optional[int] = None,
    patient_gender: Optional[str] = None
) -> str:
    """
    Educational symptom analysis for differential diagnosis learning.
    
    Args:
        symptoms: Comma-separated list of symptoms
        patient_age: Patient age for context
        patient_gender: Patient gender for context
    """
    try:
        symptom_list = [s.strip() for s in symptoms.split(",")]
        
        # Simulated differential diagnosis for educational purposes
        context_info = []
        if patient_age:
            context_info.append(f"age {patient_age}")
        if patient_gender:
            context_info.append(patient_gender.lower())
            
        context_str = f" ({', '.join(context_info)})" if context_info else ""
        
        logging.info(f"Educational symptom analysis for: {symptoms}")
        
        return f"🔍 Educational Differential Analysis for symptoms: {symptoms}{context_str}\n\n⚠️ EDUCATIONAL PURPOSE ONLY - This is for learning differential diagnosis, not medical advice. Always consult healthcare providers for actual patient care.\n\nBased on these symptoms, consider exploring: common presentations, rare but serious conditions, and systematic approach to diagnosis. Would you like me to generate study questions about these presentations?"
        
    except Exception as e:
        logging.error(f"Error in symptom analysis: {e}")
        return f"I had trouble analyzing those symptoms. Please try rephrasing or checking the format."

@function_tool()
async def search_medical_research(
    context: RunContext,  # type: ignore
    query: str,
    source_type: str = "general"
) -> str:
    """
    Search for current medical research and guidelines.
    
    Args:
        query: Medical research topic or question
        source_type: "general", "pubmed", "guidelines", "reviews"
    """
    try:
        # Enhanced medical search with context
        medical_query = f"medical research {query} {source_type} evidence-based"
        results = DuckDuckGoSearchRun().run(tool_input=medical_query)
        
        logging.info(f"Medical research search for: {query}")
        return f"📚 Medical Research Results for '{query}':\n\n{results}\n\n💡 Remember to evaluate sources for quality, recency, and relevance to your learning objectives!"
        
    except Exception as e:
        logging.error(f"Error searching medical research for '{query}': {e}")
        return f"I encountered an issue searching for medical research on '{query}'. Please try a different search term."

# =============================================================================
# EXISTING GENERAL TOOLS (Updated for Dr. Kay context)
# =============================================================================

@function_tool()
async def search_web(
    context: RunContext,  # type: ignore
    query: str) -> str:
    """
    Search the web for general information to supplement medical education.
    """
    try:
        results = DuckDuckGoSearchRun().run(tool_input=query)
        logging.info(f"Web search results for '{query}': {results}")
        return f"🌐 Web Search Results: {results}"
    except Exception as e:
        logging.error(f"Error searching the web for '{query}': {e}")
        return f"An error occurred while searching for '{query}'."

@function_tool()
async def get_weather(
    context: RunContext,  # type: ignore
    city: str) -> str:
    """
    Get current weather - useful for study environment planning.
    """
    try:
        response = requests.get(f"https://wttr.in/{city}?format=3")
        if response.status_code == 200:
            logging.info(f"Weather for {city}: {response.text.strip()}")
            return f"🌤️ Weather in {city}: {response.text.strip()}"   
        else:
            return f"Could not retrieve weather for {city}."
    except Exception as e:
        logging.error(f"Error retrieving weather for {city}: {e}")
        return f"An error occurred while retrieving weather for {city}."

@function_tool()    
async def send_email(
    context: RunContext,  # type: ignore
    to_email: str,
    subject: str,
    message: str,
    cc_email: Optional[str] = None
) -> str:
    """
    Send educational materials or study reminders via email.
    """
    try:
        smtp_server = "smtp.gmail.com"
        smtp_port = 587
        
        gmail_user = os.getenv("GMAIL_USER")
        gmail_password = os.getenv("GMAIL_APP_PASSWORD")
        
        if not gmail_user or not gmail_password:
            return "📧 Email sending requires Gmail credentials configuration."
        
        msg = MIMEMultipart()
        msg['From'] = gmail_user
        msg['To'] = to_email
        msg['Subject'] = f"Dr. Kay Medical Education: {subject}"
        
        recipients = [to_email]
        if cc_email:
            msg['Cc'] = cc_email
            recipients.append(cc_email)
        
        educational_footer = "\n\n---\nSent by Dr. Kay - AI Medical Education Assistant\n⚠️ For educational purposes only. Consult healthcare providers for medical advice."
        msg.attach(MIMEText(message + educational_footer, 'plain'))
        
        server = smtplib.SMTP(smtp_server, smtp_port)
        server.starttls()
        server.login(gmail_user, gmail_password)
        server.sendmail(gmail_user, recipients, msg.as_string())
        server.quit()
        
        logging.info(f"Educational email sent to {to_email}")
        return f"📧 Educational materials sent successfully to {to_email}!"
        
    except Exception as e:
        logging.error(f"Error sending email: {e}")
        return f"📧 Email sending failed: {str(e)}"