from fastapi import APIRouter
from database import supabase

router = APIRouter()

@router.get("/me")
def get_me():
    # Placeholder for checking auth status via Supabase
    return {"message": "Auth is handled by Supabase Client on Frontend. Use headers for protected routes."}
