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
 * Faz o parse e validação da resposta do Agente Narrador IA.
 * Garante que a estrutura JSON esperada esteja presente.
 */
export const parseNarratorResponse = (rawResponse: string): NarratorResponse => {
  try {
    // Tenta limpar possíveis marcações markdown de código
    const cleanJson = rawResponse.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanJson);
  } catch (e) {
    console.error("Erro ao fazer parse da resposta do Narrador, retornando conteúdo plano:", e);
    
    // Fallback caso não venha JSON, trata tudo como narrativa
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
