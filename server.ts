import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { createServer as createViteServer } from "vite";
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, addDoc, serverTimestamp, getDoc, doc, query, where, getDocs, updateDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { GoogleGenAI } from "@google/genai";
import fs from 'fs';

// Helper para carregar a configuração do firebase
const getFirebaseConfig = () => {
  try {
    const rawConfig = fs.readFileSync(path.join(process.cwd(), 'firebase-applet-config.json'), 'utf-8');
    const firebaseConfigLocal = JSON.parse(rawConfig);
    
    return {
      apiKey: process.env.VITE_FIREBASE_API_KEY || firebaseConfigLocal.apiKey,
      authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || firebaseConfigLocal.authDomain,
      projectId: process.env.VITE_FIREBASE_PROJECT_ID || firebaseConfigLocal.projectId,
      storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || firebaseConfigLocal.storageBucket,
      messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || firebaseConfigLocal.messagingSenderId,
      appId: process.env.VITE_FIREBASE_APP_ID || firebaseConfigLocal.appId,
      measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID || firebaseConfigLocal.measurementId,
      firestoreDatabaseId: process.env.VITE_FIREBASE_DATABASE_ID || firebaseConfigLocal.firestoreDatabaseId,
    };
  } catch (err) {
    console.error("Falha ao ler firebase-applet-config.json no backend:", err);
    return null;
  }
};

async function startServer() {
  const app = express();
  app.use(cors({ origin: true, credentials: true }));
  app.options("*", cors({ origin: true, credentials: true }));
  const PORT = Number(process.env.PORT) || 3000;

  // Accept larger payloads for base64 PDF and image uploads
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // Serve static assets from public folder
  app.use(express.static(path.join(process.cwd(), 'public')));


  // Inicializa o Firebase no Backend


  // Inicializa o Firebase no Backend

  // Rota para processar interações com o Narrador IA
  app.post("/api/ai/narrator", async (req, res) => {
    try {
      const { channelId, prompt, context, characters, activeCharacter } = req.body;
      const apiKeys = [process.env.GEMINI_API_KEY2, process.env.GEMINI_API_KEY].filter(Boolean) as string[];

      if (apiKeys.length === 0) {
        return res.status(500).json({ error: "Nenhuma chave GEMINI_API_KEY ou GEMINI_API_KEY2 configurada." });
      }

      const { NARRATOR_SYSTEM_PROMPT } = await import("./src/utils/narratorPrompt");
      const { parseNarratorResponse } = await import("./src/utils/narratorLogic");

      // Monta o dossiê com as fichas dos jogadores presentes na campanha
      let charactersContext = "";
      if (Array.isArray(characters) && characters.length > 0) {
        charactersContext = "\n\n[DOSSIÊ DE FICHAS DOS JOGADORES DA CAMPANHA]\n" + characters.map((c: any) => {
          const isCurrent = activeCharacter && (activeCharacter.id === c.id || activeCharacter.nome === c.nome);
          return `• ${isCurrent ? '★ [HERÓI ATIVO INTERAGINDO] ' : ''}Nome: ${c.nome} | Nível: ${c.nivel ?? 0} | Posição Social: ${c.posicao_social || 'Sem título'} | Ocupação: ${c.ocupacao || 'Nenhuma'} | Clã: ${c.cla || 'Nenhum'} | Cidadania: ${c.cidadania || 'Nenhuma'}
  Atributos: Físico: ${c.atributos?.fisico ?? 0} | Destreza: ${c.atributos?.destreza ?? 0} | Cognição: ${c.atributos?.cognicao ?? 0} | Carisma: ${c.atributos?.carisma ?? 0} | Primórdio: ${c.atributos?.primordio ?? 0}
  Recursos: HP: ${c.recursos?.hp || 'Cheio'} | Éter: ${c.recursos?.ether || 'Cheio'} | Destino: ${c.recursos?.destino || 'Cheio'}
  ${c.descricao ? `Lore/Biografia: "${c.descricao}"` : ''}`;
        }).join("\n\n");
      }

      const systemPromptWithRoster = NARRATOR_SYSTEM_PROMPT + charactersContext;

      const history = [
        { role: "user", parts: [{ text: systemPromptWithRoster }] },
        { role: "model", parts: [{ text: JSON.stringify({
          narrativa: "Entendido. Li com atenção as fichas dos jogadores, seus níveis e posições sociais. Conduzirei a narrativa respeitando a magnitude e a escala de perigo condizente a cada um, respondendo sempre em JSON estruturado.",
          dados_tecnicos: { rolagens: [], status_atualizados: {}, solicitacao_rolagem: null }
        }) }] },
        ...(context || []).map((m: any) => ({
          role: m.authorName && (m.authorName.includes('Narrador') || m.authorName.includes('IA')) ? 'model' : 'user',
          parts: [{ text: typeof m.content === 'string' ? m.content : JSON.stringify(m.content) }]
        }))
      ];

      const cleanPrompt = typeof prompt === 'string' ? prompt : (prompt?.text || "Prossiga a narrativa com base no contexto anterior.");

      let lastError: any = null;
      let responseText = "";

      // Itera pelas chaves disponíveis e pelos modelos compatíveis
      const modelsToTry = ["gemini-2.5-flash", "gemini-3.8-flash"];

      keyLoop: for (const apiKey of apiKeys) {
        const ai = new GoogleGenAI({ 
          apiKey,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            }
          }
        });

        for (const model of modelsToTry) {
          try {
            const result = await ai.models.generateContent({
              model,
              contents: [...history, { role: "user", parts: [{ text: cleanPrompt }] }],
              config: {
                responseMimeType: "application/json",
                maxOutputTokens: 4096,
                temperature: 0.75,
              }
            });
            responseText = result.text || "{}";
            if (responseText) {
              lastError = null;
              break keyLoop;
            }
          } catch (err: any) {
            console.warn(`[Narrador AI] Falha com chave ${apiKey.substring(0, 8)}... no modelo ${model}:`, err?.message);
            lastError = err;
          }
        }
      }

      if (!responseText && lastError) {
        throw new Error(`Falha ao gerar resposta da IA: ${lastError.message}`);
      }

      const narratorData = parseNarratorResponse(responseText);

      // Retorna a resposta estruturada para ser gravada no Firestore diretamente pelo cliente autenticado
      return res.json({ 
        success: true, 
        narrativa: narratorData.narrativa,
        dados_tecnicos: narratorData.dados_tecnicos,
        channelId 
      });
    } catch (err: any) {
      console.error("Erro na API do Narrador:", err);
      res.status(500).json({ error: err.message || "Erro desconhecido ao processar com IA." });
    }
  });

  // Proxy image to bypass CORS and download binary data server-side for Word/PDF exports
  app.get("/api/proxy-image", async (req, res) => {
    const imageUrl = req.query.url as string;
    if (!imageUrl) {
      return res.status(400).json({ error: "Missing url parameter" });
    }
    try {
      const fetchRes = await fetch(imageUrl);
      if (!fetchRes.ok) {
        return res.status(fetchRes.status).json({ error: "Failed to fetch image from remote URL" });
      }
      const arrayBuffer = await fetchRes.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const contentType = fetchRes.headers.get('content-type') || 'image/jpeg';
      const base64Data = buffer.toString('base64');
      const dataUri = `data:${contentType};base64,${base64Data}`;
      res.json({ dataUri });
    } catch (err: any) {
      console.error("Error proxying image:", err);
      res.status(500).json({ error: err?.message || "Internal server error" });
    }
  });

  // Rota para checar status detalhado do Bot do Discord
  // (Rotas do Discord removidas)

  // Rota para importar e processar PDF de Ficha Sankötei via Gemini API
  app.post("/api/characters/import-pdf", async (req, res) => {
    try {
      const { pdfBase64, textContent, mimeType = "application/pdf" } = req.body;

      if (!pdfBase64 && !textContent) {
        return res.status(400).json({ error: "Nenhum arquivo PDF ou texto fornecido para processamento." });
      }

      const apiKey = process.env.GEMINI_API_KEY2;
      if (!apiKey) {
        return res.status(500).json({ 
          error: "GEMINI_API_KEY2 não configurada no servidor. Configure a chave nos Secrets para habilitar o processamento por IA." 
        });
      }

      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const promptText = `
Você é um especialista no sistema de RPG Sankötei / Telumak RPG.
Analise detalhadamente o documento PDF da ficha de personagem Sankötei fornecido e extraia todos os dados com extrema fidelidade.

ESTRUTURA DE DADOS ESPERADA (retorne EXCLUSIVAMENTE em formato JSON):
{
  "nome": "Nome do personagem (ex: The Hen)",
  "cla": "Clã do personagem entre parênteses se houver (ex: Nuero)",
  "ocupacao": "Ocupação (ex: Deus Rei)",
  "posicao_social": "Posição Social (ex: Deus Rei)",
  "cidadania": "Cidadania e Naturalidade (ex: Rëno)",
  "seguimento": "Seguimento (ex: Conquistador)",
  "nivelamento_alma": "Texto completo de Nivelamento e Alma (ex: 9 (116). Alma: Reihao (25) 2x)",
  "nivel": 9,
  "ryo_dourado": 20,
  "ryo_prateado": 0,
  "ryo_bronze": 0,
  "hp_max": 50,
  "hp_atual": 48,
  "hp_consumidos": 2,
  "ether_max": 12,
  "ether_atual": 11,
  "ether_consumidos": 1,
  "destino_max": 23,
  "destino_atual": 22,
  "destino_consumidos": 1,
  "fortitude_max": "29+4 | 33 equipados",
  "movimento_max": "03 | 15 metros",
  "alcance_max": "03 (6) | 15 (30) metros",
  "tecnicas_max": "02 | 00 equipada",
  "fisico": 78,
  "destreza": 4,
  "cognicao": 4,
  "carisma": 30,
  "primordio": 75,
  "primordio_detalhe": "(45+20+5+5)",
  "ferramenta_fisico": 0,
  "ferramenta_fisico_max": 2,
  "ferramenta_fisico_atual": 2,
  "ferramenta_fisico_sec_max": 3,
  "ferramenta_fisico_sec_atual": 3,
  "ferramenta_destreza": 0,
  "ferramenta_destreza_max": 0,
  "ferramenta_destreza_atual": 0,
  "ferramenta_cognicao": 0,
  "ferramenta_cognicao_max": 0,
  "ferramenta_cognicao_atual": 0,
  "ferramenta_carisma": 0,
  "ferramenta_carisma_max": 1,
  "ferramenta_carisma_atual": 1,
  "html_ataques": "HTML formatado e estilizado contendo a seção COMBATE, ataques, dano, redutores e modificadores da ficha",
  "html_dons": "HTML formatado e estilizado contendo DONS E PODERES, DOMÍNIOS | VIRTUDES e FRAQUEZAS",
  "html_equipamentos": "HTML formatado e estilizado contendo UTILITÁRIOS, EQUIPAMENTOS EM USO e EQUIPAMENTOS GUARDADOS NO BAÚ",
  "html_defesa": "HTML formatado e estilizado contendo REDUTORES, FRAGILIDADE MORTAL e ORGULHO DO SOBREVIVENTE"
}

Observações importantes:
- Os atributos principais são: Força/Físico (fisico), Destreza (destreza), Cognição (cognicao), Carisma (carisma), Primórdio (primordio).
- Saúde: se o PDF indicar '46+4 / 02 consumidos', o hp_max é 50 (46+4), hp_consumidos é 2, e hp_atual é 48 (50 - 2).
- Energia (Éter): se indicar '12 / 01 consumidos', ether_max é 12, ether_consumidos é 1, ether_atual é 11.
- Destino (Henaen): se indicar '21+2 / 01 consumidos', destino_max é 23, destino_consumidos é 1, destino_atual é 22.
- Ferramentas: Físico com '2/2 3/3' significa ferramenta_fisico_max=2, ferramenta_fisico_atual=2, ferramenta_fisico_sec_max=3, ferramenta_fisico_sec_atual=3.
- Formate os blocos html_ataques, html_dons, html_equipamentos e html_defesa com tags HTML limpas (divs, headings, listas, parágrafos, strong, spans coloridos para status como BLEED, BURN, DANO, REDUTOR) para exibição direta no app.
`;

      const contentsParts: any[] = [];

      if (pdfBase64) {
        const cleanBase64 = pdfBase64.replace(/^data:[^;]+;base64,/, '');
        contentsParts.push({
          inlineData: {
            mimeType: mimeType || "application/pdf",
            data: cleanBase64,
          }
        });
      }

      if (textContent) {
        contentsParts.push({
          text: `Texto da ficha extraído:\n${textContent}`
        });
      }

      contentsParts.push({
        text: promptText
      });

      let response: any;
      try {
        response = await ai.models.generateContent({
          model: "gemini-1.5-flash",
          contents: contentsParts,
          config: {
            responseMimeType: "application/json",
          }
        });
      } catch (geminiErr: any) {
        console.warn("Tentando fallback para gemini-1.5-flash devido a:", geminiErr?.message);
        response = await ai.models.generateContent({
          model: "gemini-1.5-flash",
          contents: contentsParts,
          config: {
            responseMimeType: "application/json",
          }
        });
      }

      const rawJson = response.text || "{}";
      let parsedData: any = {};
      try {
        parsedData = JSON.parse(rawJson);
      } catch (jsonErr) {
        console.error("Erro ao fazer parse do JSON retornado pelo Gemini:", jsonErr, rawJson);
        return res.status(500).json({ error: "Falha ao estruturar os dados extraídos do PDF." });
      }

      return res.json({
        success: true,
        data: parsedData,
        message: `Ficha de "${parsedData.nome || 'Personagem'}" extraída com sucesso!`
      });

    } catch (err: any) {
      console.error("Erro ao importar ficha por PDF:", err);
      return res.status(500).json({ error: err?.message || "Erro no processamento do PDF da ficha." });
    }
  });

  // Rota genérica de envio para o Game Chat
  // (Rota removida)

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true, allowedHosts: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
