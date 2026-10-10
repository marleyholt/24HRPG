// src/utils/narratorLogic.ts

export interface NarratorResponse {
  narrativa: string;
  dados_tecnicos: {
    rolagens: Array<{ descricao: string; resultado: string; valor: number }>;
    status_atualizados: Record<string, any>;
    solicitacao_rolagem: string | null;
  };
}

/**
 * Faz o parse e validação resiliente da resposta do Agente Narrador IA.
 * Garante que NUNCA seja vazado código bruto, JSON truncado ou delimitadores na tela do chat.
 */
export const parseNarratorResponse = (rawResponse: string): NarratorResponse => {
  if (!rawResponse || typeof rawResponse !== 'string') {
    return {
      narrativa: "O silêncio ecoa pela região. O narrador aguarda sua próxima declaração.",
      dados_tecnicos: { rolagens: [], status_atualizados: {}, solicitacao_rolagem: null }
    };
  }

  const cleanText = rawResponse
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```$/g, '')
    .trim();

  // 1. Tentar parse padrão de JSON
  try {
    const parsed = JSON.parse(cleanText);
    if (parsed && typeof parsed === 'object') {
      const narrativeText = typeof parsed.narrativa === 'string' ? parsed.narrativa : (parsed.narrativa ? JSON.stringify(parsed.narrativa) : '');
      if (narrativeText) {
        return {
          narrativa: narrativeText,
          dados_tecnicos: {
            rolagens: Array.isArray(parsed.dados_tecnicos?.rolagens) ? parsed.dados_tecnicos.rolagens : [],
            status_atualizados: parsed.dados_tecnicos?.status_atualizados || {},
            solicitacao_rolagem: parsed.dados_tecnicos?.solicitacao_rolagem || null
          }
        };
      }
    }
  } catch {
    // Continua para extração defensiva abaixo
  }

  // 2. Extração defensiva caso o JSON tenha vindo truncado por limite de tokens ou com fechamento faltando
  try {
    // Procura o campo "narrativa": "..."
    const narrativeMatch = cleanText.match(/"narrativa"\s*:\s*"((?:[^"\\]|\\.)*)"/s);
    if (narrativeMatch && narrativeMatch[1]) {
      let extractedNarrative = "";
      try {
        extractedNarrative = JSON.parse('"' + narrativeMatch[1] + '"');
      } catch {
        extractedNarrative = narrativeMatch[1]
          .replace(/\\n/g, '\n')
          .replace(/\\"/g, '"')
          .replace(/\\\\/g, '\\');
      }

      // Tenta recuperar rolagens se existirem
      const rolagens: any[] = [];
      const rolagensMatch = cleanText.match(/"rolagens"\s*:\s*\[(.*?)\]/s);
      if (rolagensMatch) {
        try {
          const parsedRolls = JSON.parse('[' + rolagensMatch[1] + ']');
          if (Array.isArray(parsedRolls)) {
            rolagens.push(...parsedRolls);
          }
        } catch {}
      }

      // Tenta recuperar solicitacao_rolagem
      let solicitacao_rolagem: string | null = null;
      const solMatch = cleanText.match(/"solicitacao_rolagem"\s*:\s*"([^"]+)"/);
      if (solMatch) {
        solicitacao_rolagem = solMatch[1];
      }

      if (extractedNarrative.trim().length > 0) {
        return {
          narrativa: extractedNarrative.trim(),
          dados_tecnicos: {
            rolagens,
            status_atualizados: {},
            solicitacao_rolagem
          }
        };
      }
    }
  } catch (err) {
    console.warn("Falha no regex de extração de narrativa:", err);
  }

  // 3. Sanitização contra vazamento acidental de chaves JSON no texto puro
  let sanitizedFallback = cleanText;
  if (sanitizedFallback.startsWith('{') && sanitizedFallback.includes('"narrativa"')) {
    // Remove cabeçalhos e chaves JSON que possam ter sobrado
    sanitizedFallback = sanitizedFallback
      .replace(/^{\s*"narrativa"\s*:\s*"?/i, '')
      .replace(/"\s*,\s*"dados_tecnicos"[\s\S]*$/i, '')
      .replace(/\\n/g, '\n')
      .replace(/\\"/g, '"');
  }

  return {
    narrativa: sanitizedFallback.trim(),
    dados_tecnicos: {
      rolagens: [],
      status_atualizados: {},
      solicitacao_rolagem: null
    }
  };
};
