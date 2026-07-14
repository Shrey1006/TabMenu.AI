from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from pipeline.sentiment import analyze

app = FastAPI(
    title="Ambika Pure Veg AI Sentiment Engine",
    description="PyTorch-powered feedback classification for service bottleneck detection",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class AnalyzeRequest(BaseModel):
    text: str


class AnalyzeResponse(BaseModel):
    sentiment: str
    confidence: float
    flags: list[str]
    engine: str = "pytorch"


@app.get("/health")
def health():
    return {"status": "ok", "engine": "pytorch"}


@app.post("/analyze", response_model=AnalyzeResponse)
def analyze_feedback(req: AnalyzeRequest):
    result = analyze(req.text)
    return result


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
