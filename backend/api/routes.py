from collections import Counter

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import desc
from sqlalchemy.orm import Session

from analytics.engines import status_from_failure
from database.session import get_db
from models.entities import Alert, DigitalTwinState, HealthMetric, SensorHistory
from services.grid_service import grid_payload, latest_payloads, latest_reading, transformer_detail
from services.serialization import alert_payload, chart_point, synthetic_series


router = APIRouter(prefix="/api", tags=["smart-grid"])


@router.get("/dashboard")
def get_dashboard(db: Session = Depends(get_db)):
    transformers = latest_payloads(db)
    alerts = [alert_payload(item) for item in db.query(Alert).order_by(desc(Alert.created_at)).limit(10).all()]
    total = len(transformers)
    avg = lambda key: round(sum(item[key] for item in transformers) / total)
    status_counts = Counter(item["status"] for item in transformers)

    return {
        "widgets": {
            "totalTransformers": total,
            "healthyTransformers": status_counts["NORMAL"],
            "warningTransformers": status_counts["WARNING"] + status_counts["ADVISORY"],
            "criticalTransformers": status_counts["CRITICAL"],
            "averageHealthScore": avg("healthScore"),
            "activeAlerts": len([item for item in alerts if item["status"] != "Resolved"]),
            "averageGridLoad": avg("loadPercentage"),
            "systemAvailability": 99.74,
        },
        "quickStats": {
            "averageTemperature": avg("temperature"),
            "averageLoad": avg("loadPercentage"),
            "totalPowerConsumption": round(sum(item["consumption"] for item in transformers), 1),
            "fleetHealthScore": avg("healthScore"),
        },
        "charts": analytics_payload(db),
        "recentAlerts": alerts[:4],
        "transformers": transformers,
    }


@router.get("/grid")
def get_grid(db: Session = Depends(get_db)):
    return grid_payload(db)


@router.get("/transformers")
def get_transformers(db: Session = Depends(get_db)):
    return latest_payloads(db)


@router.get("/transformers/{transformer_id}")
def get_transformer(transformer_id: str, db: Session = Depends(get_db)):
    payload = transformer_detail(db, transformer_id)
    if not payload:
        raise HTTPException(status_code=404, detail="Transformer not found")
    return payload


@router.get("/transformers/{transformer_id}/twin")
def get_transformer_twin(transformer_id: str, db: Session = Depends(get_db)):
    payload = transformer_detail(db, transformer_id)
    if not payload:
        raise HTTPException(status_code=404, detail="Transformer not found")
    return {
        "transformerId": transformer_id,
        "expectedTemperature": payload["expectedTemperature"],
        "expectedOilTemperature": payload["expectedOilTemperature"],
        "expectedLoad": payload["expectedLoad"],
        "expectedVoltage": payload["expectedVoltage"],
        "expectedCurrent": payload["expectedCurrent"],
        "twinStatus": payload["twinStatus"],
        "predictionAccuracy": payload["predictionAccuracy"],
    }


@router.get("/transformers/{transformer_id}/history")
def get_transformer_history(transformer_id: str, limit: int = 100, db: Session = Depends(get_db)):
    twin = db.get(DigitalTwinState, transformer_id)
    rows = (
        db.query(SensorHistory)
        .filter_by(transformer_id=transformer_id)
        .order_by(desc(SensorHistory.timestamp))
        .limit(min(limit, 500))
        .all()
    )
    if not rows:
        raise HTTPException(status_code=404, detail="Transformer history not found")
    return [chart_point(item, twin) for item in reversed(rows)]


@router.get("/transformers/{transformer_id}/health")
def get_transformer_health(transformer_id: str, db: Session = Depends(get_db)):
    metric = db.get(HealthMetric, transformer_id)
    if not metric:
        raise HTTPException(status_code=404, detail="Transformer health not found")
    return {
        "transformerId": transformer_id,
        "healthScore": metric.health_score,
        "failureProbability": metric.failure_probability,
        "remainingUsefulLife": metric.remaining_useful_life_years,
        "riskScore": metric.risk_score,
        "riskCategory": metric.risk_category,
        "operationalEfficiency": metric.operational_efficiency,
        "coolingEfficiency": metric.cooling_efficiency,
    }


@router.get("/transformers/{transformer_id}/maintenance")
def get_transformer_maintenance(transformer_id: str, db: Session = Depends(get_db)):
    payload = transformer_detail(db, transformer_id)
    if not payload:
        raise HTTPException(status_code=404, detail="Transformer not found")
    return payload["maintenanceHistory"]


@router.get("/alerts")
def get_alerts(db: Session = Depends(get_db)):
    return [alert_payload(item) for item in db.query(Alert).order_by(desc(Alert.created_at)).limit(100).all()]


@router.get("/alerts/{alert_id}")
def get_alert(alert_id: str, db: Session = Depends(get_db)):
    alert = get_alert_by_external_id(db, alert_id)
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    return alert_payload(alert)


@router.get("/alerts/{alert_id}/explanation")
def get_alert_explanation(alert_id: str, db: Session = Depends(get_db)):
    alert = get_alert_by_external_id(db, alert_id)
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    return {
        "alertId": f"A{alert.id:03d}",
        "transformerId": alert.transformer_id,
        "reason": alert.explanation,
        "recommendedAction": alert.recommended_action,
        "severity": alert.severity,
    }


@router.get("/analytics")
def get_analytics(db: Session = Depends(get_db)):
    return analytics_payload(db)


def get_alert_by_external_id(db: Session, alert_id: str) -> Alert | None:
    normalized = alert_id.upper().removeprefix("A")
    if not normalized.isdigit():
        return None
    return db.get(Alert, int(normalized))


def analytics_payload(db: Session) -> dict:
    transformers = latest_payloads(db)
    total = len(transformers)
    avg = lambda key: round(sum(item[key] for item in transformers) / total)
    history = [
        latest_reading(db, item["id"])
        for item in transformers
    ]

    alert_counts = Counter(item["status"] for item in transformers)
    anomaly_counts = Counter()
    for alert in db.query(Alert).order_by(desc(Alert.created_at)).limit(50).all():
        anomaly_counts[alert.type.replace("_", " ").title()] += 1

    return {
        "cards": {
            "averageHealth": avg("healthScore"),
            "peakTemperature": max(item["temperature"] for item in transformers),
            "peakLoad": max(item["loadPercentage"] for item in transformers),
            "predictedFailures": len([item for item in transformers if item["failureProbability"] > 20]),
            "maintenanceRisk": "Elevated" if any(item["status"] in ["WARNING", "CRITICAL"] for item in transformers) else "Controlled",
            "predictionAccuracy": avg("predictionAccuracy"),
            "averageDeviation": round(sum(abs(item["temperature"] - item["expectedTemperature"]) for item in transformers) / total, 1),
            "modelConfidence": 88,
        },
        "healthTrend": synthetic_series("health", avg("healthScore")),
        "loadDistribution": [{"name": item["id"], "load": item["loadPercentage"]} for item in transformers],
        "alertStats": [
            {"name": "Critical", "value": alert_counts["CRITICAL"]},
            {"name": "Warning", "value": alert_counts["WARNING"]},
            {"name": "Advisory", "value": alert_counts["ADVISORY"]},
            {"name": "Normal", "value": alert_counts["NORMAL"]},
        ],
        "failureTrend": synthetic_series("probability", avg("failureProbability"), spread=3),
        "temperatureTrend": synthetic_series("temperature", avg("temperature"), spread=2),
        "loadTrend": synthetic_series("load", avg("loadPercentage"), spread=3),
        "rulTrend": synthetic_series("rul", round(sum(item["remainingUsefulLife"] for item in transformers) / total, 1), spread=0.2),
        "anomalyFrequency": [{"type": key, "count": value} for key, value in anomaly_counts.items()] or [{"type": "Normal", "count": 1}],
        "twinAccuracy": [
            {
                "time": item.transformer_id,
                "actualTemperature": round(item.temperature),
                "predictedTemperature": next(t["expectedTemperature"] for t in transformers if t["id"] == item.transformer_id),
                "actualLoad": round(item.load_percentage),
                "predictedLoad": next(t["expectedLoad"] for t in transformers if t["id"] == item.transformer_id),
            }
            for item in history
        ],
    }
