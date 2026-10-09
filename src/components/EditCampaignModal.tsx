import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { 
  X, 
  Settings, 
  Save, 
  Users, 
  User, 
  Sword, 
  MessageSquare, 
  ShieldAlert, 
  Sparkles, 
  Sliders, 
  HelpCircle,
  Image as ImageIcon
} from 'lucide-react';
import { CampaignData } from './CampaignSelection';

const PRESET_COVERS = [
  {
    title: 'Ruínas de Abixya',
    url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80'
  },
  {
    title: 'Fortaleza das Sombras',
    url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80'
  },
  {
    title: 'Santuário de Cristal Ethéreo',
    url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80'
  },
  {
    title: 'Deserto Cinzento de Genexya',
    url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80'
  }
];

interface EditCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaign: CampaignData | null;
  onCampaignUpdated?: (updated: CampaignData) => void;
}

export function EditCampaignModal({
  isOpen,
  onClose,
  campaign,
  onCampaignUpdated
}: EditCampaignModalProps) {
  if (!isOpen || !campaign) return null;

  const [name, setName] = useState(campaign.name || '');
  const [description, setDescription] = useState(campaign.description || '');
  const [mode, setMode] = useState<'single' | 'multi'>(campaign.mode || 'single');
  const [difficulty, setDifficulty] = useState(campaign.difficulty || 5);
  const [style, setStyle] = useState(campaign.style || 5);
  const [allowedEmailsStr, setAllowedEmailsStr] = useState(
    (campaign.allowedEmails || []).join(', ')
  );
  const [selectedCover, setSelectedCover] = useState(
    campaign.imageUrl || PRESET_COVERS[0].url
  );
  const [customCoverUrl, setCustomCoverUrl] = useState(
    PRESET_COVERS.some(p => p.url === campaign.imageUrl) ? '' : (campaign.imageUrl || '')
  );
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (campaign) {
      setName(campaign.name || '');
      setDescription(campaign.description || '');
      setMode(campaign.mode || 'single');
      setDifficulty(campaign.difficulty || 5);
      setStyle(campaign.style || 5);
      setAllowedEmailsStr((campaign.allowedEmails || []).join(', '));
      const isPreset = PRESET_COVERS.some(p => p.url === campaign.imageUrl);
      if (isPreset) {
        setSelectedCover(campaign.imageUrl || PRESET_COVERS[0].url);
        setCustomCoverUrl('');
      } else {
        setSelectedCover(PRESET_COVERS[0].url);
        setCustomCoverUrl(campaign.imageUrl || '');
      }
      setErrorMsg('');
      setSuccessMsg('');
    }
  }, [campaign]);

  const getDifficultyLabel = (val: number) => {
    if (val <= 2) return 'Muito Fácil (Narrativa relaxada, combates leves)';
    if (val <= 4) return 'Fácil (Iniciantes, margem alta para erros)';
    if (val <= 6) return 'Normal (Padrão Telumak, desafio equilibrado)';
    if (val <= 8) return 'Difícil (Estratégico, monstros letais e testes severos)';
    return 'Insano / Letal (Qualquer falha pode ser fatal!)';
  };

  const getStyleLabel = (val: number) => {
    const rp = Math.round((10 - val) * 11.11);
    const combat = 100 - rp;
    if (val <= 3) return `Foco Narrativo & Roleplay (${rp}% RP / ${combat}% Combate)`;
    if (val <= 7) return `Balanceado (${rp}% RP / ${combat}% Combate)`;
    return `Combate Tático & Ação Intensa (${rp}% RP / ${combat}% Combate)`;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('O nome da campanha é obrigatório.');
      return;
    }

    setIsSaving(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      // Processar e-mails autorizados
      const emailList = allowedEmailsStr
        .split(',')
        .map(em => em.trim().toLowerCase())
        .filter(em => em.length > 0);

      // Sempre garantir que o dono permaneça na lista
      if (campaign.ownerEmail && !emailList.includes(campaign.ownerEmail.toLowerCase().trim())) {
        emailList.unshift(campaign.ownerEmail.toLowerCase().trim());
      }

      const finalCover = customCoverUrl.trim() || selectedCover;

      const updatedFields: Partial<CampaignData> = {
        name: name.trim(),
        description: description.trim(),
        imageUrl: finalCover,
        mode,
        difficulty: Number(difficulty),
        style: Number(style),
        allowedEmails: emailList
      };

      await updateDoc(doc(db, 'campaigns', campaign.id), updatedFields);

      setSuccessMsg('Campanha atualizada com sucesso!');
      if (onCampaignUpdated) {
        onCampaignUpdated({
          ...campaign,
          ...updatedFields
        } as CampaignData);
      }

      setTimeout(() => {
        onClose();
      }, 700);
    } catch (err: any) {
      console.error('Erro ao editar campanha:', err);
      setErrorMsg('Falha ao salvar alterações: ' + (err.message || 'Erro desconhecido'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-[#0f1115] border border-blue-500/40 w-full max-w-2xl shadow-2xl relative my-8 overflow-hidden text-white animate-in fade-in zoom-in-95 duration-150">
        
        {/* CABEÇALHO DO MODAL */}
        <div className="bg-gradient-to-r from-blue-950 via-[#131722] to-slate-900 p-5 border-b border-blue-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600/20 border border-blue-500/40 rounded">
              <Sliders className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-black uppercase tracking-tight text-white flex items-center gap-2">
                <span>Editar Configurações da Campanha</span>
              </h2>
              <p className="text-[11px] text-blue-200/70 font-mono">
                Altere modo, dificuldade, estilo ou convide amigos para o multiplayer
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-white/60 hover:text-white p-1.5 hover:bg-white/10 rounded transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* MENSAGENS DE STATUS */}
        {errorMsg && (
          <div className="bg-rose-950/80 border-b border-rose-500/40 p-3 text-xs text-rose-300 font-mono">
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="bg-emerald-950/80 border-b border-emerald-500/40 p-3 text-xs text-emerald-300 font-mono">
            ✓ {successMsg}
          </div>
        )}

        {/* FORMULÁRIO DE EDIÇÃO */}
        <form onSubmit={handleSave} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto custom-scroll">
          
          {/* 1. NOME E DESCRIÇÃO */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Nome da Campanha <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                className="w-full bg-black/60 border border-white/15 px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 rounded font-sans"
                placeholder="Ex: A Queda dos Sete Céus"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Descrição ou Sinopse
              </label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={3}
                className="w-full bg-black/60 border border-white/15 px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 rounded font-sans leading-relaxed"
                placeholder="Descreva o prelúdio, ambientação ou objetivos principais da aventura..."
              />
            </div>
          </div>

          {/* 2. MODO DE JOGO (SINGLEPLAYER VS MULTIPLAYER) */}
          <div className="bg-black/40 border border-white/10 p-4 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
                <Users className="h-4 w-4" />
                <span>Modo de Jogo</span>
              </label>
              <span className="text-[10px] text-white/50 font-mono">
                {mode === 'multi' ? 'Multiplayer Co-op' : 'Singleplayer Solo'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setMode('single')}
                className={`p-3 border text-left rounded transition ${
                  mode === 'single'
                    ? 'bg-blue-600/20 border-blue-500 text-white shadow-lg shadow-blue-500/10'
                    : 'bg-black/50 border-white/10 text-white/60 hover:border-white/20'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <User className="h-4 w-4 text-sky-400" />
                  <span className="text-xs font-black uppercase">Singleplayer</span>
                </div>
                <p className="text-[10px] text-white/50 leading-tight">
                  Jornada individual guiada pelo Narrador com foco na sua história pessoal.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setMode('multi')}
                className={`p-3 border text-left rounded transition ${
                  mode === 'multi'
                    ? 'bg-purple-600/20 border-purple-500 text-white shadow-lg shadow-purple-500/10'
                    : 'bg-black/50 border-white/10 text-white/60 hover:border-white/20'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Users className="h-4 w-4 text-purple-400" />
                  <span className="text-xs font-black uppercase">Multiplayer</span>
                </div>
                <p className="text-[10px] text-white/50 leading-tight">
                  Mesa compartilhada para convidar amigos, rolar dados juntos e ver a party!
                </p>
              </button>
            </div>
          </div>

          {/* 3. CONVIDAR AMIGOS (E-MAILS PERMITIDOS) */}
          <div className="bg-black/40 border border-white/10 p-4 rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <Users className="h-4 w-4" />
                <span>Jogadores Autorizados (Convite por E-mail)</span>
              </label>
              <span className="text-[10px] text-emerald-300 font-mono">
                {allowedEmailsStr ? allowedEmailsStr.split(',').filter(x => x.trim()).length : 0} jogador(es)
              </span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Adicione os e-mails dos seus amigos (separados por vírgula). Ao fazerem login com a Conta Google deles, esta campanha aparecerá automaticamente na lista deles para entrarem e criarem seus personagens!
            </p>
            <input
              type="text"
              value={allowedEmailsStr}
              onChange={e => setAllowedEmailsStr(e.target.value)}
              className="w-full bg-black/70 border border-white/20 px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 rounded font-mono"
              placeholder="exemplo1@gmail.com, amigo2@gmail.com, guerreiro3@gmail.com"
            />
          </div>

          {/* 4. DIFICULDADE (1 A 10) */}
          <div className="bg-black/40 border border-white/10 p-4 rounded-lg space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <ShieldAlert className="h-4 w-4" />
                <span>Nível de Dificuldade ({difficulty}/10)</span>
              </label>
              <span className="text-[10px] font-mono px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded">
                {difficulty}/10
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={difficulty}
              onChange={e => setDifficulty(Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer h-2 bg-neutral-800 rounded-lg"
            />
            <p className="text-[11px] text-slate-300 font-sans italic">
              {getDifficultyLabel(difficulty)}
            </p>
          </div>

          {/* 5. ESTILO DE JOGO (ROLEPLAY VS COMBATE) */}
          <div className="bg-black/40 border border-white/10 p-4 rounded-lg space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                <Sparkles className="h-4 w-4" />
                <span>Estilo de Jogo ({style}/10)</span>
              </label>
              <span className="text-[10px] font-mono px-2 py-0.5 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded">
                {style}/10
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] text-indigo-300 uppercase font-bold flex items-center gap-1">
                <MessageSquare className="h-3 w-3" /> Roleplay
              </span>
              <input
                type="range"
                min="1"
                max="10"
                value={style}
                onChange={e => setStyle(Number(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer h-2 bg-neutral-800 rounded-lg"
              />
              <span className="text-[10px] text-rose-300 uppercase font-bold flex items-center gap-1">
                Combate <Sword className="h-3 w-3" />
              </span>
            </div>
            <p className="text-[11px] text-slate-300 font-sans italic">
              {getStyleLabel(style)}
            </p>
          </div>

          {/* 6. CAPA DA CAMPANHA */}
          <div className="bg-black/40 border border-white/10 p-4 rounded-lg space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
              <ImageIcon className="h-4 w-4 text-sky-400" />
              <span>Capa da Campanha</span>
            </label>

            {/* Presets */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {PRESET_COVERS.map((preset, idx) => {
                const isSelected = !customCoverUrl && selectedCover === preset.url;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setSelectedCover(preset.url);
                      setCustomCoverUrl('');
                    }}
                    className={`relative h-20 rounded overflow-hidden border transition text-left group ${
                      isSelected
                        ? 'border-blue-500 ring-2 ring-blue-500/40'
                        : 'border-white/10 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={preset.url} alt={preset.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent flex items-end p-1.5">
                      <span className="text-[9px] font-bold text-white uppercase leading-tight truncate">
                        {preset.title}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Custom URL */}
            <div>
              <label className="block text-[10px] uppercase font-bold text-white/50 mb-1">
                Ou cole uma URL personalizada de imagem:
              </label>
              <input
                type="url"
                value={customCoverUrl}
                onChange={e => setCustomCoverUrl(e.target.value)}
                placeholder="https://exemplo.com/minha-imagem.jpg"
                className="w-full bg-black/60 border border-white/15 px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500 rounded font-mono"
              />
            </div>
          </div>

          {/* BOTÕES DE SALVAMENTO */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs font-bold uppercase tracking-wider rounded transition"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-black uppercase tracking-wider transition rounded shadow-lg shadow-blue-900/30 flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              <span>{isSaving ? 'Salvando...' : 'Salvar Alterações'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
