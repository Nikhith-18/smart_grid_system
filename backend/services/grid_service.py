from sqlalchemy import desc
from sqlalchemy.orm import Session

from alerts.engine import build_alerts
from analytics.engines import calculate_health, to_health_metric
from digital_twin.engine import calculate_twin, to_twin_state
from models.entities import Alert, DigitalTwinState, GridConnection, HealthMetric, MaintenanceHistory, SensorHistory, Transformer
from services.serialization import alert_payload, anomaly_payload, maintenance_payload, transformer_payload
from simulator.engine import generate_reading


def latest_reading(db: Session, transformer_id: str) -> SensorHistory:
    return db.query(SensorHistory).filter_by(transformer_id=transformer_id).order_by(desc(SensorHistory.timestamp)).first()


def latest_payloads(db: Session) -> list[dict]:
    rows = []
    for transformer in db.query(Transformer).order_by(Transformer.id).all():
        reading = latest_reading(db, transformer.id)
        twin = db.get(DigitalTwinState, transformer.id)
        metric = db.get(HealthMetric, transformer.id)
        payload = transformer_payload(transformer, reading, twin, metric)
        payload["activeAlerts"] = db.query(Alert).filter_by(transformer_id=transformer.id, status="Open").count()
        rows.append(payload)
    return rows


def transformer_detail(db: Session, transformer_id: str) -> dict | None:
    transformer = db.get(Transformer, transformer_id)
    if not transformer:
        return None
    reading = latest_reading(db, transformer.id)
    twin = db.get(DigitalTwinState, transformer.id)
    metric = db.get(HealthMetric, transformer.id)
    payload = transformer_payload(transformer, reading, twin, metric)
    payload["alerts"] = [alert_payload(item) for item in db.query(Alert).filter_by(transformer_id=transformer.id).order_by(desc(Alert.created_at)).limit(8).all()]
    payload["anomalyHistory"] = [anomaly_payload(item) for item in transformer_anomalies(db, transformer.id, 8)]
    payload["maintenanceHistory"] = [maintenance_payload(item) for item in db.query(MaintenanceHistory).filter_by(transformer_id=transformer.id).order_by(desc(MaintenanceHistory.date)).all()]
    payload["anomalies"] = build_current_anomalies(payload)
    return payload


def transformer_anomalies(db: Session, transformer_id: str, limit: int = 8):
    from models.entities import AnomalyHistory

    return db.query(AnomalyHistory).filter_by(transformer_id=transformer_id).order_by(desc(AnomalyHistory.timestamp)).limit(limit).all()


def build_current_anomalies(payload: dict) -> list[dict]:
    checks = [
        ("Thermal Deviation", payload["temperature"] - payload["expectedTemperature"], 14, "Inspect cooling system"),
        ("Load Deviation", payload["loadPercentage"] - payload["expectedLoad"], 14, "Redistribute load"),
        ("Moisture Level", payload["moistureLevel"] - 18, 6, "Run oil moisture test"),
        ("Partial Discharge", payload["partialDischarge"] - 18, 20, "Run insulation diagnostics"),
    ]
    anomalies = []
    for title, value, threshold, action in checks:
        severity = "CRITICAL" if value >= threshold * 1.5 else "WARNING" if value >= threshold else "ADVISORY" if value >= threshold * 0.45 else "NORMAL"
        if severity == "NORMAL":
            continue
        anomalies.append({
            "title": title,
            "severity": severity,
            "description": f"{title} is outside the deterministic operating envelope by {round(value, 1)}.",
            "detectedTime": "Live",
            "recommendedAction": action,
        })
    return anomalies or [{
        "title": "No Active Anomaly",
        "severity": "NORMAL",
        "description": "The asset is operating within the deterministic digital twin envelope.",
        "detectedTime": "Live",
        "recommendedAction": "Continue monitoring",
    }]


def run_simulation_cycle(db: Session) -> list[dict]:
    updates = []
    for transformer in db.query(Transformer).order_by(Transformer.id).all():
        previous = latest_reading(db, transformer.id)
        reading = generate_reading(transformer, previous)
        db.add(reading)
        db.flush()

        twin_values = calculate_twin(transformer, reading)
        metric_values = calculate_health(transformer, reading, twin_values)
        twin = to_twin_state(transformer.id, twin_values)
        metric = to_health_metric(transformer.id, metric_values)
        db.merge(twin)
        db.merge(metric)
        db.flush()

        for alert, anomaly in build_alerts(transformer, reading, twin_values, metric):
            existing = db.query(Alert).filter_by(transformer_id=transformer.id, type=alert.type, status="Open").first()
            if not existing:
                db.add(alert)
                db.add(anomaly)

        payload = transformer_payload(transformer, reading, twin, metric)
        payload["activeAlerts"] = db.query(Alert).filter_by(transformer_id=transformer.id, status="Open").count()
        updates.append(payload)
    db.commit()
    return updates


def grid_payload(db: Session) -> dict:
    connections = db.query(GridConnection).all()
    transformers = latest_payloads(db)
    return {
        "transformers": transformers,
        "gridLines": [[item.from_transformer_id, item.to_transformer_id] for item in connections],
        "gridHealth": round(sum(item["healthScore"] for item in transformers) / len(transformers)),
        "powerFlowDirection": "North -> South-East",
        "connectedTransformers": len(connections),
    }
