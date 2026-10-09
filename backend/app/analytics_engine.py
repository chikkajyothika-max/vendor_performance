"""
VendorSync AI — Deterministic Grounded Analytics Engine
Processes live vendor, order, and performance data to produce verified,
reproducible calculations and factual tables.
Separation of Concerns:
User Query -> Intent Resolution -> Deterministic Calculation -> Verified Facts -> LLM Explanation
"""

import re
from typing import Dict, Any, List, Optional, Tuple

KPI_FORMULAS = {
    "score": {
        "name": "Overall Vendor Performance Score",
        "formula": "Score = (Delivery × 0.35) + (Quality × 0.35) + (Cost × 0.15) + (Reliability × 0.15)",
        "weights": {"delivery": 0.35, "quality": 0.35, "cost": 0.15, "reliability": 0.15},
        "description": "Weighted average evaluating operational reliability, manufacturing consistency, unit pricing, and relationship health.",
        "range": "40 to 99"
    },
    "risk_score": {
        "name": "Vendor Exposure Risk Score",
        "formula": "Risk Score = Base Risk (100 - Score) + Penalty",
        "penalty_formula": "Penalty = ((Delayed Orders / Total Orders) × 30) + (Complaints × 4) + (Defective Batches × 3)",
        "description": "Measures supply-chain exposure factoring in defect rates, dispatch delays, and customer escalations.",
        "thresholds": {"Low": "Score >= 85 and Risk <= 20", "Medium": "Score >= 68 and Risk <= 50", "High": "Score < 68 or Risk > 50"},
        "range": "5 to 95"
    },
    "delivery": {
        "name": "On-Time Dispatch Rate",
        "formula": "Delivery % = (On-time orders / Total orders) × 100",
        "description": "Fulfillment consistency measured across completed dispatches in the evaluation period."
    },
    "quality": {
        "name": "Quality Consistency Index",
        "formula": "Quality % = Defect-adjusted batch inspection score",
        "description": "Batch acceptance rates and conformance to technical specifications."
    },
    "cost": {
        "name": "Cost Efficiency Rating",
        "formula": "Cost % = Benchmark unit price competitiveness vs market baseline",
        "description": "Price consistency, discount tiers, and quote adherence."
    },
    "reliability": {
        "name": "Operational Reliability & Relationship Health",
        "formula": "Reliability % = SLA compliance and response time rating",
        "description": "Communication speed, contract adherence, and support responsiveness."
    }
}


def calculate_order_spend_by_vendor(orders: List[Dict[str, Any]]) -> Dict[str, float]:
    """Calculates total spend from tracked orders per vendor name/id."""
    spend_map: Dict[str, float] = {}
    for o in orders:
        v_name = o.get("vendor", "")
        amount = float(o.get("amount", 0.0))
        spend_map[v_name] = round(spend_map.get(v_name, 0.0) + amount, 2)
    return spend_map


def get_top_vendors(vendors: List[Dict[str, Any]], metric: str = "score", limit: int = 5, ascending: bool = False) -> List[Dict[str, Any]]:
    """Sorts vendors by specified numerical metric."""
    sorted_v = sorted(vendors, key=lambda x: float(x.get(metric, 0) or 0), reverse=not ascending)
    return sorted_v[:limit]


def get_vendors_by_spend(vendors: List[Dict[str, Any]], orders: List[Dict[str, Any]], limit: int = 5) -> List[Dict[str, Any]]:
    """Sorts vendors by contract value and recorded purchase order volume."""
    spend_map = calculate_order_spend_by_vendor(orders)
    enriched = []
    for v in vendors:
        v_copy = dict(v)
        recorded_spend = spend_map.get(v.get("name", ""), 0.0)
        v_copy["recorded_order_spend"] = recorded_spend
        v_copy["total_financial_commitment"] = round(float(v.get("contract_value", 0.0)) + recorded_spend, 2)
        enriched.append(v_copy)
    return sorted(enriched, key=lambda x: x["contract_value"], reverse=True)[:limit]


def compare_vendors_head_to_head(v1: Dict[str, Any], v2: Dict[str, Any]) -> Dict[str, Any]:
    """Generates a deterministic comparative matrix between two vendors."""
    metrics = ["score", "delivery", "quality", "cost", "reliability", "risk_score", "contract_value"]
    matrix = []
    v1_wins = 0
    v2_wins = 0

    for m in metrics:
        val1 = v1.get(m, 0)
        val2 = v2.get(m, 0)
        # For risk_score, lower is better
        if m == "risk_score":
            superior = v1["name"] if val1 < val2 else (v2["name"] if val2 < val1 else "Tie")
            if val1 < val2:
                v1_wins += 1
            elif val2 < val1:
                v2_wins += 1
        else:
            superior = v1["name"] if val1 > val2 else (v2["name"] if val2 > val1 else "Tie")
            if val1 > val2:
                v1_wins += 1
            elif val2 > val1:
                v2_wins += 1

        label = m.replace("_", " ").title()
        if m == "contract_value":
            formatted1 = f"${val1:,.2f}"
            formatted2 = f"${val2:,.2f}"
        else:
            formatted1 = f"{val1}%"
            formatted2 = f"{val2}%"

        matrix.append({
            "metric": label,
            "vendor_1_val": formatted1,
            "vendor_2_val": formatted2,
            "superior": superior
        })

    overall_winner = v1["name"] if v1_wins > v2_wins else (v2["name"] if v2_wins > v1_wins else "Equal Standing")

    return {
        "vendor_1": v1["name"],
        "vendor_2": v2["name"],
        "vendor_1_wins": v1_wins,
        "vendor_2_wins": v2_wins,
        "overall_winner": overall_winner,
        "matrix": matrix
    }


def find_anomalies_and_risks(vendors: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Identifies vendors showing statistical outliers or risk warnings."""
    anomalies = []
    for v in vendors:
        reasons = []
        delayed = v.get("delayed", 0)
        orders = max(v.get("orders", 1), 1)
        delay_rate = round((delayed / orders) * 100, 1)
        complaints = v.get("complaints", 0)
        defects = v.get("defects", 0)
        score = v.get("score", 0)
        trend = v.get("trend", [])

        if delay_rate >= 15.0:
            reasons.append(f"Elevated delay rate of {delay_rate}% ({delayed}/{orders} shipments late)")
        if complaints >= 3:
            reasons.append(f"High customer complaint volume ({complaints} logged disputes)")
        if defects >= 4:
            reasons.append(f"Defect rate alert ({defects} defective batches flagged)")
        if score < 75:
            reasons.append(f"Underperforming overall score ({score}% vs network benchmark)")
        if len(trend) >= 2 and (trend[-1] - trend[0]) <= -4:
            reasons.append(f"Negative 6-month trajectory ({trend[0]}% -> {trend[-1]}%)")

        if reasons:
            anomalies.append({
                "vendor_id": v.get("id"),
                "vendor_name": v.get("name"),
                "risk_level": v.get("risk"),
                "risk_score": v.get("risk_score"),
                "score": score,
                "reasons": reasons
            })
    return anomalies


def compute_portfolio_statistics(vendors: List[Dict[str, Any]], orders: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Computes exact aggregated figures across all suppliers and orders."""
    total_vendors = len(vendors)
    if total_vendors == 0:
        return {"total_vendors": 0}

    total_orders_count = sum(v.get("orders", 0) for v in vendors)
    total_delayed = sum(v.get("delayed", 0) for v in vendors)
    total_complaints = sum(v.get("complaints", 0) for v in vendors)
    total_defects = sum(v.get("defects", 0) for v in vendors)
    total_contract_value = sum(float(v.get("contract_value", 0.0) or 0.0) for v in vendors)

    avg_score = round(sum(v.get("score", 0) for v in vendors) / total_vendors, 1)
    avg_delivery = round(sum(v.get("delivery", 0) for v in vendors) / total_vendors, 1)
    avg_quality = round(sum(v.get("quality", 0) for v in vendors) / total_vendors, 1)
    avg_cost = round(sum(v.get("cost", 0) for v in vendors) / total_vendors, 1)
    avg_reliability = round(sum(v.get("reliability", 0) for v in vendors) / total_vendors, 1)

    low_risk = sum(1 for v in vendors if v.get("risk") == "Low")
    med_risk = sum(1 for v in vendors if v.get("risk") == "Medium")
    high_risk = sum(1 for v in vendors if v.get("risk") == "High")

    categories: Dict[str, int] = {}
    for v in vendors:
        cat = v.get("category", "Uncategorized")
        categories[cat] = categories.get(cat, 0) + 1

    total_recorded_order_spend = round(sum(float(o.get("amount", 0.0) or 0.0) for o in orders), 2)

    return {
        "total_vendors": total_vendors,
        "total_orders_count": total_orders_count,
        "total_delayed_orders": total_delayed,
        "network_delay_rate": round((total_delayed / max(total_orders_count, 1)) * 100, 1),
        "total_complaints": total_complaints,
        "total_defects": total_defects,
        "total_contract_value": round(total_contract_value, 2),
        "total_recorded_order_spend": total_recorded_order_spend,
        "avg_score": avg_score,
        "avg_delivery": avg_delivery,
        "avg_quality": avg_quality,
        "avg_cost": avg_cost,
        "avg_reliability": avg_reliability,
        "risk_distribution": {"Low": low_risk, "Medium": med_risk, "High": high_risk},
        "category_breakdown": categories
    }


def resolve_intent_and_facts(query: str, portfolio: Dict[str, Any], scoped_vendor_id: Optional[str] = None) -> Dict[str, Any]:
    """
    Main deterministic resolution pipeline.
    Classifies intent and computes verified facts from live database state.
    """
    q_lower = query.lower()
    vendors: List[Dict[str, Any]] = portfolio.get("vendors", [])
    orders: List[Dict[str, Any]] = portfolio.get("orders", [])

    # If scoped to a specific vendor
    scoped_vendor = None
    if scoped_vendor_id:
        scoped_vendor = next((v for v in vendors if v.get("id") == scoped_vendor_id), None)

    # Calculate portfolio aggregates
    stats = compute_portfolio_statistics(vendors, orders)

    intent = "general_query"
    verified_data: Dict[str, Any] = {"stats": stats}
    factual_table_md = ""

    def match_any(keywords: List[str], text: str) -> bool:
        for kw in keywords:
            if " " in kw:
                if kw in text:
                    return True
            else:
                if re.search(r'\b' + re.escape(kw) + r'\b', text):
                    return True
        return False

    is_compare = any(w in q_lower for w in ["compare", "versus", "vs", "difference between", "better than"])
    matched_vendors = [v for v in vendors if v.get("name", "").lower() in q_lower or v.get("id", "").lower() in q_lower]

    # 1. KPI Formula Explanations & Methodology
    is_kpi_query = (
        match_any(["kpi", "formula", "formulas", "methodology", "weighted", "weights", "scoring"], q_lower) or
        (("calculate" in q_lower or "calculated" in q_lower or "calculation" in q_lower) and any(w in q_lower for w in ["score", "risk", "rating", "performance", "metric"])) or
        ("how is" in q_lower and "score" in q_lower)
    )
    if is_kpi_query:
        intent = "kpi_explanation"
        verified_data["kpi_formulas"] = KPI_FORMULAS

        factual_table_md = "### [VERIFIED DATA] Official System KPI Formulas\n\n"
        for k, v in KPI_FORMULAS.items():
            factual_table_md += f"- **{v['name']}**: `{v['formula']}`\n  *Meaning*: {v['description']}\n"

    # 2. Vendor Comparison
    elif is_compare or len(matched_vendors) >= 2:
        intent = "comparison"
        if len(matched_vendors) >= 2:
            v1, v2 = matched_vendors[0], matched_vendors[1]
        elif len(vendors) >= 2:
            # Default to comparing top 2 vendors
            sorted_v = sorted(vendors, key=lambda x: x.get("score", 0), reverse=True)
            v1, v2 = sorted_v[0], sorted_v[1]
        else:
            v1, v2 = vendors[0], vendors[0]

        comparison = compare_vendors_head_to_head(v1, v2)
        verified_data["comparison"] = comparison

        factual_table_md = f"### [VERIFIED DATA] Comparison: {v1['name']} vs {v2['name']}\n\n"
        factual_table_md += "| Metric | " + v1['name'] + " | " + v2['name'] + " | Superior Supplier |\n"
        factual_table_md += "|---|---|---|---|\n"
        for row in comparison["matrix"]:
            factual_table_md += f"| **{row['metric']}** | {row['vendor_1_val']} | {row['vendor_2_val']} | {row['superior']} |\n"
        factual_table_md += f"\n*Deterministic Outcome: {comparison['overall_winner']} leads on {max(comparison['vendor_1_wins'], comparison['vendor_2_wins'])} of 7 key dimensions.*"

    # 3. Revenue / Sales / Spend / Contract Value
    elif match_any(["revenue", "sales", "spend", "contract", "highest spend", "highest value", "most money", "cost"], q_lower):
        intent = "revenue_spend"
        top_by_contract = get_vendors_by_spend(vendors, orders, limit=5)
        verified_data["top_financial_vendors"] = top_by_contract

        factual_table_md = "### [VERIFIED DATA] Top Suppliers by Financial Commitment\n\n"
        factual_table_md += "| Rank | Vendor Name | Category | Contract Value | Recorded Orders Spend | Overall Score |\n"
        factual_table_md += "|---|---|---|---|---|---|\n"
        for i, v in enumerate(top_by_contract, 1):
            factual_table_md += f"| {i} | **{v['name']}** ({v['id']}) | {v['category']} | ${v['contract_value']:,.2f} | ${v.get('recorded_order_spend', 0.0):,.2f} | {v['score']}% |\n"
        factual_table_md += f"\n*Total Network Contract Value: ${stats['total_contract_value']:,.2f} | Total Recorded Order Spend: ${stats['total_recorded_order_spend']:,.2f}*"

    # 4. High Risk / Lowest Performance / Delay / Complaints
    elif match_any(["lowest", "worst", "poor", "risk", "high risk", "late", "delay", "delays", "defect", "defects", "complaint", "complaints", "bottleneck", "bottlenecks", "attention"], q_lower):
        intent = "risk_and_defects"
        anomalies = find_anomalies_and_risks(vendors)
        lowest_score = get_top_vendors(vendors, metric="score", limit=3, ascending=True)
        lowest_delivery = get_top_vendors(vendors, metric="delivery", limit=3, ascending=True)
        verified_data["anomalies"] = anomalies
        verified_data["lowest_score"] = lowest_score
        verified_data["lowest_delivery"] = lowest_delivery

        factual_table_md = "### [VERIFIED DATA] Risk Assessment & Performance Bottlenecks\n\n"
        factual_table_md += "| Vendor | Category | Risk Level | Score | Delivery | Delay Rate | Complaints | Defects |\n"
        factual_table_md += "|---|---|---|---|---|---|---|---|\n"
        for v in vendors:
            if v.get("risk") in ["High", "Medium"] or v.get("score") < 80:
                orders_cnt = max(v.get("orders", 1), 1)
                d_rate = round((v.get("delayed", 0) / orders_cnt) * 100, 1)
                factual_table_md += f"| **{v['name']}** ({v['id']}) | {v['category']} | `{v['risk']}` ({v['risk_score']}%) | {v['score']}% | {v['delivery']}% | {d_rate}% | {v['complaints']} | {v['defects']} |\n"

    # 4. Highest Performance / Best Vendors / Recommendations
    elif any(w in q_lower for w in ["highest", "best", "top", "leader", "recommend", "preferred", "allocate"]):
        intent = "ranking_and_recommendations"
        top_scored = get_top_vendors(vendors, metric="score", limit=5)
        top_delivery = get_top_vendors(vendors, metric="delivery", limit=3)
        top_quality = get_top_vendors(vendors, metric="quality", limit=3)
        verified_data["top_scored"] = top_scored
        verified_data["top_delivery"] = top_delivery
        verified_data["top_quality"] = top_quality

        factual_table_md = "### [VERIFIED DATA] Top Performing Suppliers Matrix\n\n"
        factual_table_md += "| Rank | Vendor Name | Category | Overall Score | Delivery | Quality | Cost | Reliability | Risk |\n"
        factual_table_md += "|---|---|---|---|---|---|---|---|---|\n"
        for i, v in enumerate(top_scored, 1):
            factual_table_md += f"| {i} | **{v['name']}** ({v['id']}) | {v['category']} | **{v['score']}%** | {v['delivery']}% | {v['quality']}% | {v['cost']}% | {v['reliability']}% | `{v['risk']}` |\n"

    # 5. KPI Formula Explanations
    elif any(w in q_lower for w in ["kpi", "formula", "how is score calculated", "how do you calculate", "weighted", "methodology", "weights"]):
        intent = "kpi_explanation"
        verified_data["kpi_formulas"] = KPI_FORMULAS

        factual_table_md = "### [VERIFIED DATA] Official System KPI Formulas\n\n"
        for k, v in KPI_FORMULAS.items():
            factual_table_md += f"- **{v['name']}**: `{v['formula']}`\n  *Meaning*: {v['description']}\n"

    # 6. Trend / Trajectory Analysis
    elif any(w in q_lower for w in ["trend", "history", "trajectory", "change", "over time", "6-month", "improving", "declining"]):
        intent = "trends"
        trends_summary = []
        for v in vendors:
            trend = v.get("trend", [])
            if len(trend) >= 2:
                delta = trend[-1] - trend[0]
                direction = "Improving ↗" if delta > 0 else ("Declining ↘" if delta < 0 else "Stable →")
                trends_summary.append({
                    "vendor": v["name"],
                    "id": v["id"],
                    "start": trend[0],
                    "current": trend[-1],
                    "delta": delta,
                    "direction": direction,
                    "history": trend
                })
        verified_data["trends"] = trends_summary

        factual_table_md = "### [VERIFIED DATA] 6-Month Vendor Performance Trajectory\n\n"
        factual_table_md += "| Vendor | Initial Score | Current Score | Net Change | Trajectory | Full Trend (M1 -> M6) |\n"
        factual_table_md += "|---|---|---|---|---|---|\n"
        for t in sorted(trends_summary, key=lambda x: x["delta"], reverse=True):
            trend_str = " -> ".join(map(str, t["history"]))
            factual_table_md += f"| **{t['vendor']}** | {t['start']}% | {t['current']}% | {t['delta']:+d}% | {t['direction']} | {trend_str} |\n"

    # 7. Default: Portfolio Overview / Executive Summary
    else:
        intent = "portfolio_summary"
        top_v = get_top_vendors(vendors, metric="score", limit=3)
        verified_data["top_vendors"] = top_v

        factual_table_md = f"### [VERIFIED DATA] Network Portfolio Summary\n\n"
        factual_table_md += f"- **Total Active Suppliers**: {stats['total_vendors']}\n"
        factual_table_md += f"- **Risk Distribution**: {stats['risk_distribution']['Low']} Low, {stats['risk_distribution']['Medium']} Medium, {stats['risk_distribution']['High']} High Risk\n"
        factual_table_md += f"- **Total Contract Value**: ${stats['total_contract_value']:,.2f}\n"
        factual_table_md += f"- **Total Tracked Orders**: {stats['total_orders_count']} (Total recorded spend: ${stats['total_recorded_order_spend']:,.2f})\n"
        factual_table_md += f"- **Network Averages**: Score `{stats['avg_score']}%`, Delivery `{stats['avg_delivery']}%`, Quality `{stats['avg_quality']}%`, Cost `{stats['avg_cost']}%`\n"

    # If scoped vendor exists, add vendor-specific breakdown
    if scoped_vendor:
        verified_data["scoped_vendor"] = scoped_vendor
        factual_table_md += f"\n\n### [VERIFIED SCOPED VENDOR] {scoped_vendor['name']} ({scoped_vendor['id']})\n"
        factual_table_md += f"- **Category**: {scoped_vendor['category']} | **Location**: {scoped_vendor['location']}\n"
        factual_table_md += f"- **Score**: {scoped_vendor['score']}% | **Risk Rating**: {scoped_vendor['risk']} ({scoped_vendor['risk_score']}%)\n"
        factual_table_md += f"- **Delivery**: {scoped_vendor['delivery']}% | **Quality**: {scoped_vendor['quality']}%\n"
        factual_table_md += f"- **Orders**: {scoped_vendor['orders']} total | **Delayed**: {scoped_vendor['delayed']} | **Complaints**: {scoped_vendor['complaints']} | **Defects**: {scoped_vendor['defects']}\n"
        factual_table_md += f"- **Contract Value**: ${scoped_vendor.get('contract_value', 100000):,.2f}\n"

    return {
        "intent": intent,
        "verified_metrics": verified_data,
        "factual_table_md": factual_table_md
    }
