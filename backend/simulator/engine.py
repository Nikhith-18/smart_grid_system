from random import uniform

from digital_twin.engine import clamp
from models.entities import SensorHistory, Transformer


BASELINES = {
    "T1": dict(temperature=68, oil_temperature=61, load_percentage=54, moisture_level=8, partial_discharge=5, vibration_level=0.12, power_factor=0.97),
    "T2": dict(temperature=84, oil_temperature=78, load_percentage=82, moisture_level=18, partial_discharge=21, vibration_level=0.28, power_factor=0.92),
    "T3": dict(temperature=74, oil_temperature=67, load_percentage=68, moisture_level=11, partial_discharge=9, vibration_level=0.16, power_factor=0.95),
    "T4": dict(temperature=62, oil_temperature=57, load_percentage=43, moisture_level=7, partial_discharge=3, vibration_level=0.09, power_factor=0.98),
    "T5": dict(temperature=96, oil_temperature=91, load_percentage=94, moisture_level=29, partial_discharge=44, vibration_level=0.47, power_factor=0.88),
}


def walk(value: float, step: float, low: float, high: float, decimals: int = 1) -> float:
    return round(clamp(value + uniform(-step, step), low, high), decimals)


def generate_reading(transformer: Transformer, previous: SensorHistory | None = None) -> SensorHistory:
    base = BASELINES[transformer.id]
    source = previous or type("Reading", (), {
        **base,
        "voltage": transformer.primary_voltage_kv,
        "current": (transformer.rated_capacity_mva * 1000) / (1.732 * transformer.primary_voltage_kv),
    })()

    return SensorHistory(
        transformer_id=transformer.id,
        temperature=walk(source.temperature, 1.4, 45, 112),
        oil_temperature=walk(source.oil_temperature, 1.1, 40, 108),
        load_percentage=walk(source.load_percentage, 2.2, 18, 100),
        voltage=walk(source.voltage, transformer.primary_voltage_kv * 0.006, transformer.primary_voltage_kv * 0.95, transformer.primary_voltage_kv * 1.04),
        current=walk(source.current, 5.0, 80, 460),
        power_factor=walk(source.power_factor, 0.01, 0.82, 0.99, 2),
        moisture_level=walk(source.moisture_level, 0.7, 4, 36),
        partial_discharge=walk(source.partial_discharge, 1.5, 1, 58),
        vibration_level=walk(source.vibration_level, 0.015, 0.04, 0.62, 2),
    )
