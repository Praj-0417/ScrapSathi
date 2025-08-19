import os
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from pathlib import Path
from dotenv import load_dotenv
import httpx
import re
from langchain_community.document_loaders import TextLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores.faiss import FAISS
from fastapi.middleware.cors import CORSMiddleware


load_dotenv()

# === Config ===
TOGETHER_API_KEY = os.getenv("TOGETHER_API_KEY")
KNOWLEDGE_BASE_PATH = Path("Knowledge_base")  # Adjust path as per your structure

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Or specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    query: str
    #for prev queries
    prev_queries: Optional[List[str]] = None

# === Knowledge Base (Markdown Loader + FAISS RAG Setup) ===

def load_markdown_files(file_list: List[str]):
    docs = []
    for filename in file_list:
        filepath = KNOWLEDGE_BASE_PATH / filename
        if not filepath.exists():
            raise FileNotFoundError(f"File not found: {filepath}")
        loader = TextLoader(str(filepath), encoding='utf-8')
        docs.extend(loader.load())
    return docs

def build_faiss_index(documents):
    if not documents:
        raise ValueError("No documents provided for FAISS index.")
    embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=200, chunk_overlap=50)
    docs_chunks = text_splitter.split_documents(documents)
    vectorstore = FAISS.from_documents(docs_chunks, embeddings)
    return vectorstore.as_retriever(search_kwargs={"k": 5})


file_list = ["ScrapSaathi_KnowledgeBase_FAQs.md", "ScrapSaathi_KnowledgeBase_Detailed.md"]

# to remove think from answer
def clean_response(text):
    # If </think> exists, return everything after it
    if "</think>" in text:
        return text.split("</think>", 1)[1].strip()
    # Otherwise, remove <think>...</think> blocks if present
    return re.sub(r"<think>.*?</think>", "", text, flags=re.DOTALL).strip()

try:
    documents = load_markdown_files(file_list)
    retriever = build_faiss_index(documents)
except Exception as e:
    print(f"Error loading knowledge base: {e}")
    retriever = None

#to format the response
import unicodedata

def format_response(text):
    import unicodedata
    try:
        # Try decoding twice to handle double-escaped unicode
        text = text.encode('utf-8').decode('unicode_escape')
        text = text.encode('latin1').decode('utf-8')
    except Exception:
        pass
    text = unicodedata.normalize("NFKC", text)
    return text
# === Deepseek via Together API ===

async def query_deepseek(context: str, question: str, prev_queries: list = None) -> str:
    url = "https://api.together.xyz/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {TOGETHER_API_KEY}",
        "Content-Type": "application/json"
    }

    prev_qs = "\n".join(f"- {q}" for q in prev_queries) if prev_queries else "None"
    prompt = f"""
You are Scrap Saathi's helpful assistant.

If the user query is vague or a follow-up (like "explain again", "repeat", "tell me more", etc.), 
use the previous queries to infer what the user is referring to. 
If the current query is unrelated to previous queries, answer it independently.

Previous user queries (most recent last):
{prev_qs}

First preference: Use the provided context below to answer the user's question.

Context:
{context}

If the context does not contain the answer, you are allowed to use your general knowledge,
but ONLY if the question is about Scrap Saathi services, recycling, environmental protection, or waste management.

If the question is outside these topics (e.g., celebrities, politics, unrelated tech), reply:
"I'm sorry, I can only assist with queries related to Scrap Saathi, recycling, or environmental topics. If you have a different question, please use the Contact Us form on our website."

Current user query: {question}

Provide a detailed, helpful, and polite response.
Try to be concise but informative, and avoid unnecessary repetition.
**Do NOT include any internal thoughts, reasoning, or <think> tags in your answer. Only output the final answer for the user.**
"""

    payload = {
        "model": "deepseek-ai/DeepSeek-R1-Distill-Llama-70B-free",
        "messages": [
            {"role": "system", "content": "You are Scrap Saathi's helpful chatbot."},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.7,
        "max_tokens": 1000
    }

    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.post(url, headers=headers, json=payload)

    if response.status_code != 200:
        raise HTTPException(status_code=response.status_code, detail=response.text)

    result = response.json()
    return result['choices'][0]['message']['content']

# === API Endpoint ===



@app.post("/chat")
async def chat_endpoint(request: ChatRequest):
    if retriever is None:
        raise HTTPException(status_code=500, detail="Knowledge base not loaded.")

    queries = request.prev_queries or []
    queries.append(request.query)
    combined_query = " ".join(queries)

    docs = retriever.get_relevant_documents(combined_query)
    context = "\n\n---\n\n".join([doc.page_content for doc in docs]) if docs else "No relevant context found."
    print(f"Context for query '{combined_query}':\n{context}\n{'='*40}")

    raw_answer = await query_deepseek(context, request.query, request.prev_queries)
    print("----------------------------------------------")
    print()
    print("RAW LLM OUTPUT:", repr(raw_answer))
    print()
    cleaned_answer = clean_response(raw_answer)
    formatted_answer = format_response(cleaned_answer)

    print()
    print("FORMATTED ANSWER:", repr(formatted_answer))
    print("----------------------------------------------")
    print()
    return {"answer": formatted_answer}