import os
import json
import logging
from typing import Dict, Any, List, Optional
import httpx

logger = logging.getLogger("ai_service")

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "").strip()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "").strip()
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")

def get_ai_status() -> Dict[str, Any]:
    """Returns the current operational status of the AI integration."""
    has_gemini = bool(os.getenv("GEMINI_API_KEY", "").strip())
    has_openai = bool(os.getenv("OPENAI_API_KEY", "").strip())
    
    if has_gemini:
        return {
            "provider": "google_gemini",
            "model": GEMINI_MODEL,
            "connected": True,
            "mode": "Live Google Gemini AI",
            "message": "Connected to Google Gemini API"
        }
    elif has_openai:
        return {
            "provider": "openai",
            "model": "gpt-4o-mini",
            "connected": True,
            "mode": "Live OpenAI GPT",
            "message": "Connected to OpenAI API"
        }
    else:
        return {
            "provider": "heuristic_ai_engine",
            "model": "VendorSync-Local-Reasoning-v2",
            "connected": False,
            "mode": "Smart Local AI Engine (Offline / Standby)",
            "message": "Add GEMINI_API_KEY in .env to activate live Google Gemini 1.5 Flash"
        }

async def call_gemini_api(prompt: str, system_instruction: str = "") -> Optional[str]:
    """Direct HTTPS call to Google Gemini Flash API using httpx."""
    api_key = os.getenv("GEMINI_API_KEY", "").strip()
    if not api_key:
        return None

    # Use Gemini REST API
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent?key={api_key}"
    
    payload = {
        "contents": [
            {
                "parts": [
                    {"text": prompt}
                ]
            }
        ],
        "generationConfig": {
            "temperature": 0.2,
            "topP": 0.8,
            "maxOutputTokens": 2048,
        }
    }
    
    if system_instruction:
        payload["systemInstruction"] = {
            "parts": [{"text": system_instruction}]
        }

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(url, json=payload)
            if resp.status_code == 200:
                data = resp.json()
                candidates = data.get("candidates", [])
                if candidates:
                    parts = candidates[0].get("content", {}).get("parts", [])
                    if parts:
                        return parts[0].get("text", "")
            else:
                logger.warning(f"Gemini API returned status {resp.status_code}: {resp.text}")
    except Exception as e:
        logger.error(f"Error calling Gemini API: {e}")
    return None

async def call_openai_api(messages: List[Dict[str, str]]) -> Optional[str]:
    """Call OpenAI compatible API if OPENAI_API_KEY is configured."""
    api_key = os.getenv("OPENAI_API_KEY", "").strip()
    if not api_key:
        return None

    url = "https://api.openai.com/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    payload = {
        "model": "gpt-4o-mini",
        "messages": messages,
        "temperature": 0.2
    }

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(url, headers=headers, json=payload)
            if resp.status_code == 200:
                data = resp.json()
                choices = data.get("choices", [])
                if choices:
                    return choices[0].get("message", {}).get("content", "")
    except Exception as e:
        logger.error(f"Error calling OpenAI API: {e}")
    return None

def _local_fallback_risk_analysis(vendor: Dict[str, Any], notes: List[Any], orders: List[Any]) -> Dict[str, Any]:
    """Deterministic, explainable heuristic fallback when no external API key is active."""
    score = vendor.get("score", 75)
    delivery = vendor.get("delivery", 80)
    quality = vendor.get("quality", 80)
    cost = vendor.get("cost", 75)
    reliability = vendor.get("reliability", 80)
    orders_cnt = vendor.get("orders", 10)
    delayed_cnt = vendor.get("delayed", 0)
    complaints_cnt = vendor.get("complaints", 0)
    defects_cnt = vendor.get("defects", 0)
    
    delay_ratio = delayed_cnt / max(orders_cnt, 1)

    drivers = []
    positives = []

    if delivery >= 90:
        positives.append(f"Superior on-time dispatch rate ({delivery}%)")
    elif delivery < 78:
        drivers.append(f"Sub-par fulfillment schedule ({delivery}% on-time, {delayed_cnt} delayed orders)")
    else:
        positives.append(f"Acceptable delivery cadence ({delivery}%)")

    if quality >= 90:
        positives.append(f"Industry-leading manufacturing consistency ({quality}% score)")
    elif quality < 78:
        drivers.append(f"Quality defect frequency above threshold ({defects_cnt} recorded defect batches)")
    else:
        positives.append(f"Moderate quality adherence ({quality}%)")

    if complaints_cnt > 1:
        drivers.append(f"Elevated stakeholder friction ({complaints_cnt} open escalations)")
    else:
        positives.append("Clean stakeholder resolution history with low complaint volume")

    if cost >= 85:
        positives.append(f"Competitive unit rate efficiency ({cost}% rating)")
    elif cost < 70:
        drivers.append(f"Higher contract margin variance ({cost}% rating)")

    if score >= 85 and delay_ratio <= 0.08:
        risk_level = "Low"
        risk_score = vendor.get("risk_score", 12)
        summary = (
            f"{vendor.get('name')} demonstrates exemplary operational reliability across {orders_cnt} tracked cycles. "
            f"Fulfillment consistency sits at {delivery}% with negligible warranty disputes."
        )
        recommendations = [
            "Maintain Tier-1 preferred vendor status for future high-volume procurement.",
            "Consider negotiating multi-year volume tier discounts.",
            "Schedule standard bi-annual business reviews."
        ]
        negotiation = "Leverage prompt payment terms to negotiate an additional 3-5% rebate on bulk purchase orders."
    elif score >= 70:
        risk_level = "Medium"
        risk_score = max(vendor.get("risk_score", 35), 32)
        summary = (
            f"{vendor.get('name')} maintains viable baseline throughput ({score}%), but exhibits moderate vulnerability "
            f"in delivery schedule buffers ({delayed_cnt} delayed dispatches)."
        )
        recommendations = [
            "Retain as secondary or split-award supplier rather than single-source.",
            "Institute strict milestone tracking with weekly delivery checkpoints.",
            "Establish penalty clauses for delays exceeding 48 hours."
        ]
        negotiation = "Tie progress billing to verified on-time delivery milestones rather than advance disbursements."
    else:
        risk_level = "High"
        risk_score = max(vendor.get("risk_score", 72), 65)
        summary = (
            f"{vendor.get('name')} presents acute procurement exposure. Multiple performance bottlenecks detected "
            f"including {delayed_cnt} delayed orders and {complaints_cnt} service grievances."
        )
        recommendations = [
            "Freeze new capital purchase orders pending a mandatory supplier audit.",
            "Demand a 30-day root-cause Corrective Action Plan (CAPA).",
            "Qualify pre-approved backup vendors to avoid supply-chain disruption."
        ]
        negotiation = "Withhold 15% warranty retainage on active deliveries until zero-defect verification."

    return {
        "vendor_id": vendor.get("id"),
        "vendor_name": vendor.get("name"),
        "risk_level": risk_level,
        "risk_score": risk_score,
        "confidence_score": 92,
        "executive_summary": summary,
        "key_risk_drivers": drivers if drivers else ["No adverse risk drivers detected."],
        "positive_indicators": positives,
        "strategic_recommendations": recommendations,
        "contract_negotiation_advice": negotiation,
        "engine": "VendorSync Smart Local AI Reasoning (Offline)",
        "gemini_connected": False
    }

async def analyze_vendor_risk_ai(
    vendor: Dict[str, Any],
    notes: Optional[List[Dict[str, Any]]] = None,
    orders: Optional[List[Dict[str, Any]]] = None
) -> Dict[str, Any]:
    """
    Performs AI-powered risk diagnosis using Google Gemini Flash (with intelligent local fallback).
    """
    notes = notes or []
    orders = orders or []
    
    notes_summary = "; ".join([f"{n.get('author')}: {n.get('note')}" for n in notes[:5]]) if notes else "No notes recorded."
    recent_orders = [
        f"Order {o.get('id')}: ${o.get('amount')} ({o.get('status')})" for o in orders[:5]
    ]

    prompt = f"""
Analyze the following supplier data and output a structured JSON procurement risk analysis.

SUPPLIER PROFILE:
- ID: {vendor.get('id')}
- Name: {vendor.get('name')}
- Category: {vendor.get('category')}
- Location: {vendor.get('location')}
- Contract Value: ${vendor.get('contract_value', 100000)}
- Overall Score: {vendor.get('score')}%
- Delivery Reliability: {vendor.get('delivery')}%
- Product Quality: {vendor.get('quality')}%
- Cost Efficiency: {vendor.get('cost')}%
- Relationship Health: {vendor.get('reliability')}%
- Total Orders: {vendor.get('orders')}
- Delayed Orders: {vendor.get('delayed')}
- Customer Complaints: {vendor.get('complaints')}
- Defective Batches: {vendor.get('defects')}
- Recent Notes: {notes_summary}
- Recent Orders: {', '.join(recent_orders) if recent_orders else 'None'}

INSTRUCTIONS:
Return strictly a valid JSON object matching this schema without any markdown formatting or code fences:
{{
  "vendor_id": "{vendor.get('id')}",
  "vendor_name": "{vendor.get('name')}",
  "risk_level": "Low" | "Medium" | "High",
  "risk_score": <integer 1 to 100>,
  "confidence_score": <integer 80 to 99>,
  "executive_summary": "<concise 2-3 sentence executive briefing>",
  "key_risk_drivers": ["<specific driver 1>", "<specific driver 2>"],
  "positive_indicators": ["<positive 1>", "<positive 2>"],
  "strategic_recommendations": ["<actionable recommendation 1>", "<actionable recommendation 2>"],
  "contract_negotiation_advice": "<specific negotiation strategy>"
}}
"""
    system_instruction = (
        "You are an enterprise procurement risk analyst and AI auditor. "
        "Provide factual, grounded, analytical risk evaluations. Return only raw JSON."
    )

    # 1. Try Gemini
    raw_response = await call_gemini_api(prompt, system_instruction)
    
    # 2. Try OpenAI if Gemini not set
    if not raw_response and os.getenv("OPENAI_API_KEY", "").strip():
        messages = [
            {"role": "system", "content": system_instruction},
            {"role": "user", "content": prompt}
        ]
        raw_response = await call_openai_api(messages)

    if raw_response:
        try:
            # Clean markdown fences if present
            cleaned = raw_response.strip()
            if cleaned.startswith("```json"):
                cleaned = cleaned[7:]
            if cleaned.startswith("```"):
                cleaned = cleaned[3:]
            if cleaned.endswith("```"):
                cleaned = cleaned[:-3]
            data = json.loads(cleaned.strip())
            data["engine"] = f"Google Gemini Flash ({GEMINI_MODEL})"
            data["gemini_connected"] = True
            return data
        except Exception as e:
            logger.warning(f"Failed to parse LLM JSON: {e}, text: {raw_response[:200]}")

    # 3. Fallback to local reasoning
    return _local_fallback_risk_analysis(vendor, notes, orders)

async def chat_with_procurement_ai(
    user_message: str,
    portfolio: Dict[str, Any],
    chat_history: Optional[List[Dict[str, str]]] = None
) -> Dict[str, Any]:
    """
    RAG-grounded AI Copilot for procurement managers.
    Answers natural language queries using live database context.
    """
    chat_history = chat_history or []
    vendors = portfolio.get("vendors", [])
    stats = portfolio.get("stats", {})
    orders = portfolio.get("orders", [])

    # Format grounded context
    vendor_lines = [
        f"- {v.get('name')} (ID: {v.get('id')}, Category: {v.get('category')}, Score: {v.get('score')}%, Risk: {v.get('risk')}, Delivery: {v.get('delivery')}%, Quality: {v.get('quality')}%, Delayed: {v.get('delayed')}/{v.get('orders')}, Complaints: {v.get('complaints')})"
        for v in vendors
    ]
    context = (
        f"PORTFOLIO OVERVIEW:\n"
        f"Total Vendors: {stats.get('vendors')}, Low Risk: {stats.get('low')}, Medium Risk: {stats.get('medium')}, High Risk: {stats.get('high')}, Orders Tracked: {stats.get('orders')}\n\n"
        f"ACTIVE VENDORS:\n" + "\n".join(vendor_lines) + "\n\n"
        f"RECENT ORDERS SAMPLE ({min(5, len(orders))} shown):\n" +
        "\n".join([f"- Order {o.get('id')}: {o.get('vendor')} (${o.get('amount')}, Status: {o.get('status')})" for o in orders[:5]])
    )

    system_instruction = (
        "You are VendorSync Copilot, an expert AI procurement intelligence assistant. "
        "You help procurement managers evaluate supplier risks, compare vendors, draft negotiation strategies, and spot supply-chain bottlenecks. "
        "Ground all answers strictly on the supplied portfolio context. Be concise, professional, and actionable."
    )

    prompt = f"""
{context}

USER QUERY:
{user_message}

Please provide a well-structured, clear, professional answer formatted in markdown. Include specific data points from the portfolio.
"""

    raw_response = await call_gemini_api(prompt, system_instruction)
    
    if not raw_response and os.getenv("OPENAI_API_KEY", "").strip():
        messages = [
            {"role": "system", "content": system_instruction},
            {"role": "user", "content": prompt}
        ]
        raw_response = await call_openai_api(messages)

    if raw_response:
        return {
            "reply": raw_response.strip(),
            "provider": "Google Gemini",
            "model": GEMINI_MODEL,
            "connected": True
        }

    # Heuristic smart fallback for chat
    lower_q = user_message.lower()
    
    if "high risk" in lower_q or "attention" in lower_q or "risk" in lower_q and "highest" in lower_q:
        high_risk = [v for v in vendors if v.get("risk") == "High"]
        names = ", ".join([v.get("name") for v in high_risk]) if high_risk else "None currently"
        reply = (
            f"### 🚨 High Risk Supplier Alert\n\n"
            f"Based on live performance analytics, the following vendor(s) are classified as **High Risk**:\n\n"
        )
        for v in high_risk:
            reply += f"- **{v['name']}** (Score: `{v['score']}%`, Risk: `{v['risk_score']}%`): {v['delayed']} delayed orders, {v['complaints']} complaints. Primary bottleneck is delivery schedule variance.\n"
        reply += (
            f"\n**Actionable Advice:**\n"
            f"1. Freeze new high-dollar allocations.\n"
            f"2. Require a mandatory 30-day Corrective Action Plan.\n"
            f"3. Activate secondary pre-approved suppliers in the same category."
        )
    elif "compare" in lower_q or "versus" in lower_q or "vs" in lower_q:
        matched = [v for v in vendors if any(word in v.get("name", "").lower() for word in lower_q.split())]
        if len(matched) >= 2:
            v1, v2 = matched[0], matched[1]
            reply = (
                f"### 📊 Comparative Analysis: {v1['name']} vs {v2['name']}\n\n"
                f"| Metric | {v1['name']} | {v2['name']} | Superior Supplier |\n"
                f"|---|---|---|---|\n"
                f"| **Overall Score** | {v1['score']}% | {v2['score']}% | **{v1['name'] if v1['score'] > v2['score'] else v2['name']}** |\n"
                f"| **Delivery** | {v1['delivery']}% | {v2['delivery']}% | **{v1['name'] if v1['delivery'] > v2['delivery'] else v2['name']}** |\n"
                f"| **Quality** | {v1['quality']}% | {v2['quality']}% | **{v1['name'] if v1['quality'] > v2['quality'] else v2['name']}** |\n"
                f"| **Risk Rating** | {v1['risk']} ({v1['risk_score']}%) | {v2['risk']} ({v2['risk_score']}%) | **{v1['name'] if v1['risk_score'] < v2['risk_score'] else v2['name']}** |\n\n"
                f"**Recommendation:** For high-stakes contracts, prioritize **{v1['name'] if v1['score'] > v2['score'] else v2['name']}** due to superior consistency."
            )
        else:
            top_v = max(vendors, key=lambda x: x.get("score", 0)) if vendors else None
            reply = (
                f"### 📊 Vendor Comparison Overview\n\n"
                f"Your network contains **{len(vendors)}** suppliers across multiple categories. "
                f"The highest rated supplier is **{top_v['name'] if top_v else 'Northstar'}** with **{top_v['score'] if top_v else 96}%** overall performance.\n\n"
                f"Select specific vendor names (e.g. *'Compare Apex vs Northstar'*) for a detailed side-by-side metric matrix."
            )
    elif "recommend" in lower_q or "best" in lower_q or "order" in lower_q:
        low_risk = sorted([v for v in vendors if v.get("risk") == "Low"], key=lambda x: x.get("score", 0), reverse=True)
        top = low_risk[0] if low_risk else (vendors[0] if vendors else None)
        reply = (
            f"### 💡 Strategic Procurement Recommendation\n\n"
            f"For new strategic purchase allocations, the recommended primary partner is **{top['name']}** (`{top['id']}`):\n\n"
            f"- **Performance Score**: `{top['score']}%` (Top tier)\n"
            f"- **On-Time Delivery**: `{top['delivery']}%`\n"
            f"- **Quality Consistency**: `{top['quality']}%`\n"
            f"- **Risk Posture**: `{top['risk']} ({top['risk_score']}%)`\n\n"
            f"They possess the lowest operational exposure in your portfolio. You can safely assign high-volume purchase commitments to this vendor."
        )
    else:
        reply = (
            f"### 🤖 VendorSync AI Assistant Response\n\n"
            f"I have analyzed your vendor network of **{len(vendors)} active suppliers** ({stats.get('low', 0)} low risk, {stats.get('medium', 0)} medium risk, {stats.get('high', 0)} high risk).\n\n"
            f"**Key Network Observations:**\n"
            f"- **Top Performer**: {sorted(vendors, key=lambda x: x.get('score', 0), reverse=True)[0]['name'] if vendors else 'Northstar Components'}\n"
            f"- **Overall Order Fulfillment**: {stats.get('orders', 0)} tracked orders with stable throughput.\n\n"
            f"You can ask me to:\n"
            f"- *'Assess high risk vendors and propose remedies'*\n"
            f"- *'Compare Northstar vs Apex Microdevices'*\n"
            f"- *'Draft a vendor negotiation letter'*\n"
            f"- *'Recommend the best supplier for electronics'*"
        )

    return {
        "reply": reply,
        "provider": "VendorSync Local AI Engine (Offline)",
        "model": "VendorSync-Local-Reasoning-v2",
        "connected": False
    }
