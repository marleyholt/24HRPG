import { 
  Continent, 
  RACES, 
  CLASSES, 
  PROFESSIONS, 
  CLASS_SKILLS, 
  WEAPON_SKILLS, 
  RACIAL_ADVANTAGES, 
  RACIAL_DISADVANTAGES,
  ATTRIBUTE_WEAKNESSES 
} from './telumakRules';

export interface CharacterBuilderState {
  // Passo 1: Geografia e Identidade
  nome: string;
  email_dono: string;
  continente: Continent;
  cidade: string;
  cla: string;
  historico: string;
  motivacao: string;
  avatarUrl: string;

  // Passo 2: Raça
  raceId: string;

  // Passo 3: Classe
  classId: string;

  // Passo 4: Profissão
  professionId: string;

  // Passo 5: Perícias
  classSkillId: string;
  professionSkillName: string;
  weaponSkillId: number;

  // Passo 6: Desvantagens & Vantagens Raciais
  disadvantages: string[]; // ids de RACIAL_DISADVANTAGES
  advantages: string[]; // ids de RACIAL_ADVANTAGES (liberada se tiver 2 desvantagens)

  // Passo 7: Distribuição de Atributos Base (60 pontos no Nv. 0)
  // Regra: Mínimo 4 por atributo. Se a raça tiver penalidade -6, deve alocar pelo menos 10 para o atributo ficar >= 4.
  baseFisico: number;
  baseDestreza: number;
  baseCognicao: number;
  baseCarisma: number;
  basePrimordio: number; // Opcional, inicia com 10 no Nível 0

  // Passo 8: Fraquezas Obrigatórias de Atributos abaixo de 10
  attributeWeaknesses: { [attr: string]: string };

  // Multiplayer
  visivelParty?: boolean;
}

export interface CalculatedStats {
  // Atributos Finais Calculados
  fisico: number;
  destreza: number;
  cognicao: number;
  carisma: number;
  primordio: number;

  // Pontos de Distribuição
  pointsSpent: number;
  pointsRemaining: number;
  minPointsError: string | null;

  // Marcadores Derivados
  saude: number;
  energia: number;
  destino: number;
  fortitude: number;
  movimento: number;
  alcance: number;
  flutuacao: number;

  // Índices de Combate & Modificadores
  ataque: number;
  defesa: number;
  redutor: number;
  atk_emboscada: number;
  red_emboscada: number;
  atk_disparo: number;
  atk_magico: number;
  def_magico: number;
  red_magico: number;

  // Testes e Rolagens
  precisaoFormula: string;
  prec_emboscada: number;
  prec_disparo: number;
  prec_magica: number;
  evasaoFormula: string;
  percepcaoFormula: string;

  // Ferramentas por atributos (modificadores)
  ferramenta_fisico: number;
  ferramenta_destreza: number;
  ferramenta_cognicao: number;
  ferramenta_carisma: number;

  // Usos diários de ferramentas avançadas (a cada 20 pontos completos)
  usos_ferramenta_fisico: number;
  usos_ferramenta_destreza: number;
  usos_ferramenta_cognicao: number;
  usos_ferramenta_carisma: number;

  // Atributos abaixo de 10 que exigem fraquezas
  lowAttributes: ('fisico' | 'destreza' | 'cognicao' | 'carisma')[];
}

export function calculateCharacterStats(state: CharacterBuilderState): CalculatedStats {
  const race = RACES.find(r => r.id === state.raceId);
  const charClass = CLASSES.find(c => c.id === state.classId);
  const profession = PROFESSIONS.find(p => p.id === state.professionId);
  const classSkill = CLASS_SKILLS.find(cs => cs.id === state.classSkillId);
  const profSkill = profession?.skills.find(ps => ps.name === state.professionSkillName);
  const weaponSkill = WEAPON_SKILLS.find(ws => ws.id === state.weaponSkillId);

  // 1. ATRIBUTOS BASE COM PENALIDADES RACIAIS
  let fis = Number(state.baseFisico || 4);
  let des = Number(state.baseDestreza || 4);
  let cog = Number(state.baseCognicao || 4);
  let car = Number(state.baseCarisma || 4);
  let pri = 10 + Number(state.basePrimordio || 0); // Primórdio inicia com 10 no nível 0

  if (race) {
    if (race.penaltyAttr === 'fisico') fis -= race.penaltyValue;
    if (race.penaltyAttr === 'destreza') des -= race.penaltyValue;
    if (race.penaltyAttr === 'cognicao') cog -= race.penaltyValue;
    if (race.penaltyAttr === 'carisma') car -= race.penaltyValue;
    if (race.penaltyAttr === 'primordio') pri -= race.penaltyValue;
  }

  // Pontos gastos (60 disponíveis)
  const pointsSpent = Number(state.baseFisico || 0) + 
                      Number(state.baseDestreza || 0) + 
                      Number(state.baseCognicao || 0) + 
                      Number(state.baseCarisma || 0) + 
                      Number(state.basePrimordio || 0);
  const pointsRemaining = 60 - pointsSpent;

  // Validação do mínimo final de 4
  let minPointsError: string | null = null;
  if (fis < 4) minPointsError = 'Força final não pode ser menor que 4.';
  else if (des < 4) minPointsError = 'Destreza final não pode ser menor que 4.';
  else if (cog < 4) minPointsError = 'Cognição final não pode ser menor que 4.';
  else if (car < 4) minPointsError = 'Carisma final não pode ser menor que 4.';
  else if (pri < 4) minPointsError = 'Primórdio final não pode ser menor que 4.';

  // 2. MARCADORES DERIVADOS INICIAIS
  // Regra Oficial Telumak RPG (Nível 1):
  // SAÚDE: 2 base + floor(Físico / 10)
  // ENERGIA: 1 base + floor(Carisma / 10)
  // DESTINO: 1 base + floor(Primórdio / 10)
  // FORTITUDE: 1 base + floor(Físico / 10)
  // MOVIMENTO: 1 base + floor(Destreza / 10)
  // ALCANCE: 1 base + floor(Cognição / 10)
  // FLUTUAÇÃO: 0 (caso tenha bônus racial, soma + floor(Primórdio / 10))
  let saude = 2 + Math.max(0, Math.floor(fis / 10));
  let energia = 1 + Math.max(0, Math.floor(car / 10));
  let destino = 1 + Math.max(0, Math.floor(pri / 10));
  let fortitude = 1 + Math.max(0, Math.floor(fis / 10));
  let movimento = 1 + Math.max(0, Math.floor(des / 10));
  let alcance = 1 + Math.max(0, Math.floor(cog / 10));
  let flutuacao = 0;

  // 3. ÍNDICES DE COMBATE INICIAIS
  // Redutor 0, Ataque 1, Defesa 1, Redutor-Emboscada 0, Prec-Mágica 0, Atk-Mágico 0, Prec-Disparo 0
  let redutor = 0;
  let ataque = 1;
  let defesa = 1;
  let atk_emboscada = 1; // Todo ataque em emboscada causa Dano +1 base
  let red_emboscada = 0;
  let atk_disparo = 0;
  let atk_magico = 0;
  let def_magico = 0;
  let red_magico = 0;
  let prec_emboscada = 0;
  let prec_disparo = 0;
  let prec_magica = 0;
  let prec_simples = 0;
  let evasiva = 0;
  let perceber = 0;

  // Exceção de Classes Mágicas: começam com Atk-Mágico 1 e Def-Mágico 1
  if (state.classId === 'feiticeiro_ab' || state.classId === 'mago_ge') {
    atk_magico = 1;
    def_magico = 1;
  }

  // 4. BÔNUS DE RAÇA
  if (race) {
    if (race.bonus.fortitude) fortitude += race.bonus.fortitude;
    if (race.bonus.saude) saude += race.bonus.saude;
    if (race.bonus.ataque) ataque += race.bonus.ataque;
    if (race.bonus.movimento) movimento += race.bonus.movimento;
    if (race.bonus.alcance) alcance += race.bonus.alcance;
    if (race.bonus.disparo) atk_disparo += race.bonus.disparo;
    if (race.bonus.energia) energia += race.bonus.energia;
    if (race.bonus.feitico) prec_magica += race.bonus.feitico;
    if (race.bonus.precisao_magica) prec_magica += race.bonus.precisao_magica;
    if (race.bonus.defesa) defesa += race.bonus.defesa;
    if (race.bonus.redutor) redutor += race.bonus.redutor;
    if (race.bonus.redutor_magico) red_magico += race.bonus.redutor_magico;
    if (race.bonus.atk_magico) atk_magico += race.bonus.atk_magico;
  }

  // 5. BÔNUS DE CLASSE
  if (charClass) {
    if (charClass.bonus.redutor_simples) redutor += charClass.bonus.redutor_simples;
    if (charClass.bonus.atk_simples) ataque += charClass.bonus.atk_simples;
    if (charClass.bonus.atk_emboscada) atk_emboscada += charClass.bonus.atk_emboscada;
    if (charClass.bonus.prec_emboscada) prec_emboscada += charClass.bonus.prec_emboscada;
    if (charClass.bonus.red_emboscada) red_emboscada += charClass.bonus.red_emboscada;
    if (charClass.bonus.perceber) perceber += charClass.bonus.perceber;
    if (charClass.bonus.atk_disparo) atk_disparo += charClass.bonus.atk_disparo;
    if (charClass.bonus.prec_disparo) prec_disparo += charClass.bonus.prec_disparo;
    if (charClass.bonus.prec_magica) prec_magica += charClass.bonus.prec_magica;
    if (charClass.bonus.atk_magico) atk_magico += charClass.bonus.atk_magico;
    if (charClass.bonus.def_magico) def_magico += charClass.bonus.def_magico;
    if (charClass.bonus.def_simples) defesa += charClass.bonus.def_simples;
    if (charClass.bonus.prec_simples) prec_simples += charClass.bonus.prec_simples;
    if (charClass.bonus.evasiva) evasiva += charClass.bonus.evasiva;
    if (charClass.bonus.red_magico) red_magico += charClass.bonus.red_magico;
  }

  // 6. BÔNUS DE PERÍCIA DE CLASSE
  if (classSkill) {
    if (classSkill.statBonus.fortitude) fortitude += classSkill.statBonus.fortitude;
    if (classSkill.statBonus.movimento) movimento += classSkill.statBonus.movimento;
    if (classSkill.statBonus.alcance) alcance += classSkill.statBonus.alcance;
    if (classSkill.statBonus.destino) destino += classSkill.statBonus.destino;
    if (classSkill.statBonus.energia) energia += classSkill.statBonus.energia;
    if (classSkill.statBonus.saude) saude += classSkill.statBonus.saude;
    if (classSkill.statBonus.prec_simples) prec_simples += classSkill.statBonus.prec_simples;
  }

  // 7. BÔNUS DE PERÍCIA DE PROFISSÃO
  if (profSkill) {
    if (profSkill.statBonus.alcance) alcance += profSkill.statBonus.alcance;
    if (profSkill.statBonus.saude) saude += profSkill.statBonus.saude;
    if (profSkill.statBonus.movimento) movimento += profSkill.statBonus.movimento;
    if (profSkill.statBonus.fortitude) fortitude += profSkill.statBonus.fortitude;
    if (profSkill.statBonus.destino) destino += profSkill.statBonus.destino;
  }

  // 8. BÔNUS DE VANTAGENS RACIAIS SELECIONADAS
  state.advantages.forEach(advId => {
    const adv = RACIAL_ADVANTAGES.find(a => a.id === advId);
    if (adv) {
      if (adv.bonus.fortitude) fortitude += adv.bonus.fortitude;
      if (adv.bonus.saude) saude += adv.bonus.saude;
      if (adv.bonus.movimento) movimento += adv.bonus.movimento;
      if (adv.bonus.alcance) alcance += adv.bonus.alcance;
      if (adv.bonus.energia) energia += adv.bonus.energia;
      if (adv.bonus.redutor) redutor += adv.bonus.redutor;
      if (adv.bonus.flutuacao) {
        flutuacao += adv.bonus.flutuacao + Math.max(0, Math.floor(pri / 10));
      }
    }
  });

  // 9. PENALIDADES DE DESVANTAGENS RACIAIS SELECIONADAS
  state.disadvantages.forEach(disId => {
    const dis = RACIAL_DISADVANTAGES.find(d => d.id === disId);
    if (dis) {
      if (dis.penalty.fortitude) fortitude = Math.max(0, fortitude - dis.penalty.fortitude);
      if (dis.penalty.destino) destino = Math.max(0, destino - dis.penalty.destino);
      if (dis.penalty.movimento) movimento = Math.max(0, movimento - dis.penalty.movimento);
      if (dis.penalty.energia) energia = Math.max(0, energia - dis.penalty.energia);
      if (dis.penalty.saude) saude = Math.max(0, saude - dis.penalty.saude);
      if (dis.penalty.alcance) alcance = Math.max(0, alcance - dis.penalty.alcance);
    }
  });

  // 10. FÓRMULAS DE TESTES E PRECISÃO
  // Precisão Desarmada: Força + (1 + Fortitude)d10
  // Com Arma: depende da perícia de arma
  let precisaoFormula = `${fis} + ${1 + fortitude + prec_simples}d10 (Desarmado)`;
  if (weaponSkill) {
    let statVal = fis;
    if (weaponSkill.attr1 === 'destreza') statVal = des;
    if (weaponSkill.attr1 === 'cognicao') statVal = cog;
    if (weaponSkill.attr1 === 'carisma') statVal = car;
    if (weaponSkill.attr1 === 'primordio') statVal = pri;

    let markerVal = fortitude;
    if (weaponSkill.attr2 === 'movimento') markerVal = movimento;
    if (weaponSkill.attr2 === 'alcance') markerVal = alcance;
    if (weaponSkill.attr2 === 'destino') markerVal = destino;

    const diceCount = 1 + markerVal + (weaponSkill.type === 'DISPARO' ? prec_disparo : weaponSkill.type === 'MAGICA' ? prec_magica : prec_simples);
    precisaoFormula = `${statVal} + ${diceCount}d10 (${weaponSkill.name})`;
  }

  // Evasão: Destreza + (1 + Movimento + Evasiva)d10
  const evasaoFormula = `${des} + ${1 + movimento + evasiva}d10`;

  // Percepção: Cognição + (1 + Alcance + Perceber)d10
  const percepcaoFormula = `${cog} + ${1 + alcance + perceber}d10`;

  // Ferramentas Modificadores de Combate
  const ferramenta_fisico = Math.max(0, Math.floor(fis / 10));
  const ferramenta_destreza = Math.max(0, Math.floor(des / 10));
  const ferramenta_cognicao = Math.max(0, Math.floor(cog / 10));
  const ferramenta_carisma = Math.max(0, Math.floor(car / 10));

  // Usos de ferramentas avançadas: 1 uso para cada 20 pontos completos
  const usos_ferramenta_fisico = Math.floor(fis / 20);
  const usos_ferramenta_destreza = Math.floor(des / 20);
  const usos_ferramenta_cognicao = Math.floor(cog / 20);
  const usos_ferramenta_carisma = Math.floor(car / 20);

  // Checagem de atributos < 10 para fraquezas obrigatórias
  const lowAttributes: ('fisico' | 'destreza' | 'cognicao' | 'carisma')[] = [];
  if (fis < 10) lowAttributes.push('fisico');
  if (des < 10) lowAttributes.push('destreza');
  if (cog < 10) lowAttributes.push('cognicao');
  if (car < 10) lowAttributes.push('carisma');

  return {
    fisico: fis,
    destreza: des,
    cognicao: cog,
    carisma: car,
    primordio: pri,

    pointsSpent,
    pointsRemaining,
    minPointsError,

    saude,
    energia,
    destino,
    fortitude,
    movimento,
    alcance,
    flutuacao,

    ataque,
    defesa,
    redutor,
    atk_emboscada,
    red_emboscada,
    atk_disparo,
    atk_magico,
    def_magico,
    red_magico,

    precisaoFormula,
    prec_emboscada,
    prec_disparo,
    prec_magica,
    evasaoFormula,
    percepcaoFormula,

    ferramenta_fisico,
    ferramenta_destreza,
    ferramenta_cognicao,
    ferramenta_carisma,

    usos_ferramenta_fisico,
    usos_ferramenta_destreza,
    usos_ferramenta_cognicao,
    usos_ferramenta_carisma,

    lowAttributes
  };
}
