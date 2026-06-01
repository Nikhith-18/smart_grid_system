from datetime import datetime

from models.entities import DigitalTwinState, SensorHistory, Transformer


def clamp(value: float, low: float, high: float) -> float:
    return max(low, min(high, value))


def calculate_twin(transformer: Transformer, reading: SensorHistory, ambient_temperature: float = 31.0) -> dict:
    cooling_factor = {
        "ONAN": 1.0,
        "ONAF": 0.86,
        "OFAF": 0.72,
    }.get(transformer.cooling_type, 0.9)

    normalized_load = reading.load_percentage / 100
    expected_temperature = ambient_temperature + 26 + normalized_load * 42 * cooling_factor
    expected_oil_temperature = expected_temperature - 6
    expected_load = clamp((transformer.rated_capacity_mva / 80) * 66 + 18, 42, 88)
    expected_voltage = transformer.primary_voltage_kv
    expected_current = (transformer.rated_capacity_mva * 1000) / (1.732 * transformer.primary_voltage_kv)

    deviations = {
        "temperature_deviation": reading.temperature - expected_temperature,
        "oil_temperature_deviation": reading.oil_temperature - expected_oil_temperature,
        "load_deviation": reading.load_percentage - expected_load,
        "voltage_deviation": reading.voltage - expected_voltage,
        "current_deviation": reading.current - expected_current,
    }
    max_pressure = max(
        abs(deviations["temperature_deviation"]) / 14,
        abs(deviations["oil_temperature_deviation"]) / 13,
        abs(deviations["load_deviation"]) / 14,
        abs(deviations["voltage_deviation"]) / 10,
        abs(deviations["current_deviation"]) / 70,
    )
    severity = "MAJOR" if max_pressure >= 1 else "MINOR" if max_pressure >= 0.45 else "NORMAL"

    return {
        "updated_at": datetime.utcnow(),
        "expected_temperature": round(expected_temperature, 1),
        "expected_oil_temperature": round(expected_oil_temperature, 1),
        "expected_load": round(expected_load, 1),
        "expected_voltage": round(expected_voltage, 1),
        "expected_current": round(expected_current, 1),
        "temperature_deviation": round(deviations["temperature_deviation"], 1),
        "oil_temperature_deviation": round(deviations["oil_temperature_deviation"], 1),
        "load_deviation": round(deviations["load_deviation"], 1),
        "voltage_deviation": round(deviations["voltage_deviation"], 1),
        "current_deviation": round(deviations["current_deviation"], 1),
        "severity": severity,
        "twin_status": "Degraded" if severity == "MAJOR" else "Learning" if severity == "MINOR" else "Synced",
    }


def to_twin_state(transformer_id: str, values: dict) -> DigitalTwinState:
    return DigitalTwinState(transformer_id=transformer_id, **values)
