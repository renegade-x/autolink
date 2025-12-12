from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from uuid import UUID
from database import supabase
from models import Vehicle, VehicleCreate

router = APIRouter()

@router.get("", response_model=List[Vehicle])
def get_vehicles(
    make: Optional[str] = None,
    location: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None
):
    query = supabase.table("vehicles").select("*")
    
    if make:
        query = query.ilike("make", f"%{make}%")
    if location:
        query = query.ilike("location", f"%{location}%")
    if min_price:
        query = query.gte("price_per_day", min_price)
    if max_price:
        query = query.lte("price_per_day", max_price)
        
    result = query.execute()
    return result.data

@router.get("/{vehicle_id}", response_model=Vehicle)
def get_vehicle(vehicle_id: UUID):
    result = supabase.table("vehicles").select("*").eq("id", str(vehicle_id)).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    return result.data[0]

@router.post("", response_model=Vehicle)
def create_vehicle(vehicle: VehicleCreate):
    # In a real app, verify user is a dealer here
    from fastapi.encoders import jsonable_encoder
    
    # Check if images provided, if not ensure empty list
    if not vehicle.images:
        vehicle.images = []

    # Convert to JSON-compatible dict (UUIDs -> str, Dates -> ISO str) to avoid serialization errors
    vehicle_dict = jsonable_encoder(vehicle)
    
    result = supabase.table("vehicles").insert(vehicle_dict).execute()
    if not result.data:
         raise HTTPException(status_code=400, detail="Could not create vehicle")
    return result.data[0]

@router.put("/{vehicle_id}", response_model=Vehicle)
def update_vehicle(vehicle_id: UUID, vehicle: VehicleCreate):
    from fastapi.encoders import jsonable_encoder
    vehicle_dict = jsonable_encoder(vehicle, exclude_unset=True)
    result = supabase.table("vehicles").update(vehicle_dict).eq("id", str(vehicle_id)).execute()
    if not result.data:
         raise HTTPException(status_code=404, detail="Vehicle not found or update failed")
    return result.data[0]

@router.delete("/{vehicle_id}")
def delete_vehicle(vehicle_id: UUID):
    result = supabase.table("vehicles").delete().eq("id", str(vehicle_id)).execute()
    return {"message": "Vehicle deleted successfully"}
