import os
import logging
from dotenv import load_dotenv

from livekit import agents
from livekit.agents import AgentSession, Agent, RoomInputOptions
from livekit.plugins import (
    noise_cancellation,
)
from livekit.plugins import google
from prompts import AGENT_INSTRUCTION, SESSION_INSTRUCTION
from tools import (
    # Medical Education Tools
    generate_medical_quiz,
    create_study_plan,
    analyze_medical_document,
    medical_calculator,
    symptom_checker,
    search_medical_research,
    # General Tools
    search_web,
    get_weather,
    send_email
)

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Validate required environment variables
required_env_vars = {
    'LIVEKIT_URL': os.getenv('LIVEKIT_URL'),
    'LIVEKIT_API_KEY': os.getenv('LIVEKIT_API_KEY'),
    'LIVEKIT_API_SECRET': os.getenv('LIVEKIT_API_SECRET'),
    'GOOGLE_API_KEY': os.getenv('GOOGLE_API_KEY')
}

missing_vars = [var for var, value in required_env_vars.items() if not value]
if missing_vars:
    logger.error(f"Missing required environment variables: {missing_vars}")
    logger.error("Please check your .env file and ensure all required variables are set")
else:
    logger.info("✅ All required environment variables are configured")
    logger.info(f"🔗 LiveKit URL: {required_env_vars['LIVEKIT_URL']}")
    api_key = required_env_vars['LIVEKIT_API_KEY']
    logger.info(f"🔑 LiveKit API Key: {api_key[:10] if api_key else 'None'}...")


class DrKay(Agent):
    """
    Dr. Kay - AI-powered voice and video medical tutor and educational assistant
    Configured with your LiveKit credentials for real-time communication
    """
    def __init__(self) -> None:
        super().__init__(
            instructions=AGENT_INSTRUCTION,
            llm=google.beta.realtime.RealtimeModel(
                voice="Aoede",  # Professional female voice suitable for medical education
                temperature=0.7,  # Slightly lower for more consistent medical information
                model="gemini-2.0-flash-exp",  # Latest model for best performance
            ),
            tools=[
                # Core Medical Education Tools
                generate_medical_quiz,
                create_study_plan,
                analyze_medical_document,
                medical_calculator,
                symptom_checker,
                search_medical_research,
                # Supporting General Tools
                search_web,
                get_weather,
                send_email
            ],
        )
        logger.info("🩺 Dr. Kay agent initialized with medical education capabilities")


async def entrypoint(ctx: agents.JobContext):
    """
    Entry point for Dr. Kay medical tutor agent with enhanced educational capabilities
    Uses your configured LiveKit credentials for real-time communication
    """
    logger.info("🚀 Starting Dr. Kay agent session")
    logger.info(f"🏠 Room: {ctx.room.name}")
    
    session = AgentSession()

    await session.start(
        room=ctx.room,
        agent=DrKay(),
        room_input_options=RoomInputOptions(
            # Enable video for visual medical education support
            video_enabled=True,
            # Enhanced noise cancellation for clear medical discussions
            noise_cancellation=noise_cancellation.BVC(),
        ),
    )

    logger.info("🔗 Connected to LiveKit room successfully")
    await ctx.connect()

    # Start with medical education focused greeting
    await session.generate_reply(
        instructions=SESSION_INSTRUCTION,
    )
    
    logger.info("✅ Dr. Kay session started successfully")


if __name__ == "__main__":
    # Verify environment setup before starting
    if missing_vars:
        print("❌ Cannot start Dr. Kay agent: Missing environment variables")
        print(f"Missing: {missing_vars}")
        print("Please check your .env file and try again")
        exit(1)
    
    # Run Dr. Kay agent with medical education capabilities
    logger.info("🩺 Starting Dr. Kay - AI Medical Tutor Agent")
    agents.cli.run_app(agents.WorkerOptions(entrypoint_fnc=entrypoint))