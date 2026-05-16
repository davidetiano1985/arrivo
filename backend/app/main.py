from fastapi import FastAPI

from app.routes import routers

app = FastAPI(
    title="Arrivo API",
    version="0.1.0",
    description="API scaffold for the Arrivo platform.",
)

for router in routers:
    app.include_router(router, prefix="/api/v1")

