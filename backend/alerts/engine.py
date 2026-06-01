from datetime import datetime

from analytics.engines import status_from_failure
from models.entities import Alert, AnomalyHistory, HealthMetric, SensorHistory, Transformer


RULES = [
    ("OVERHEATING", lambda r, t, h: r.temperature - t["expected_temperature"] >= 14 or r.temperature >= 92, "Inspect cooling system"),
    ("HIGH_MOISTURE", lambda r, t, h: r.moisture_level >= 24, "Check breather and perform oil moisture test"),
    ("OIL_DEGRADATION", lambda r, t, h: r.oil_temperature >= 88 or (r.oil_temperature - t["expected_oil_temperature"]) >= 13, "Schedule DGA and oil quality inspection"),
    ("OVERLOAD", lambda r, t, h: r.load_percentage >= 90, "Transfer load or adjust feeder schedule"),
    ("HIGH_VIBRATION", lambda r, t, h: r.vibration_level >= 0.42, "Inspect fan bank, mounting, and core vibration"),
    ("PARTIAL_DISCHARGE", lambda r, t, h: r.partial_discharge >= 38, "Run insulation diagnostics"),
    ("VOLTAGE_ANOMALY", lambda r, t, h: abs(t["voltage_deviation"]) >= 9, "Inspect tap changer and feeder voltage regulation"),
]


def severity_for(metric: HealthMetric) -> str:
    return status_from_failure(metric.failure_probability)


def build_alerts(transformer: Transformer, reading: SensorHistory, twin: dict, metric: HealthMetric) -> list[tuple[Alert, AnomalyHistory]]:
    alerts = []
    severity = severity_for(metric)
    if severity == "NORMAL":
        return alerts

    for alert_type, predicate, action in RULES:
        if not predicate(reading, twin, metric):
            continue
        deviation = round(reading.temperature - twin["expected_temperature"], 1)
        message = f"{alert_type.replace('_', ' ').title()} detected on {transformer.name}"
        explanation = (
            f"Actual Temperature = {reading.temperature}C. "
            f"Expected Temperature = {twin['expected_temperature']}C. "
            f"Deviation = {deviation:+}C. Risk = {metric.risk_category}."
        )
        description = f"{message}. {explanation}"
        alerts.append((
            Alert(
                transformer_id=transformer.id,
                type=alert_type,
                severity=severity,
                message=message,
                explanation=explanation,
                recommended_action=action,
                created_at=datetime.utcnow(),
                status="Open",
            ),
            AnomalyHistory(
                transformer_id=transformer.id,
                anomaly_type=alert_type,
                severity=severity,
                description=description,
                timestamp=datetime.utcnow(),
            ),
        ))
    return alerts
