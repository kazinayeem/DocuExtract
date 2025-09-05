import { NextRequest } from "next/server";
import {
  GoogleGenAI,
  createUserContent,
  createPartFromUri,
} from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: "AIzaSyCU_3pVcZZOwqBh448m-G7NduL613sQ63M",
});

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const file = form.get("image") as File;

  const uploaded = await ai.files.upload({ file });

  if (!uploaded.uri) {
    return new Response(
      JSON.stringify({ error: "File upload failed: URI is undefined." }),
      { status: 400 }
    );
  }

  const result = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: createUserContent([
      createPartFromUri(uploaded.uri, uploaded.mimeType!),
      `{
  "cashMemo": {
    "number": "...",
    "date": "...",
    "shop": {
      "name": "...",
      "tagline": "...",
      "address": "...",
      "phone": "...",
      "cell": "..."
    },
    "customer": {
      "name": "...",
      "address": "...",
      "number: ".."
    },
    "products": [
      {
        "slNo": 1,
        "description": "...",
        "size": "...",
        "quantity": 0,
        "rate": 0,
        "amount": 0,
        "discount" : 0,
      }
    ],
    "totals": {
      "total": 0,
      "advance": 0,
      "balance": 0,
      "discunt" :0,
    },
    "inWords": "Write the total or balance amount in words, e.g., 1250 → 'One Thousand Two Hundred Fifty Only",
    "footer": {
      "delivery": "...",
      "note": "...",
      "receivedBy": "...",
      "for": "..."
    },
    "language": "auto-detect"
  }
}
`,
    ]),
  });

  return new Response(JSON.stringify({ text: result.text ?? "" }));
}
