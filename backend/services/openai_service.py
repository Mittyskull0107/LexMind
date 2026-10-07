import os

from dotenv import load_dotenv
from openai import AsyncOpenAI

load_dotenv()

client = AsyncOpenAI(
    api_key=os.getenv("GROQ_API_KEY"),
    base_url="https://api.groq.com/openai/v1"
)


async def generate_answer(
    message: str,
    memories: str
):
    response = await client.responses.create(
        model="openai/gpt-oss-20b",
        instructions=(
            "You are LexMind, an AI legal case assistant. "
            "Use the provided case memories to answer the lawyer's question. "
            "Do not invent facts that are not present in the case memories. "
            "If the memories do not contain enough information, say so."
        ),
        input=f"""
Case memories:
{memories}

Lawyer's question:
{message}
"""
    )

    return response.output_text