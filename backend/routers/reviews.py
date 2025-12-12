from fastapi import APIRouter, HTTPException
from typing import List
from uuid import UUID
from database import supabase
from models import Review, ReviewCreate

router = APIRouter()

@router.get("", response_model=List[Review])
def get_reviews(dealer_id: UUID = None, vehicle_id: UUID = None):
    query = supabase.table("reviews").select("*")
    if dealer_id:
        query = query.eq("dealer_id", str(dealer_id))
    # Note: vehicle_id is not directly on reviews table in my schema (it's on bookings), 
    # but I put dealer_id on reviews. 
    # If we want reviews for a vehicle, we'd need to join bookings. 
    # For MVP, let's just stick to dealer reviews.
    
    result = query.execute()
    return result.data

@router.post("", response_model=Review)
def create_review(review: ReviewCreate):
    # Verify booking exists and belongs to customer
    # For MVP, direct insert
    from fastapi.encoders import jsonable_encoder
    review_dict = jsonable_encoder(review)
    result = supabase.table("reviews").insert(review_dict).execute()
    if not result.data:
         raise HTTPException(status_code=400, detail="Could not create review")
    return result.data[0]
