import os
import redis

REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
REDIS_PORT = int(os.getenv("REDIS_PORT", "6379"))

redis_client = redis.Redis(
    host=REDIS_HOST,
    port=REDIS_PORT,
    decode_responses=True
)


def get_cached_response(query: str):
    return redis_client.get(f"chat:{query}")


def cache_response(query: str, response: str):
    redis_client.setex(
        f"chat:{query}",
        3600,
        response
    )


def clear_cache():
    keys = redis_client.keys("chat:*")

    if keys:
        redis_client.delete(*keys)

    return len(keys)
