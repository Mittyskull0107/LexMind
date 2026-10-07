import os
from dotenv import load_dotenv
from hindsight_client import Hindsight

load_dotenv()

HINDSIGHT_API_KEY = os.getenv("HINDSIGHT_API_KEY")
HINDSIGHT_API_URL = os.getenv(
    "HINDSIGHT_API_URL",
    "https://api.hindsight.vectorize.io"
)

client = Hindsight(
    base_url=HINDSIGHT_API_URL,
    api_key=HINDSIGHT_API_KEY
)


async def create_case_memory_bank(case_id: int):
    bank_id = f"case-{case_id}"

    bank = await client.acreate_bank(
        bank_id=bank_id,
        name=f"LexMind Case {case_id}"
    )

    return bank


async def add_memory(case_id: int, memory: str):
    bank_id = f"case-{case_id}"

    result = await client.aretain(
        bank_id=bank_id,
        content=memory
    )

    return result


async def recall_memory(case_id: int, query: str):
    bank_id = f"case-{case_id}"

    result = await client.arecall(
        bank_id=bank_id,
        query=query
    )

    return result