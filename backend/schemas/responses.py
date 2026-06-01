from pydantic import BaseModel, ConfigDict


class CamelModel(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)


class TransformerSummary(CamelModel):
    id: str
    name: str
    location: str
    status: str
    healthScore: int
    failureProbability: int


class AlertResponse(CamelModel):
    id: str
    transformerId: str
    type: str
    severity: str
    timestamp: str
    status: str
    message: str
    action: str
    explanation: str
