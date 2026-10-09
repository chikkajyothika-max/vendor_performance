import sqlite3
import json
import os
import uuid
import time
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from dotenv import load_dotenv
from .auth import hash_password

# Load environment variables
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "").strip()
DB_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SQLITE_PATH = os.path.join(DB_DIR, "vendor_sync.db")
SEED_JSON = os.path.join(os.path.dirname(os.path.abspath(__file__)), "seed_data.json")

IS_POSTGRES = bool(DATABASE_URL and (DATABASE_URL.startswith("postgresql://") or DATABASE_URL.startswith("postgres://")))

if IS_POSTGRES:
    try:
        import psycopg2
        import psycopg2.extras
    except ImportError:
        IS_POSTGRES = False

class DBConnection:
    """Unified wrapper around SQLite and PostgreSQL connections."""
    def __init__(self):
        self.is_postgres = IS_POSTGRES
        if self.is_postgres:
            # Fix postgres:// scheme if needed for SQLAlchemy/psycopg2
            url = DATABASE_URL
            if url.startswith("postgres://"):
                url = "postgresql://" + url[len("postgres://"):]
            self.conn = psycopg2.connect(url)
            self.cursor_factory = psycopg2.extras.RealDictCursor
        else:
            self.conn = sqlite3.connect(SQLITE_PATH)
            self.conn.row_factory = sqlite3.Row
            self.cursor_factory = None

    def cursor(self):
        if self.is_postgres:
            return self.conn.cursor(cursor_factory=self.cursor_factory)
        return self.conn.cursor()

    def commit(self):
        self.conn.commit()

    def rollback(self):
        self.conn.rollback()

    def close(self):
        self.conn.close()

def get_connection():
    return DBConnection()

def execute_query(cursor, query: str, params: tuple = ()):
    """Executes query adapting parameter syntax between SQLite (?) and PostgreSQL (%s)."""
    if IS_POSTGRES:
        # Convert ? placeholders to %s for PostgreSQL
        pg_query = query.replace("?", "%s")
        cursor.execute(pg_query, params)
    else:
        cursor.execute(query, params)
    return cursor

def get_database_health() -> Dict[str, Any]:
    """Healthcheck endpoint utility reporting database status and latency."""
    t0 = time.time()
    try:
        db = get_connection()
        cur = db.cursor()
        execute_query(cur, "SELECT COUNT(*) as count FROM users")
        row = cur.fetchone()
        user_count = row["count"] if IS_POSTGRES else row[0]
        db.close()
        latency_ms = round((time.time() - t0) * 1000, 2)
        return {
            "status": "healthy",
            "dialect": "PostgreSQL" if IS_POSTGRES else "SQLite",
            "database_url_configured": bool(DATABASE_URL),
            "latency_ms": latency_ms,
            "user_count": user_count
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e),
            "dialect": "PostgreSQL" if IS_POSTGRES else "SQLite"
        }

def init_db():
    db = get_connection()
    cursor = db.cursor()

    # Create users table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role VARCHAR(64) NOT NULL DEFAULT 'procurement_manager',
        created_at VARCHAR(64) NOT NULL
    )
    """)

    # Create vendors table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS vendors (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(128) NOT NULL,
        email VARCHAR(255) NOT NULL,
        location VARCHAR(255) NOT NULL,
        status VARCHAR(64) NOT NULL DEFAULT 'Active',
        contract_value DOUBLE PRECISION DEFAULT 100000.0,
        score INTEGER NOT NULL,
        risk_score INTEGER NOT NULL,
        risk VARCHAR(64) NOT NULL,
        delivery INTEGER NOT NULL,
        quality INTEGER NOT NULL,
        cost INTEGER NOT NULL,
        reliability INTEGER NOT NULL,
        orders INTEGER NOT NULL,
        delayed INTEGER NOT NULL,
        complaints INTEGER NOT NULL,
        defects INTEGER NOT NULL,
        trend TEXT NOT NULL,
        history TEXT NOT NULL
    )
    """ if IS_POSTGRES else """
    CREATE TABLE IF NOT EXISTS vendors (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        email TEXT NOT NULL,
        location TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'Active',
        contract_value REAL DEFAULT 100000.0,
        score INTEGER NOT NULL,
        risk_score INTEGER NOT NULL,
        risk TEXT NOT NULL,
        delivery INTEGER NOT NULL,
        quality INTEGER NOT NULL,
        cost INTEGER NOT NULL,
        reliability INTEGER NOT NULL,
        orders INTEGER NOT NULL,
        delayed INTEGER NOT NULL,
        complaints INTEGER NOT NULL,
        defects INTEGER NOT NULL,
        trend TEXT NOT NULL,
        history TEXT NOT NULL
    )
    """)

    # Create orders table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS orders (
        id VARCHAR(64) PRIMARY KEY,
        vendor_id VARCHAR(64) NOT NULL,
        vendor VARCHAR(255) NOT NULL,
        category VARCHAR(128) NOT NULL,
        amount DOUBLE PRECISION NOT NULL,
        date VARCHAR(64) NOT NULL,
        status VARCHAR(64) NOT NULL,
        FOREIGN KEY (vendor_id) REFERENCES vendors (id) ON DELETE CASCADE
    )
    """ if IS_POSTGRES else """
    CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY,
        vendor_id TEXT NOT NULL,
        vendor TEXT NOT NULL,
        category TEXT NOT NULL,
        amount REAL NOT NULL,
        date TEXT NOT NULL,
        status TEXT NOT NULL,
        FOREIGN KEY (vendor_id) REFERENCES vendors (id) ON DELETE CASCADE
    )
    """)

    # Create notes table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS notes (
        id VARCHAR(64) PRIMARY KEY,
        vendor_id VARCHAR(64) NOT NULL,
        author VARCHAR(255) NOT NULL,
        note TEXT NOT NULL,
        created_at VARCHAR(64) NOT NULL,
        FOREIGN KEY (vendor_id) REFERENCES vendors (id) ON DELETE CASCADE
    )
    """ if IS_POSTGRES else """
    CREATE TABLE IF NOT EXISTS notes (
        id TEXT PRIMARY KEY,
        vendor_id TEXT NOT NULL,
        author TEXT NOT NULL,
        note TEXT NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY (vendor_id) REFERENCES vendors (id) ON DELETE CASCADE
    )
    """)

    # Create monthly_stats table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS monthly_stats (
        month VARCHAR(64) PRIMARY KEY,
        score INTEGER NOT NULL
    )
    """ if IS_POSTGRES else """
    CREATE TABLE IF NOT EXISTS monthly_stats (
        month TEXT PRIMARY KEY,
        score INTEGER NOT NULL
    )
    """)

    db.commit()

    # Seed data if users table is empty
    cursor.execute("SELECT COUNT(*) as count FROM users")
    row = cursor.fetchone()
    count = row["count"] if IS_POSTGRES else row["count"]
    if count == 0:
        seed_database(db)

    db.close()

def seed_database(db: DBConnection):
    cursor = db.cursor()
    now_iso = datetime.now(timezone.utc).isoformat()

    # Create default admin user
    execute_query(cursor, """
    INSERT INTO users (id, name, email, password_hash, role, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
    """, (
        "usr-admin",
        "Alex Morgan",
        "admin@vendorsync.ai",
        hash_password("admin123"),
        "admin",
        now_iso
    ))

    # Load seed data from seed_data.json if exists
    if os.path.exists(SEED_JSON):
        with open(SEED_JSON, "r", encoding="utf-8") as f:
            data = json.load(f)

        dash = data.get("dashboard", {})
        vendors = dash.get("vendors", [])
        vendor_details = data.get("vendors", {})
        orders = dash.get("orders", [])
        monthly = dash.get("monthly", [])

        # Insert monthly stats
        for m in monthly:
            if IS_POSTGRES:
                execute_query(cursor, """
                INSERT INTO monthly_stats (month, score) VALUES (?, ?)
                ON CONFLICT (month) DO UPDATE SET score = EXCLUDED.score
                """, (m["month"], m["score"]))
            else:
                execute_query(cursor, "INSERT OR REPLACE INTO monthly_stats (month, score) VALUES (?, ?)", (m["month"], m["score"]))

        # Insert vendors
        for v in vendors:
            vid = v["id"]
            v_detail = vendor_details.get(vid, {})
            history_json = json.dumps(v_detail.get("history", [
                {"month": "Jan", "score": v["score"] - 4, "delivery": v["delivery"] - 2, "quality": v["quality"] - 3},
                {"month": "Feb", "score": v["score"] - 3, "delivery": v["delivery"] - 1, "quality": v["quality"] - 2},
                {"month": "Mar", "score": v["score"] - 2, "delivery": v["delivery"], "quality": v["quality"] - 1},
                {"month": "Apr", "score": v["score"] - 1, "delivery": v["delivery"], "quality": v["quality"]},
                {"month": "May", "score": v["score"], "delivery": v["delivery"], "quality": v["quality"]},
                {"month": "Jun", "score": v["score"], "delivery": v["delivery"], "quality": v["quality"]},
            ]))
            trend_json = json.dumps(v.get("trend", [v["score"] - 4, v["score"] - 2, v["score"]]))

            if IS_POSTGRES:
                execute_query(cursor, """
                INSERT INTO vendors (
                    id, name, category, email, location, status, contract_value,
                    score, risk_score, risk, delivery, quality, cost, reliability,
                    orders, delayed, complaints, defects, trend, history
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT (id) DO UPDATE SET
                    name = EXCLUDED.name, score = EXCLUDED.score, risk_score = EXCLUDED.risk_score,
                    risk = EXCLUDED.risk, delivery = EXCLUDED.delivery, quality = EXCLUDED.quality,
                    trend = EXCLUDED.trend, history = EXCLUDED.history
                """, (
                    vid, v["name"], v["category"], v["email"], v["location"], v.get("status", "Active"),
                    v.get("contract_value", 100000.0), v["score"], v["risk_score"], v["risk"],
                    v["delivery"], v["quality"], v["cost"], v["reliability"],
                    v["orders"], v["delayed"], v["complaints"], v["defects"],
                    trend_json, history_json
                ))
            else:
                execute_query(cursor, """
                INSERT OR REPLACE INTO vendors (
                    id, name, category, email, location, status, contract_value,
                    score, risk_score, risk, delivery, quality, cost, reliability,
                    orders, delayed, complaints, defects, trend, history
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    vid, v["name"], v["category"], v["email"], v["location"], v.get("status", "Active"),
                    v.get("contract_value", 100000.0), v["score"], v["risk_score"], v["risk"],
                    v["delivery"], v["quality"], v["cost"], v["reliability"],
                    v["orders"], v["delayed"], v["complaints"], v["defects"],
                    trend_json, history_json
                ))

        # Insert orders
        for o in orders:
            if IS_POSTGRES:
                execute_query(cursor, """
                INSERT INTO orders (id, vendor_id, vendor, category, amount, date, status)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT (id) DO NOTHING
                """, (
                    o["id"], o["vendor_id"], o["vendor"], o["category"], o["amount"], o["date"], o["status"]
                ))
            else:
                execute_query(cursor, """
                INSERT OR REPLACE INTO orders (id, vendor_id, vendor, category, amount, date, status)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                """, (
                    o["id"], o["vendor_id"], o["vendor"], o["category"], o["amount"], o["date"], o["status"]
                ))

    db.commit()

# --- Query helpers ---

def get_user_by_email(email: str) -> Optional[Dict[str, Any]]:
    db = get_connection()
    cursor = db.cursor()
    execute_query(cursor, "SELECT * FROM users WHERE LOWER(email) = LOWER(?)", (email,))
    row = cursor.fetchone()
    db.close()
    return dict(row) if row else None

def get_user_by_id(user_id: str) -> Optional[Dict[str, Any]]:
    db = get_connection()
    cursor = db.cursor()
    execute_query(cursor, "SELECT * FROM users WHERE id = ?", (user_id,))
    row = cursor.fetchone()
    db.close()
    return dict(row) if row else None

def create_user(name: str, email: str, password_hash: str, role: str = "procurement_manager") -> Dict[str, Any]:
    db = get_connection()
    cursor = db.cursor()
    user_id = f"usr-{uuid.uuid4().hex[:8]}"
    created_at = datetime.now(timezone.utc).isoformat()
    execute_query(cursor, """
    INSERT INTO users (id, name, email, password_hash, role, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
    """, (user_id, name, email, password_hash, role, created_at))
    db.commit()
    db.close()
    return {
        "id": user_id,
        "name": name,
        "email": email,
        "role": role,
        "created_at": created_at
    }

def get_all_vendors() -> List[Dict[str, Any]]:
    db = get_connection()
    cursor = db.cursor()
    execute_query(cursor, "SELECT * FROM vendors ORDER BY score DESC")
    rows = cursor.fetchall()
    db.close()
    result = []
    for r in rows:
        d = dict(r)
        if isinstance(d.get("trend"), str):
            d["trend"] = json.loads(d["trend"])
        d.pop("history", None)
        result.append(d)
    return result

def get_vendor_by_id(vendor_id: str) -> Optional[Dict[str, Any]]:
    db = get_connection()
    cursor = db.cursor()
    execute_query(cursor, "SELECT * FROM vendors WHERE id = ?", (vendor_id,))
    row = cursor.fetchone()
    db.close()
    if not row:
        return None
    d = dict(row)
    if isinstance(d.get("trend"), str):
        d["trend"] = json.loads(d["trend"])
    if isinstance(d.get("history"), str):
        d["history"] = json.loads(d["history"])
    return d

def create_vendor(data: Dict[str, Any]) -> Dict[str, Any]:
    db = get_connection()
    cursor = db.cursor()
    vendor_id = f"V-{uuid.uuid4().hex[:4].upper()}"

    # Default metrics for newly added vendor
    delivery = 85
    quality = 85
    cost = 80
    reliability = 85
    orders = 10
    delayed = 1
    complaints = 0
    defects = 1

    from .scoring import calculate_vendor_metrics
    metrics = calculate_vendor_metrics(delivery, quality, cost, reliability, orders, delayed, complaints, defects)

    trend = [metrics["score"] - 3, metrics["score"] - 1, metrics["score"]]
    history = [
        {"month": "Apr", "score": metrics["score"] - 3, "delivery": delivery - 2, "quality": quality - 1},
        {"month": "May", "score": metrics["score"] - 1, "delivery": delivery - 1, "quality": quality},
        {"month": "Jun", "score": metrics["score"], "delivery": delivery, "quality": quality},
    ]

    execute_query(cursor, """
    INSERT INTO vendors (
        id, name, category, email, location, status, contract_value,
        score, risk_score, risk, delivery, quality, cost, reliability,
        orders, delayed, complaints, defects, trend, history
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        vendor_id, data["name"], data["category"], data["email"], data["location"], "Active",
        data.get("contract_value", 100000.0), metrics["score"], metrics["risk_score"], metrics["risk"],
        delivery, quality, cost, reliability, orders, delayed, complaints, defects,
        json.dumps(trend), json.dumps(history)
    ))
    db.commit()
    db.close()

    return get_vendor_by_id(vendor_id)

def delete_vendor(vendor_id: str) -> bool:
    db = get_connection()
    cursor = db.cursor()
    execute_query(cursor, "DELETE FROM orders WHERE vendor_id = ?", (vendor_id,))
    execute_query(cursor, "DELETE FROM notes WHERE vendor_id = ?", (vendor_id,))
    execute_query(cursor, "DELETE FROM vendors WHERE id = ?", (vendor_id,))
    affected = cursor.rowcount
    db.commit()
    db.close()
    return affected > 0

def get_vendor_profile(vendor_id: str) -> Optional[Dict[str, Any]]:
    vendor = get_vendor_by_id(vendor_id)
    if not vendor:
        return None

    db = get_connection()
    cursor = db.cursor()

    # Get notes
    execute_query(cursor, "SELECT * FROM notes WHERE vendor_id = ? ORDER BY created_at DESC", (vendor_id,))
    notes = [dict(r) for r in cursor.fetchall()]

    # Get orders
    execute_query(cursor, "SELECT * FROM orders WHERE vendor_id = ? ORDER BY date DESC", (vendor_id,))
    orders = [dict(r) for r in cursor.fetchall()]

    db.close()

    history = vendor.pop("history", [])

    return {
        "vendor": vendor,
        "history": history,
        "notes": notes,
        "orders": orders
    }

def add_vendor_note(vendor_id: str, author: str, note_text: str) -> Dict[str, Any]:
    db = get_connection()
    cursor = db.cursor()
    note_id = f"note-{uuid.uuid4().hex[:8]}"
    created_at = datetime.now(timezone.utc).isoformat()
    execute_query(cursor, """
    INSERT INTO notes (id, vendor_id, author, note, created_at)
    VALUES (?, ?, ?, ?, ?)
    """, (note_id, vendor_id, author, note_text, created_at))
    db.commit()
    db.close()
    return {
        "id": note_id,
        "vendor_id": vendor_id,
        "author": author,
        "note": note_text,
        "created_at": created_at
    }

def delete_vendor_note(vendor_id: str, note_id: str) -> bool:
    db = get_connection()
    cursor = db.cursor()
    execute_query(cursor, "DELETE FROM notes WHERE id = ? AND vendor_id = ?", (note_id, vendor_id))
    affected = cursor.rowcount
    db.commit()
    db.close()
    return affected > 0

def get_dashboard_data(user: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    db = get_connection()
    cursor = db.cursor()

    # Vendors
    vendors = get_all_vendors()

    # Orders
    execute_query(cursor, "SELECT * FROM orders ORDER BY date DESC")
    orders = [dict(r) for r in cursor.fetchall()]

    # Monthly stats
    execute_query(cursor, "SELECT month, score FROM monthly_stats")
    monthly = [dict(r) for r in cursor.fetchall()]

    db.close()

    # Compute aggregate stats
    total_vendors = len(vendors)
    low_count = sum(1 for v in vendors if v["risk"] == "Low")
    med_count = sum(1 for v in vendors if v["risk"] == "Medium")
    high_count = sum(1 for v in vendors if v["risk"] == "High")
    total_orders = len(orders)

    stats = {
        "vendors": total_vendors,
        "low": low_count,
        "medium": med_count,
        "high": high_count,
        "orders": total_orders
    }

    user_response = None
    if user:
        user_response = {
            "id": user["id"],
            "name": user["name"],
            "email": user["email"],
            "role": user["role"],
            "created_at": user["created_at"]
        }

    return {
        "user": user_response,
        "vendors": vendors,
        "orders": orders,
        "stats": stats,
        "monthly": monthly
    }
