// Regras Oficiais do Sistema Telumak RPG

export type Continent = 'ABIXYA' | 'GENEXYA';

export interface RaceRule {
  id: string;
  name: string;
  continent: Continent;
  description: string;
  appearance: {
    height: string;
    skin: string;
    eyes: string;
    arms?: string;
  };
  bonusDescription: string;
  bonus: {
    fortitude?: number;
    saude?: number;
    ataque?: number;
    resistencia?: number;
    movimento?: number;
    alcance?: number;
    disparo?: number;
    energia?: number;
    feitico?: number; // Sinônimo de PREC-MÁGICA
    precisao_magica?: number;
    defesa?: number;
    redutor?: number;
    redutor_magico?: number;
    redutor_emboscada?: number;
    atk_magico?: number;
  };
  penaltyAttr: 'fisico' | 'destreza' | 'cognicao' | 'carisma' | 'primordio';
  penaltyValue: number; // e.g., 6
  giftName: string;
  giftDescription: string;
}

export interface ClassRule {
  id: string;
  name: string;
  continent: Continent;
  description: string;
  bonus: {
    redutor_simples?: number;
    atk_simples?: number;
    atk_emboscada?: number;
    prec_emboscada?: number;
    red_emboscada?: number;
    perceber?: number; // PERCEPÇÃO
    atk_disparo?: number;
    prec_disparo?: number;
    prec_magica?: number;
    atk_magico?: number;
    def_magico?: number;
    def_simples?: number;
    prec_simples?: number;
    evasiva?: number; // ESQUIVA
    red_magico?: number;
  };
}

export interface ProfessionRule {
  id: string;
  name: string;
  continent: Continent;
  compatibleClasses: string[];
  description: string;
  skills: {
    name: string;
    effectDescription: string;
    statBonus: {
      alcance?: number;
      saude?: number;
      movimento?: number;
      fortitude?: number;
      destino?: number;
    };
  }[];
}

export interface ClassSkillRule {
  id: string;
  className: string;
  continent: Continent;
  name: string;
  effectDescription: string;
  statBonus: {
    fortitude?: number;
    movimento?: number;
    alcance?: number;
    raise?: number;
    destino?: number;
    energia?: number;
    saude?: number;
    prec_simples?: number;
  };
}

export interface WeaponSkillRule {
  id: number;
  name: string;
  formula: string; // Ex: "FORÇA + FORTITUDE"
  attr1: 'fisico' | 'destreza' | 'cognicao' | 'carisma' | 'primordio';
  attr2: 'fortitude' | 'movimento' | 'alcance' | 'destino';
  type: 'CORPO_A_CORPO' | 'DISPARO' | 'MAGICA';
}

export interface RacialAdvantageRule {
  id: string;
  raceId: string;
  name: string;
  description: string;
  bonus: {
    fortitude?: number;
    saude?: number;
    movimento?: number;
    alcance?: number;
    energia?: number;
    flutuacao?: number;
    redutor?: number;
    raise?: number;
  };
}

export interface RacialDisadvantageRule {
  id: string;
  raceId: string;
  name: string;
  description: string;
  penalty: {
    fortitude?: number;
    destino?: number;
    movimento?: number;
    energia?: number;
    saude?: number;
    alcance?: number;
  };
}

export interface AttributeWeaknessRule {
  attr: 'fisico' | 'destreza' | 'cognicao' | 'carisma';
  name: string;
  description: string;
}

// 1. CIDADES POR CONTINENTE
export const NATIONS_REGIONS = {
  ABIXYA: [
    { id: 'bukhara', name: 'Bukhara', desc: 'Ligas de cristal escuro, vidro, condutores de antimatéria e feixes de espectro-violeta. Predominam os Ezaris e os Primarcas de Prata (Valgäri).' },
    { id: 'balsaguna', name: 'Balsaguna', desc: 'Fossas de magma, vales de pedra negra, cidade-fortaleza. Muralhas de basalto e carcaças mecânicas. Predominam os Azaris e os Senhores do Ferro (Forzari).' },
    { id: 'karakorum', name: 'Karakorum', desc: 'Capital e super-metrópole colossal, cidade vertical. Torres de vidro-negro e titânio. Onde vivem os soberanos Izari.' }
  ],
  GENEXYA: [
    { id: 'haloramek', name: 'Halöramëk', desc: 'Reino místico e centro de conhecimento arcano do continente governado pela raça Aramëk.' },
    { id: 'karagron', name: 'Karagrön', desc: 'Reino governado pela raça Aragron no coração das florestas densas, repleto de templos antigos.' },
    { id: 'valumnia', name: 'Välumnia', desc: 'Reino nas margens dos maiores rios, arquipélagos e ilhas de Genexya, governado pelos Aranur.' }
  ]
};

// 2. RAÇAS
export const RACES: RaceRule[] = [
  {
    id: 'azari',
    name: 'Azari',
    continent: 'ABIXYA',
    description: 'Possuem quatro braços e força descomunal. Mestres da forja de Balsaguna.',
    appearance: {
      height: '2.10m a 3.00m',
      skin: 'Vermelha, cinza, ébano ou albina',
      eyes: 'Vermelho, amarelo, laranja ou violeta',
      arms: '4 braços'
    },
    bonusDescription: '+1 Fortitude, +1 Saúde, +1 Ataque, +1 Resistência',
    bonus: { fortitude: 1, saude: 1, ataque: 1, resistencia: 1 },
    penaltyAttr: 'cognicao',
    penaltyValue: 6,
    giftName: 'Fúria',
    giftDescription: 'Dano +4, ou Defesa +4 durante a ativação'
  },
  {
    id: 'ezari',
    name: 'Ezari',
    continent: 'ABIXYA',
    description: 'Velocidade sobrenatural e músculos flexíveis. Mestres e assassinos velozes de Bukhara.',
    appearance: {
      height: '2.10m a 3.00m',
      skin: 'Cinza, roxo ou albino',
      eyes: 'Vermelho, amarelo, laranja ou violeta (4 olhos ou 4 íris)',
      arms: '2 ou 4 braços'
    },
    bonusDescription: '+1 Movimento, +1 Alcance, +1 Disparo (ATK-DISPARO)',
    bonus: { movimento: 1, alcance: 1, disparo: 1 },
    penaltyAttr: 'fisico',
    penaltyValue: 6,
    giftName: 'Reflexo',
    giftDescription: 'Ataques Duplo, ou Esquivas Dupla'
  },
  {
    id: 'aramek',
    name: 'Aramëk',
    continent: 'GENEXYA',
    description: 'Corpos esguios com 3 pares de orelhas e olhos sem pupilas repletos de pontos luminescentes. Guardiões da telecinese.',
    appearance: {
      height: '2.00m a 2.40m',
      skin: 'Caucasiana, rosa ou morena',
      eyes: 'Órbitas lilás, preto, azul-noite com pontos luminescentes',
      arms: '2 braços (3 pares de orelhas)'
    },
    bonusDescription: '+1 Energia, +1 Feitiço (PREC-MÁGICA), +1 Disparo',
    bonus: { energia: 1, precisao_magica: 1, disparo: 1 },
    penaltyAttr: 'destreza',
    penaltyValue: 6,
    giftName: 'Telecinese',
    giftDescription: 'Dano-M +2, Defesa-M +2, ou Controle'
  },
  {
    id: 'aragron',
    name: 'Aragron',
    continent: 'GENEXYA',
    description: 'Corpos maciços e bestiais com partes escamosas minerais (rubi, ônix, safira). Guerreiros indomáveis.',
    appearance: {
      height: '2.00m a 2.60m',
      skin: 'Verde, cinza, azul, amarelo ou morena encouraçada',
      eyes: 'Rubi, âmbar, safira, ametista ou ônix'
    },
    bonusDescription: '+1 Saúde, +1 Resistência, +1 Ataque, +1 Defesa',
    bonus: { saude: 1, resistencia: 1, ataque: 1, defesa: 1 },
    penaltyAttr: 'carisma',
    penaltyValue: 6,
    giftName: 'Sopro e Instinto',
    giftDescription: 'Sopro (Dano-M +4) e Instinto (Caçada)'
  },
  {
    id: 'aranur',
    name: 'Aranur',
    continent: 'GENEXYA',
    description: 'Presença impositiva e nobre com harmonia elemental ancestral, governantes das águas e ilhas.',
    appearance: {
      height: '2.00m a 2.50m',
      skin: 'Bronzeada ou castanho-claro',
      eyes: 'Opala-dourado, cyano-azul, ametista-rosa ou violeta'
    },
    bonusDescription: '+1 Redutor, +1 Redutor Mágico, +1 Atk Mágico',
    bonus: { redutor: 1, redutor_magico: 1, atk_magico: 1 },
    penaltyAttr: 'primordio',
    penaltyValue: 6,
    giftName: 'Elemental',
    giftDescription: 'Redutor +2, Redutor-M +2, Atk-Magic +2'
  }
];

// 3. CLASSES
export const CLASSES: ClassRule[] = [
  // ABIXYA
  {
    id: 'barbaro',
    name: 'Bárbaro',
    continent: 'ABIXYA',
    description: 'Guerreiro de força bruta imparável dos desertos e fossas.',
    bonus: { redutor_simples: 2, atk_simples: 2 }
  },
  {
    id: 'assassino',
    name: 'Assassino',
    continent: 'ABIXYA',
    description: 'Especialista em ataques letais furtivos e infiltração.',
    bonus: { atk_emboscada: 2, prec_emboscada: 2 }
  },
  {
    id: 'cacador',
    name: 'Caçador',
    continent: 'ABIXYA',
    description: 'Rastreador astuto treinado para caçar nos ermos hostis.',
    bonus: { red_emboscada: 1, atk_emboscada: 1, perceber: 2 }
  },
  {
    id: 'atirador',
    name: 'Atirador',
    continent: 'ABIXYA',
    description: 'Tirador de precisão letal com armamento de projéteis e tecnologia.',
    bonus: { atk_disparo: 1, prec_emboscada: 1, prec_disparo: 2 }
  },
  {
    id: 'feiticeiro_ab',
    name: 'Feiticeiro AB',
    continent: 'ABIXYA',
    description: 'Manipulador arcanista das energias sombrias e antimatéria de Abixya.',
    bonus: { prec_magica: 2, atk_magico: 2 }
  },
  // GENEXYA
  {
    id: 'paladino',
    name: 'Paladino',
    continent: 'GENEXYA',
    description: 'Bastião sagrado que combina proteção marcial e bênção mágica.',
    bonus: { redutor_simples: 1, red_magico: 1, red_emboscada: 1, atk_magico: 1 }
  },
  {
    id: 'guerreiro',
    name: 'Guerreiro',
    continent: 'GENEXYA',
    description: 'Mestre no combate tático equilibrado corpo a corpo.',
    bonus: { atk_simples: 1, def_simples: 1, redutor_simples: 1, prec_simples: 1 }
  },
  {
    id: 'mercenario',
    name: 'Mercenário',
    continent: 'GENEXYA',
    description: 'Combatente versátil adaptado a embates corpo a corpo e tiros rápidos com alta evasiva.',
    bonus: { prec_simples: 1, prec_disparo: 1, evasiva: 2 }
  },
  {
    id: 'ranger',
    name: 'Ranger',
    continent: 'GENEXYA',
    description: 'Guardião das florestas e rotas selvagens com sentidos aguçados.',
    bonus: { perceber: 2, prec_simples: 1, prec_disparo: 1 }
  },
  {
    id: 'arqueiro',
    name: 'Arqueiro',
    continent: 'GENEXYA',
    description: 'Mestre no disparo de precisão devastador à longa distância.',
    bonus: { atk_disparo: 2, prec_disparo: 2 }
  },
  {
    id: 'mago_ge',
    name: 'Mago GE',
    continent: 'GENEXYA',
    description: 'Erudito do ARAR místico com domínio total sobre feitiços e defesas mágicas.',
    bonus: { prec_magica: 1, atk_magico: 1, def_magico: 1, red_magico: 1 }
  }
];

// 4. PROFISSÕES
export const PROFESSIONS: ProfessionRule[] = [
  // ABIXYA
  {
    id: 'inteligencia_razis',
    name: 'Inteligência Razis',
    continent: 'ABIXYA',
    compatibleClasses: ['feiticeiro_ab', 'assassino', 'cacador'],
    description: 'Acessa banco de dados de Território, Civilizações e Mitos de Abixya sem teste. Rola Conquista para achar tesouros.',
    skills: [
      {
        name: 'Mapeamento de Relíquias',
        effectDescription: '+1 ALCANCE e 1 Re-roll em testes de Cognição ao analisar ruínas e relíquias.',
        statBonus: { alcance: 1 }
      },
      {
        name: 'Sobrevivência Árida',
        effectDescription: '+1 SAÚDE e 1 Re-roll em testes de Cognição para rotas seguras e água nos desertos.',
        statBonus: { saude: 1 }
      }
    ]
  },
  {
    id: 'militar_razeros',
    name: 'Militar Razeros',
    continent: 'ABIXYA',
    compatibleClasses: ['barbaro', 'atirador', 'assassino', 'cacador'],
    description: 'Acessa banco de Criminosos e Procurados de Abixya. Rola Fraqueza para achar ponto fraco dos inimigos.',
    skills: [
      {
        name: 'Interrogatório e Investigação',
        effectDescription: '+1 SAÚDE e 1 Re-roll em testes de Físico/Cognição para extrair dados.',
        statBonus: { saude: 1 }
      },
      {
        name: 'Tática de Combate',
        effectDescription: '+1 MOVIMENTO e 1 Re-roll por dia em PRECISÃO no combate.',
        statBonus: { movimento: 1 }
      }
    ]
  },
  {
    id: 'paramilitar_razagi',
    name: 'Paramilitar Razagi',
    continent: 'ABIXYA',
    compatibleClasses: ['atirador', 'barbaro', 'assassino', 'cacador'],
    description: 'Acessa banco de Animais e Mutações de Abixya. Rola Fragilidade para achar ponto vital de feras.',
    skills: [
      {
        name: 'Rastreamento de Feras',
        effectDescription: '+1 ALCANCE e 1 Re-roll em testes de Cognição ao seguir rastros.',
        statBonus: { alcance: 1 }
      },
      {
        name: 'Anatomia Monstruosa',
        effectDescription: '+1 FORTITUDE e 1 Re-roll por dia em PRECISÃO em emboscada.',
        statBonus: { fortitude: 1 }
      }
    ]
  },
  // GENEXYA
  {
    id: 'explorador_genos',
    name: 'Exploradores Gënos',
    continent: 'GENEXYA',
    compatibleClasses: ['ranger', 'mago_ge', 'arqueiro', 'mercenario', 'guerreiro'],
    description: 'Acessa bases de dados de História, Cultura, Ritos de Genexya. Rola Conquista para tesouros lendários.',
    skills: [
      {
        name: 'Cartografia Mística',
        effectDescription: '+1 ALCANCE e 1 Re-roll em Cognição ao analisar mapas antigos.',
        statBonus: { alcance: 1 }
      },
      {
        name: 'Linguística Antiga',
        effectDescription: '+1 DESTINO e 1 Re-roll em testes de Cognição com ritos ancestrais.',
        statBonus: { destino: 1 }
      }
    ]
  },
  {
    id: 'guardioes_nexus',
    name: 'Guardiões Nexus',
    continent: 'GENEXYA',
    compatibleClasses: ['paladino', 'guerreiro', 'ranger', 'arqueiro', 'mago_ge'],
    description: 'Acessa banco de Bosses Humanoides e Seres Semidivinos de Genexya. Rola Fraqueza 2x.',
    skills: [
      {
        name: 'Sentinela Prateada',
        effectDescription: '+1 FORTITUDE e 1 Re-roll em testes de Percepção em guarda.',
        statBonus: { fortitude: 1 }
      },
      {
        name: 'Vigor Inabalável',
        effectDescription: '+1 SAÚDE e resistência aumentada em confrontos épicos.',
        statBonus: { saude: 1 }
      }
    ]
  },
  {
    id: 'mercenarios_axen',
    name: 'Mercenários Axen',
    continent: 'GENEXYA',
    compatibleClasses: ['mercenario', 'guerreiro', 'arqueiro', 'ranger', 'paladino'],
    description: 'Acessa dados de Bosses Criatura e Animais Ancestrais de Genexya. Rola Fragilidade 2x.',
    skills: [
      {
        name: 'Instinto Predatório',
        effectDescription: '+1 MOVIMENTO e bônus tático ao cercar bestas colossais.',
        statBonus: { movimento: 1 }
      },
      {
        name: 'Corte Penetrante',
        effectDescription: '+1 FORTITUDE e 1 Re-roll em combate contra armaduras biológicas.',
        statBonus: { fortitude: 1 }
      }
    ]
  }
];

// 5. PERÍCIAS DE CLASSE
export const CLASS_SKILLS: ClassSkillRule[] = [
  // ABIXYA
  { id: 'cs_barb_1', className: 'barbaro', continent: 'ABIXYA', name: 'Força Bruta', effectDescription: '+1 FORTITUDE e Dano +1 em combate (1x/dia) ao atacar ou agarrar.', statBonus: { fortitude: 1 } },
  { id: 'cs_barb_2', className: 'barbaro', continent: 'ABIXYA', name: 'Avanço Frenético', effectDescription: '+1 MOVIMENTO e 1x Re-roll em PRECISÃO no combate ao avançar.', statBonus: { movimento: 1 } },
  
  { id: 'cs_ass_1', className: 'assassino', continent: 'ABIXYA', name: 'Furtividade Sombria', effectDescription: '+1 MOVIMENTO e Dano +1 em emboscada (1x/dia).', statBonus: { movimento: 1 } },
  { id: 'cs_ass_2', className: 'assassino', continent: 'ABIXYA', name: 'Golpe Cirúrgico', effectDescription: '+1 ALCANCE e 1x Re-roll em PRECISÃO em emboscada.', statBonus: { alcance: 1 } },
  
  { id: 'cs_cac_1', className: 'cacador', continent: 'ABIXYA', name: 'Percepção Aguçada', effectDescription: '+1 MOVIMENTO e 1x Re-roll em PERCEPÇÃO em emboscada.', statBonus: { movimento: 1 } },
  { id: 'cs_cac_2', className: 'cacador', continent: 'ABIXYA', name: 'Pontaria de Caça', effectDescription: '+1 ALCANCE e 1x Re-roll em PRECISÃO em emboscada.', statBonus: { alcance: 1 } },
  
  { id: 'cs_at_1', className: 'atirador', continent: 'ABIXYA', name: 'Avaliação do Perigo', effectDescription: '+1 RAISE (1x/dia) ao usar EVADIR ou ACELERAR em combate.', statBonus: { raise: 1 } },
  { id: 'cs_at_2', className: 'atirador', continent: 'ABIXYA', name: 'Prática de Armas', effectDescription: '+1 FORTITUDE e +1 ALCANCE para alternar corpo a corpo e distância.', statBonus: { fortitude: 1, alcance: 1 } },
  
  { id: 'cs_fe_1', className: 'feiticeiro_ab', continent: 'ABIXYA', name: 'Foco Arcano', effectDescription: '+1 DESTINO e +1 RAISE ao usar FOCAR para canalizar energias.', statBonus: { destino: 1, raise: 1 } },
  { id: 'cs_fe_2', className: 'feiticeiro_ab', continent: 'ABIXYA', name: 'Mestria Mágica', effectDescription: '+1 ENERGIA e 1x Re-roll em PRECISÃO MÁGICA em combate.', statBonus: { energia: 1 } },
  
  // GENEXYA
  { id: 'cs_ran_1', className: 'ranger', continent: 'GENEXYA', name: 'Leitura de Pistas', effectDescription: '+1 ALCANCE e 1x Re-roll em PERCEPÇÃO em emboscada.', statBonus: { alcance: 1 } },
  { id: 'cs_ran_2', className: 'ranger', continent: 'GENEXYA', name: 'Tiro Certeiro', effectDescription: '+1 MOVIMENTO e 1x Re-roll em PRECISÃO em combate.', statBonus: { movimento: 1 } },
  
  { id: 'cs_gue_1', className: 'guerreiro', continent: 'GENEXYA', name: 'Postura Marcial', effectDescription: '+1 FORTITUDE e Dano +1 em combate (1x/dia) ao usar ATACAR.', statBonus: { fortitude: 1 } },
  { id: 'cs_gue_2', className: 'guerreiro', continent: 'GENEXYA', name: 'Guarda Fechada', effectDescription: '+1 SAÚDE e 1x Re-roll em EVASÃO em combate ao bloquear.', statBonus: { saude: 1 } },
  
  { id: 'cs_mer_1', className: 'mercenario', continent: 'GENEXYA', name: 'Giro Tático', effectDescription: '+1 PREC-SIMPLES (1x/dia) ao usar ABDICAR para reorientar posição.', statBonus: { prec_simples: 1 } },
  { id: 'cs_mer_2', className: 'mercenario', continent: 'GENEXYA', name: 'Mira Treinada', effectDescription: '+1 SAÚDE e +1 MOVIMENTO para alternar golpes e tiros rápidos.', statBonus: { saude: 1, movimento: 1 } },
  
  { id: 'cs_pal_1', className: 'paladino', continent: 'GENEXYA', name: 'Bastião de Defesa', effectDescription: '+1 FORTITUDE e +1 RAISE ao acionar a ferramenta RESISTIR.', statBonus: { fortitude: 1, raise: 1 } },
  { id: 'cs_pal_2', className: 'paladino', continent: 'GENEXYA', name: 'Vigilância de Guarda', effectDescription: '+1 SAÚDE e 1x Re-roll em PERCEPÇÃO em emboscada.', statBonus: { saude: 1 } },
  
  { id: 'cs_mag_1', className: 'mago_ge', continent: 'GENEXYA', name: 'Sintonia Elemental', effectDescription: '+1 ENERGIA e Dano Mágico +1 (1x/dia) em combate.', statBonus: { energia: 1 } },
  { id: 'cs_mag_2', className: 'mago_ge', continent: 'GENEXYA', name: 'Controle Arcano', effectDescription: '+1 DESTINO e 1x Re-roll em PRECISÃO MÁGICA em combate.', statBonus: { destino: 1 } },
  
  { id: 'cs_arq_1', className: 'arqueiro', continent: 'GENEXYA', name: 'Olho de Águia', effectDescription: '+1 ALCANCE e 1x Re-roll em PRECISÃO em emboscada.', statBonus: { alcance: 1 } },
  { id: 'cs_arq_2', className: 'arqueiro', continent: 'GENEXYA', name: 'Disparo Veloz', effectDescription: '+1 MOVIMENTO e Dano +1 em múltiplos disparos.', statBonus: { movimento: 1 } }
];

// 6. PERÍCIAS DE ARMA
export const WEAPON_SKILLS: WeaponSkillRule[] = [
  { id: 1, name: 'Machado e Montante', formula: 'FORÇA + FORTITUDE', attr1: 'fisico', attr2: 'fortitude', type: 'CORPO_A_CORPO' },
  { id: 2, name: 'Lança e Clava', formula: 'DESTREZA + MOVIMENTO', attr1: 'destreza', attr2: 'movimento', type: 'CORPO_A_CORPO' },
  { id: 3, name: 'Espadas e Adagas', formula: 'DESTREZA + MOVIMENTO', attr1: 'destreza', attr2: 'movimento', type: 'CORPO_A_CORPO' },
  { id: 4, name: 'Rifle de Disparo e Adaga', formula: 'COGNIÇÃO + MOVIMENTO', attr1: 'cognicao', attr2: 'movimento', type: 'DISPARO' },
  { id: 5, name: 'Polearm, Gancho, Corrente e Foice', formula: 'FORÇA + MOVIMENTO', attr1: 'fisico', attr2: 'movimento', type: 'CORPO_A_CORPO' },
  { id: 6, name: 'Facas e Pistolas', formula: 'COGNIÇÃO + ALCANCE', attr1: 'cognicao', attr2: 'alcance', type: 'DISPARO' },
  { id: 7, name: 'Lança, Adagas e Facas', formula: 'DESTREZA + MOVIMENTO', attr1: 'destreza', attr2: 'movimento', type: 'CORPO_A_CORPO' },
  { id: 8, name: 'Rifle de Disparo e Pistola', formula: 'COGNIÇÃO + ALCANCE', attr1: 'cognicao', attr2: 'alcance', type: 'DISPARO' },
  { id: 9, name: 'Escudo, Espada e Lança', formula: 'DESTREZA + FORTITUDE', attr1: 'destreza', attr2: 'fortitude', type: 'CORPO_A_CORPO' },
  { id: 10, name: 'Escudo e Montante', formula: 'FORÇA + FORTITUDE', attr1: 'fisico', attr2: 'fortitude', type: 'CORPO_A_CORPO' },
  { id: 11, name: 'Amuleto ou Anel', formula: 'COGNIÇÃO + ALCANCE (Magia)', attr1: 'cognicao', attr2: 'alcance', type: 'MAGICA' },
  { id: 12, name: 'Cajado ou Totem Cerimonial', formula: 'CARISMA + ALCANCE (Magia)', attr1: 'carisma', attr2: 'alcance', type: 'MAGICA' },
  { id: 17, name: 'Alabarda e Machado de Guerra', formula: 'FORÇA + FORTITUDE', attr1: 'fisico', attr2: 'fortitude', type: 'CORPO_A_CORPO' },
  { id: 18, name: 'Arco Curto e Adagas', formula: 'DESTREZA + ALCANCE', attr1: 'destreza', attr2: 'alcance', type: 'DISPARO' },
  { id: 19, name: 'Gládio e Escudo de Corpo', formula: 'FORÇA + FORTITUDE', attr1: 'fisico', attr2: 'fortitude', type: 'CORPO_A_CORPO' },
  { id: 20, name: 'Besta Leve e Facas de Arremesso', formula: 'COGNIÇÃO + ALCANCE', attr1: 'cognicao', attr2: 'alcance', type: 'DISPARO' },
  { id: 21, name: 'Martelo de Guerra e Escudo', formula: 'FORÇA + FORTITUDE', attr1: 'fisico', attr2: 'fortitude', type: 'CORPO_A_CORPO' },
  { id: 22, name: 'Cajado Elemental e Orbe', formula: 'PRIMÓRDIO + ALCANCE (Magia)', attr1: 'primordio', attr2: 'alcance', type: 'MAGICA' },
  { id: 23, name: 'Grimoire e Talismã Ancestral', formula: 'COGNIÇÃO + DESTINO (Magia)', attr1: 'cognicao', attr2: 'destino', type: 'MAGICA' }
];

// 7. VANTAGENS RACIAIS
export const RACIAL_ADVANTAGES: RacialAdvantageRule[] = [
  { id: 'azari_adv_1', raceId: 'azari', name: 'Força Extrema', description: 'Receberá FORTITUDE +2 (linhagem Forzari de Balsaguna).', bonus: { fortitude: 2 } },
  { id: 'azari_adv_2', raceId: 'azari', name: 'Saúde Extrema', description: 'Receberá SAÚDE +3 (físico descomunal entre os Azari).', bonus: { saude: 3 } },
  { id: 'ezari_adv_1', raceId: 'ezari', name: 'Velocidade Extrema', description: 'Receberá MOVIMENTO +2 (linhagem de assassinos velozes de Bukhara).', bonus: { movimento: 2 } },
  { id: 'ezari_adv_2', raceId: 'ezari', name: 'Mentalidade Extrema', description: 'Receberá ALCANCE +2 (linhagem de cientistas e percepção de Bukhara).', bonus: { alcance: 2 } },
  { id: 'aramek_adv_1', raceId: 'aramek', name: 'Telecinese Superior', description: 'Receberá ENERGIA +3 por conexão profunda com o ARAR.', bonus: { energia: 3 } },
  { id: 'aramek_adv_2', raceId: 'aramek', name: 'Voo Telecinético', description: 'Receberá FLUTUAÇÃO +1 e ALCANCE +1.', bonus: { flutuacao: 1, alcance: 1 } },
  { id: 'aragron_adv_1', raceId: 'aragron', name: 'Asas e Voo', description: 'Receberá FLUTUAÇÃO +2 (casta dos voadores).', bonus: { flutuacao: 2 } },
  { id: 'aragron_adv_2', raceId: 'aragron', name: 'Cauda', description: 'Receberá RAISE +1 de movimentação (2x/dia) pela cauda longa.', bonus: { raise: 1 } },
  { id: 'aranur_adv_1', raceId: 'aranur', name: 'Duplo Elemento', description: 'Receberá REDUTOR +3 pela fusão de linhagens ancestrais.', bonus: { redutor: 3 } }
];

// 8. DESVANTAGENS RACIAIS
export const RACIAL_DISADVANTAGES: RacialDisadvantageRule[] = [
  { id: 'azari_dis_1', raceId: 'azari', name: 'Mente Rígida', description: 'Rola 1 dado de perigo em Abixya (ou 2 fora) e +10% chance de encontro inimigo.', penalty: {} },
  { id: 'azari_dis_2', raceId: 'azari', name: 'Corpo Pesado', description: 'Perde 1 ponto de FORTITUDE (-1) e -1 dado de precisão em combate.', penalty: { fortitude: 1 } },
  { id: 'azari_dis_3', raceId: 'azari', name: 'Mutante Deformado', description: 'Perde 1 ponto de DESTINO (-1) e sofre +1 dano na área deformada.', penalty: { destino: 1 } },
  
  { id: 'ezari_dis_1', raceId: 'ezari', name: 'Pele Frágil', description: 'Recebe +1 DANO contra Esmagar, Agarrar e dispositivos de Explosão/Impacto.', penalty: {} },
  { id: 'ezari_dis_2', raceId: 'ezari', name: 'Exaustão Precoce', description: 'Perde 1 ponto de MOVIMENTO (-1) e perde 1 Energia ao entrar em combate.', penalty: { movimento: 1, energia: 1 } },
  { id: 'ezari_dis_3', raceId: 'ezari', name: 'Mutante Doente', description: 'Perde 1 ponto de DESTINO (-1) e sofre perda de saúde se aparelhos forem rompidos.', penalty: { destino: 1 } },
  
  { id: 'aramek_dis_1', raceId: 'aramek', name: 'Conexão Atrapalhada', description: 'Perde 1 ponto de MOVIMENTO (-1) e -1 dado de evasão em combate.', penalty: { movimento: 1 } },
  { id: 'aramek_dis_2', raceId: 'aramek', name: 'Sobrecarga Espiritual', description: 'Perde 1 ponto de SAÚDE (-1) e 1 de FORTITUDE (-1) pelo estresse no corpo.', penalty: { saude: 1, fortitude: 1 } },
  { id: 'aramek_dis_3', raceId: 'aramek', name: 'Mente Quebrada', description: 'Perde 1 ponto de DESTINO (-1) e 1 de ALCANCE (-1) por alucinações arcanas.', penalty: { destino: 1, alcance: 1 } },
  
  { id: 'aragron_dis_1', raceId: 'aragron', name: 'Presença Hostil', description: 'Adiciona +20% de inimigos em exploração (30% fora de Genexya).', penalty: {} },
  { id: 'aragron_dis_2', raceId: 'aragron', name: 'Rigidez Muscular', description: 'Perde 1 ponto de FORTITUDE (-1) e -1 dado de precisão em ataques finos.', penalty: { fortitude: 1 } },
  { id: 'aragron_dis_3', raceId: 'aragron', name: 'Bestialidade', description: 'Perde 1 ponto de DESTINO (-1) e fica incapaz de se defender em combate.', penalty: { destino: 1 } },
  
  { id: 'aranur_dis_1', raceId: 'aranur', name: 'Corpo Sensível', description: 'Recebe +1 Dano contra Focar/Concentrar e efeitos elétricos ou perfuração profunda.', penalty: {} },
  { id: 'aranur_dis_2', raceId: 'aranur', name: 'Orgulho Ancestral', description: 'Perde 2 pontos de ENERGIA (-2) por dia ao ingressar em combate.', penalty: { energia: 2 } },
  { id: 'aranur_dis_3', raceId: 'aranur', name: 'Corrupção Ancestral', description: 'Perde 1 ponto de DESTINO (-1) e sofre dores severas contra tecnologia pesada.', penalty: { destino: 1 } }
];

// 9. FRAQUEZAS OBRIGATÓRIAS QUANDO ATRIBUTO < 10
export const ATTRIBUTE_WEAKNESSES: AttributeWeaknessRule[] = [
  { attr: 'fisico', name: 'Frágil contra Disparo', description: 'Recebe +1 Dano adicional contra projéteis em combate ou emboscada.' },
  { attr: 'fisico', name: 'Frágil contra Elemental', description: 'Recebe +1 Dano de fogo (BURN), ácido (ACID), gelo ou eletricidade.' },
  { attr: 'destreza', name: 'Medo de Quantidades', description: 'Sofre +1 RAISE adicional de velocidade em lutas contra superioridade numérica.' },
  { attr: 'destreza', name: 'Medo de Monstros', description: 'Sofre +1 RAISE adicional contra animais, bestas ou mutações.' },
  { attr: 'cognicao', name: 'Frágil contra Surpresas', description: 'Recebe +1 Dano em emboscadas ou ataques de oportunidade.' },
  { attr: 'cognicao', name: 'Deficiência Sensorial', description: 'Sofre +1 RAISE adicional ao ser surpreendido em emboscada.' },
  { attr: 'carisma', name: 'Cicatrizes/Deformação (Caçado)', description: 'Recebe +1 inimigo adicional em encontros de combate ou emboscada.' },
  { attr: 'carisma', name: 'Odiado e Infame', description: 'Limite de parceiros de equipe reduzido (PARTY -1).' }
];
