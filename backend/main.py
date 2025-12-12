from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import vehicles, auth, bookings, reviews

app = FastAPI(title="AutoLink API")

# CORS Setup
origins = [
    "http://localhost:5173", # Vite Frontend
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://localhost:8000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(vehicles.router, prefix="/api/vehicles", tags=["Vehicles"])
app.include_router(bookings.router, prefix="/api/bookings", tags=["Bookings"])
app.include_router(reviews.router, prefix="/api/reviews", tags=["Reviews"])
app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])

@app.get("/")
def read_root():
    return {"message": "AutoLink API is running"}
