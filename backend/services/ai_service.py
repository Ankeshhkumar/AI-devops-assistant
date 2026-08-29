import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("OPENROUTER_API_KEY")
MODEL_NAME = os.getenv(
    "OPENROUTER_MODEL",
    "google/gemma-4-26b-a4b-it:free"
)

if not API_KEY:
    raise RuntimeError(
        "OPENROUTER_API_KEY is not configured"
    )

client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=API_KEY,
)


def get_ai_response(query: str):

    try:
        print(
            f"🚀 Sending request to OpenRouter: "
            f"{MODEL_NAME}..."
        )

        response = client.chat.completions.create(
            model=MODEL_NAME,
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are a helpful DevOps assistant. "
                        "Provide clear, concise and practical answers. "
                        "Do not expose internal reasoning. "
                        "Focus on the final answer, commands, "
                        "configuration examples and troubleshooting steps."
                    ),
                },
                {
                    "role": "user",
                    "content": query,
                },
            ],
            temperature=0.2,
            max_tokens=1024,
        )

        choice = response.choices[0]
        answer = choice.message.content

        print("✅ Response successfully received from OpenRouter.")
        print(f"🔍 Finish reason: {choice.finish_reason}")
        print(f"🔍 Content available: {answer is not None}")

        if not answer:
            raise RuntimeError(
                "OpenRouter returned an empty final response"
            )

        return answer.strip()

    except Exception as e:
        print(f"❌ OpenRouter API Error: {e}")
        raise RuntimeError(
            f"Failed to process OpenRouter request: {e}"
        )
