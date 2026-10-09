from typing import Dict, Any, List

def calculate_vendor_metrics(
    delivery: int = 80,
    quality: int = 80,
    cost: int = 75,
    reliability: int = 80,
    orders: int = 20,
    delayed: int = 2,
    complaints: int = 1,
    defects: int = 2
) -> Dict[str, Any]:
    """
    Computes weighted overall performance score, risk score, and risk category.
    Weights: Delivery 35%, Quality 35%, Cost efficiency 15%, Reliability 15%.
    """
    score = int(round(delivery * 0.35 + quality * 0.35 + cost * 0.15 + reliability * 0.15))
    score = max(40, min(99, score))

    # Risk score calculation
    penalty = int(round((delayed / max(orders, 1)) * 30 + (complaints * 4) + (defects * 3)))
    base_risk = 100 - score
    risk_score = max(5, min(95, base_risk + penalty))

    if score >= 85 and risk_score <= 20:
        risk = "Low"
    elif score >= 68 and risk_score <= 50:
        risk = "Medium"
    else:
        risk = "High"

    return {
        "score": score,
        "risk_score": risk_score,
        "risk": risk
    }

def predict_vendor_risk(vendor: Dict[str, Any]) -> Dict[str, Any]:
    """
    Risk intelligence prediction engine: computes risk metrics,
    identifies driving risk factors, and provides actionable recommendations.
    """
    delivery = vendor.get("delivery", 80)
    quality = vendor.get("quality", 80)
    score = vendor.get("score", 75)
    orders = vendor.get("orders", 10)
    delayed = vendor.get("delayed", 0)
    complaints = vendor.get("complaints", 0)
    defects = vendor.get("defects", 0)
    delay_rate = delayed / max(orders, 1)

    factors: List[str] = []
    
    if delivery >= 90:
        factors.append("strong delivery history")
    elif delivery < 75:
        factors.append("frequent delivery delays")
    else:
        factors.append("delivery consistency")

    if quality >= 90:
        factors.append("consistent quality")
    elif quality < 75:
        factors.append("defect rates above target")
    else:
        factors.append("quality variation")

    if complaints <= 2 and defects <= 3:
        factors.append("low complaint volume")
    else:
        factors.append("complaint volume")

    # Risk assessment
    if score >= 85 and delay_rate <= 0.08:
        risk = "Low"
        risk_score = vendor.get("risk_score", 10)
        recommendation = "Continue sourcing and monitor monthly trends."
    elif score >= 68:
        risk = "Medium"
        risk_score = max(vendor.get("risk_score", 30), 25)
        recommendation = "Keep as a secondary source while monitoring corrective actions."
    else:
        risk = "High"
        risk_score = max(vendor.get("risk_score", 65), 55)
        recommendation = "Hold new contract commitments and require an immediate quality audit."

    return {
        "vendor_id": vendor["id"],
        "risk_score": risk_score,
        "risk": risk,
        "performance": score,
        "factors": factors,
        "recommendation": recommendation
    }
