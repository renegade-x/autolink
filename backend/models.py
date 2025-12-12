from pydantic import BaseModel
from typing import Optional, List
from enum import Enum
from datetime import date, datetime
from uuid import UUID

class UserRole(str, Enum):
    DEALER = "dealer"
    CUSTOMER = "customer"

class BookingStatus(str, Enum):
    PENDING_PAYMENT = "pending_payment"
    CONFIRMED = "confirmed"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class PaymentMethod(str, Enum):
    CARD = "card"
    CASH = "cash"

# --- Profiles ---
class ProfileBase(BaseModel):
    full_name: Optional[str] = None
    address: Optional[str] = None
    phone_number: Optional[str] = None

class ProfileCreate(ProfileBase):
    role: UserRole = UserRole.CUSTOMER
    bank_details: Optional[str] = None # Dealer Only

class Profile(ProfileBase):
    id: UUID
    role: UserRole
    created_at: datetime
    bank_details: Optional[str] = None

# --- Vehicles ---
class VehicleBase(BaseModel):
    make: str
    model: str
    year: int
    price_per_day: float
    description: Optional[str] = None
    is_available: bool = True
    images: List[str] = []
    location: Optional[str] = None

class VehicleCreate(VehicleBase):
    dealer_id: UUID

class Vehicle(VehicleBase):
    id: UUID
    dealer_id: UUID
    created_at: datetime

# --- Bookings ---
class BookingBase(BaseModel):
    vehicle_id: UUID
    start_date: date
    end_date: date

class BookingCreate(BookingBase):
    pass

class Booking(BookingBase):
    id: UUID
    customer_id: UUID
    total_amount: float
    status: BookingStatus
    created_at: datetime

# --- Payments ---
class PaymentCreate(BaseModel):
    booking_id: UUID
    amount: float
    payment_method: PaymentMethod

class Payment(PaymentCreate):
    id: UUID
    is_verified: bool
    transaction_date: datetime

# --- Reviews ---
class ReviewCreate(BaseModel):
    booking_id: UUID
    dealer_id: UUID
    rating: int
    comment: Optional[str] = None

class Review(ReviewCreate):
    id: UUID
    customer_id: UUID
    created_at: datetime
