from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import StoreProfile
from ..schemas import StoreProfileResponse, StoreProfileUpdate, MessageResponse
from ..seed_data import seed_database

router = APIRouter(prefix="/api/store", tags=["Store Profile & Settings"])

@router.get("/profile", response_model=StoreProfileResponse)
def get_store_profile(db: Session = Depends(get_db)):
    profile = db.query(StoreProfile).first()
    if not profile:
        seed_database(db)
        profile = db.query(StoreProfile).first()
    return profile.to_dict()

@router.put("/profile", response_model=StoreProfileResponse)
def update_store_profile(profile_in: StoreProfileUpdate, db: Session = Depends(get_db)):
    profile = db.query(StoreProfile).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Store profile not initialized")

    update_data = profile_in.model_dump(exclude_unset=True)
    for k, v in update_data.items():
        setattr(profile, k, v)

    db.commit()
    db.refresh(profile)
    return profile.to_dict()

@router.post("/reset-defaults", response_model=MessageResponse)
def reset_store_defaults(db: Session = Depends(get_db)):
    """Reset the database to initial clean mock state"""
    seed_database(db, force=True)
    return {"message": "Pharmacy ERP database restored to initial clean state.", "success": True}
