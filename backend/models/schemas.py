"""Pydantic models for JalRaksha API request/response schemas."""

from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum


class BlurStatus(str, Enum):
    GOOD = "good"
    BORDERLINE = "borderline"
    BLURRY = "blurry"


class SeverityLevel(str, Enum):
    NONE = "none"
    MINOR = "minor"
    MODERATE = "moderate"
    SEVERE = "severe"
    VISIBLE = "visible"
    SUSPECTED = "suspected"
    CANNOT_DETERMINE = "cannot_determine"


class RiskLevel(str, Enum):
    LOW = "low"
    MODERATE = "moderate"
    HIGH = "high"
    CRITICAL = "critical"


class AssetType(str, Enum):
    RIVER_EMBANKMENT = "river_embankment"
    CANAL_EMBANKMENT = "canal_embankment"
    ROAD_EMBANKMENT = "road_embankment"
    RAILWAY_EMBANKMENT = "railway_embankment"
    DAM_RESERVOIR = "dam_reservoir"


class ReportStatus(str, Enum):
    NEW = "new"
    UNDER_REVIEW = "under_review"
    INSPECTION_REQUIRED = "inspection_required"
    ACTION_RECOMMENDED = "action_recommended"
    RESOLVED = "resolved"


# --- Image Validation ---

class ImageValidationResponse(BaseModel):
    valid: bool
    blur_score: float = Field(serialization_alias="blurScore")
    blur_status: BlurStatus = Field(serialization_alias="blurStatus")
    relevant: Optional[bool] = None
    confidence: Optional[float] = None
    category: Optional[str] = None
    message: Optional[str] = None


# --- Structural Assessment ---

class StructuralFinding(BaseModel):
    severity: str
    confidence: float
    explanation: str


class AssessmentResult(BaseModel):
    cracks: StructuralFinding
    erosion: StructuralFinding
    seepage: StructuralFinding
    settlement: StructuralFinding
    additional_issues: list[str] = Field(default_factory=list, serialization_alias="additionalIssues")
    summary: str = ""


# --- Risk ---

class RiskBreakdown(BaseModel):
    cracks_score: float = Field(serialization_alias="cracksScore")
    erosion_score: float = Field(serialization_alias="erosionScore")
    seepage_score: float = Field(serialization_alias="seepageScore")
    settlement_score: float = Field(serialization_alias="settlementScore")
    additional_score: float = Field(serialization_alias="additionalScore")
    community_score: float = Field(serialization_alias="communityScore")
    total_score: float = Field(serialization_alias="totalScore")
    risk_level: RiskLevel = Field(serialization_alias="riskLevel")


# --- Community / Engineer Data ---

class CommunityData(BaseModel):
    asset_name: str = Field(serialization_alias="assetName")
    community_reports: int = Field(serialization_alias="communityReports")
    unresolved_reports: int = Field(serialization_alias="unresolvedReports")
    resolved_reports: int = Field(serialization_alias="resolvedReports")
    last_report: str = Field(serialization_alias="lastReport")
    average_severity: str = Field(serialization_alias="averageSeverity")


class EngineerReport(BaseModel):
    id: str
    date: str
    finding: str
    status: str
    recommended: Optional[str] = None


# --- Analysis Request/Response ---

class AnalysisResponse(BaseModel):
    assessment: AssessmentResult
    risk: RiskBreakdown
    community: Optional[CommunityData] = None
    engineer_reports: Optional[list[EngineerReport]] = Field(
        default=None, serialization_alias="engineerReports"
    )
    recommended_action: str = Field(serialization_alias="recommendedAction")


# --- Demo Assets ---

class DemoAsset(BaseModel):
    id: str
    asset_name: str = Field(serialization_alias="assetName")
    asset_type: str = Field(serialization_alias="assetType")
    latitude: float
    longitude: float
    address: str
    risk_score: float = Field(serialization_alias="riskScore")
    risk_level: RiskLevel = Field(serialization_alias="riskLevel")
    community_reports: int = Field(serialization_alias="communityReports")
    unresolved_reports: int = Field(serialization_alias="unresolvedReports")
    engineer_reports_count: int = Field(serialization_alias="engineerReports")
    observations: dict
    additional_issues: list[str] = Field(default_factory=list, serialization_alias="additionalIssues")
    recommended_action: str = Field(serialization_alias="recommendedAction")
    status: ReportStatus = ReportStatus.NEW
