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
load_dotenv()


class DrKay(Agent):
    """
    Dr. Kay - AI-powered voice and video medical tutor and educational assistant
    """
    def __init__(self) -> None:
        super().__init__(
            instructions=AGENT_INSTRUCTION,
            llm=google.beta.realtime.RealtimeModel(
                voice="Aoede",  # Professional female voice suitable for medical education
                temperature=0.7,  # Slightly lower for more consistent medical information
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


async def entrypoint(ctx: agents.JobContext):
    """
    Entry point for Dr. Kay medical tutor agent with enhanced educational capabilities
    """
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

    await ctx.connect()

    # Start with medical education focused greeting
    await session.generate_reply(
        instructions=SESSION_INSTRUCTION,
    )


if __name__ == "__main__":
    # Run Dr. Kay agent with medical education capabilities
    agents.cli.run_app(agents.WorkerOptions(entrypoint_fnc=entrypoint))