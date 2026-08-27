"""Demo assets endpoint — returns seeded infrastructure data."""

from fastapi import APIRouter
from services.demo_data import get_all_demo_assets, get_community_data, get_engineer_reports

router = APIRouter()


@router.get("/demo-assets")
async def get_demo_assets():
    """Return all seeded demo infrastructure assets."""
    return {"assets": get_all_demo_assets()}


@router.get("/demo-assets/{asset_name}/community")
async def get_asset_community(asset_name: str):
    """Get community data for a specific asset."""
    data = get_community_data(asset_name)
    if data:
        return data
    return {"communityReports": 0, "unresolvedReports": 0, "resolvedReports": 0}


@router.get("/demo-assets/{asset_name}/engineer-reports")
async def get_asset_engineer_reports(asset_name: str):
    """Get engineer reports for a specific asset."""
    reports = get_engineer_reports(asset_name)
    return {"reports": reports}
