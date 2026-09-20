import os
import re
import logging
import asyncio
from contextlib import asynccontextmanager
from pathlib import Path
from typing import List, Optional

import httpx
import unicodedata
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from langchain_community.document_loaders import TextLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores.faiss import FAISS

# ─── Logging ──────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format='{"level":"%(levelname)s","timestamp":"%(asctime)s","message":"%(message)s"}',
)
logger = logging.getLogger("scrapsaathi-chatbot")

# ─── Config ───────────────────────────────────────────────────────────────────
load_dotenv()

TOGETHER_API_KEY: str = os.getenv("TOGETHER_API_KEY", "")
KNOWLEDGE_BASE_PATH = Path(os.getenv("KNOWLEDGE_BASE_PATH", "Knowledge_base"))
ALLOWED_ORIGINS: List[str] = [
    o.strip()
    for o in os.getenv(
        "ALLOWED_ORIGINS",
        "http://localhost:5173,https://scrap-sathi.vercel.app",
    ).split(",")
    if o.strip()
]
TOGETHER_API_URL = "https://api.together.xyz/v1/chat/completions"
TOGETHER_MODEL = "deepseek-ai/DeepSeek-R1-Distill-Llama-70B-free"
MAX_RETRIES = 3
RETRY_DELAY_SECONDS = 2

# ─── Knowledge Base ───────────────────────────────────────────────────────────
retriever = None  # set during startup


def load_markdown_files(file_list: List[str]):
    docs = []
    for filename in file_list:
        filepath = KNOWLEDGE_BASE_PATH / filename
        if not filepath.exists():
            logger.warning(f"Knowledge base file not found: {filepath}")
            continue
        loader = TextLoader(str(filepath), encoding="utf-8")
        docs.extend(loader.load())
    return docs


def build_faiss_index(documents):
    if not documents:
        raise ValueError("No documents loaded for FAISS index.")
    embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
    splitter = RecursiveCharacterTextSplitter(chunk_size=200, chunk_overlap=50)
    chunks = splitter.split_documents(documents)
    vectorstore = FAISS.from_documents(chunks, embeddings)
    return vectorstore.as_retriever(search_kwargs={"k": 5})


# ─── Startup / Shutdown ───────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    global retriever
    logger.info("Loading knowledge base...")
    try:
        kb_files = [
            "ScrapSaathi_KnowledgeBase_FAQs.md",
            "ScrapSaathi_KnowledgeBase_Detailed.md",
        ]
        documents = load_markdown_files(kb_files)
        if documents:
            retriever = build_faiss_index(documents)
            logger.info(f"Knowledge base loaded — {len(documents)} documents indexed")
        else:
            logger.warning("No knowledge base documents found — chatbot will use general knowledge only")
    except Exception as exc:
        logger.error(f"Knowledge base load failed: {exc}")
        retriever = None
    yield
    logger.info("Shutting down chatbot service")


# ─── App ──────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="ScrapSaathi RAG Chatbot",
    description="AI-powered assistant for ScrapSaathi waste management platform",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)


# ─── Models ───────────────────────────────────────────────────────────────────
class ChatRequest(BaseModel):
    query: str
    prev_queries: Optional[List[str]] = None


class ChatResponse(BaseModel):
    answer: str


# ─── Helpers ──────────────────────────────────────────────────────────────────
def clean_think_tags(text: str) -> str:
    """Remove <think>...</think> blocks from LLM output."""
    if "</think>" in text:
        return text.split("</think>", 1)[1].strip()
    return re.sub(r"<think>.*?</think>", "", text, flags=re.DOTALL).strip()


def normalize_unicode(text: str) -> str:
    try:
        text = text.encode("utf-8").decode("unicode_escape")
        text = text.encode("latin1").decode("utf-8")
    except Exception:
        pass
    return unicodedata.normalize("NFKC", text)


# ─── LLM Call ─────────────────────────────────────────────────────────────────
async def call_together_api(context: str, question: str, prev_queries: Optional[List[str]]) -> str:
    if not TOGETHER_API_KEY:
        raise HTTPException(status_code=503, detail="LLM API key not configured.")

    prev_qs = "\n".join(f"- {q}" for q in prev_queries) if prev_queries else "None"
    prompt = f"""You are Scrap Saathi's helpful assistant.

If the user query is vague or a follow-up (like "explain again", "repeat", "tell me more"),
use the previous queries to infer what the user is referring to.
If the current query is unrelated to previous queries, answer it independently.

Previous user queries (most recent last):
{prev_qs}

First preference: Use the provided context below to answer the user's question.

Context:
{context}

If the context does not contain the answer, you may use your general knowledge,
but ONLY if the question is about Scrap Saathi services, recycling, environmental protection, or waste management.

If the question is outside these topics, reply:
"I'm sorry, I can only assist with queries related to Scrap Saathi, recycling, or environmental topics."

Current user query: {question}

Provide a detailed, helpful, and polite response. Be concise but informative.
Do NOT include any internal thoughts, reasoning, or <think> tags in your answer."""

    headers = {
        "Authorization": f"Bearer {TOGETHER_API_KEY}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": TOGETHER_MODEL,
        "messages": [
            {"role": "system", "content": "You are Scrap Saathi's helpful chatbot."},
            {"role": "user", "content": prompt},
        ],
        "temperature": 0.7,
        "max_tokens": 1000,
    }

    last_error = None
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(TOGETHER_API_URL, headers=headers, json=payload)

            if response.status_code == 200:
                result = response.json()
                return result["choices"][0]["message"]["content"]

            logger.warning(f"Together API attempt {attempt} failed: HTTP {response.status_code}")
            last_error = f"HTTP {response.status_code}"

        except httpx.TimeoutException:
            logger.warning(f"Together API attempt {attempt} timed out")
            last_error = "timeout"
        except Exception as exc:
            logger.error(f"Together API attempt {attempt} error: {exc}")
            last_error = str(exc)

        if attempt < MAX_RETRIES:
            await asyncio.sleep(RETRY_DELAY_SECONDS * attempt)

    raise HTTPException(status_code=502, detail=f"LLM service unavailable after {MAX_RETRIES} attempts: {last_error}")


# ─── Endpoints ────────────────────────────────────────────────────────────────
@app.get("/health", tags=["Health"])
async def health_check():
    return {
        "success": True,
        "message": "ScrapSaathi chatbot is healthy",
        "data": {
            "service": "scrapsaathi-chatbot",
            "knowledge_base_loaded": retriever is not None,
        },
    }


@app.post("/chat", response_model=ChatResponse, tags=["Chat"])
async def chat_endpoint(request: ChatRequest):
    if not request.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty.")

    # Retrieve relevant context
    context = "No relevant context found."
    if retriever is not None:
        try:
            queries = list(request.prev_queries or []) + [request.query]
            combined_query = " ".join(queries)
            docs = retriever.get_relevant_documents(combined_query)
            if docs:
                context = "\n\n---\n\n".join(doc.page_content for doc in docs)
                logger.info(f"Retrieved {len(docs)} context chunks for query")
        except Exception as exc:
            logger.error(f"Retriever error: {exc}")

    raw_answer = await call_together_api(context, request.query, request.prev_queries)
    cleaned = clean_think_tags(raw_answer)
    formatted = normalize_unicode(cleaned)

    return ChatResponse(answer=formatted)