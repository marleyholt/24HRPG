import React, { useState, useMemo } from 'react';
import { 
  Continent, 
  RACES, 
  CLASSES, 
  PROFESSIONS, 
  CLASS_SKILLS, 
  WEAPON_SKILLS, 
  RACIAL_ADVANTAGES, 
  RACIAL_DISADVANTAGES, 
  ATTRIBUTE_WEAKNESSES, 
  NATIONS_REGIONS 
} from '../utils/telumakRules';
import { CharacterBuilderState, calculateCharacterStats } from '../utils/characterCalculations';
import { ImageUploadField } from './ImageUploadField';
import { 
  Sparkles, Heart, Zap, Star, Shield, Crosshair, 
  Flame, Award, AlertTriangle, Check, X, ChevronRight, 
  ChevronLeft, Swords, BookOpen, Compass, User, RefreshCw, Info, Lock
} from 'lucide-react';

interface CharacterCreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveCharacter: (charData: any) => Promise<void>;
  currentUserEmail: string;
}

const INITIAL_STATE: CharacterBuilderState = {
  nome: '',
  email_dono: '',
  continente: 'ABIXYA',
  cidade: 'bukhara',
  cla: '',
  historico: '',
  motivacao: '',
  avatarUrl: '',

  raceId: 'azari',
  classId: 'barbaro',
  professionId: 'inteligencia_razis',

  classSkillId: 'cs_barb_1',
  professionSkillName: 'Mapeamento de Relíquias',
  weaponSkillId: 1,

  disadvantages: [],
  advantages: [],

  // Azari tem penalidade de -6 em Cognição. Logo, para ter no mínimo 4 final, aloca 10 em Cognição.
  // Total 60: Fisico 20, Destreza 15, Cognição 10, Carisma 15, Primórdio 0.
  baseFisico: 20,
  baseDestreza: 15,
  baseCognicao: 10,
  baseCarisma: 15,
  basePrimordio: 0,

  attributeWeaknesses: {},
  visivelParty: true
};

export function CharacterCreatorModal({ isOpen, onClose, onSaveCharacter, currentUserEmail }: CharacterCreatorModalProps) {
  const [formState, setFormState] = useState<CharacterBuilderState>(() => ({
    ...INITIAL_STATE,
    email_dono: currentUserEmail || ''
  }));
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Cálculo em tempo real estritamente pelas regras do Telumak
  const stats = useMemo(() => calculateCharacterStats(formState), [formState]);

  if (!isOpen) return null;

  // Filtragens por continente e regras atuais
  const availableRaces = RACES.filter(r => r.continent === formState.continente);
  const availableClasses = CLASSES.filter(c => c.continent === formState.continente);
  const currentRace = RACES.find(r => r.id === formState.raceId);
  const currentClass = CLASSES.find(c => c.id === formState.classId);

  const availableProfessions = PROFESSIONS.filter(p => {
    if (p.continent !== formState.continente) return false;
    // Checar se a classe atual é compatível com a profissão
    return p.compatibleClasses.includes(formState.classId);
  });

  const currentProfession = PROFESSIONS.find(p => p.id === formState.professionId) || availableProfessions[0];
  const availableClassSkills = CLASS_SKILLS.filter(cs => cs.className === formState.classId);
  const availableRacialDisadvantages = RACIAL_DISADVANTAGES.filter(d => d.raceId === formState.raceId);
  const availableRacialAdvantages = RACIAL_ADVANTAGES.filter(a => a.raceId === formState.raceId);

  // Troca de continente ajusta seleções automaticamente
  const handleContinentChange = (newContinent: Continent) => {
    const firstRace = RACES.find(r => r.continent === newContinent)!;
    const firstClass = CLASSES.find(c => c.continent === newContinent)!;
    const firstProf = PROFESSIONS.find(p => p.continent === newContinent && p.compatibleClasses.includes(firstClass.id)) || PROFESSIONS.find(p => p.continent === newContinent)!;
    const firstCity = NATIONS_REGIONS[newContinent][0].id;
    const firstClassSkill = CLASS_SKILLS.find(cs => cs.className === firstClass.id);

    // Ajuste de base para respeitar penalidade da nova raça
    let baseFis = 15;
    let baseDes = 15;
    let baseCog = 15;
    let baseCar = 15;
    if (firstRace.penaltyAttr === 'fisico') { baseFis = 18; baseCog = 12; }
    if (firstRace.penaltyAttr === 'destreza') { baseDes = 18; baseFis = 12; }
    if (firstRace.penaltyAttr === 'cognicao') { baseCog = 18; baseFis = 12; }
    if (firstRace.penaltyAttr === 'carisma') { baseCar = 18; baseFis = 12; }

    setFormState(prev => ({
      ...prev,
      continente: newContinent,
      cidade: firstCity,
      raceId: firstRace.id,
      classId: firstClass.id,
      professionId: firstProf.id,
      classSkillId: firstClassSkill ? firstClassSkill.id : '',
      professionSkillName: firstProf.skills[0]?.name || '',
      disadvantages: [],
      advantages: [],
      baseFisico: baseFis,
      baseDestreza: baseDes,
      baseCognicao: baseCog,
      baseCarisma: baseCar,
      basePrimordio: 0
    }));
  };

  const handleRaceChange = (newRaceId: string) => {
    const newRace = RACES.find(r => r.id === newRaceId);
    if (!newRace) return;

    // Assegura que o atributo com penalidade receba alocação suficiente para garantir mínimo 4
    let baseFis = formState.baseFisico;
    let baseDes = formState.baseDestreza;
    let baseCog = formState.baseCognicao;
    let baseCar = formState.baseCarisma;

    if (newRace.penaltyAttr === 'fisico' && baseFis < 10) baseFis = 10;
    if (newRace.penaltyAttr === 'destreza' && baseDes < 10) baseDes = 10;
    if (newRace.penaltyAttr === 'cognicao' && baseCog < 10) baseCog = 10;
    if (newRace.penaltyAttr === 'carisma' && baseCar < 10) baseCar = 10;

    setFormState(prev => ({
      ...prev,
      raceId: newRaceId,
      baseFisico: baseFis,
      baseDestreza: baseDes,
      baseCognicao: baseCog,
      baseCarisma: baseCar,
      disadvantages: [],
      advantages: []
    }));
  };

  const handleClassChange = (newClassId: string) => {
    const compatibleProfs = PROFESSIONS.filter(p => p.continent === formState.continente && p.compatibleClasses.includes(newClassId));
    const nextProf = compatibleProfs[0] || availableProfessions[0];
    const nextClassSkill = CLASS_SKILLS.find(cs => cs.className === newClassId);

    setFormState(prev => ({
      ...prev,
      classId: newClassId,
      professionId: nextProf.id,
      classSkillId: nextClassSkill ? nextClassSkill.id : '',
      professionSkillName: nextProf.skills[0]?.name || ''
    }));
  };

  const toggleDisadvantage = (disId: string) => {
    setFormState(prev => {
      const exists = prev.disadvantages.includes(disId);
      const newDis = exists ? prev.disadvantages.filter(id => id !== disId) : [...prev.disadvantages, disId];
      // Se não tiver 2 desvantagens, remove vantagens raciais que exigiam 2
      const newAdv = newDis.length >= 2 ? prev.advantages : [];
      return { ...prev, disadvantages: newDis, advantages: newAdv };
    });
  };

  const toggleAdvantage = (advId: string) => {
    if (formState.disadvantages.length < 2) return;
    setFormState(prev => {
      const exists = prev.advantages.includes(advId);
      // Limite de 1 vantagem racial por regra
      const newAdv = exists ? [] : [advId];
      return { ...prev, advantages: newAdv };
    });
  };

  const handleSetWeakness = (attr: string, weaknessName: string) => {
    setFormState(prev => ({
      ...prev,
      attributeWeaknesses: {
        ...prev.attributeWeaknesses,
        [attr]: weaknessName
      }
    }));
  };

  const handleSave = async () => {
    if (!formState.nome.trim()) {
      alert('Por favor, informe o Nome do Personagem.');
      setCurrentStep(1);
      return;
    }

    if (stats.pointsRemaining !== 0) {
      alert(`Você deve gastar exatamente 60 pontos nos atributos base. Restantes: ${stats.pointsRemaining}`);
      setCurrentStep(4);
      return;
    }

    if (stats.minPointsError) {
      alert(stats.minPointsError);
      setCurrentStep(4);
      return;
    }

    // Validação de fraquezas obrigatórias para atributos < 10
    for (const attr of stats.lowAttributes) {
      if (!formState.attributeWeaknesses[attr]) {
        alert(`O atributo ${attr.toUpperCase()} ficou abaixo de 10. Selecione a Fraqueza Obrigatória no Passo 5.`);
        setCurrentStep(5);
        return;
      }
    }

    setIsSubmitting(true);
    try {
      // Montagem do payload completo para salvar no Firebase
      const raceObj = RACES.find(r => r.id === formState.raceId);
      const classObj = CLASSES.find(c => c.id === formState.classId);
      const profObj = PROFESSIONS.find(p => p.id === formState.professionId);
      const classSkillObj = CLASS_SKILLS.find(cs => cs.id === formState.classSkillId);
      const weaponSkillObj = WEAPON_SKILLS.find(ws => ws.id === formState.weaponSkillId);

      const htmlAtaques = `
        <div class="space-y-2">
          <p><b>Arma Principal:</b> ${weaponSkillObj?.name || 'Desarmado'} (${stats.precisaoFormula})</p>
          <p><b>Ataque Simples:</b> +${stats.ataque} | <b>Defesa:</b> +${stats.defesa} | <b>Redutor:</b> +${stats.redutor}</p>
          <p><b>Emboscada:</b> Dano +${stats.atk_emboscada} | Prec: +${stats.prec_emboscada}d10 | Redutor: +${stats.red_emboscada}</p>
          ${stats.atk_disparo > 0 || stats.prec_disparo > 0 ? `<p><b>Disparo:</b> Atk +${stats.atk_disparo} | Prec +${stats.prec_disparo}d10</p>` : ''}
          ${stats.atk_magico > 0 || stats.prec_magica > 0 ? `<p><b>Mágico:</b> Atk +${stats.atk_magico} | Def +${stats.def_magico} | Prec +${stats.prec_magica}d10</p>` : ''}
        </div>
      `;

      const htmlDons = `
        <div class="space-y-2">
          <p><b>Dom Racial (${raceObj?.giftName}):</b> ${raceObj?.giftDescription}</p>
          <p><i>Uso diário: 1 vez ao dia (Nível 0).</i></p>
          <p><b>Perícia de Classe (${classSkillObj?.name}):</b> ${classSkillObj?.effectDescription}</p>
          <p><b>Perícia de Profissão (${formState.professionSkillName}):</b> ${profObj?.skills.find(s => s.name === formState.professionSkillName)?.effectDescription || ''}</p>
          ${formState.advantages.length > 0 ? `<p><b>Vantagem Racial:</b> ${RACIAL_ADVANTAGES.find(a => a.id === formState.advantages[0])?.name} - ${RACIAL_ADVANTAGES.find(a => a.id === formState.advantages[0])?.description}</p>` : ''}
          ${formState.disadvantages.length > 0 ? `<p><b>Desvantagens:</b> ${formState.disadvantages.map(id => RACIAL_DISADVANTAGES.find(d => d.id === id)?.name).join(', ')}</p>` : ''}
          ${stats.lowAttributes.length > 0 ? `<p><b>Fraquezas de Atributo (&lt;10):</b> ${stats.lowAttributes.map(a => `${a.toUpperCase()}: ${formState.attributeWeaknesses[a]}`).join(', ')}</p>` : ''}
        </div>
      `;

      const htmlEquipamentos = `
        <div class="space-y-1">
          <p><b>Armamento:</b> ${weaponSkillObj?.name}</p>
          <p><b>Origem:</b> ${formState.continente} - ${formState.cidade.toUpperCase()}</p>
          <p><b>Kit Inicial:</b> Mochila de viagem, cantil de água, ração de viagem, vestimenta de ${formState.cidade}.</p>
        </div>
      `;

      const htmlDefesa = `
        <div class="space-y-2">
          <p><b>Evasão:</b> ${stats.evasaoFormula}</p>
          <p><b>Percepção:</b> ${stats.percepcaoFormula}</p>
          <p><b>Redutor de Dano:</b> ${stats.redutor}</p>
          <p><b>Redutor de Emboscada:</b> ${stats.red_emboscada}</p>
          <p><b>Redutor Mágico:</b> ${stats.red_magico}</p>
        </div>
      `;

      const newCharacterPayload = {
        nome: formState.nome.trim(),
        email_dono: formState.email_dono.trim(),
        cla: formState.cla.trim(),
        ocupacao: `${classObj?.name || ''} / ${profObj?.name || ''}`,
        posicao_social: 'Aventureiro Inicial',
        cidadania: `${formState.continente} (${formState.cidade.toUpperCase()})`,
        seguimento: formState.motivacao.trim() || 'Desbravador',
        descricao: formState.historico.trim() || `Nascido em ${formState.cidade}, portador do dom de ${raceObj?.giftName}.`,
        nivel: 1, // Nível inicial oficial é 1
        xp: 0, // Contador de pontos de experiência gerenciado pelo Narrador
        visivel_party: formState.visivelParty !== false,
        
        // Marcadores Oficiais Telumak RPG
        hp_atual: stats.saude,
        hp_max: stats.saude,
        ether_atual: stats.energia,
        ether_max: stats.energia,
        destino_atual: stats.destino,
        destino_max: stats.destino,

        alcance_atual: stats.alcance,
        alcance_max: `${stats.alcance} | ${stats.alcance * 5}m`,
        movimento_atual: stats.movimento,
        movimento_max: `${stats.movimento} | ${stats.movimento * 5}m`,
        fortitude_atual: stats.fortitude,
        fortitude_max: `${stats.fortitude} | ${stats.fortitude * 50}kg`,
        tecnicas_atual: 1,
        tecnicas_max: `01 | 01 equipada`,

        // Atributos Finais Calculados
        fisico: stats.fisico,
        destreza: stats.destreza,
        cognicao: stats.cognicao,
        carisma: stats.carisma,
        primordio: stats.primordio,
        primordio_detalhe: `(10 base + ${formState.basePrimordio}${raceObj?.penaltyAttr === 'primordio' ? ' - 6 racial' : ''})`,

        // Ferramentas Modificadores e Contadores de uso
        ferramenta_fisico: stats.ferramenta_fisico,
        ferramenta_fisico_max: Math.max(1, stats.usos_ferramenta_fisico),
        ferramenta_fisico_atual: Math.max(1, stats.usos_ferramenta_fisico),
        ferramenta_fisico_sec_max: 2,
        ferramenta_fisico_sec_atual: 2,

        ferramenta_destreza: stats.ferramenta_destreza,
        ferramenta_destreza_max: stats.usos_ferramenta_destreza,
        ferramenta_destreza_atual: stats.usos_ferramenta_destreza,

        ferramenta_cognicao: stats.ferramenta_cognicao,
        ferramenta_cognicao_max: stats.usos_ferramenta_cognicao,
        ferramenta_cognicao_atual: stats.usos_ferramenta_cognicao,

        ferramenta_carisma: stats.ferramenta_carisma,
        ferramenta_carisma_max: stats.usos_ferramenta_carisma,
        ferramenta_carisma_atual: stats.usos_ferramenta_carisma,

        img_saudavel: formState.avatarUrl.trim() || 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=400&q=80',
        img_ferido: '',
        img_muito_ferido: '',

        html_ataques: htmlAtaques,
        html_dons: htmlDons,
        html_equipamentos: htmlEquipamentos,
        html_defesa: htmlDefesa,

        status_ativos: [],
        ativo_na_mesa: false
      };

      await onSaveCharacter(newCharacterPayload);
      onClose();
    } catch (err: any) {
      alert(`Erro ao salvar ficha: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-md animate-in fade-in overflow-hidden">
      <div className="bg-[#0b0e14] border border-blue-500/40 w-full max-w-6xl h-[95vh] flex flex-col shadow-2xl overflow-hidden rounded-sm">
        
        {/* CABEÇALHO DO MODAL */}
        <div className="bg-[#07090e] border-b border-white/10 px-4 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-blue-500/20 border border-blue-500/40 text-blue-400">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black uppercase tracking-wider text-white flex items-center gap-2">
                <span>Criador de Ficha Oficial Telumak</span>
                <span className="text-[10px] font-mono px-2 py-0.5 bg-blue-600/30 text-sky-300 border border-blue-500/30">Nível 0</span>
              </h2>
              <p className="text-[10px] text-white/50 font-mono">
                Cálculos em tempo real com regras oficiais de Raças, Classes, Perícias e 60 Pontos
              </p>
            </div>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            className="p-1.5 text-white/40 hover:text-white hover:bg-white/10 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* PAINEL FIXO NO TOPO: RESUMO EM TEMPO REAL DA FICHA (INDICADORES & ATRIBUTOS) */}
        <div className="bg-[#080b12] border-b border-blue-500/20 p-3 shrink-0 shadow-lg select-none">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
            
            {/* 1. ATRIBUTOS BASE FINAIS */}
            <div className="col-span-2 lg:col-span-2 bg-black/60 border border-white/10 p-2 flex flex-col justify-between">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-sky-400 flex items-center gap-1">
                  <Swords className="h-3 w-3" />
                  Atributos Finais
                </span>
                <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 border ${stats.pointsRemaining === 0 ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/40' : 'bg-amber-950/40 text-amber-400 border-amber-500/40'}`}>
                  {stats.pointsRemaining === 0 ? '60/60 Pontos OK' : `${stats.pointsRemaining} pts livres`}
                </span>
              </div>
              <div className="grid grid-cols-5 gap-1 text-center font-mono">
                <div className="bg-[#10141f] p-1 border border-white/5">
                  <div className="text-[9px] text-white/50 font-bold">FOR</div>
                  <div className="text-sm font-black text-white">{stats.fisico}</div>
                  <div className="text-[8px] text-sky-400">+{stats.ferramenta_fisico}</div>
                </div>
                <div className="bg-[#10141f] p-1 border border-white/5">
                  <div className="text-[9px] text-white/50 font-bold">DES</div>
                  <div className="text-sm font-black text-white">{stats.destreza}</div>
                  <div className="text-[8px] text-sky-400">+{stats.ferramenta_destreza}</div>
                </div>
                <div className="bg-[#10141f] p-1 border border-white/5">
                  <div className="text-[9px] text-white/50 font-bold">COG</div>
                  <div className="text-sm font-black text-white">{stats.cognicao}</div>
                  <div className="text-[8px] text-sky-400">+{stats.ferramenta_cognicao}</div>
                </div>
                <div className="bg-[#10141f] p-1 border border-white/5">
                  <div className="text-[9px] text-white/50 font-bold">CAR</div>
                  <div className="text-sm font-black text-white">{stats.carisma}</div>
                  <div className="text-[8px] text-sky-400">+{stats.ferramenta_carisma}</div>
                </div>
                <div className="bg-[#10141f] p-1 border border-white/5">
                  <div className="text-[9px] text-indigo-400 font-bold">PRI</div>
                  <div className="text-sm font-black text-indigo-300">{stats.primordio}</div>
                  <div className="text-[8px] text-indigo-400">arcano</div>
                </div>
              </div>
            </div>

            {/* 2. MARCADORES DERIVADOS */}
            <div className="col-span-2 lg:col-span-3 bg-black/60 border border-white/10 p-2 flex flex-col justify-between">
              <div className="text-[10px] font-black uppercase tracking-wider text-sky-400 mb-1 flex items-center gap-1">
                <Heart className="h-3 w-3 text-red-400" />
                Marcadores Derivados em Tempo Real
              </div>
              <div className="grid grid-cols-6 gap-1 text-center font-mono">
                <div className="bg-[#10141f] p-1 border border-red-500/20">
                  <div className="text-[8px] text-red-400 font-bold">SAÚDE</div>
                  <div className="text-xs font-black text-white">{stats.saude}</div>
                </div>
                <div className="bg-[#10141f] p-1 border border-blue-500/20">
                  <div className="text-[8px] text-blue-400 font-bold">ENERGIA</div>
                  <div className="text-xs font-black text-white">{stats.energia}</div>
                </div>
                <div className="bg-[#10141f] p-1 border border-amber-500/20">
                  <div className="text-[8px] text-amber-400 font-bold">DESTINO</div>
                  <div className="text-xs font-black text-white">{stats.destino}</div>
                </div>
                <div className="bg-[#10141f] p-1 border border-violet-500/20">
                  <div className="text-[8px] text-violet-400 font-bold">FORT.</div>
                  <div className="text-xs font-black text-white">{stats.fortitude}</div>
                </div>
                <div className="bg-[#10141f] p-1 border border-cyan-500/20">
                  <div className="text-[8px] text-cyan-400 font-bold">MOV.</div>
                  <div className="text-xs font-black text-white">{stats.movimento}</div>
                </div>
                <div className="bg-[#10141f] p-1 border border-emerald-500/20">
                  <div className="text-[8px] text-emerald-400 font-bold">ALC.</div>
                  <div className="text-xs font-black text-white">{stats.alcance}</div>
                </div>
              </div>
            </div>

            {/* 3. COMBATE & TESTES */}
            <div className="col-span-2 lg:col-span-2 bg-black/60 border border-white/10 p-2 flex flex-col justify-between">
              <div className="text-[10px] font-black uppercase tracking-wider text-sky-400 mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Crosshair className="h-3 w-3 text-emerald-400" />
                  Combate & Rolagens
                </span>
                <span className="text-[9px] font-mono text-white/50">
                  RED +{stats.redutor} | ATK +{stats.ataque}
                </span>
              </div>
              <div className="text-[10px] font-mono space-y-0.5 text-white/80">
                <div className="truncate"><span className="text-sky-400 font-bold">PREC:</span> {stats.precisaoFormula}</div>
                <div className="truncate"><span className="text-cyan-400 font-bold">EVA:</span> {stats.evasaoFormula} | <span className="text-amber-400 font-bold">PER:</span> {stats.percepcaoFormula}</div>
              </div>
            </div>

          </div>

          {/* ALERTA DE REGRAS SE HOUVER ATRIBUTO < 10 OU PONTOS RESTANTES */}
          {(stats.pointsRemaining !== 0 || stats.minPointsError || stats.lowAttributes.length > 0) && (
            <div className="mt-2 pt-2 border-t border-white/5 flex flex-wrap items-center justify-between text-[10px] font-mono text-amber-300 gap-2">
              <div className="flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                <span>
                  {stats.minPointsError ? (
                    <span className="text-red-400 font-bold">{stats.minPointsError}</span>
                  ) : stats.pointsRemaining !== 0 ? (
                    <span>Distribua os 60 pontos base (restam <b>{stats.pointsRemaining}</b>).</span>
                  ) : stats.lowAttributes.length > 0 ? (
                    <span>Atributos abaixo de 10 detectados: {stats.lowAttributes.join(', ').toUpperCase()}. Escolha a fraqueza obrigatória!</span>
                  ) : (
                    <span>Tudo pronto para validar sua build!</span>
                  )}
                </span>
              </div>
              <div className="text-[9px] text-white/40">
                {currentRace?.name} ({currentRace?.penaltyAttr.toUpperCase()} -6) • {currentClass?.name}
              </div>
            </div>
          )}
        </div>

        {/* NAVEGAÇÃO DE PASSOS (TABS SUPERIORES) */}
        <div className="bg-[#090c13] border-b border-white/10 px-4 py-2 flex items-center gap-1 overflow-x-auto custom-scroll shrink-0 select-none">
          {[
            { step: 1, label: '1. Origem & Identidade' },
            { step: 2, label: '2. Raça & Dom' },
            { step: 3, label: '3. Classe & Perícias' },
            { step: 4, label: '4. Distribuição 60 Pts' },
            { step: 5, label: '5. Vantagens / Fraquezas' },
            { step: 6, label: '6. Resumo Final' },
          ].map(s => (
            <button
              key={s.step}
              type="button"
              onClick={() => setCurrentStep(s.step)}
              className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition shrink-0 flex items-center gap-1.5 ${
                currentStep === s.step
                  ? 'bg-blue-600 text-white shadow'
                  : 'bg-white/5 hover:bg-white/10 text-white/60 hover:text-white'
              }`}
            >
              <span>{s.label}</span>
            </button>
          ))}
        </div>

        {/* CORPO DO FORMULÁRIO COM SCROLL (PERGUNTAS E RESPOSTAS) */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto custom-scroll space-y-6">

          {/* PASSO 1: CONTINENTE, CIDADE E IDENTIDADE */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-in fade-in">
              <div className="border-b border-white/10 pb-3">
                <h3 className="text-sm font-black uppercase tracking-wider text-sky-400 flex items-center gap-2">
                  <Compass className="h-4 w-4" />
                  <span>1. Continente, Nação e Identidade do Personagem</span>
                </h3>
                <p className="text-xs text-white/50 mt-0.5">
                  Escolha o continente natal e a cidade de origem conforme as regras do Telumak RPG.
                </p>
              </div>

              {/* SELEÇÃO DE CONTINENTE */}
              <div>
                <label className="block text-xs font-bold uppercase text-white/80 mb-2">1.1. Qual continente você escolhe para o seu personagem? *</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleContinentChange('ABIXYA')}
                    className={`p-4 border text-left transition flex flex-col justify-between ${
                      formState.continente === 'ABIXYA'
                        ? 'bg-blue-600/20 border-blue-500 text-white shadow-lg shadow-blue-500/10'
                        : 'bg-black/40 border-white/10 text-white/60 hover:border-white/20'
                    }`}
                  >
                    <div>
                      <div className="text-sm font-black uppercase flex items-center justify-between">
                        <span>ABIXYA</span>
                        {formState.continente === 'ABIXYA' && <Check className="h-4 w-4 text-blue-400" />}
                      </div>
                      <p className="text-xs text-white/60 mt-1">
                        Árido, pedregoso, desértico e vulcânico. Tecnologia pesada, ligas de cristal negro e condutores de antimatéria.
                      </p>
                    </div>
                    <div className="text-[10px] font-mono text-sky-400 mt-2">
                      Raças: Azaris (4 braços) e Ezaris (ultravelozes)
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleContinentChange('GENEXYA')}
                    className={`p-4 border text-left transition flex flex-col justify-between ${
                      formState.continente === 'GENEXYA'
                        ? 'bg-blue-600/20 border-blue-500 text-white shadow-lg shadow-blue-500/10'
                        : 'bg-black/40 border-white/10 text-white/60 hover:border-white/20'
                    }`}
                  >
                    <div>
                      <div className="text-sm font-black uppercase flex items-center justify-between">
                        <span>GENEXYA</span>
                        {formState.continente === 'GENEXYA' && <Check className="h-4 w-4 text-blue-400" />}
                      </div>
                      <p className="text-xs text-white/60 mt-1">
                        Solos férteis, florestas subtropicais, bacias hidrográficas densas e rios místicos. Conexão profunda com o ARAR.
                      </p>
                    </div>
                    <div className="text-[10px] font-mono text-emerald-400 mt-2">
                      Raças: Aramëk (telecinese), Aragron (escamosos) e Aranur (elementais)
                    </div>
                  </button>
                </div>
              </div>

              {/* SELEÇÃO DE CIDADE / REINO */}
              <div>
                <label className="block text-xs font-bold uppercase text-white/80 mb-2">
                  {formState.continente === 'ABIXYA' 
                    ? '1.2. Se escolheu ABIXYA, em qual cidade/região seu personagem nasceu ou vive?' 
                    : '1.3. Se escolheu GENEXYA, em qual reino seu personagem nasceu ou vive?'}
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {NATIONS_REGIONS[formState.continente].map(reg => (
                    <button
                      key={reg.id}
                      type="button"
                      onClick={() => setFormState(prev => ({ ...prev, cidade: reg.id }))}
                      className={`p-3 border text-left transition ${
                        formState.cidade === reg.id
                          ? 'bg-blue-600/20 border-blue-500 text-white'
                          : 'bg-black/40 border-white/10 text-white/60 hover:border-white/20'
                      }`}
                    >
                      <div className="font-bold text-xs uppercase text-sky-300 flex items-center justify-between">
                        <span>{reg.name}</span>
                        {formState.cidade === reg.id && <Check className="h-3.5 w-3.5 text-blue-400" />}
                      </div>
                      <p className="text-[11px] text-white/60 mt-1 leading-relaxed">
                        {reg.desc}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* DADOS BÁSICOS DO PERSONAGEM */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-[11px] text-white/80 font-bold uppercase mb-1">Nome do Personagem *</label>
                  <input
                    type="text"
                    value={formState.nome}
                    onChange={e => setFormState(prev => ({ ...prev, nome: e.target.value }))}
                    placeholder="Ex: Garrokh Forzari"
                    className="w-full bg-[#07090e] border border-white/10 px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-white/80 font-bold uppercase mb-1">Email do Jogador Dono (Opcional)</label>
                  <input
                    type="email"
                    value={formState.email_dono}
                    onChange={e => setFormState(prev => ({ ...prev, email_dono: e.target.value }))}
                    placeholder="jogador@email.com"
                    className="w-full bg-[#07090e] border border-white/10 px-3 py-2 text-white text-xs font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-white/80 font-bold uppercase mb-1">Clã ou Família</label>
                  <input
                    type="text"
                    value={formState.cla}
                    onChange={e => setFormState(prev => ({ ...prev, cla: e.target.value }))}
                    placeholder="Ex: Linhagem Forzari de Balsaguna"
                    className="w-full bg-[#07090e] border border-white/10 px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-white/80 font-bold uppercase mb-1">5.1. Motivação Principal</label>
                  <input
                    type="text"
                    value={formState.motivacao}
                    onChange={e => setFormState(prev => ({ ...prev, motivacao: e.target.value }))}
                    placeholder="Ex: Proteger a forja sagrada e pagar uma dívida de honra"
                    className="w-full bg-[#07090e] border border-white/10 px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-white/80 font-bold uppercase mb-1">4.1. Histórico / Background</label>
                <textarea
                  value={formState.historico}
                  onChange={e => setFormState(prev => ({ ...prev, historico: e.target.value }))}
                  placeholder="Escreva um breve resumo da história de vida do seu personagem..."
                  rows={3}
                  className="w-full bg-[#07090e] border border-white/10 px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* UPLOAD OU URL DO AVATAR */}
              <div>
                <ImageUploadField
                  label="Foto / Avatar do Personagem"
                  value={formState.avatarUrl}
                  onChange={url => setFormState(prev => ({ ...prev, avatarUrl: url }))}
                  helperText="Envie uma imagem do seu dispositivo para representar visualmente seu herói"
                />
              </div>

              {/* VISIBILIDADE PARA PARTY NO MULTIPLAYER */}
              <div className="p-3.5 bg-blue-950/30 border border-blue-500/40 flex items-center justify-between">
                <div>
                  <span className="text-xs font-black text-white uppercase tracking-wider block">
                    Visível para Party (Multiplayer)
                  </span>
                  <span className="text-[11px] text-white/60">
                    Permite que seus companheiros de grupo vejam sua ficha no rolo de aliados.
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formState.visivelParty !== false}
                    onChange={e => setFormState(prev => ({ ...prev, visivelParty: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          )}

          {/* PASSO 2: ESCOLHA DA RAÇA E DOM */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-in fade-in">
              <div className="border-b border-white/10 pb-3">
                <h3 className="text-sm font-black uppercase tracking-wider text-sky-400 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>2. Escolha da Raça e Dom Natural</span>
                </h3>
                <p className="text-xs text-white/50 mt-0.5">
                  Cada raça possui bônus imediatos nos indicadores, uma penalidade fixa de -6 em um atributo e um Dom exclusivo.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availableRaces.map(r => {
                  const isSelected = formState.raceId === r.id;
                  return (
                    <div
                      key={r.id}
                      onClick={() => handleRaceChange(r.id)}
                      className={`p-4 border cursor-pointer transition flex flex-col justify-between ${
                        isSelected
                          ? 'bg-blue-600/20 border-blue-500 text-white shadow-xl shadow-blue-500/10'
                          : 'bg-black/40 border-white/10 text-white/70 hover:border-white/20'
                      }`}
                    >
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
                            <span>{r.name}</span>
                            <span className="text-[10px] font-mono px-2 py-0.5 bg-white/10 text-sky-300">
                              {r.appearance.height}
                            </span>
                          </span>
                          {isSelected && <Check className="h-4 w-4 text-blue-400" />}
                        </div>

                        <p className="text-xs text-white/70 leading-relaxed mb-3">
                          {r.description}
                        </p>

                        <div className="space-y-1.5 text-[11px] font-mono bg-[#080b12] p-2.5 border border-white/5">
                          <div>
                            <span className="text-emerald-400 font-bold">Bônus: </span>
                            <span className="text-white/90">{r.bonusDescription}</span>
                          </div>
                          <div>
                            <span className="text-rose-400 font-bold">Ônus Obrigatório: </span>
                            <span className="text-rose-300">Sofre perda em {r.penaltyAttr.toUpperCase()} (-{r.penaltyValue})</span>
                          </div>
                          <div>
                            <span className="text-amber-400 font-bold">Dom Natural: </span>
                            <span className="text-amber-300">{r.giftName} ({r.giftDescription})</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-[10px] text-white/40 mt-3 pt-2 border-t border-white/5">
                        Pele: {r.appearance.skin} • Olhos: {r.appearance.eyes}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* DETALHAMENTO DO DOM DO PERSONAGEM */}
              {currentRace && (
                <div className="p-4 bg-blue-950/20 border border-blue-500/30">
                  <div className="flex items-center gap-2 text-xs font-black uppercase text-sky-300 mb-1">
                    <Sparkles className="h-4 w-4" />
                    <span>Regra do Dom: {currentRace.giftName}</span>
                  </div>
                  <p className="text-xs text-white/70 leading-relaxed">
                    Você poderá usar seu Dom diariamente. Como começa no Nível 0, você pode usá-lo <b>1 vez ao dia</b>.
                    Ao subir de nível, receberá usos adicionais.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* PASSO 3: CLASSE, PROFISSÃO E PERÍCIAS */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-in fade-in">
              <div className="border-b border-white/10 pb-3">
                <h3 className="text-sm font-black uppercase tracking-wider text-sky-400 flex items-center gap-2">
                  <Award className="h-4 w-4" />
                  <span>3. Classe, Profissão e Perícias (Classe, Profissão e Arma)</span>
                </h3>
                <p className="text-xs text-white/50 mt-0.5">
                  Conforme a regra oficial: você escolhe 1 perícia de classe, 1 perícia de profissão e 1 perícia de armamento.
                </p>
              </div>

              {/* SELEÇÃO DE CLASSE */}
              <div>
                <label className="block text-xs font-bold uppercase text-white/80 mb-2">3.1. Qual classe você escolhe? *</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {availableClasses.map(c => {
                    const isSelected = formState.classId === c.id;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => handleClassChange(c.id)}
                        className={`p-3 border text-left transition flex flex-col justify-between ${
                          isSelected
                            ? 'bg-blue-600/20 border-blue-500 text-white'
                            : 'bg-black/40 border-white/10 text-white/70 hover:border-white/20'
                        }`}
                      >
                        <div>
                          <div className="font-bold text-xs uppercase flex items-center justify-between">
                            <span className="text-sky-300">{c.name}</span>
                            {isSelected && <Check className="h-3.5 w-3.5 text-blue-400" />}
                          </div>
                          <p className="text-[11px] text-white/60 mt-1">
                            {c.description}
                          </p>
                        </div>
                        <div className="text-[10px] font-mono text-emerald-400 mt-2 pt-1 border-t border-white/5">
                          Bônus direto no combate ativo
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* SELEÇÃO DE PROFISSÃO COMPATÍVEL */}
              <div>
                <label className="block text-xs font-bold uppercase text-white/80 mb-2">4. Escolha sua Profissão (conectada à sua classe) *</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {availableProfessions.map(p => {
                    const isSelected = formState.professionId === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setFormState(prev => ({ 
                          ...prev, 
                          professionId: p.id,
                          professionSkillName: p.skills[0]?.name || ''
                        }))}
                        className={`p-3 border text-left transition ${
                          isSelected
                            ? 'bg-blue-600/20 border-blue-500 text-white'
                            : 'bg-black/40 border-white/10 text-white/70 hover:border-white/20'
                        }`}
                      >
                        <div className="font-bold text-xs uppercase flex items-center justify-between">
                          <span className="text-sky-300">{p.name}</span>
                          {isSelected && <Check className="h-3.5 w-3.5 text-blue-400" />}
                        </div>
                        <p className="text-[11px] text-white/60 mt-1 leading-relaxed">
                          {p.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ESCOLHA DAS 3 PERÍCIAS */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                
                {/* 5.1 PERÍCIA DE CLASSE */}
                <div className="bg-black/40 border border-white/10 p-3 space-y-2">
                  <span className="text-xs font-black uppercase text-sky-400 block border-b border-white/10 pb-1">
                    5.1. Perícia de Classe ({currentClass?.name})
                  </span>
                  <div className="space-y-2">
                    {availableClassSkills.map(cs => {
                      const isSelected = formState.classSkillId === cs.id;
                      return (
                        <div
                          key={cs.id}
                          onClick={() => setFormState(prev => ({ ...prev, classSkillId: cs.id }))}
                          className={`p-2.5 border cursor-pointer text-left transition ${
                            isSelected ? 'bg-blue-600/20 border-blue-500 text-white' : 'border-white/5 hover:border-white/20 text-white/70'
                          }`}
                        >
                          <div className="font-bold text-xs uppercase flex items-center justify-between">
                            <span>{cs.name}</span>
                            {isSelected && <Check className="h-3.5 w-3.5 text-blue-400" />}
                          </div>
                          <p className="text-[10px] text-white/60 mt-1 leading-snug">
                            {cs.effectDescription}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 5.2 PERÍCIA DE PROFISSÃO */}
                <div className="bg-black/40 border border-white/10 p-3 space-y-2">
                  <span className="text-xs font-black uppercase text-sky-400 block border-b border-white/10 pb-1">
                    5.2. Perícia de Profissão ({currentProfession?.name})
                  </span>
                  <div className="space-y-2">
                    {currentProfession?.skills.map(ps => {
                      const isSelected = formState.professionSkillName === ps.name;
                      return (
                        <div
                          key={ps.name}
                          onClick={() => setFormState(prev => ({ ...prev, professionSkillName: ps.name }))}
                          className={`p-2.5 border cursor-pointer text-left transition ${
                            isSelected ? 'bg-blue-600/20 border-blue-500 text-white' : 'border-white/5 hover:border-white/20 text-white/70'
                          }`}
                        >
                          <div className="font-bold text-xs uppercase flex items-center justify-between">
                            <span>{ps.name}</span>
                            {isSelected && <Check className="h-3.5 w-3.5 text-blue-400" />}
                          </div>
                          <p className="text-[10px] text-white/60 mt-1 leading-snug">
                            {ps.effectDescription}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 5.3 PERÍCIA DE ARMA */}
                <div className="bg-black/40 border border-white/10 p-3 space-y-2">
                  <span className="text-xs font-black uppercase text-sky-400 block border-b border-white/10 pb-1">
                    5.3. Perícia de Armamento
                  </span>
                  <div className="space-y-1.5 max-h-64 overflow-y-auto custom-scroll pr-1">
                    {WEAPON_SKILLS.map(ws => {
                      const isSelected = formState.weaponSkillId === ws.id;
                      return (
                        <div
                          key={ws.id}
                          onClick={() => setFormState(prev => ({ ...prev, weaponSkillId: ws.id }))}
                          className={`p-2 border cursor-pointer text-left transition ${
                            isSelected ? 'bg-blue-600/20 border-blue-500 text-white' : 'border-white/5 hover:border-white/20 text-white/70'
                          }`}
                        >
                          <div className="font-bold text-[11px] uppercase flex items-center justify-between">
                            <span>{ws.name}</span>
                            {isSelected && <Check className="h-3 w-3 text-blue-400" />}
                          </div>
                          <div className="text-[9px] font-mono text-sky-400">
                            Rolagem: {ws.formula}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* PASSO 4: DISTRIBUIÇÃO DOS 60 PONTOS */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-in fade-in">
              <div className="border-b border-white/10 pb-3 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-sky-400 flex items-center gap-2">
                    <Swords className="h-4 w-4" />
                    <span>4. Distribuição de 60 Pontos Iniciais nos Atributos Base</span>
                  </h3>
                  <p className="text-xs text-white/50 mt-0.5">
                    Regra: O valor final mínimo em cada atributo é 4. Caso sua raça ({currentRace?.name}) tenha penalidade de -{currentRace?.penaltyValue} em {currentRace?.penaltyAttr.toUpperCase()}, você deve alocar pelo menos 10 pontos nele.
                  </p>
                </div>
                <div className={`px-4 py-2 border font-mono font-bold text-xs flex items-center gap-2 ${
                  stats.pointsRemaining === 0 
                    ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/50' 
                    : stats.pointsRemaining > 0 
                      ? 'bg-blue-950/40 text-sky-300 border-blue-500/50' 
                      : 'bg-red-950/40 text-red-300 border-red-500/50'
                }`}>
                  <span>Pontos Restantes:</span>
                  <span className="text-base font-black">{stats.pointsRemaining} / 60</span>
                </div>
              </div>

              {/* SLIDERS E INPUTS DOS ATRIBUTOS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* FORÇA / FÍSICO */}
                <div className="p-4 bg-black/40 border border-white/10 space-y-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-xs font-black uppercase text-white block">Força (Físico)</span>
                      <span className="text-[10px] text-white/50 font-mono">
                        {currentRace?.penaltyAttr === 'fisico' ? 'Sofre -6 da Raça' : 'Sem penalidade'}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xl font-black text-white font-mono">{stats.fisico}</span>
                      <span className="text-[10px] text-sky-400 font-mono block">Alocado: {formState.baseFisico}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={currentRace?.penaltyAttr === 'fisico' ? 10 : 4}
                      max={40}
                      value={formState.baseFisico}
                      onChange={e => setFormState(prev => ({ ...prev, baseFisico: Number(e.target.value) }))}
                      className="w-full accent-blue-500"
                    />
                    <input
                      type="number"
                      min={currentRace?.penaltyAttr === 'fisico' ? 10 : 4}
                      max={40}
                      value={formState.baseFisico}
                      onChange={e => setFormState(prev => ({ ...prev, baseFisico: Number(e.target.value) }))}
                      className="w-16 bg-[#07090e] border border-white/10 px-2 py-1 text-white text-xs font-mono text-center"
                    />
                  </div>
                </div>

                {/* DESTREZA */}
                <div className="p-4 bg-black/40 border border-white/10 space-y-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-xs font-black uppercase text-white block">Destreza</span>
                      <span className="text-[10px] text-white/50 font-mono">
                        {currentRace?.penaltyAttr === 'destreza' ? 'Sofre -6 da Raça' : 'Sem penalidade'}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xl font-black text-white font-mono">{stats.destreza}</span>
                      <span className="text-[10px] text-sky-400 font-mono block">Alocado: {formState.baseDestreza}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={currentRace?.penaltyAttr === 'destreza' ? 10 : 4}
                      max={40}
                      value={formState.baseDestreza}
                      onChange={e => setFormState(prev => ({ ...prev, baseDestreza: Number(e.target.value) }))}
                      className="w-full accent-blue-500"
                    />
                    <input
                      type="number"
                      min={currentRace?.penaltyAttr === 'destreza' ? 10 : 4}
                      max={40}
                      value={formState.baseDestreza}
                      onChange={e => setFormState(prev => ({ ...prev, baseDestreza: Number(e.target.value) }))}
                      className="w-16 bg-[#07090e] border border-white/10 px-2 py-1 text-white text-xs font-mono text-center"
                    />
                  </div>
                </div>

                {/* COGNIÇÃO */}
                <div className="p-4 bg-black/40 border border-white/10 space-y-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-xs font-black uppercase text-white block">Cognição</span>
                      <span className="text-[10px] text-white/50 font-mono">
                        {currentRace?.penaltyAttr === 'cognicao' ? 'Sofre -6 da Raça' : 'Sem penalidade'}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xl font-black text-white font-mono">{stats.cognicao}</span>
                      <span className="text-[10px] text-sky-400 font-mono block">Alocado: {formState.baseCognicao}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={currentRace?.penaltyAttr === 'cognicao' ? 10 : 4}
                      max={40}
                      value={formState.baseCognicao}
                      onChange={e => setFormState(prev => ({ ...prev, baseCognicao: Number(e.target.value) }))}
                      className="w-full accent-blue-500"
                    />
                    <input
                      type="number"
                      min={currentRace?.penaltyAttr === 'cognicao' ? 10 : 4}
                      max={40}
                      value={formState.baseCognicao}
                      onChange={e => setFormState(prev => ({ ...prev, baseCognicao: Number(e.target.value) }))}
                      className="w-16 bg-[#07090e] border border-white/10 px-2 py-1 text-white text-xs font-mono text-center"
                    />
                  </div>
                </div>

                {/* CARISMA */}
                <div className="p-4 bg-black/40 border border-white/10 space-y-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-xs font-black uppercase text-white block">Carisma</span>
                      <span className="text-[10px] text-white/50 font-mono">
                        {currentRace?.penaltyAttr === 'carisma' ? 'Sofre -6 da Raça' : 'Sem penalidade'}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xl font-black text-white font-mono">{stats.carisma}</span>
                      <span className="text-[10px] text-sky-400 font-mono block">Alocado: {formState.baseCarisma}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={currentRace?.penaltyAttr === 'carisma' ? 10 : 4}
                      max={40}
                      value={formState.baseCarisma}
                      onChange={e => setFormState(prev => ({ ...prev, baseCarisma: Number(e.target.value) }))}
                      className="w-full accent-blue-500"
                    />
                    <input
                      type="number"
                      min={currentRace?.penaltyAttr === 'carisma' ? 10 : 4}
                      max={40}
                      value={formState.baseCarisma}
                      onChange={e => setFormState(prev => ({ ...prev, baseCarisma: Number(e.target.value) }))}
                      className="w-16 bg-[#07090e] border border-white/10 px-2 py-1 text-white text-xs font-mono text-center"
                    />
                  </div>
                </div>

                {/* PRIMÓRDIO (INICIA EM 10 AUTOMATICAMENTE NO NV 0) */}
                <div className="col-span-1 md:col-span-2 p-4 bg-indigo-950/20 border border-indigo-500/30 space-y-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-xs font-black uppercase text-indigo-300 block">Primórdio (Poder Sobrenatural / Arcano)</span>
                      <span className="text-[10px] text-white/50 font-mono">
                        Inicia automaticamente com 10 pontos no Nível 0. Você pode alocar pontos extras opcionais dos 60.
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xl font-black text-indigo-300 font-mono">{stats.primordio}</span>
                      <span className="text-[10px] text-indigo-400 font-mono block">10 Base + {formState.basePrimordio} alocado</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={0}
                      max={20}
                      value={formState.basePrimordio}
                      onChange={e => setFormState(prev => ({ ...prev, basePrimordio: Number(e.target.value) }))}
                      className="w-full accent-indigo-500"
                    />
                    <input
                      type="number"
                      min={0}
                      max={20}
                      value={formState.basePrimordio}
                      onChange={e => setFormState(prev => ({ ...prev, basePrimordio: Number(e.target.value) }))}
                      className="w-16 bg-[#07090e] border border-white/10 px-2 py-1 text-white text-xs font-mono text-center"
                    />
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* PASSO 5: VANTAGENS RACIAIS, DESVANTAGENS E FRAQUEZAS OBRIGATÓRIAS */}
          {currentStep === 5 && (
            <div className="space-y-6 animate-in fade-in">
              <div className="border-b border-white/10 pb-3">
                <h3 className="text-sm font-black uppercase tracking-wider text-sky-400 flex items-center gap-2">
                  <Flame className="h-4 w-4 text-amber-400" />
                  <span>5. Desvantagens Raciais, Vantagens e Fraquezas de Atributos</span>
                </h3>
                <p className="text-xs text-white/50 mt-0.5">
                  Regras Oficiais: Ao escolher duas desvantagens raciais, você ganha o direito a 1 Vantagem Racial extra. Se algum atributo ficou abaixo de 10 após a distribuição, deve assumir a fraqueza correspondente.
                </p>
              </div>

              {/* FRAQUEZAS OBRIGATÓRIAS DE ATRIBUTOS < 10 */}
              {stats.lowAttributes.length > 0 && (
                <div className="p-4 bg-amber-950/30 border border-amber-500/50 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-black uppercase text-amber-300">
                    <AlertTriangle className="h-4 w-4 text-amber-400" />
                    <span>6.1. Fraqueza Obrigatória por Atributo Abaixo de 10</span>
                  </div>
                  <p className="text-[11px] text-white/70">
                    Os seguintes atributos ficaram abaixo de 10: <b>{stats.lowAttributes.map(a => a.toUpperCase()).join(', ')}</b>. Escolha a fraqueza para cada um deles:
                  </p>

                  <div className="space-y-3 pt-1">
                    {stats.lowAttributes.map(attr => {
                      const options = ATTRIBUTE_WEAKNESSES.filter(w => w.attr === attr);
                      const currentSelected = formState.attributeWeaknesses[attr] || '';

                      return (
                        <div key={attr} className="bg-black/60 p-3 border border-white/10 space-y-2">
                          <span className="text-xs font-black uppercase text-white">
                            Fraqueza para {attr.toUpperCase()} (Atual: {stats[attr]}):
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {options.map(opt => (
                              <button
                                key={opt.name}
                                type="button"
                                onClick={() => handleSetWeakness(attr, opt.name)}
                                className={`p-2.5 border text-left transition ${
                                  currentSelected === opt.name
                                    ? 'bg-amber-600/30 border-amber-500 text-white'
                                    : 'bg-white/5 border-white/10 text-white/70 hover:border-white/20'
                                }`}
                              >
                                <div className="font-bold text-[11px] uppercase flex items-center justify-between">
                                  <span>{opt.name}</span>
                                  {currentSelected === opt.name && <Check className="h-3.5 w-3.5 text-amber-400" />}
                                </div>
                                <p className="text-[10px] text-white/60 mt-1">
                                  {opt.description}
                                </p>
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* DESVANTAGENS RACIAIS */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-bold uppercase text-white/80">
                    8. Desvantagens Raciais ({currentRace?.name})
                  </label>
                  <span className="text-[10px] font-mono text-sky-400">
                    Selecionadas: {formState.disadvantages.length} (Selecione 2 para liberar Vantagem Racial)
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {availableRacialDisadvantages.map(dis => {
                    const isSelected = formState.disadvantages.includes(dis.id);
                    return (
                      <div
                        key={dis.id}
                        onClick={() => toggleDisadvantage(dis.id)}
                        className={`p-3 border cursor-pointer transition flex flex-col justify-between ${
                          isSelected
                            ? 'bg-rose-950/40 border-rose-500 text-white shadow'
                            : 'bg-black/40 border-white/10 text-white/70 hover:border-white/20'
                        }`}
                      >
                        <div>
                          <div className="font-bold text-xs uppercase flex items-center justify-between text-rose-300">
                            <span>{dis.name}</span>
                            {isSelected && <Check className="h-3.5 w-3.5 text-rose-400" />}
                          </div>
                          <p className="text-[11px] text-white/60 mt-1.5 leading-relaxed">
                            {dis.description}
                          </p>
                        </div>
                        <div className="text-[9px] font-mono text-rose-400/80 mt-2 pt-1 border-t border-white/5">
                          Altera modificador/indicador em tempo real
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* VANTAGENS RACIAIS */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-bold uppercase text-white/80 flex items-center gap-1.5">
                    <span>7. Vantagem Racial Extra</span>
                    {formState.disadvantages.length < 2 && (
                      <span className="text-[10px] text-amber-400 font-mono flex items-center gap-1">
                        <Lock className="h-3 w-3" /> Bloqueada (Requer 2 desvantagens)
                      </span>
                    )}
                  </label>
                  <span className="text-[10px] font-mono text-sky-400">
                    {formState.advantages.length > 0 ? '1 Vantagem Ativa' : 'Nenhuma selecionada'}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {availableRacialAdvantages.map(adv => {
                    const isSelected = formState.advantages.includes(adv.id);
                    const isDisabled = formState.disadvantages.length < 2;

                    return (
                      <div
                        key={adv.id}
                        onClick={() => !isDisabled && toggleAdvantage(adv.id)}
                        className={`p-3.5 border transition flex flex-col justify-between ${
                          isDisabled 
                            ? 'opacity-40 cursor-not-allowed bg-black/20 border-white/5 text-white/40' 
                            : isSelected
                              ? 'bg-emerald-950/40 border-emerald-500 text-white shadow cursor-pointer'
                              : 'bg-black/40 border-white/10 text-white/70 hover:border-white/20 cursor-pointer'
                        }`}
                      >
                        <div>
                          <div className="font-bold text-xs uppercase flex items-center justify-between text-emerald-300">
                            <span>{adv.name}</span>
                            {isSelected && <Check className="h-3.5 w-3.5 text-emerald-400" />}
                          </div>
                          <p className="text-[11px] text-white/70 mt-1.5 leading-relaxed">
                            {adv.description}
                          </p>
                        </div>
                        <div className="text-[9px] font-mono text-emerald-400 mt-2 pt-1 border-t border-white/5">
                          Reflete imediatamente nos indicadores no topo
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          )}

          {/* PASSO 6: RESUMO E CONFIRMAÇÃO */}
          {currentStep === 6 && (
            <div className="space-y-6 animate-in fade-in">
              <div className="border-b border-white/10 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-sky-400 flex items-center gap-2">
                    <Check className="h-4 w-4" />
                    <span>6. Revisão Geral do Modelo de Ficha Oficial</span>
                  </h3>
                  <p className="text-xs text-white/50 mt-0.5">
                    Revise os dados antes de gerar a ficha oficial no banco de dados e no seu grimório.
                  </p>
                </div>
              </div>

              <div className="bg-[#07090e] border border-white/10 p-5 space-y-4">
                <div className="flex flex-col sm:flex-row items-center gap-4 border-b border-white/10 pb-4">
                  <img
                    src={formState.avatarUrl || 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=400&q=80'}
                    alt="Avatar"
                    className="w-20 h-20 object-cover border border-blue-500/40 shrink-0"
                  />
                  <div>
                    <h4 className="text-lg font-black uppercase text-white">{formState.nome || 'Sem Nome'}</h4>
                    <p className="text-xs text-sky-400 font-mono">
                      {currentRace?.name} • {currentClass?.name} • {currentProfession?.name}
                    </p>
                    <p className="text-[11px] text-white/60 font-mono mt-0.5">
                      Origem: {formState.continente} ({formState.cidade.toUpperCase()}) • Jogador: {formState.email_dono || 'Sem Dono (Mestre)'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center font-mono">
                  <div className="bg-black/60 p-2 border border-white/10">
                    <span className="text-[10px] text-white/40 block">FORÇA</span>
                    <span className="text-lg font-black text-white">{stats.fisico}</span>
                  </div>
                  <div className="bg-black/60 p-2 border border-white/10">
                    <span className="text-[10px] text-white/40 block">DESTREZA</span>
                    <span className="text-lg font-black text-white">{stats.destreza}</span>
                  </div>
                  <div className="bg-black/60 p-2 border border-white/10">
                    <span className="text-[10px] text-white/40 block">COGNIÇÃO</span>
                    <span className="text-lg font-black text-white">{stats.cognicao}</span>
                  </div>
                  <div className="bg-black/60 p-2 border border-white/10">
                    <span className="text-[10px] text-white/40 block">CARISMA</span>
                    <span className="text-lg font-black text-white">{stats.carisma}</span>
                  </div>
                  <div className="bg-black/60 p-2 border border-white/10">
                    <span className="text-[10px] text-indigo-400 block">PRIMÓRDIO</span>
                    <span className="text-lg font-black text-indigo-300">{stats.primordio}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono pt-2">
                  <div className="space-y-1.5 bg-black/40 p-3 border border-white/5">
                    <div className="text-sky-300 font-bold uppercase text-[11px] mb-1">Marcadores Finais:</div>
                    <div>Saúde: <b className="text-white">{stats.saude}</b></div>
                    <div>Energia: <b className="text-white">{stats.energia}</b></div>
                    <div>Destino: <b className="text-white">{stats.destino}</b></div>
                    <div>Fortitude: <b className="text-white">{stats.fortitude} ({stats.fortitude * 50}kg peso máx)</b></div>
                    <div>Movimento: <b className="text-white">{stats.movimento} ({stats.movimento * 5}m/turno)</b></div>
                    <div>Alcance: <b className="text-white">{stats.alcance} ({stats.alcance * 5}m)</b></div>
                  </div>

                  <div className="space-y-1.5 bg-black/40 p-3 border border-white/5">
                    <div className="text-sky-300 font-bold uppercase text-[11px] mb-1">Combate & Testes:</div>
                    <div>Precisão: <b className="text-white">{stats.precisaoFormula}</b></div>
                    <div>Evasão: <b className="text-white">{stats.evasaoFormula}</b></div>
                    <div>Percepção: <b className="text-white">{stats.percepcaoFormula}</b></div>
                    <div>Redutor de Dano: <b className="text-white">+{stats.redutor}</b></div>
                    <div>Ataque / Defesa: <b className="text-white">+{stats.ataque} / +{stats.defesa}</b></div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* RODAPÉ COM BOTÕES DE NAVEGAÇÃO E FINALIZAÇÃO */}
        <div className="bg-[#07090e] border-t border-white/10 px-4 py-3 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
            disabled={currentStep === 1}
            className="flex items-center gap-1.5 px-4 py-2 bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-white/5 text-white text-xs font-bold uppercase tracking-wider transition"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Anterior</span>
          </button>

          <div className="flex items-center gap-2">
            {currentStep < 6 ? (
              <button
                type="button"
                onClick={() => setCurrentStep(prev => Math.min(6, prev + 1))}
                className="flex items-center gap-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-black uppercase tracking-wider transition shadow"
              >
                <span>Próximo Passo</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSave}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase tracking-wider transition shadow-lg disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Criando Ficha...</span>
                ) : (
                  <>
                    <Check className="h-4 w-4 stroke-[3]" />
                    <span>Concluir e Criar Ficha Oficial</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
