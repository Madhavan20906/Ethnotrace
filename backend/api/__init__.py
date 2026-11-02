from fastapi import APIRouter
from .documents import router as documents_router
from .extractions import router as extractions_router
from .botanical import router as botanical_router
from .graph import router as graph_router
from .evidence import router as evidence_router
from .historical import router as historical_router
from .copilot import router as copilot_router
from .sources import router as sources_router
from .analytics import router as analytics_router
from .review import router as review_router
from .auth import router as auth_router

api_router = APIRouter(prefix="/api/v1")
api_router.include_router(documents_router)
api_router.include_router(extractions_router)
api_router.include_router(botanical_router)
api_router.include_router(graph_router)
api_router.include_router(evidence_router)
api_router.include_router(historical_router)
api_router.include_router(copilot_router)
api_router.include_router(sources_router)
api_router.include_router(analytics_router)
api_router.include_router(review_router)
api_router.include_router(auth_router)
