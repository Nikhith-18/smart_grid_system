from datetime import datetime, timedelta

from analytics.engines import status_from_failure
from models.entities import Alert, AnomalyHistory, DigitalTwinState, HealthMetric, MaintenanceHistory, SensorHistory, Transformer


def iso(value: datetime) -> str:
    return value.isoformat()


def transformer_payload(transformer: Transformer, reading: SensorHistory, twin: DigitalTwinState, metric: HealthMetric) -> dict:
    status = status_from_failure(metric.failure_probability)
    return {
        "id": transformer.id,
        "name": transformer.name,
        "location": transformer.location,
        "latitude": transformer.latitude,
        "longitude": transformer.longitude,
        "status": status,
        "ratedCapacity": f"{int(transformer.rated_capacity_mva)} MVA",
        "primaryVoltage": f"{int(transformer.primary_voltage_kv)} kV",
        "secondaryVoltage": f"{int(transformer.secondary_voltage_kv)} kV",
        "coolingType": transformer.cooling_type,
        "yearOfManufacture": transformer.installation_year,
        "healthScore": round(metric.health_score),
        "temperature": round(reading.temperature),
        "oilTemperature": round(reading.oil_temperature),
        "loadPercentage": round(reading.load_percentage),
        "voltage": round(reading.voltage, 1),
        "current": round(reading.current),
        "powerFactor": reading.power_factor,
        "moistureLevel": round(reading.moisture_level),
        "vibrationLevel": reading.vibration_level,
        "partialDischarge": round(reading.partial_discharge),
        "failureProbability": round(metric.failure_probability),
        "expectedTemperature": round(twin.expected_temperature),
        "expectedLoad": round(twin.expected_load),
        "expectedVoltage": round(twin.expected_voltage, 1),
        "expectedCurrent": round(twin.expected_current),
        "expectedOilTemperature": round(twin.expected_oil_temperature),
        "riskScore": round(metric.risk_score),
        "riskCategory": metric.risk_category,
        "operationalEfficiency": round(metric.operational_efficiency),
        "coolingEfficiency": round(metric.cooling_efficiency),
        "operatingRegion": metric.operating_region,
        "predictionAccuracy": round(metric.prediction_accuracy),
        "twinStatus": twin.twin_status,
        "remainingUsefulLife": metric.remaining_useful_life_years,
        "consumption": round(transformer.rated_capacity_mva * reading.load_percentage / 100, 1),
    }


def alert_payload(alert: Alert) -> dict:
    return {
        "id": f"A{alert.id:03d}",
        "rawId": alert.id,
        "transformerId": alert.transformer_id,
        "type": alert.type.replace("_", " ").title(),
        "severity": alert.severity,
        "timestamp": iso(alert.created_at),
        "status": alert.status,
        "message": alert.message,
        "action": alert.recommended_action,
        "explanation": alert.explanation,
    }


def anomaly_payload(item: AnomalyHistory) -> dict:
    return {
        "timestamp": item.timestamp.strftime("%Y-%m-%d %H:%M"),
        "type": item.anomaly_type.replace("_", " ").title(),
        "severity": item.severity,
        "description": item.description,
    }


def maintenance_payload(item: MaintenanceHistory) -> dict:
    return {
        "date": item.date.date().isoformat(),
        "type": item.type,
        "description": item.description,
        "result": item.result,
    }


def chart_point(history: SensorHistory, twin: DigitalTwinState | None = None) -> dict:
    return {
        "time": history.timestamp.strftime("%H:%M"),
        "temperature": round(history.temperature),
        "oilTemperature": round(history.oil_temperature),
        "load": round(history.load_percentage),
        "voltage": round(history.voltage, 1),
        "current": round(history.current),
        "powerFactor": history.power_factor,
        "moistureLevel": round(history.moisture_level),
        "partialDischarge": round(history.partial_discharge),
        "vibrationLevel": history.vibration_level,
        "expectedTemperature": round(twin.expected_temperature) if twin else round(history.temperature - 2),
        "expectedLoad": round(twin.expected_load) if twin else round(history.load_percentage - 1),
        "expectedVoltage": round(twin.expected_voltage, 1) if twin else round(history.voltage, 1),
        "expectedCurrent": round(twin.expected_current) if twin else round(history.current),
        "expectedOilTemperature": round(twin.expected_oil_temperature) if twin else round(history.oil_temperature - 2),
    }


def synthetic_series(label: str, value: float, count: int = 7, spread: float = 4) -> list[dict]:
    now = datetime.utcnow()
    return [
        {"time": (now - timedelta(days=count - index - 1)).strftime("%d %b"), label: round(value + ((index % 3) - 1) * spread)}
        for index in range(count)
    ]
