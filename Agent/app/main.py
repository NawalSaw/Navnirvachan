import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.Agent_navin import router as agent_router
from app.routes.Agent_Navin_realtime import router as agent_realtime_router

app = FastAPI()

# Enable CORS (for local frontend testing or cross-origin communication)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change this to your frontend's origin in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register the agent WebSocket route
app.include_router(agent_router, prefix="/api/v1")
app.include_router(agent_realtime_router, prefix="/api/v1")

@app.get("/")
async def root():
    return {"message": "Voice Agent API is up and running!"}



if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=5001, reload=True)