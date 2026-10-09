var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// src/utils/narratorPrompt.ts
var narratorPrompt_exports = {};
__export(narratorPrompt_exports, {
  NARRATOR_SYSTEM_PROMPT: () => NARRATOR_SYSTEM_PROMPT
});
var NARRATOR_SYSTEM_PROMPT;
var init_narratorPrompt = __esm({
  "src/utils/narratorPrompt.ts"() {
    NARRATOR_SYSTEM_PROMPT = `
[INSTRU\xC7\xD5ES DO SISTEMA - AGENTE MESTRE DE RPG / NARRADOR T\xC1TICO]

Voc\xEA \xE9 um Mestre de Jogo (Game Master) e Narrador especializado em campanhas de RPG de mesa de alta densidade t\xE1tica, dark fantasy e progress\xE3o \xE9pica. Sua fun\xE7\xE3o \xE9 conduzir o mundo, os NPCs e as mec\xE2nicas de combate com rigor, realismo visceral e profundidade liter\xE1ria.

Para cada intera\xE7\xE3o, voc\xEA DEVE executar internamente a seguinte Cadeia de Pensamentos (Chain-of-Thought - CoT) antes de gerar a resposta final:
1. An\xE1lise de Inten\xE7\xE3o e Contexto: Identifique o objetivo imediato do jogador (combate, infiltra\xE7\xE3o, planejamento, di\xE1logo) e verifique o estado atual das fichas, turnos, dist\xE2ncias e status ativos (ex: dano, exaust\xE3o, efeitos clim\xE1ticos).
2. Resolu\xE7\xE3o Mec\xE2nica: Calcule regras, testes de dificuldade (Bdif), margens de sucesso (Raises), pontos de vida de hordas/inimigos e consequ\xEAncias de posicionamento (frente, flancos, retaguarda) de forma consistente com o hist\xF3rico.
3. Constru\xE7\xE3o Sensorial e Liter\xE1ria: Traduza os resultados mec\xE2nicos em prosa cinematogr\xE1fica, adulta e visceral, enfatizando o peso f\xEDsico, o cansa\xE7o, a brutalidade e a atmosfera sombria do cen\xE1rio.
4. Organiza\xE7\xE3o de Sa\xEDda: Estruture a resposta EXCLUSIVAMENTE em formato JSON.

FORMATO DE SA\xCDDA (Obrigat\xF3rio em JSON):
{
  "narrativa": "Sua prosa densa e imersiva aqui.",
  "dados_tecnicos": {
    "rolagens": [
      { "descricao": "Teste de F\xEDsico contra dificuldade X", "resultado": "Sucesso/Falha", "valor": 15 }
    ],
    "status_atualizados": {
      "hp": 45,
      "outros": "..."
    },
    "solicitacao_rolagem": "Caso precise que o jogador role algo, descreva aqui, sen\xE3o null."
  }
}

PADR\xD5ES DE RESPOSTA E FORMATO:

0. PADR\xD5ES:
- Na primeira intera\xE7\xE3o do jogador, solicitar uma breve descri\xE7\xE3o do seu personagem, definindo alinhamento e palavras chave para defini-lo, devem escolher 4 virtudes e 4 defeitos para nortear a o roleplay e facilitar sua forma de narrar lista de defeitos e virtudes o objetivo \xE9 criar um background de roleplay para o personagem com um alinhamento de a\xE7\xF5es:
- Todos os NPCs criados por voc\xEA, devem escolher 4 virtudes e 4 defeitos para nortear a o roleplay e facilitar sua forma de narrar
- Falas devem ser escritas nessa estrutura: 
    > *\u2014 [fala]* \u2014 [narrativa] \u2014 *[fala]*.
- Os titulos maiores, devem ser precedidos de #
- Os titulos menores, devem ser precedidos de ##
Letra	Virtudes (Qualidades)	Defeitos
A	Altru\xEDsta, Am\xE1vel, Atencioso, Aut\xEAntico	Arrogante, Ap\xE1tico, Avarento, Antip\xE1tico
B	Benevolente, Bondoso, Bem-humorado	Belicoso (briguento), Banal, Biromba
C	Corajoso, Companheiro, Cordial, Compreensivo	Cruel, C\xEDnico, Ciumento, Covarde
D	Dedicado, Determinado, Discreto, D\xF3cil	Desonesto, Desorganizado, Desleal, Desleixado
E	Emp\xE1tico, Esfor\xE7ado, Elegante, Eficiente	Ego\xEDsta, Egoc\xEAntrico, Invejoso, Estourado
F	Fiel, Franco, Flex\xEDvel, Fraterno	Falso, Fofoqueiro, Fr\xEDvolo, Fraco
G	Generoso, Gentil, Grato, Genu\xEDno	Gancioso, Grosseiro, Guloso, Ganza
H	Honesto, Humilde, Honrado, Hospitaleiro	Hip\xF3crita, Hostil, Hipercr\xEDtico
I	\xCDntegro, Inteligente, Inovador, Inspirador	Impaciente, Invejoso, Irrespons\xE1vel, Imaturo
J	Justo, Jovial, Juicioso	Julgador, Justiceiro (vingativo), Jactancioso
L	Leal, Liberal, L\xFAcido, Laborioso	Leviano, Lento, Limitado, Luxurioso
M	Maduro, Modesto, Misericordioso, Motivado	Manipulador, Maledicente, Mesquinho, Mentiroso
N	Nobre, Natural, Neutro, Zeloso	Negligente, Narcisista, Nervoso, Negativista
O	Otimista, Organizado, Observador, Ousado	Orgulhoso, Omissor, Obstinado, Opressor
P	Paciente, Persistente, Prudente, Prestativo	Procrastinador, Posesivo, Preconceituoso, Pessimista
Q	Querido, Questionador (construtivo)	Queixoso, Quixotesco (irrealista)
R	Resiliente, Respeitoso, Respons\xE1vel, Racional	Rancoroso, R\xEDgido, Rebelde (destrutivo), Ranzinza
S	Sincero, Solid\xE1rio, S\xE1bio, Simp\xE1tico	Sarc\xE1stico, Soberbo, S\xEDnico, Superficial
T	Tolerante, Trabalhador, Transparente	Teimoso, T\xEDmido (em excesso), Traidor, Tacanho
U	Urgente (proativo), \xDAnico, Unificador	Umbral, Utilitarista (interesseiro)
V	Valente, Verdadeiro, Vers\xE1til, Vigilante	Vaidoso, Vingativo, Vol\xFAvel, Vulgar
X	Xen\xF3filo (atra\xE7\xE3o pelo novo)	Xen\xF3fobo
Z	Zeloso, Zelador	Zombeteiro, Turvo (sem clareza)


1. Estilo Narrativo:
- Prosa densa, imersiva e de tom \xE9pico/sombrio.
- Valorize descri\xE7\xF5es sensoriais precisas: o atrito do metal, o rastro de sangue, a topografia do terreno, o estresse t\xE1tico e a psicologia pragm\xE1tica dos l\xEDderes.
- Trate o protagonista e suas escolhas com a gravidade e o respeito condizentes com arqu\xE9tipos de lideran\xE7a implac\xE1vel ou figuras de autoridade m\xE1xima ("Deus-Rei", senhores da guerra, comandantes supremos).
- Ao final da narrativa, oferee\xE7a sempre 4 op\xE7\xF5es a serem seguidas, uma segura, uma intermediaria, uma arriscada e a op\xE7\xE3o do jogador tentar algo diferente.

2. Condu\xE7\xE3o de Combates e Turnos:
- Estruture o confronto de forma t\xE1tica e espacial (divis\xE3o em turnos de ataque, oportunidade, posicionamento de hordas ou unidades rivais).
- Integre penalidades e b\xF4nus din\xE2micos (status de dano cont\xEDnuo, exaust\xE3o, armaduras pesadas, armadilhas, sabotagens).
- Descreva os golpes relacionando diretamente o esfor\xE7o f\xEDsico do personagem com o impacto catastr\xF3fico nos alvos.

3. Estrutura de Resumo T\xE1tico (dentro do campo 'narrativa'):
- Sempre que houver conclus\xE3o de conflitos, passagens de fase ou alinhamentos estrat\xE9gicos importantes, forne\xE7a um bloco final formatado em t\xF3picos claros (RESUMO T\xC1TICO / RESUMO).
- Detalhe de forma objetiva: status num\xE9ricos atualizados, posi\xE7\xF5es das equipes, baixas inimigas, recursos utilizados e os pr\xF3ximos marcos operacionais.

Idioma de opera\xE7\xE3o obrigat\xF3rio: Portugu\xEAs brasileiro.
`;
  }
});

// src/utils/narratorLogic.ts
var narratorLogic_exports = {};
__export(narratorLogic_exports, {
  parseNarratorResponse: () => parseNarratorResponse
});
var parseNarratorResponse;
var init_narratorLogic = __esm({
  "src/utils/narratorLogic.ts"() {
    parseNarratorResponse = (rawResponse) => {
      try {
        const cleanJson = rawResponse.replace(/```json/g, "").replace(/```/g, "").trim();
        return JSON.parse(cleanJson);
      } catch (e) {
        console.error("Erro ao fazer parse da resposta do Narrador, retornando conte\xFAdo plano:", e);
        return {
          narrativa: rawResponse,
          dados_tecnicos: {
            rolagens: [],
            status_atualizados: {},
            solicitacao_rolagem: null
          }
        };
      }
    };
  }
});

// server.ts
var import_config = require("dotenv/config");
var import_express = __toESM(require("express"), 1);
var import_cors = __toESM(require("cors"), 1);
var import_path = __toESM(require("path"), 1);
var import_vite = require("vite");
var import_genai = require("@google/genai");
async function startServer() {
  const app = (0, import_express.default)();
  app.use((0, import_cors.default)());
  const PORT = Number(process.env.PORT) || 3e3;
  app.use(import_express.default.json({ limit: "50mb" }));
  app.use(import_express.default.urlencoded({ extended: true, limit: "50mb" }));
  app.use(import_express.default.static(import_path.default.join(process.cwd(), "public")));
  app.post("/api/ai/narrator", async (req, res) => {
    try {
      const { channelId, prompt, context } = req.body;
      const apiKeys = [process.env.GEMINI_API_KEY2, process.env.GEMINI_API_KEY].filter(Boolean);
      if (apiKeys.length === 0) {
        return res.status(500).json({ error: "Nenhuma chave GEMINI_API_KEY ou GEMINI_API_KEY2 configurada." });
      }
      const { NARRATOR_SYSTEM_PROMPT: NARRATOR_SYSTEM_PROMPT2 } = await Promise.resolve().then(() => (init_narratorPrompt(), narratorPrompt_exports));
      const { parseNarratorResponse: parseNarratorResponse2 } = await Promise.resolve().then(() => (init_narratorLogic(), narratorLogic_exports));
      const history = [
        { role: "user", parts: [{ text: NARRATOR_SYSTEM_PROMPT2 }] },
        { role: "model", parts: [{ text: JSON.stringify({
          narrativa: "Entendido. Sou o Mestre de Jogo e Narrador T\xE1tico de Telumak RPG. Conduzirei as a\xE7\xF5es com prosa visceral e c\xE1lculos t\xE1ticos, respondendo sempre em JSON estruturado.",
          dados_tecnicos: { rolagens: [], status_atualizados: {}, solicitacao_rolagem: null }
        }) }] },
        ...(context || []).map((m) => ({
          role: m.authorName && (m.authorName.includes("Narrador") || m.authorName.includes("IA")) ? "model" : "user",
          parts: [{ text: typeof m.content === "string" ? m.content : JSON.stringify(m.content) }]
        }))
      ];
      const cleanPrompt = typeof prompt === "string" ? prompt : prompt?.text || "Prossiga a narrativa com base no contexto anterior.";
      let lastError = null;
      let responseText = "";
      const modelsToTry = ["gemini-2.5-flash", "gemini-3.8-flash"];
      keyLoop: for (const apiKey of apiKeys) {
        const ai = new import_genai.GoogleGenAI({
          apiKey,
          httpOptions: {
            headers: {
              "User-Agent": "aistudio-build"
            }
          }
        });
        for (const model of modelsToTry) {
          try {
            const result = await ai.models.generateContent({
              model,
              contents: [...history, { role: "user", parts: [{ text: cleanPrompt }] }],
              config: {
                responseMimeType: "application/json"
              }
            });
            responseText = result.text || "{}";
            if (responseText) {
              lastError = null;
              break keyLoop;
            }
          } catch (err) {
            console.warn(`[Narrador AI] Falha com chave ${apiKey.substring(0, 8)}... no modelo ${model}:`, err?.message);
            lastError = err;
          }
        }
      }
      if (!responseText && lastError) {
        throw new Error(`Falha ao gerar resposta da IA: ${lastError.message}`);
      }
      const narratorData = parseNarratorResponse2(responseText);
      return res.json({
        success: true,
        narrativa: narratorData.narrativa,
        dados_tecnicos: narratorData.dados_tecnicos,
        channelId
      });
    } catch (err) {
      console.error("Erro na API do Narrador:", err);
      res.status(500).json({ error: err.message || "Erro desconhecido ao processar com IA." });
    }
  });
  app.get("/api/proxy-image", async (req, res) => {
    const imageUrl = req.query.url;
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
      const contentType = fetchRes.headers.get("content-type") || "image/jpeg";
      const base64Data = buffer.toString("base64");
      const dataUri = `data:${contentType};base64,${base64Data}`;
      res.json({ dataUri });
    } catch (err) {
      console.error("Error proxying image:", err);
      res.status(500).json({ error: err?.message || "Internal server error" });
    }
  });
  app.post("/api/characters/import-pdf", async (req, res) => {
    try {
      const { pdfBase64, textContent, mimeType = "application/pdf" } = req.body;
      if (!pdfBase64 && !textContent) {
        return res.status(400).json({ error: "Nenhum arquivo PDF ou texto fornecido para processamento." });
      }
      const apiKey = process.env.GEMINI_API_KEY2;
      if (!apiKey) {
        return res.status(500).json({
          error: "GEMINI_API_KEY2 n\xE3o configurada no servidor. Configure a chave nos Secrets para habilitar o processamento por IA."
        });
      }
      const ai = new import_genai.GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build"
          }
        }
      });
      const promptText = `
Voc\xEA \xE9 um especialista no sistema de RPG Sank\xF6tei / Telumak RPG.
Analise detalhadamente o documento PDF da ficha de personagem Sank\xF6tei fornecido e extraia todos os dados com extrema fidelidade.

ESTRUTURA DE DADOS ESPERADA (retorne EXCLUSIVAMENTE em formato JSON):
{
  "nome": "Nome do personagem (ex: The Hen)",
  "cla": "Cl\xE3 do personagem entre par\xEAnteses se houver (ex: Nuero)",
  "ocupacao": "Ocupa\xE7\xE3o (ex: Deus Rei)",
  "posicao_social": "Posi\xE7\xE3o Social (ex: Deus Rei)",
  "cidadania": "Cidadania e Naturalidade (ex: R\xEBno)",
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
  "html_ataques": "HTML formatado e estilizado contendo a se\xE7\xE3o COMBATE, ataques, dano, redutores e modificadores da ficha",
  "html_dons": "HTML formatado e estilizado contendo DONS E PODERES, DOM\xCDNIOS | VIRTUDES e FRAQUEZAS",
  "html_equipamentos": "HTML formatado e estilizado contendo UTILIT\xC1RIOS, EQUIPAMENTOS EM USO e EQUIPAMENTOS GUARDADOS NO BA\xDA",
  "html_defesa": "HTML formatado e estilizado contendo REDUTORES, FRAGILIDADE MORTAL e ORGULHO DO SOBREVIVENTE"
}

Observa\xE7\xF5es importantes:
- Os atributos principais s\xE3o: For\xE7a/F\xEDsico (fisico), Destreza (destreza), Cogni\xE7\xE3o (cognicao), Carisma (carisma), Prim\xF3rdio (primordio).
- Sa\xFAde: se o PDF indicar '46+4 / 02 consumidos', o hp_max \xE9 50 (46+4), hp_consumidos \xE9 2, e hp_atual \xE9 48 (50 - 2).
- Energia (\xC9ter): se indicar '12 / 01 consumidos', ether_max \xE9 12, ether_consumidos \xE9 1, ether_atual \xE9 11.
- Destino (Henaen): se indicar '21+2 / 01 consumidos', destino_max \xE9 23, destino_consumidos \xE9 1, destino_atual \xE9 22.
- Ferramentas: F\xEDsico com '2/2 3/3' significa ferramenta_fisico_max=2, ferramenta_fisico_atual=2, ferramenta_fisico_sec_max=3, ferramenta_fisico_sec_atual=3.
- Formate os blocos html_ataques, html_dons, html_equipamentos e html_defesa com tags HTML limpas (divs, headings, listas, par\xE1grafos, strong, spans coloridos para status como BLEED, BURN, DANO, REDUTOR) para exibi\xE7\xE3o direta no app.
`;
      const contentsParts = [];
      if (pdfBase64) {
        const cleanBase64 = pdfBase64.replace(/^data:[^;]+;base64,/, "");
        contentsParts.push({
          inlineData: {
            mimeType: mimeType || "application/pdf",
            data: cleanBase64
          }
        });
      }
      if (textContent) {
        contentsParts.push({
          text: `Texto da ficha extra\xEDdo:
${textContent}`
        });
      }
      contentsParts.push({
        text: promptText
      });
      let response;
      try {
        response = await ai.models.generateContent({
          model: "gemini-1.5-flash",
          contents: contentsParts,
          config: {
            responseMimeType: "application/json"
          }
        });
      } catch (geminiErr) {
        console.warn("Tentando fallback para gemini-1.5-flash devido a:", geminiErr?.message);
        response = await ai.models.generateContent({
          model: "gemini-1.5-flash",
          contents: contentsParts,
          config: {
            responseMimeType: "application/json"
          }
        });
      }
      const rawJson = response.text || "{}";
      let parsedData = {};
      try {
        parsedData = JSON.parse(rawJson);
      } catch (jsonErr) {
        console.error("Erro ao fazer parse do JSON retornado pelo Gemini:", jsonErr, rawJson);
        return res.status(500).json({ error: "Falha ao estruturar os dados extra\xEDdos do PDF." });
      }
      return res.json({
        success: true,
        data: parsedData,
        message: `Ficha de "${parsedData.nome || "Personagem"}" extra\xEDda com sucesso!`
      });
    } catch (err) {
      console.error("Erro ao importar ficha por PDF:", err);
      return res.status(500).json({ error: err?.message || "Erro no processamento do PDF da ficha." });
    }
  });
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true, allowedHosts: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
