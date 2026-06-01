from datetime import datetime, timedelta

from sqlalchemy.orm import Session

from analytics.engines import calculate_health, to_health_metric
from digital_twin.engine import calculate_twin, to_twin_state
from models.entities import GridConnection, MaintenanceHistory, Transformer
from simulator.engine import generate_reading


TRANSFORMERS = [
    ("T1", "Transformer T1", "Substation North", 12.305, 76.655, 40, 220, 33, "ONAF", 2018),
    ("T2", "Transformer T2", "Industrial East", 12.314, 76.686, 63, 220, 66, "OFAF", 2014),
    ("T3", "Transformer T3", "Central Business District", 12.292, 76.671, 50, 132, 33, "ONAN", 2020),
    ("T4", "Transformer T4", "Residential West", 12.281, 76.642, 25, 132, 11, "ONAN", 2021),
    ("T5", "Transformer T5", "Airport South", 12.266, 76.692, 80, 400, 220, "OFAF", 2011),
]

MAINTENANCE = [
    ("DGA Analysis", "Routine dissolved gas analysis completed.", "Gas profile reviewed"),
    ("Bushing Inspection", "Infrared and visual inspection of bushings.", "No critical defects"),
    ("Cooling Fan Service", "Fan bank service and radiator cleaning.", "Cooling performance improved"),
    ("Oil Replacement", "Oil filtration and partial replacement.", "Dielectric strength improved"),
    ("Contact Cleaning", "Tap changer contact cleaning and torque checks.", "Contact resistance reduced"),
]


def seed_database(db: Session) -> None:
    if db.query(Transformer).count():
        return

    for row in TRANSFORMERS:
        db.add(Transformer(
            id=row[0],
            name=row[1],
            location=row[2],
            latitude=row[3],
            longitude=row[4],
            rated_capacity_mva=row[5],
            primary_voltage_kv=row[6],
            secondary_voltage_kv=row[7],
            cooling_type=row[8],
            installation_year=row[9],
        ))
    db.flush()

    for from_id, to_id in [("T1", "T2"), ("T2", "T3"), ("T3", "T4"), ("T4", "T5"), ("T2", "T5")]:
        db.add(GridConnection(from_transformer_id=from_id, to_transformer_id=to_id))

    now = datetime.utcnow()
    for transformer in db.query(Transformer).all():
        previous = None
        for _ in range(12):
            reading = generate_reading(transformer, previous)
            reading.timestamp = now - timedelta(minutes=(12 - _) * 5)
            db.add(reading)
            previous = reading
        db.flush()

        twin_values = calculate_twin(transformer, previous)
        metric_values = calculate_health(transformer, previous, twin_values)
        db.merge(to_twin_state(transformer.id, twin_values))
        db.merge(to_health_metric(transformer.id, metric_values))

        for index, maintenance in enumerate(MAINTENANCE[:3]):
            db.add(MaintenanceHistory(
                transformer_id=transformer.id,
                date=now - timedelta(days=70 + index * 62 + len(transformer.id)),
                type=maintenance[0],
                description=maintenance[1],
                result=maintenance[2],
            ))
    db.commit()
