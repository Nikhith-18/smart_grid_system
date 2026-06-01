from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database.session import Base


class Transformer(Base):
    __tablename__ = "transformers"

    id: Mapped[str] = mapped_column(String(8), primary_key=True)
    name: Mapped[str] = mapped_column(String(80), nullable=False)
    location: Mapped[str] = mapped_column(String(120), nullable=False)
    latitude: Mapped[float] = mapped_column(Float, nullable=False)
    longitude: Mapped[float] = mapped_column(Float, nullable=False)
    rated_capacity_mva: Mapped[float] = mapped_column(Float, nullable=False)
    primary_voltage_kv: Mapped[float] = mapped_column(Float, nullable=False)
    secondary_voltage_kv: Mapped[float] = mapped_column(Float, nullable=False)
    cooling_type: Mapped[str] = mapped_column(String(20), nullable=False)
    installation_year: Mapped[int] = mapped_column(Integer, nullable=False)

    history: Mapped[list["SensorHistory"]] = relationship(back_populates="transformer")


class SensorHistory(Base):
    __tablename__ = "sensor_history"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    timestamp: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True)
    transformer_id: Mapped[str] = mapped_column(ForeignKey("transformers.id"), index=True)
    temperature: Mapped[float] = mapped_column(Float)
    oil_temperature: Mapped[float] = mapped_column(Float)
    load_percentage: Mapped[float] = mapped_column(Float)
    voltage: Mapped[float] = mapped_column(Float)
    current: Mapped[float] = mapped_column(Float)
    power_factor: Mapped[float] = mapped_column(Float)
    moisture_level: Mapped[float] = mapped_column(Float)
    partial_discharge: Mapped[float] = mapped_column(Float)
    vibration_level: Mapped[float] = mapped_column(Float)

    transformer: Mapped[Transformer] = relationship(back_populates="history")


class DigitalTwinState(Base):
    __tablename__ = "digital_twin_state"

    transformer_id: Mapped[str] = mapped_column(ForeignKey("transformers.id"), primary_key=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    expected_temperature: Mapped[float] = mapped_column(Float)
    expected_oil_temperature: Mapped[float] = mapped_column(Float)
    expected_load: Mapped[float] = mapped_column(Float)
    expected_voltage: Mapped[float] = mapped_column(Float)
    expected_current: Mapped[float] = mapped_column(Float)
    temperature_deviation: Mapped[float] = mapped_column(Float)
    oil_temperature_deviation: Mapped[float] = mapped_column(Float)
    load_deviation: Mapped[float] = mapped_column(Float)
    voltage_deviation: Mapped[float] = mapped_column(Float)
    current_deviation: Mapped[float] = mapped_column(Float)
    severity: Mapped[str] = mapped_column(String(16))
    twin_status: Mapped[str] = mapped_column(String(24))


class HealthMetric(Base):
    __tablename__ = "health_metrics"

    transformer_id: Mapped[str] = mapped_column(ForeignKey("transformers.id"), primary_key=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    health_score: Mapped[float] = mapped_column(Float)
    failure_probability: Mapped[float] = mapped_column(Float)
    remaining_useful_life_years: Mapped[float] = mapped_column(Float)
    operational_efficiency: Mapped[float] = mapped_column(Float)
    cooling_efficiency: Mapped[float] = mapped_column(Float)
    risk_score: Mapped[float] = mapped_column(Float)
    risk_category: Mapped[str] = mapped_column(String(16))
    operating_region: Mapped[str] = mapped_column(String(24))
    prediction_accuracy: Mapped[float] = mapped_column(Float)


class Alert(Base):
    __tablename__ = "alerts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    transformer_id: Mapped[str] = mapped_column(ForeignKey("transformers.id"), index=True)
    type: Mapped[str] = mapped_column(String(40), index=True)
    severity: Mapped[str] = mapped_column(String(16), index=True)
    message: Mapped[str] = mapped_column(Text)
    explanation: Mapped[str] = mapped_column(Text)
    recommended_action: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True)
    status: Mapped[str] = mapped_column(String(24), default="Open")


class AnomalyHistory(Base):
    __tablename__ = "anomaly_history"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    transformer_id: Mapped[str] = mapped_column(ForeignKey("transformers.id"), index=True)
    anomaly_type: Mapped[str] = mapped_column(String(40))
    severity: Mapped[str] = mapped_column(String(16))
    description: Mapped[str] = mapped_column(Text)
    timestamp: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class MaintenanceHistory(Base):
    __tablename__ = "maintenance_history"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    transformer_id: Mapped[str] = mapped_column(ForeignKey("transformers.id"), index=True)
    date: Mapped[datetime] = mapped_column(DateTime)
    type: Mapped[str] = mapped_column(String(60))
    description: Mapped[str] = mapped_column(Text)
    result: Mapped[str] = mapped_column(Text)


class GridConnection(Base):
    __tablename__ = "grid_connections"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    from_transformer_id: Mapped[str] = mapped_column(ForeignKey("transformers.id"))
    to_transformer_id: Mapped[str] = mapped_column(ForeignKey("transformers.id"))
    power_flow_direction: Mapped[str] = mapped_column(String(80), default="North -> South-East")
