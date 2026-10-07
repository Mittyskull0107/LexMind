import asyncio

from services.hindsight_service import (
    create_case_memory_bank,
    add_memory,
    recall_memory
)


async def test():

    bank = await create_case_memory_bank(1)
    print("BANK:", bank)

    stored = await add_memory(
        1,
        "The client purchased the property in 2018."
    )
    print("STORED:", stored)

    recalled = await recall_memory(
        1,
        "When did the client purchase the property?"
    )
    print("RECALLED:", recalled)


asyncio.run(test())