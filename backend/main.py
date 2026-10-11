import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from routers import auth, bookings, reviews, vehicles

app = FastAPI(title="AutoLink API")

# CORS Setup - allow all origins so requests from EC2 IPs / AWS domains succeed
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API Routers
app.include_router(vehicles.router, prefix="/api/vehicles", tags=["Vehicles"])
app.include_router(bookings.router, prefix="/api/bookings", tags=["Bookings"])
app.include_router(reviews.router, prefix="/api/reviews", tags=["Reviews"])
app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])

# Health check route for testing API status directly
@app.get("/api/health")
def health_check():
    return {"message": "AutoLink API is running"}

# Locate frontend dist directory
frontend_dist_path = os.path.join(os.path.dirname(__file__), "dist")
if not os.path.exists(frontend_dist_path):
    frontend_dist_path = os.path.join(
        os.path.dirname(os.path.dirname(__file__)), "frontend", "dist"
    )

# Mount /assets if it exists for bundled CSS/JS
assets_path = os.path.join(frontend_dist_path, "assets")
if os.path.exists(assets_path):
    app.mount("/assets", StaticFiles(directory=assets_path), name="assets")

# Single Page Application catch-all route (serves static files or index.html)
if os.path.exists(frontend_dist_path):
    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        file_path = os.path.join(frontend_dist_path, full_path)
        if full_path and os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(frontend_dist_path, "index.html"))