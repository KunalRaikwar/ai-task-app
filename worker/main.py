import os
import time
import json
import signal
import sys
from datetime import datetime
from dotenv import load_dotenv
import redis
from pymongo import MongoClient
from bson.objectid import ObjectId

load_dotenv()

# Configuration
REDIS_URL = os.getenv('REDIS_URL', 'redis://localhost:6379')
MONGODB_URI = os.getenv('MONGODB_URI', 'mongodb://localhost:27017/ai_task_platform')

# Graceful shutdown flag
is_shutting_down = False

def handle_sigterm(signum, frame):
    global is_shutting_down
    print("SIGTERM received. Gracefully shutting down worker...", flush=True)
    is_shutting_down = True

signal.signal(signal.SIGTERM, handle_sigterm)
signal.signal(signal.SIGINT, handle_sigterm)

def get_redis_client():
    try:
        r = redis.from_url(REDIS_URL, decode_responses=True)
        r.ping()
        print("Connected to Redis successfully", flush=True)
        return r
    except Exception as e:
        print(f"Redis Connection Error: {e}", flush=True)
        sys.exit(1)

def get_mongo_client():
    try:
        client = MongoClient(MONGODB_URI, serverSelectionTimeoutMS=5000)
        # Verify connection
        client.admin.command('ping')
        print("Connected to MongoDB successfully", flush=True)
        # Extract DB name from URI or default
        db_name = MONGODB_URI.split('/')[-1].split('?')[0]
        if not db_name or db_name == MONGODB_URI:
            db_name = 'ai_task_platform'
        return client[db_name]
    except Exception as e:
        print(f"MongoDB Connection Error: {e}", flush=True)
        sys.exit(1)

def log_task_step(tasks_col, task_id, message):
    log_entry = {
        "timestamp": datetime.utcnow(),
        "message": message
    }
    tasks_col.update_one(
        {"_id": ObjectId(task_id)},
        {"$push": {"logs": log_entry}}
    )

def process_task(tasks_col, task_id):
    try:
        task = tasks_col.find_one({"_id": ObjectId(task_id)})
        if not task:
            print(f"Task {task_id} not found in MongoDB", flush=True)
            return

        print(f"Processing Task {task_id}: {task.get('title')}", flush=True)

        # Update status to running
        tasks_col.update_one(
            {"_id": ObjectId(task_id)},
            {"$set": {"status": "running"}}
        )
        log_task_step(tasks_col, task_id, "Worker assigned. Operation initialized.")

        # Simulate intensive AI task computation time
        time.sleep(2.5)

        operation = task.get('operation')
        input_text = task.get('inputText', '')
        result = None

        log_task_step(tasks_col, task_id, f"Executing operation: '{operation}' on input payload.")

        if operation == 'uppercase':
            result = input_text.upper()
        elif operation == 'lowercase':
            result = input_text.lower()
        elif operation == 'reverse':
            result = input_text[::-1]
        elif operation == 'word_count':
            words = len(input_text.split())
            chars = len(input_text)
            result = {"words": words, "characters": chars, "summary": f"{words} words, {chars} characters"}
        else:
            raise ValueError(f"Unknown operation: {operation}")

        log_task_step(tasks_col, task_id, "Operation executed successfully. Compiling result output.")

        # Mark as success
        tasks_col.update_one(
            {"_id": ObjectId(task_id)},
            {
                "$set": {
                    "status": "success",
                    "result": result
                }
            }
        )
        print(f"Task {task_id} completed successfully.", flush=True)

    except Exception as e:
        print(f"Error processing task {task_id}: {str(e)}", flush=True)
        try:
            tasks_col.update_one(
                {"_id": ObjectId(task_id)},
                {
                    "$set": {
                        "status": "failed",
                        "result": {"error": str(e)}
                    }
                }
            )
            log_task_step(tasks_col, task_id, f"Execution failed with exception: {str(e)}")
        except Exception as db_err:
            print(f"DB Error while failing task: {db_err}", flush=True)

def main():
    print("Initializing Python Worker Node...", flush=True)
    redis_client = get_redis_client()
    mongo_db = get_mongo_client()
    tasks_col = mongo_db['tasks']

    print("Worker listening on Redis 'task_queue'...", flush=True)

    while not is_shutting_down:
        try:
            # BLPOP waits up to 3 seconds for an element in queue
            item = redis_client.blpop(['task_queue'], timeout=3)
            if item:
                queue_name, task_id = item
                process_task(tasks_col, task_id)
        except redis.ConnectionError:
            print("Redis connection error. Retrying in 5 seconds...", flush=True)
            time.sleep(5)
        except Exception as e:
            print(f"Unexpected error in worker loop: {e}", flush=True)
            time.sleep(2)

    print("Worker stopped gracefully.", flush=True)

if __name__ == "__main__":
    main()
