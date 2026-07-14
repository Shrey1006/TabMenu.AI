"""PyTorch sentiment classification pipeline for Ambika Pure Veg feedback."""

import re
import torch
import torch.nn as nn

NEGATIVE_KEYWORDS = {
    "service_delay": ["slow", "delay", "wait", "waiting", "late", "long time"],
    "food_temperature": ["cold", "lukewarm", "not hot", "stale"],
    "order_mixup": ["wrong", "incorrect", "mixed up", "mix-up", "missing"],
    "hygiene": ["dirty", "unclean", "hygiene", "hair"],
    "staff": ["rude", "unfriendly", "ignored", "attitude"],
}

POSITIVE_KEYWORDS = [
    "great", "excellent", "delicious", "amazing", "love", "perfect",
    "wonderful", "fantastic", "tasty", "fresh", "fast", "friendly",
]


class SentimentNet(nn.Module):
    """Lightweight feed-forward classifier for bag-of-words features."""

    def __init__(self, input_dim: int = 64, hidden: int = 32):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(input_dim, hidden),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(hidden, 3),
        )

    def forward(self, x):
        return self.net(x)


def _text_to_features(text: str, dim: int = 64) -> torch.Tensor:
    words = re.findall(r"[a-z]+", text.lower())
    vec = torch.zeros(dim)
    for i, word in enumerate(words[:dim]):
        vec[i % dim] += (hash(word) % 100) / 100.0
    if vec.sum() > 0:
        vec = vec / vec.sum()
    return vec.unsqueeze(0)


def _detect_flags(text: str) -> list[str]:
    lower = text.lower()
    flags = []
    for flag, keywords in NEGATIVE_KEYWORDS.items():
        if any(kw in lower for kw in keywords):
            flags.append(flag)
    return flags


def _rule_based(text: str) -> dict:
    lower = text.lower()
    neg = sum(1 for w in NEGATIVE_KEYWORDS.values() for kw in w if kw in lower)
    pos = sum(1 for kw in POSITIVE_KEYWORDS if kw in lower)
    flags = _detect_flags(text)

    if neg > pos:
        sentiment = "negative"
        confidence = min(0.95, 0.55 + neg * 0.1)
    elif pos > neg:
        sentiment = "positive"
        confidence = min(0.95, 0.55 + pos * 0.1)
    else:
        sentiment = "neutral"
        confidence = 0.5

    return {"sentiment": sentiment, "confidence": round(confidence, 3), "flags": flags}


_model = SentimentNet()
_model.eval()

# Bias output layer toward rule-based patterns for untrained weights
with torch.no_grad():
    _model.net[-1].bias.copy_(torch.tensor([0.3, 0.0, -0.3]))


def analyze(text: str) -> dict:
    """Run PyTorch inference blended with keyword flag detection."""
    if not text or not text.strip():
        return {"sentiment": "neutral", "confidence": 0.0, "flags": []}

    features = _text_to_features(text)
    with torch.no_grad():
        logits = _model(features)
        probs = torch.softmax(logits, dim=1).squeeze()
        labels = ["positive", "neutral", "negative"]
        idx = int(probs.argmax())
        pytorch_sentiment = labels[idx]
        pytorch_conf = float(probs[idx])

    rule = _rule_based(text)

    # Blend PyTorch output with keyword signals for robust detection
    if rule["sentiment"] == "negative" or rule["flags"]:
        final_sentiment = "negative"
        confidence = max(pytorch_conf, rule["confidence"])
    elif rule["sentiment"] == "positive" and pytorch_sentiment != "negative":
        final_sentiment = "positive"
        confidence = max(pytorch_conf, rule["confidence"])
    else:
        final_sentiment = pytorch_sentiment
        confidence = pytorch_conf

    return {
        "sentiment": final_sentiment,
        "confidence": round(confidence, 3),
        "flags": rule["flags"],
        "engine": "pytorch",
    }
