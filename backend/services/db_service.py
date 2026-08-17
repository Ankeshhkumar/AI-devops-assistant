import psycopg2
import os

def get_connection():
    return psycopg2.connect(
    database=os.getenv("DB_NAME", "ai_chat"),
    user=os.getenv("DB_USER", "postgres"),
    password=os.getenv("DB_PASSWORD", "postgres"),
    host=os.getenv("DB_HOST", "localhost"),  # key change
    port="5432"
    )       


def save_chat(query, response):
    conn = get_connection()
    cur = conn.cursor()
    
    cur.execute(
        "INSERT INTO chats (query, response) VALUES (%s, %s)",
        (query, response)
    )
    
    conn.commit()
    cur.close()
    conn.close()

def get_chats():
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("SELECT query, response FROM chats ORDER BY id ASC")
    rows = cur.fetchall()

    cur.close()
    conn.close()

    return rows
    
def clear_chats():
    try:
        conn = get_connection()
        cur = conn.cursor()

        cur.execute("DELETE FROM chats")
        rows_deleted = cur.rowcount  # Get number of rows deleted

        conn.commit()
        cur.close()
        conn.close()

        return rows_deleted  # Return number of rows deleted

    except Exception as e:
        print("DB Error:", e)
        return 0  # Or return None, or raise the exception


