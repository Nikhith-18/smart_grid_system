from datetime import datetime

from digital_twin.engine import clamp
from models.entities import HealthMetric, SensorHistory, Transformer


def risk_label(score: float) -> str:
    if score >= 75:
        return "CRITICAL"
    if score >= 45:
        return "HIGH"
    if score >= 20:
        return "MEDIUM"
    return "LOW"


def status_from_failure(probability: float) -> str:
    if probability >= 45:
        return "CRITICAL"
    if probability >= 18:
        return "WARNING"
    if probability >= 8:
        return "ADVISORY"
    return "NORMAL"


def operating_region(load: float, temperature: float) -> str:
    if temperature >= 92 or load >= 92:
        return "Critical"
    if temperature >= 82 or load >= 78:
        return "Warning"
    if temperature >= 68 or load >= 55:
        return "Normal"
    return "Optimal"


def calculate_health(transformer: Transformer, reading: SensorHistory, twin: dict) -> dict:
    score = 100.0
    score -= max(0, reading.temperature - 76) * 0.65
    score -= max(0, reading.oil_temperature - 72) * 0.55
    score -= max(0, reading.load_percentage - 76) * 0.38
    score -= max(0, reading.moisture_level - 12) * 0.8
    score -= max(0, reading.vibration_level - 0.18) * 26
    score -= max(0, reading.partial_discharge - 10) * 0.72
    score -= abs(twin["temperature_deviation"]) * 0.45
    score -= max(0, datetime.utcnow().year - transformer.installation_year - 8) * 1.4
    health_score = round(clamp(score, 8, 99), 1)

    failure_probability = round(clamp(100 - health_score + max(0, twin["temperature_deviation"]) * 0.65, 1, 95), 1)
    age = datetime.utcnow().year - transformer.installation_year
    remaining_useful_life = round(clamp(7.2 - age * 0.18 - failure_probability / 23, 0.2, 7.5), 1)
    operational_efficiency = round(clamp(99 - max(0, reading.load_percentage - 70) * 0.5 - failure_probability * 0.18, 40, 99), 1)
    cooling_efficiency = round(clamp(98 - max(0, reading.temperature - twin["expected_temperature"]) * 2.1, 28, 98), 1)
    risk_score = round(clamp(failure_probability * 0.75 + (100 - cooling_efficiency) * 0.25, 1, 100), 1)

    return {
        "updated_at": datetime.utcnow(),
        "health_score": health_score,
        "failure_probability": failure_probability,
        "remaining_useful_life_years": remaining_useful_life,
        "operational_efficiency": operational_efficiency,
        "cooling_efficiency": cooling_efficiency,
        "risk_score": risk_score,
        "risk_category": risk_label(risk_score),
        "operating_region": operating_region(reading.load_percentage, reading.temperature),
        "prediction_accuracy": round(clamp(98 - abs(twin["temperature_deviation"]) * 0.8 - abs(twin["load_deviation"]) * 0.4, 55, 98), 1),
    }


def to_health_metric(transformer_id: str, values: dict) -> HealthMetric:
    return HealthMetric(transformer_id=transformer_id, **values)
