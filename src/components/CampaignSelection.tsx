import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { 
  collection, 
  query, 
  where,
  getDocs,
  onSnapshot, 
  addDoc, 
  serverTimestamp,
  orderBy,
  doc,
  deleteDoc,
  updateDoc,
  arrayRemove
} from 'firebase/firestore';
import { 
  Plus, 
  Play, 
  Users, 
  User, 
  ShieldAlert, 
  Clock, 
  Sparkles, 
  Sword, 
  MessageSquare, 
  LogOut, 
  Layers,
  Flame,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  X,
  Trash2,
  UserMinus,
  Crown,
  AlertCircle,
  Sliders
} from 'lucide-react';
import { EditCampaignModal } from './EditCampaignModal';
import { removeCampaignCharactersFromCache } from '../utils/browserCache';

export interface CampaignData {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  mode: 'single' | 'multi';
  difficulty: number; // 1 a 10
  style: number; // 1 (Puro Roleplay) a 10 (Puro Combate)
  allowedEmails: string[];
  ownerEmail?: string;
  characterNames: string[];
  totalPlayTimeMinutes?: number;
  lastResponseAt?: any;
  needsAction?: boolean;
  actionMessage?: string;
  createdAt?: any;
}

interface CampaignSelectionProps {
  userEmail: string | null;
  onSelectCampaign: (campaignId: string) => void;
  onLogout?: () => void;
  isGM?: boolean;
}

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

export function CampaignSelection({ 
  userEmail, 
  onSelectCampaign, 
  onLogout,
  isGM = false 
}: CampaignSelectionProps) {
  const [campaigns, setCampaigns] = useState<CampaignData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Formulário de Nova Campanha
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [mode, setMode] = useState<'single' | 'multi'>('single');
  const [difficulty, setDifficulty] = useState(5);
  const [style, setStyle] = useState(5); // 5 = Balanceado
  const [characterNamesStr, setCharacterNamesStr] = useState('');
  const [allowedEmailsStr, setAllowedEmailsStr] = useState(userEmail || '');
  const [selectedCover, setSelectedCover] = useState(PRESET_COVERS[0].url);
  const [customCoverUrl, setCustomCoverUrl] = useState('');

  // Estados para exclusão, edição e saída de campanha
  const [campaignToDelete, setCampaignToDelete] = useState<CampaignData | null>(null);
  const [campaignToLeave, setCampaignToLeave] = useState<CampaignData | null>(null);
  const [editingCampaign, setEditingCampaign] = useState<CampaignData | null>(null);
  const [newOwnerEmail, setNewOwnerEmail] = useState('');
  const [isProcessingAction, setIsProcessingAction] = useState(false);

  const normalizedUserEmail = (userEmail || '').toLowerCase().trim();

  useEffect(() => {
    if (!normalizedUserEmail) {
      setLoading(false);
      return;
    }

    // Carregar campanhas
    try {
      const campRef = collection(db, 'campaigns');
      const unsub = onSnapshot(campRef, (snapshot) => {
        const list: CampaignData[] = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name || 'Campanha Sem Nome',
            description: data.description || '',
            imageUrl: data.imageUrl || PRESET_COVERS[0].url,
            mode: data.mode === 'multi' ? 'multi' : 'single',
            difficulty: Number(data.difficulty) || 5,
            style: Number(data.style) || 5,
            allowedEmails: Array.isArray(data.allowedEmails) ? data.allowedEmails : [],
            ownerEmail: data.ownerEmail || '',
            characterNames: Array.isArray(data.characterNames) ? data.characterNames : [],
            totalPlayTimeMinutes: Number(data.totalPlayTimeMinutes) || 120,
            lastResponseAt: data.lastResponseAt || null,
            needsAction: !!data.needsAction,
            actionMessage: data.actionMessage || 'Sua vez de agir no turno!',
            createdAt: data.createdAt || null
          } as CampaignData;
        });

        // Filtrar campanhas: somente onde o e-mail do jogador está vinculado ou ele é dono/GM
        const filtered = list.filter(c => {
          if (isGM) return true;
          const emails = c.allowedEmails.map(e => e.toLowerCase().trim());
          const isOwner = c.ownerEmail && c.ownerEmail.toLowerCase().trim() === normalizedUserEmail;
          return isOwner || emails.includes(normalizedUserEmail);
        });

        setCampaigns(filtered);
        setLoading(false);
      }, (err) => {
        console.warn("Aviso ao carregar campanhas:", err);
        setLoading(false);
      });

      return () => unsub();
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  }, [normalizedUserEmail, isGM]);

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Informe o nome da campanha.');
      return;
    }

    setCreating(true);
    setErrorMsg('');

    try {
      const emailList = allowedEmailsStr
        .split(',')
        .map(e => e.trim().toLowerCase())
        .filter(e => e.length > 0);

      if (userEmail && !emailList.includes(userEmail.toLowerCase().trim())) {
        emailList.push(userEmail.toLowerCase().trim());
      }

      const charList = characterNamesStr
        .split(',')
        .map(c => c.trim())
        .filter(c => c.length > 0);

      const finalCover = customCoverUrl.trim() || selectedCover;

      const newCampaign = {
        name: name.trim(),
        description: description.trim() || 'Aventuras em Telumak...',
        imageUrl: finalCover,
        mode,
        difficulty,
        style,
        allowedEmails: emailList,
        ownerEmail: userEmail || '',
        characterNames: charList.length > 0 ? charList : ['Aventureiro Inicial'],
        totalPlayTimeMinutes: 0,
        lastResponseAt: serverTimestamp(),
        needsAction: true,
        actionMessage: 'Campanha iniciada! Faça sua primeira ação.',
        createdAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'campaigns'), newCampaign);
      setShowCreateModal(false);
      // Entra automaticamente na campanha criada
      onSelectCampaign(docRef.id);
    } catch (err: any) {
      console.error("Erro ao criar campanha:", err);
      setErrorMsg('Falha ao salvar campanha: ' + (err.message || 'Erro desconhecido'));
    } finally {
      setCreating(false);
    }
  };

  // 1. Excluir Campanha (apenas criador da campanha) - com exclusão em cascata das fichas vinculadas e limpeza de cache
  const handleDeleteCampaign = async () => {
    if (!campaignToDelete) return;
    setIsProcessingAction(true);
    try {
      const campId = campaignToDelete.id;
      const campName = campaignToDelete.name;

      // 1.1 Excluir todas as fichas de personagens vinculadas a esta campanha (por id e por nome)
      try {
        const charsRef = collection(db, 'characters');
        const queries = [
          query(charsRef, where('campaign_id', '==', campId)),
          query(charsRef, where('campaignId', '==', campId)),
          query(charsRef, where('campaign_nome', '==', campName)),
          query(charsRef, where('campaign_id', '==', campName)),
          query(charsRef, where('campaignId', '==', campName))
        ];

        const deletedCharIds = new Set<string>();
        for (const q of queries) {
          try {
            const snap = await getDocs(q);
            for (const cDoc of snap.docs) {
              if (!deletedCharIds.has(cDoc.id)) {
                deletedCharIds.add(cDoc.id);
                await deleteDoc(doc(db, 'characters', cDoc.id));
              }
            }
          } catch (qErr) {
            console.warn("Aviso na consulta de fichas para exclusão:", qErr);
          }
        }
      } catch (charErr) {
        console.warn("Aviso ao deletar fichas da campanha:", charErr);
      }

      // 1.2 Limpar dados desta campanha do cache local do navegador
      removeCampaignCharactersFromCache(campId, campName);

      // 1.3 Excluir o documento da campanha atual
      await deleteDoc(doc(db, 'campaigns', campId));

      // 1.4 Se houver documentos duplicados com o mesmo nome pertencentes ao mesmo dono, remover também
      try {
        const campRef = collection(db, 'campaigns');
        const dupSnap = await getDocs(query(campRef, where('name', '==', campName)));
        for (const dDoc of dupSnap.docs) {
          const dData = dDoc.data();
          if (dDoc.id !== campId && dData.ownerEmail && dData.ownerEmail.toLowerCase().trim() === normalizedUserEmail) {
            await deleteDoc(doc(db, 'campaigns', dDoc.id));
          }
        }
      } catch (dupErr) {
        console.warn("Aviso ao verificar duplicatas de campanha:", dupErr);
      }

      setCampaignToDelete(null);
    } catch (err: any) {
      console.error("Erro ao excluir campanha:", err);
      alert("Erro ao excluir campanha: " + (err.message || 'Erro desconhecido'));
    } finally {
      setIsProcessingAction(false);
    }
  };

  // 2. Sair da Campanha (com transferência de administração se for criador)
  const handleLeaveCampaign = async () => {
    if (!campaignToLeave || !userEmail) return;
    setIsProcessingAction(true);
    try {
      const isOwner = campaignToLeave.ownerEmail?.toLowerCase().trim() === userEmail.toLowerCase().trim();
      const currentEmailNormalized = userEmail.toLowerCase().trim();
      
      if (isOwner) {
        const otherPlayers = (campaignToLeave.allowedEmails || []).filter(
          e => e.toLowerCase().trim() !== currentEmailNormalized
        );

        if (otherPlayers.length === 0) {
          // Se for o único jogador ativo, exclui a campanha e suas fichas
          try {
            const charsRef = collection(db, 'characters');
            const queries = [
              query(charsRef, where('campaign_id', '==', campaignToLeave.id)),
              query(charsRef, where('campaignId', '==', campaignToLeave.id)),
              query(charsRef, where('campaign_nome', '==', campaignToLeave.name))
            ];
            for (const q of queries) {
              const snap = await getDocs(q);
              for (const cDoc of snap.docs) {
                await deleteDoc(doc(db, 'characters', cDoc.id));
              }
            }
          } catch (e) {
            console.warn(e);
          }
          removeCampaignCharactersFromCache(campaignToLeave.id, campaignToLeave.name);
          await deleteDoc(doc(db, 'campaigns', campaignToLeave.id));
        } else {
          if (!newOwnerEmail) {
            alert("Por favor, selecione qual jogador ativo assumirá a administração da campanha.");
            setIsProcessingAction(false);
            return;
          }
          await updateDoc(doc(db, 'campaigns', campaignToLeave.id), {
            ownerEmail: newOwnerEmail.toLowerCase().trim(),
            allowedEmails: arrayRemove(currentEmailNormalized)
          });
        }
      } else {
        // Jogador comum saindo da campanha
        await updateDoc(doc(db, 'campaigns', campaignToLeave.id), {
          allowedEmails: arrayRemove(currentEmailNormalized)
        });
      }

      setCampaignToLeave(null);
      setNewOwnerEmail('');
    } catch (err: any) {
      console.error("Erro ao sair da campanha:", err);
      alert("Erro ao sair da campanha: " + (err.message || 'Erro desconhecido'));
    } finally {
      setIsProcessingAction(false);
    }
  };

  const formatPlayTime = (minutes: number = 0) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}m de jogo`;
    return `${hours}h ${mins > 0 ? `${mins}m` : ''} de jogo`;
  };

  const formatLastResponse = (timestamp: any) => {
    if (!timestamp) return 'Sem respostas recentes';
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      const diffMs = Date.now() - date.getTime();
      const diffMin = Math.floor(diffMs / (1000 * 60));
      if (diffMin < 2) return 'Agora há pouco';
      if (diffMin < 60) return `Há ${diffMin} minutos`;
      const diffHours = Math.floor(diffMin / 60);
      if (diffHours < 24) return `Há ${diffHours} horas`;
      const diffDays = Math.floor(diffHours / 24);
      return `Há ${diffDays} dias`;
    } catch {
      return 'Recentemente';
    }
  };

  const getStyleLabel = (styleVal: number) => {
    if (styleVal <= 3) return { label: 'Foco em Narrativa & Roleplay', rpPercent: 85, combatPercent: 15 };
    if (styleVal >= 8) return { label: 'Foco em Combate Tático Brutal', rpPercent: 20, combatPercent: 80 };
    return { label: 'Equilibrado (RP & Combate)', rpPercent: 50, combatPercent: 50 };
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans flex flex-col justify-between selection:bg-blue-600 selection:text-white">
      {/* BARRA SUPERIOR */}
      <header className="border-b border-blue-500/20 bg-[#0a0a0a]/90 backdrop-blur sticky top-0 z-30 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border border-blue-500/40 p-0.5 bg-black flex items-center justify-center">
              <img 
                src="/telumak-logo.svg" 
                alt="RPG Telumak" 
                className="w-full h-full object-contain rounded-full"
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black italic tracking-tighter uppercase text-white">
                  TELUMAK<span className="text-blue-500">.ia 24H</span>
                </h1>
                <span className="text-[10px] bg-blue-500/20 text-sky-400 font-mono px-2 py-0.5 border border-blue-500/30 font-bold uppercase">
                  Módulo 0: Campanhas
                </span>
              </div>
              <p className="text-[11px] text-white/50 font-mono flex items-center gap-2">
                <span>Conectado como:</span>
                <span className="text-sky-400 font-bold">{userEmail || 'Jogador'}</span>
                {isGM && <span className="text-amber-400 font-bold ml-1">👑 MESTRE</span>}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider px-4 py-2.5 rounded-none flex items-center gap-2 transition shadow-lg shadow-emerald-950/40 border border-emerald-400/30"
            >
              <Plus className="w-4 h-4" />
              <span>Criar Campanha</span>
            </button>

            {onLogout && (
              <button
                onClick={onLogout}
                className="bg-[#151515] hover:bg-rose-950/30 border border-white/10 hover:border-rose-500/40 text-white/70 hover:text-rose-400 font-bold text-xs uppercase tracking-wider px-3 py-2.5 rounded-none flex items-center gap-2 transition"
                title="Sair da Conta"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Desconectar</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="max-w-7xl mx-auto w-full p-6 sm:p-8 flex-1">
        <div className="mb-8 flex flex-col sm:flex-row justify-between sm:items-end gap-2 border-b border-white/10 pb-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white flex items-center gap-3">
              <Layers className="w-7 h-7 text-blue-500" />
              Grimório de Campanhas
            </h2>
            <p className="text-xs text-white/50 mt-1">
              Selecione o mundo onde deseja adentrar. São exibidas apenas as campanhas vinculadas ao seu e-mail.
            </p>
          </div>
          <span className="text-xs font-mono text-sky-400/80">
            {campaigns.length} {campaigns.length === 1 ? 'campanha disponível' : 'campanhas disponíveis'}
          </span>
        </div>

        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-xs font-mono tracking-widest uppercase text-sky-400/70">
              Sintonizando campanhas do jogador...
            </span>
          </div>
        ) : campaigns.length === 0 ? (
          /* NENHUMA CAMPANHA ENCONTRADA */
          <div className="bg-[#0a0a0a] border border-white/10 p-10 text-center max-w-xl mx-auto my-12 shadow-2xl relative">
            <div className="w-16 h-16 rounded-full bg-blue-500/10 border border-blue-500/30 mx-auto flex items-center justify-center mb-4 text-blue-400">
              <Sparkles className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold uppercase text-white mb-2">Nenhuma Campanha Vinculada</h3>
            <p className="text-xs text-white/60 mb-6 leading-relaxed">
              Você ainda não está vinculado a nenhuma mesa de Telumak com o e-mail <span className="text-sky-300 font-bold">{userEmail}</span>.
              Dê o primeiro passo criando uma nova campanha solo ou multiplayer com nosso Mestre IA!
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-widest px-6 py-3 transition inline-flex items-center gap-2 shadow-lg shadow-blue-900/30"
            >
              <Plus className="w-4 h-4" />
              Criar Primeira Campanha Agora
            </button>
          </div>
        ) : (
          /* GRADE DE CAMPANHAS */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map(c => {
              const styleInfo = getStyleLabel(c.style);

              return (
                <div 
                  key={c.id}
                  className="bg-[#0c0c0c] border border-blue-500/20 hover:border-blue-500/60 transition-all duration-200 shadow-xl flex flex-col justify-between group overflow-hidden relative"
                >
                  {/* ALERTA: AÇÃO NECESSÁRIA */}
                  {c.needsAction && (
                    <div className="bg-rose-600 text-white text-[10px] font-black uppercase px-3 py-1 flex items-center justify-between tracking-wider shadow animate-pulse z-10">
                      <span className="flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        AÇÃO NECESSÁRIA
                      </span>
                      <span className="text-[9px] font-mono opacity-90">{c.actionMessage}</span>
                    </div>
                  )}

                  {/* IMAGEM DA CAMPANHA */}
                  <div className="relative h-44 w-full overflow-hidden bg-black/60">
                    <img 
                      src={c.imageUrl || PRESET_COVERS[0].url} 
                      alt={c.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 filter brightness-90 group-hover:brightness-100"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c0c] via-transparent to-black/30 pointer-events-none" />
                    
                    {/* BADGES SUPERIORES NA IMAGEM */}
                    <div className="absolute top-2.5 left-2.5 flex items-center gap-2">
                      <span className={`text-[10px] font-black uppercase px-2.5 py-1 tracking-wider border shadow-md ${
                        c.mode === 'multi' 
                          ? 'bg-purple-950/80 border-purple-500/50 text-purple-300' 
                          : 'bg-sky-950/80 border-sky-500/50 text-sky-300'
                      }`}>
                        {c.mode === 'multi' ? 'Multiplayer' : 'Singleplayer'}
                      </span>

                      <span className="text-[10px] font-bold uppercase px-2 py-1 bg-black/80 border border-white/20 text-white">
                        Dificuldade {c.difficulty}/10
                      </span>
                    </div>
                  </div>

                  {/* CORPO DE INFORMAÇÕES DA CAMPANHA */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-xl font-black uppercase tracking-tight text-white mb-1 group-hover:text-blue-400 transition-colors">
                        {c.name}
                      </h3>
                      
                      {c.description && (
                        <p className="text-xs text-white/60 line-clamp-2 mb-4 leading-relaxed">
                          {c.description}
                        </p>
                      )}

                      {/* ESTILO DA CAMPANHA (ROLEPLAY VS COMBATE) */}
                      <div className="mb-4 bg-black/40 border border-white/5 p-2.5">
                        <div className="flex justify-between items-center text-[10px] font-bold uppercase mb-1">
                          <span className="text-indigo-400 flex items-center gap-1">
                            <MessageSquare className="w-3 h-3" /> Roleplay ({styleInfo.rpPercent}%)
                          </span>
                          <span className="text-rose-400 flex items-center gap-1">
                            Combate ({styleInfo.combatPercent}%) <Sword className="w-3 h-3" />
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-neutral-800 overflow-hidden flex rounded-full">
                          <div 
                            className="bg-indigo-500 h-full transition-all" 
                            style={{ width: `${styleInfo.rpPercent}%` }}
                          />
                          <div 
                            className="bg-rose-500 h-full transition-all" 
                            style={{ width: `${styleInfo.combatPercent}%` }}
                          />
                        </div>
                        <p className="text-[9px] text-white/40 mt-1 font-mono text-center">
                          {styleInfo.label}
                        </p>
                      </div>

                      {/* NOMES DOS PERSONAGENS */}
                      <div className="mb-3">
                        <span className="text-[9px] uppercase tracking-widest text-sky-300/60 font-bold block mb-1">
                          Personagens Vinculados:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {c.characterNames && c.characterNames.length > 0 ? (
                            c.characterNames.map((name, idx) => (
                              <span 
                                key={idx} 
                                className="text-[10px] bg-white/5 border border-white/10 px-2 py-0.5 text-white/90 font-mono"
                              >
                                {name}
                              </span>
                            ))
                          ) : (
                            <span className="text-[10px] text-white/40 italic">Nenhum personagem registrado</span>
                          )}
                        </div>
                      </div>

                      {/* TEMPOS DE JOGO E ÚLTIMA RESPOSTA */}
                      <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-white/60 border-t border-white/10 pt-3 mb-4">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-amber-400" />
                          <span>{formatPlayTime(c.totalPlayTimeMinutes)}</span>
                        </div>
                        <div className="flex items-center gap-1.5 justify-end">
                          <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{formatLastResponse(c.lastResponseAt)}</span>
                        </div>
                      </div>
                    </div>

                    {/* BOTÕES DE AÇÃO: ENTRAR, SAIR E EXCLUIR */}
                    {(() => {
                      const isOwner = c.ownerEmail?.toLowerCase().trim() === normalizedUserEmail;
                      return (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => onSelectCampaign(c.id)}
                            className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase text-xs tracking-widest py-3 flex items-center justify-center gap-2 transition duration-150 rounded-none shadow-lg shadow-blue-950/40 border border-blue-400/30"
                          >
                            <Play className="w-4 h-4 fill-white" />
                            <span>Entrar no Mundo</span>
                          </button>

                          {/* Botão Editar Campanha (Criador ou GM) */}
                          {(isOwner || isGM) && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingCampaign(c);
                              }}
                              className="px-3.5 py-3 bg-white/5 hover:bg-blue-950/40 text-white/50 hover:text-blue-400 border border-white/10 hover:border-blue-500/40 transition flex items-center justify-center"
                              title="Editar Campanha (Dificuldade, Estilo, Modo e Amigos)"
                            >
                              <Sliders className="w-4 h-4" />
                            </button>
                          )}

                          {/* Botão Sair da Campanha */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setCampaignToLeave(c);
                              const otherPlayers = (c.allowedEmails || []).filter(
                                em => em.toLowerCase().trim() !== normalizedUserEmail
                              );
                              setNewOwnerEmail(otherPlayers[0] || '');
                            }}
                            className="px-3.5 py-3 bg-white/5 hover:bg-amber-950/40 text-white/50 hover:text-amber-400 border border-white/10 hover:border-amber-500/40 transition flex items-center justify-center"
                            title={isOwner ? "Sair da Campanha (Transferir Liderança)" : "Sair desta Campanha"}
                          >
                            <LogOut className="w-4 h-4" />
                          </button>

                          {/* Botão Remover Campanha (Apenas Criador) */}
                          {isOwner && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setCampaignToDelete(c);
                              }}
                              className="px-3.5 py-3 bg-white/5 hover:bg-rose-950/40 text-white/50 hover:text-rose-400 border border-white/10 hover:border-rose-500/40 transition flex items-center justify-center"
                              title="Excluir Campanha Permanentemente (Apenas Criador)"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* MODAL: CRIAR NOVA CAMPANHA */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0a0a0a] border border-blue-500/30 max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative my-8">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-4 right-4 text-white/50 hover:text-white transition"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="mb-6">
              <h2 className="text-2xl font-black uppercase tracking-tight text-white flex items-center gap-2">
                <Plus className="w-6 h-6 text-emerald-400" />
                Criar Nova Campanha de RPG
              </h2>
              <p className="text-xs text-white/50 mt-1">
                Configure as diretrizes iniciais do mundo, modo de jogo e os heróis participantes.
              </p>
            </div>

            {errorMsg && (
              <div className="mb-4 bg-rose-950/30 border border-rose-500/40 text-rose-300 p-3 text-xs font-semibold">
                ⚠️ {errorMsg}
              </div>
            )}

            <form onSubmit={handleCreateCampaign} className="space-y-5">
              {/* NOME DA CAMPANHA */}
              <div className="space-y-1">
                <label className="block text-[10px] uppercase font-bold text-sky-300/80 tracking-widest">
                  Nome da Campanha *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Ex: A Queda dos Reis de Abixya"
                  className="w-full bg-[#111] border border-white/10 px-3 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 rounded-none placeholder-white/20"
                  required
                />
              </div>

              {/* DESCRIÇÃO / CONTEXTO */}
              <div className="space-y-1">
                <label className="block text-[10px] uppercase font-bold text-sky-300/80 tracking-widest">
                  Resumo / Sinopse Inicial
                </label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Descreva a premissa da aventura, o cenário ou o mistério central..."
                  rows={2}
                  className="w-full bg-[#111] border border-white/10 px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 rounded-none placeholder-white/20"
                />
              </div>

              {/* MODO DE JOGO & DIFICULDADE */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-bold text-sky-300/80 tracking-widest">
                    Modo de Jogo
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setMode('single')}
                      className={`py-2 px-3 text-xs font-bold uppercase transition border ${
                        mode === 'single'
                          ? 'bg-blue-600 border-blue-400 text-white'
                          : 'bg-[#151515] border-white/10 text-white/50 hover:text-white'
                      }`}
                    >
                      Singleplayer
                    </button>
                    <button
                      type="button"
                      onClick={() => setMode('multi')}
                      className={`py-2 px-3 text-xs font-bold uppercase transition border ${
                        mode === 'multi'
                          ? 'bg-purple-600 border-purple-400 text-white'
                          : 'bg-[#151515] border-white/10 text-white/50 hover:text-white'
                      }`}
                    >
                      Multiplayer
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="block text-[10px] uppercase font-bold text-sky-300/80 tracking-widest">
                      Dificuldade: {difficulty}/10
                    </label>
                    <span className="text-[9px] font-mono text-white/40">
                      {difficulty <= 3 ? 'Iniciante' : difficulty <= 7 ? 'Desafiador' : 'Impiedoso'}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={difficulty}
                    onChange={e => setDifficulty(Number(e.target.value))}
                    className="w-full accent-blue-500 cursor-pointer"
                  />
                </div>
              </div>

              {/* ESTILO (ROLEPLAY VS COMBATE) */}
              <div className="space-y-1 bg-[#111] p-3 border border-white/5">
                <div className="flex justify-between items-center text-[10px] font-bold uppercase">
                  <span className="text-indigo-400">Foco em Roleplay ({110 - style * 10}%)</span>
                  <span className="text-white font-mono">Estilo da IA: {style}/10</span>
                  <span className="text-rose-400">Foco em Combate ({style * 10}%)</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={style}
                  onChange={e => setStyle(Number(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
                <p className="text-[9px] text-white/40 font-mono text-center">
                  Define a frequência com que o Mestre IA propõe diálogos profundos versus encontros táticos com dados.
                </p>
              </div>

              {/* IMAGEM DE CAPA */}
              <div className="space-y-2">
                <label className="block text-[10px] uppercase font-bold text-sky-300/80 tracking-widest">
                  Capa Visual da Campanha (Gerada por IA / Predefinições)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {PRESET_COVERS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => { setSelectedCover(preset.url); setCustomCoverUrl(''); }}
                      className={`relative h-16 rounded overflow-hidden border transition ${
                        selectedCover === preset.url && !customCoverUrl
                          ? 'border-blue-500 ring-2 ring-blue-500/50'
                          : 'border-white/10 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={preset.url} alt={preset.title} className="w-full h-full object-cover" />
                      <span className="absolute bottom-0 inset-x-0 bg-black/80 text-[8px] font-bold py-0.5 truncate px-1 text-center">
                        {preset.title}
                      </span>
                    </button>
                  ))}
                </div>
                <input
                  type="url"
                  value={customCoverUrl}
                  onChange={e => setCustomCoverUrl(e.target.value)}
                  placeholder="Ou cole a URL de uma imagem personalizada..."
                  className="w-full bg-[#111] border border-white/10 px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500 rounded-none placeholder-white/20"
                />
              </div>

              {/* PERSONAGENS E E-MAILS VINCULADOS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-bold text-sky-300/80 tracking-widest">
                    Nomes dos Personagens (separados por vírgula)
                  </label>
                  <input
                    type="text"
                    value={characterNamesStr}
                    onChange={e => setCharacterNamesStr(e.target.value)}
                    placeholder="Ex: Aldor, Elowen, Kael"
                    className="w-full bg-[#111] border border-white/10 px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 rounded-none placeholder-white/20"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-bold text-sky-300/80 tracking-widest">
                    E-mails Autorizados (separados por vírgula)
                  </label>
                  <input
                    type="text"
                    value={allowedEmailsStr}
                    onChange={e => setAllowedEmailsStr(e.target.value)}
                    placeholder="amigo@gmail.com, jogador@telumak.com"
                    className="w-full bg-[#111] border border-white/10 px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 rounded-none placeholder-white/20"
                  />
                </div>
              </div>

              {/* BOTÕES DE AÇÃO */}
              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs uppercase font-bold text-white/50 hover:text-white transition"
                  disabled={creating}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-widest px-6 py-2.5 transition flex items-center gap-2 shadow-lg disabled:opacity-50"
                >
                  {creating ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Criando Mundo...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Concluir e Iniciar Campanha</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EXCLUIR CAMPANHA (APENAS CRIADOR) */}
      {campaignToDelete && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0e0e0e] border border-rose-500/50 max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-2.5 text-rose-400">
              <Trash2 className="w-5 h-5" />
              <h3 className="text-base font-black uppercase tracking-wider text-white">
                Excluir Campanha Permanentemente
              </h3>
            </div>

            <p className="text-xs text-white/70 leading-relaxed">
              Você está prestes a excluir a campanha <strong className="text-white">"{campaignToDelete.name}"</strong>. Esta ação não poderá ser desfeita. Todos os registros, mensagens e dados desta aventura serão apagados.
            </p>

            <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setCampaignToDelete(null)}
                disabled={isProcessingAction}
                className="px-4 py-2 text-xs font-bold uppercase text-white/60 hover:text-white transition"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDeleteCampaign}
                disabled={isProcessingAction}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs uppercase tracking-wider transition flex items-center gap-1.5 shadow-lg disabled:opacity-50"
              >
                {isProcessingAction ? 'Excluindo...' : 'Sim, Excluir Campanha'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: SAIR DA CAMPANHA (COM TRANSFERÊNCIA SE FOR CRIADOR) */}
      {campaignToLeave && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0e0e0e] border border-amber-500/50 max-w-lg w-full p-6 shadow-2xl space-y-4">
            {(() => {
              const isOwner = campaignToLeave.ownerEmail?.toLowerCase().trim() === normalizedUserEmail;
              const otherPlayers = (campaignToLeave.allowedEmails || []).filter(
                em => em.toLowerCase().trim() !== normalizedUserEmail
              );

              return (
                <>
                  <div className="flex items-center gap-2.5 text-amber-400">
                    <LogOut className="w-5 h-5" />
                    <h3 className="text-base font-black uppercase tracking-wider text-white">
                      {isOwner ? 'Transferir Liderança & Sair da Campanha' : 'Sair da Campanha'}
                    </h3>
                  </div>

                  {isOwner ? (
                    otherPlayers.length > 0 ? (
                      <div className="space-y-3">
                        <p className="text-xs text-white/80 leading-relaxed">
                          Como você é o <strong className="text-amber-400">Criador</strong> da campanha <strong className="text-white">"{campaignToLeave.name}"</strong>, é necessário passar a administração para outro jogador ativo antes de sair:
                        </p>

                        <div className="space-y-1">
                          <label className="block text-[10px] uppercase font-bold text-sky-300 tracking-wider">
                            Selecione o Novo Administrador / Mestre:
                          </label>
                          <select
                            value={newOwnerEmail}
                            onChange={(e) => setNewOwnerEmail(e.target.value)}
                            className="w-full bg-[#151515] border border-white/20 p-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                          >
                            {otherPlayers.map((email, idx) => (
                              <option key={idx} value={email}>
                                {email}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-xs text-white/80 leading-relaxed">
                          Você é o <strong className="text-amber-400">Criador</strong> e o único jogador participante nesta campanha. Ao sair, a campanha será excluída permanentemente.
                        </p>
                      </div>
                    )
                  ) : (
                    <p className="text-xs text-white/80 leading-relaxed">
                      Tem certeza que deseja sair da campanha <strong className="text-white">"{campaignToLeave.name}"</strong>? Você não terá mais acesso às fichas e sessões desta aventura.
                    </p>
                  )}

                  <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                    <button
                      type="button"
                      onClick={() => { setCampaignToLeave(null); setNewOwnerEmail(''); }}
                      disabled={isProcessingAction}
                      className="px-4 py-2 text-xs font-bold uppercase text-white/60 hover:text-white transition"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={handleLeaveCampaign}
                      disabled={isProcessingAction}
                      className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-black text-xs uppercase tracking-wider transition flex items-center gap-1.5 shadow-lg disabled:opacity-50"
                    >
                      {isProcessingAction 
                        ? 'Processando...' 
                        : isOwner && otherPlayers.length > 0 
                          ? 'Transferir e Sair' 
                          : isOwner 
                            ? 'Excluir e Sair' 
                            : 'Confirmar Saída'}
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* MODAL: EDITAR CONFIGURAÇÕES DA CAMPANHA */}
      <EditCampaignModal
        isOpen={!!editingCampaign}
        onClose={() => setEditingCampaign(null)}
        campaign={editingCampaign}
        onCampaignUpdated={(updated) => {
          setCampaigns(prev => prev.map(item => item.id === updated.id ? updated : item));
        }}
      />

      {/* RODAPÉ */}
      <footer className="border-t border-white/5 py-4 px-6 text-center text-[10px] text-white/30 font-mono uppercase tracking-widest">
        TELUMAK.ia 24H • Sistema Digital de Campanhas & Inteligência Narrativa
      </footer>
    </div>
  );
}
