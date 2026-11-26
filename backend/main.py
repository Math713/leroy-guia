import json
import os
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from google import genai
from google.genai import types
from pydantic import BaseModel

load_dotenv()

BASE_DIR = Path(__file__).parent
CATALOG = json.loads((BASE_DIR / "catalog.json").read_text(encoding="utf-8"))
CATALOG_BY_ID = {product["id"]: product for product in CATALOG}

MODEL = os.getenv("GEMINI_MODEL", "gemini-3.5-flash")
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

catalog_for_ai = [
    {"id": p["id"], "name": p["name"], "category": p["category"], "price": p["price"], "description": p["description"]}
    for p in CATALOG
]

SYSTEM_INSTRUCTION = f"""
Você é o Leroy Guia, um assistente virtual que ajuda clientes com problemas de casa,
manutenção, reformas e jardinagem. Responda sempre em português do Brasil.

Regras:
- Interprete o problema descrito e dê orientações práticas em 3 a 5 frases, em linguagem simples.
- Recomende somente produtos do catálogo abaixo, usando o campo "id". No máximo 4 produtos.
- Recomende apenas produtos realmente úteis para o problema. Se nenhum servir, devolva a lista vazia.
- Se a mensagem não tiver relação com casa, reforma ou manutenção, explique educadamente
  que você só ajuda com esses assuntos e devolva a lista de produtos vazia.
- Nunca invente produtos que não estão no catálogo.
- Os preços do catálogo estão em reais (R$). Se o cliente informar um orçamento, 
o total dos produtos recomendados deve caber nele.
- Se nenhuma combinação couber no orçamento, diga isso com honestidade e sugira 
a opção mais em conta, em vez de recomendar produtos acima do valor.
- Use o histórico da conversa para entender perguntas de acompanhamento.

Catálogo:
{json.dumps(catalog_for_ai, ensure_ascii=False)}
"""


class HistoryItem(BaseModel):
    role: str
    text: str


class ChatRequest(BaseModel):
    message: str
    history: list[HistoryItem] = []


class AssistantReply(BaseModel):
    text: str
    product_ids: list[int]


app = FastAPI(title="Leroy Guia API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", FRONTEND_URL],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"name": "Leroy Guia API", "status": "ok"}

@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/chat")
def chat(request: ChatRequest):
    message = request.message.strip()
    if not message:
        raise HTTPException(status_code=400, detail="A mensagem não pode estar vazia.")

    contents = []
    for item in request.history[-6:]:
        role = "user" if item.role == "user" else "model"
        contents.append(types.Content(role=role, parts=[types.Part(text=item.text)]))
    contents.append(types.Content(role="user", parts=[types.Part(text=message)]))

    try:
        response = client.models.generate_content(
            model=MODEL,
            contents=contents,
            config=types.GenerateContentConfig(
                system_instruction=SYSTEM_INSTRUCTION,
                response_mime_type="application/json",
                response_schema=AssistantReply,
            ),
        )
        reply = response.parsed
    except Exception as error:
        print("Erro ao chamar o Gemini:", error)
        raise HTTPException(status_code=502, detail="Não foi possível obter resposta da IA agora.")

    if reply is None:
        raise HTTPException(status_code=502, detail="A IA devolveu uma resposta inválida.")

    products = [CATALOG_BY_ID[i] for i in reply.product_ids if i in CATALOG_BY_ID][:4]
    return {"text": reply.text, "products": products}