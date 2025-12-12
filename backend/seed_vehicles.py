import os
from dotenv import load_dotenv
from supabase import create_client, Client

# Load env from backend folder
load_dotenv(override=True)
url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_KEY")

if not url or not key:
    print("Error: Missing SUPABASE_URL or SUPABASE_KEY")
    exit(1)

supabase: Client = create_client(url, key)

vehicles_data = [
    {
        "make": "Tesla",
        "model": "Model S Plaid",
        "year": 2024,
        "price_per_day": 150.00,
        "location": "San Francisco, CA",
        "images": ["https://images.unsplash.com/photo-1560958089-b8a1929cea89"],
        "description": "Experience the future with the quickest acceleration of any vehicle in production. 0-60 mph in 1.99s. Tri-motor all-wheel drive.",
        "is_available": True
    },
    {
        "make": "Porsche",
        "model": "911 GT3",
        "year": 2023,
        "price_per_day": 350.00,
        "location": "Los Angeles, CA",
        "images": ["https://images.unsplash.com/photo-1611821064430-0941e8d7d692"],
        "description": "Track-ready performance with a naturally aspirated 4.0L engine and pure driving connection. The ultimate driver's car.",
        "is_available": True
    },
    {
        "make": "Mercedes-Benz",
        "model": "G-Class AMG",
        "year": 2023,
        "price_per_day": 300.00,
        "location": "Miami, FL",
        "images": ["https://images.unsplash.com/photo-1605515298946-d062f2e9da53"],
        "description": "The ultimate symbol of luxury and off-road capability. Iconic design meets modern tech and a handcrafted V8 engine.",
        "is_available": True
    },
    {
        "make": "BMW",
        "model": "M4 Competition",
        "year": 2024,
        "price_per_day": 180.00,
        "location": "New York, NY",
        "images": ["https://images.unsplash.com/photo-1617531653332-bd46c24f2068"],
        "description": "Aggressive styling and pinpoint handling make this the perfect sports coupe for the city. Twin-turbo inline-six power.",
        "is_available": True
    },
    {
        "make": "Land Rover",
        "model": "Range Rover",
        "year": 2024,
        "price_per_day": 250.00,
        "location": "Aspen, CO",
        "images": ["https://images.unsplash.com/photo-1541899481282-d53bffe3c35d"],
        "description": "Peerless refinement and luxury. The most desirable SUV in the world, perfect for a comfortable getaway.",
        "is_available": True
    },
    {
        "make": "McLaren",
        "model": "720S",
        "year": 2022,
        "price_per_day": 450.00,
        "location": "Las Vegas, NV",
        "images": ["https://images.unsplash.com/photo-1621135802920-133df287f89c"],
        "description": "A supercar that pushes the boundaries of performance. Aerodynamic design and blistering speed.",
        "is_available": True
    }
]

def seed_data():
    print("Starting database seed...")
    
    # 1. Get a dealer ID (Corrected to search for 'dealer' role specifically)
    profiles = supabase.table("profiles").select("id").eq("role", "dealer").limit(1).execute()
    
    msg = "'profiles' table has no dealers. Please Sign Up as a Dealer in the app first."
    if not profiles.data:
        print(f"Error: {msg}")
        return

    dealer_id = profiles.data[0]['id']
    print(f"Using Dealer ID: {dealer_id}")

    # 2. CLEAR EXISTING VEHICLES for this dealer to prevent duplicates and broken links
    print("Clearing old vehicles...")
    try:
        supabase.table("vehicles").delete().eq("dealer_id", dealer_id).execute()
    except Exception as e:
        print(f"Warning: Could not clear old vehicles (maybe none exist): {e}")

    # 3. Insert Vehicles
    count = 0
    for v in vehicles_data:
        v['dealer_id'] = dealer_id
        try:
            print(f"Inserting {v['make']} {v['model']}...")
            supabase.table("vehicles").insert(v).execute()
            count += 1
        except Exception as e:
            print(f"Failed to insert {v['model']}: {e}")

    print(f"\nSuccess! Cleared old data and seeded {count} fresh vehicles.")

if __name__ == "__main__":
    seed_data()
