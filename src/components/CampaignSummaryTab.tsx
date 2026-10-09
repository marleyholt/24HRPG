import React, { useState, useEffect } from 'react';
import { 
  CampaignData, Character, DiscordNotebookMessage, UserProfile 
} from '../types';
import { 
  BookOpen, Users, Dices, Scroll, Shield, Heart, Zap, Sparkles, 
  MapPin, Clock, Calendar, Sword, Compass, CheckCircle2, Award,
  FileText, MessageSquare, ChevronRight, Eye, RefreshCw, Layers,
  UserMinus, Crown, Trash2, Sliders, Plus
} from 'lucide-react';
import { collection, query, where, orderBy, limit, getDocs, doc, updateDoc, deleteDoc, arrayRemove } from 'firebase/firestore';
import { db } from '../firebase';
import { EditCampaignModal } from './EditCampaignModal';

interface CampaignSummaryTabProps {
  campaign: CampaignData | null;
  characters: Character[];
  isGM: boolean;
  currentUserProfile: UserProfile | null;
  onSelectCharacter?: (char: Character) => void;
  onNavigateToTab?: (tab: 'personagens' | 'discord' | 'resumo') => void;
}

export function CampaignSummaryTab({
  campaign,
  characters,
  isGM,
  currentUserProfile,
  onSelectCharacter,
  onNavigateToTab
}: CampaignSummaryTabProps) {
  const [recentNarrative, setRecentNarrative] = useState<DiscordNotebookMessage[]>([]);
  const [recentNotes, setRecentNotes] = useState<DiscordNotebookMessage[]>([]);
  const [recentRolls, setRecentRolls] = useState<DiscordNotebookMessage[]>([]);
  const [loadingContent, setLoadingContent] = useState(false);

  // Carregar dados de resumo dos canais da campanha
  useEffect(() => {
    if (!campaign?.id) return;

    let isMounted = true;
    const fetchSummaryData = async () => {
      setLoadingContent(true);
      try {
        // 1. Mensagens recentes de Narrativa
        const qNarrativa = query(
          collection(db, 'discord_messages'),
          where('channelId', '==', '1-narrativa'),
          orderBy('createdAt', 'desc'),
          limit(5)
        );
        const snapNarrativa = await getDocs(qNarrativa);
        const listNarrativa: DiscordNotebookMessage[] = [];
        snapNarrativa.forEach(doc => {
          listNarrativa.push({ id: doc.id, ...doc.data() } as DiscordNotebookMessage);
        });

        // 2. Mensagens recentes de Anotações
        const qNotes = query(
          collection(db, 'discord_messages'),
          where('channelId', '==', '3-anotacoes'),
          orderBy('createdAt', 'desc'),
          limit(5)
        );
        const snapNotes = await getDocs(qNotes);
        const listNotes: DiscordNotebookMessage[] = [];
        snapNotes.forEach(doc => {
          listNotes.push({ id: doc.id, ...doc.data() } as DiscordNotebookMessage);
        });

        // 3. Mensagens recentes de Rolagens
        const qRolls = query(
          collection(db, 'discord_messages'),
          where('channelId', '==', '2-rolagens'),
          orderBy('createdAt', 'desc'),
          limit(5)
        );
        const snapRolls = await getDocs(qRolls);
        const listRolls: DiscordNotebookMessage[] = [];
        snapRolls.forEach(doc => {
          listRolls.push({ id: doc.id, ...doc.data() } as DiscordNotebookMessage);
        });

        if (isMounted) {
          setRecentNarrative(listNarrativa.reverse());
          setRecentNotes(listNotes.reverse());
          setRecentRolls(listRolls.reverse());
        }
      } catch (err) {
        console.warn('Erro ao carregar dados do resumo da campanha:', err);
      } finally {
        if (isMounted) setLoadingContent(false);
      }
    };

    fetchSummaryData();
    return () => {
      isMounted = false;
    };
  }, [campaign?.id]);

  const isOwner = campaign?.ownerEmail?.toLowerCase().trim() === currentUserProfile?.email?.toLowerCase().trim();
  const [removingEmail, setRemovingEmail] = useState<string | null>(null);
  const [deletingCharId, setDeletingCharId] = useState<string | null>(null);
  const [showEditCampaignModal, setShowEditCampaignModal] = useState(false);

  // 1. Excluir a própria ficha nesta campanha (disponível para o dono da ficha)
  const handleDeleteMyCharacter = async (charId: string, charNome: string) => {
    const confirmMsg = `Tem certeza que deseja excluir sua ficha "${charNome}" desta campanha? Esta ação é irreversível e apagará seus dados de personagem no banco de dados.`;
    if (!window.confirm(confirmMsg)) return;

    setDeletingCharId(charId);
    try {
      await deleteDoc(doc(db, 'characters', charId));
    } catch (err: any) {
      console.error("Erro ao excluir ficha:", err);
      alert("Erro ao excluir ficha: " + (err.message || 'Erro desconhecido'));
    } finally {
      setDeletingCharId(null);
    }
  };

  // 2. Remover jogador da campanha (apenas criador da campanha)
  const handleRemovePlayer = async (emailToRemove: string) => {
    if (!campaign?.id || !emailToRemove) return;
    const confirmMsg = `Tem certeza que deseja remover o jogador "${emailToRemove}" desta campanha? Ele perderá o acesso imediato a esta aventura.`;
    if (!window.confirm(confirmMsg)) return;

    setRemovingEmail(emailToRemove);
    try {
      // Remove da lista de e-mails permitidos da campanha
      await updateDoc(doc(db, 'campaigns', campaign.id), {
        allowedEmails: arrayRemove(emailToRemove.toLowerCase().trim())
      });

      // Remove do Firestore as fichas deste jogador vinculadas à campanha
      try {
        const charsRef = collection(db, 'characters');
        const snap1 = await getDocs(query(
          charsRef,
          where('campaign_id', '==', campaign.id),
          where('email_dono', '==', emailToRemove.toLowerCase().trim())
        ));
        for (const cDoc of snap1.docs) {
          await deleteDoc(doc(db, 'characters', cDoc.id));
        }

        const snap2 = await getDocs(query(
          charsRef,
          where('campaignId', '==', campaign.id),
          where('email_dono', '==', emailToRemove.toLowerCase().trim())
        ));
        for (const cDoc of snap2.docs) {
          await deleteDoc(doc(db, 'characters', cDoc.id));
        }
      } catch (errChars) {
        console.warn("Aviso ao remover fichas do jogador:", errChars);
      }
    } catch (err: any) {
      console.error("Erro ao remover jogador da campanha:", err);
      alert("Erro ao remover jogador: " + (err.message || 'Erro desconhecido'));
    } finally {
      setRemovingEmail(null);
    }
  };

  const totalMembers = campaign?.allowedEmails?.length || (campaign as any)?.membros_emails?.length || (characters.length > 0 ? characters.length : 1);
  const userCharacters = characters.filter(c => c.email_dono?.toLowerCase() === currentUserProfile?.email?.toLowerCase());

  return (
    <div className="flex-1 bg-[#0f1115] text-white p-4 sm:p-6 lg:p-8 overflow-y-auto">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* CABEÇALHO DO MÓDULO 3: RESUMO DA CAMPANHA */}
        <div className="relative overflow-hidden rounded-xl border border-blue-500/30 bg-gradient-to-r from-blue-950/60 via-[#131722] to-slate-900/80 p-6 sm:p-8 shadow-2xl">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded">
                  Módulo 3 • Resumo Oficial
                </span>
                <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-white/10 text-white/70 rounded flex items-center gap-1">
                  <Compass className="h-3 w-3 text-sky-400" />
                  {campaign?.mode === 'multi' || (campaign as any)?.tipo_jogo === 'multiplayer' ? 'Mesa Multiplayer' : 'Jornada Singleplayer'}
                </span>
              </div>
              
              <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white uppercase italic">
                {campaign?.name || (campaign as any)?.nome || 'Campanha Telumak RPG'}
              </h1>
              
              <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
                {campaign?.description || (campaign as any)?.descricao || 'Uma jornada imersiva no universo de Telumak, com regras oficiais, crônicas narrativas e destinos forjados pelos dados.'}
              </p>
            </div>

            {/* Ações Rápidas de Atalho */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 shrink-0">
              {(isOwner || isGM) && (
                <button
                  type="button"
                  onClick={() => setShowEditCampaignModal(true)}
                  className="px-4 py-2 bg-white/10 hover:bg-blue-600/30 text-sky-300 hover:text-white border border-blue-500/30 rounded-lg text-xs font-black uppercase tracking-wider transition shadow-lg flex items-center gap-1.5"
                  title="Editar Configurações da Campanha (Modo, Dificuldade, Estilo e Amigos)"
                >
                  <Sliders className="h-4 w-4" />
                  <span>Editar Campanha</span>
                </button>
              )}

              {onNavigateToTab && (
                <>
                  <button
                    type="button"
                    onClick={() => onNavigateToTab('personagens')}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-black uppercase tracking-wider transition shadow-lg flex items-center gap-1.5"
                  >
                    <Scroll className="h-4 w-4" />
                    <span>Ver Fichas</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onNavigateToTab('discord')}
                    className="px-4 py-2 bg-[#5865f2] hover:bg-[#4752c4] text-white rounded-lg text-xs font-black uppercase tracking-wider transition shadow-lg flex items-center gap-1.5"
                  >
                    <MessageSquare className="h-4 w-4" />
                    <span>Ir à Narração</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Cartões Rápidos de Métricas */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-6 pt-6 border-t border-white/10">
            <div className="bg-black/30 p-3 rounded-lg border border-white/5">
              <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                <Users className="h-3 w-3 text-sky-400" /> Heróis na Party
              </span>
              <p className="text-xl font-black text-white mt-1">{characters.length}</p>
            </div>

            <div className="bg-black/30 p-3 rounded-lg border border-white/5">
              <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                <Shield className="h-3 w-3 text-emerald-400" /> Mestre / Narrador
              </span>
              <p className="text-xs font-bold text-emerald-300 mt-1 truncate" title={campaign?.ownerEmail || (campaign as any)?.dono_email || 'Narrador IA'}>
                {campaign?.ownerEmail ? campaign.ownerEmail.split('@')[0] : (campaign as any)?.dono_email ? (campaign as any).dono_email.split('@')[0] : 'Narrador IA'}
              </p>
            </div>

            <div className="bg-black/30 p-3 rounded-lg border border-white/5">
              <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                <Clock className="h-3 w-3 text-amber-400" /> Sistema Ativo
              </span>
              <p className="text-xs font-black text-amber-300 mt-1">Telumak Puro</p>
            </div>

            <div className="bg-black/30 p-3 rounded-lg border border-white/5">
              <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                <Dices className="h-3 w-3 text-purple-400" /> Status da Sessão
              </span>
              <p className="text-xs font-black text-purple-300 mt-1">Em Andamento</p>
            </div>
          </div>
        </div>

        {/* SEÇÃO 1: HERÓIS DA CAMPANHA (FICHAS) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black uppercase tracking-wider text-white flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-400" />
              <span>Aventureiros da Campanha ({characters.length})</span>
            </h2>
            <span className="text-xs text-slate-400">
              Clique em um personagem para inspecionar os detalhes
            </span>
          </div>

          {characters.length === 0 ? (
            <div className="bg-[#14171f] p-8 rounded-xl border border-white/10 text-center space-y-3">
              <Scroll className="h-10 w-10 text-white/30 mx-auto" />
              <h3 className="text-sm font-bold text-white">Nenhum herói criado nesta campanha</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Crie o primeiro personagem no Módulo 1: Criação e Ficha de Personagem para iniciar as crônicas.
              </p>
              {onNavigateToTab && (
                <button
                  type="button"
                  onClick={() => onNavigateToTab('personagens')}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded shadow transition"
                >
                  Criar Personagem Agora
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {characters.map((char) => {
                const isMine = char.email_dono?.toLowerCase() === currentUserProfile?.email?.toLowerCase();
                const isPartyVisible = char.visivel_party !== false;

                return (
                  <div
                    key={char.id}
                    onClick={() => onSelectCharacter && onSelectCharacter(char)}
                    className="bg-[#14171f] hover:bg-[#1a1f2c] border border-white/10 hover:border-blue-500/50 rounded-xl p-4 transition-all duration-200 cursor-pointer shadow-lg group relative overflow-hidden"
                  >
                    <div className="flex items-start gap-3.5">
                      {/* Avatar */}
                      <div className="w-14 h-14 rounded-lg bg-black/60 border border-white/10 overflow-hidden shrink-0 flex items-center justify-center relative">
                        {char.foto_url || char.avatarUrl || char.img_saudavel ? (
                          <img 
                            src={char.foto_url || char.avatarUrl || char.img_saudavel} 
                            alt={char.nome} 
                            className="w-full h-full object-cover group-hover:scale-105 transition" 
                          />
                        ) : (
                          <span className="text-xl font-black text-blue-400">
                            {char.nome ? char.nome.charAt(0).toUpperCase() : '?'}
                          </span>
                        )}
                        <span className="absolute bottom-0 right-0 bg-blue-600 text-white text-[9px] font-black px-1 rounded-tl">
                          Nv.{char.nivel || 1}
                        </span>
                      </div>

                      {/* Info Básica */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <h3 className="text-sm font-black text-white truncate group-hover:text-blue-300 transition">
                            {char.nome}
                          </h3>
                          <div className="flex items-center gap-1">
                            {isMine && (
                              <div className="flex items-center gap-1">
                                <span className="text-[9px] font-black uppercase px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 rounded border border-emerald-500/30">
                                  Seu
                                </span>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteMyCharacter(char.id, char.nome);
                                  }}
                                  disabled={deletingCharId === char.id}
                                  className="p-1 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded transition"
                                  title="Excluir minha ficha desta campanha"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </div>
                            )}
                            {isOwner && char.email_dono && char.email_dono.toLowerCase().trim() !== currentUserProfile?.email?.toLowerCase().trim() && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemovePlayer(char.email_dono!);
                                }}
                                className="p-1 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded transition"
                                title={`Remover jogador (${char.email_dono}) da campanha`}
                              >
                                <UserMinus className="h-3 w-3" />
                              </button>
                            )}
                          </div>
                        </div>

                        <p className="text-xs text-slate-400 truncate">
                          {char.cla || 'Sem clã'} • {char.ocupacao || 'Aventureiro'}
                        </p>

                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] text-slate-400">XP: <strong className="text-white">{char.xp || 0}</strong></span>
                          <span className="text-white/20">•</span>
                          <span className={`text-[10px] flex items-center gap-1 ${isPartyVisible ? 'text-sky-300' : 'text-slate-500'}`}>
                            <Eye className="h-2.5 w-2.5" />
                            {isPartyVisible ? 'Party' : 'Privado'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Barras de Recursos Oficiais Telumak */}
                    <div className="mt-3 pt-3 border-t border-white/5 grid grid-cols-3 gap-2 text-center">
                      <div className="bg-rose-950/30 border border-rose-500/20 rounded p-1">
                        <span className="text-[9px] uppercase font-bold text-rose-400 block">Saúde</span>
                        <span className="text-xs font-black text-white">
                          {char.hp_atual ?? 2}/{char.hp_max ?? 2}
                        </span>
                      </div>

                      <div className="bg-sky-950/30 border border-sky-500/20 rounded p-1">
                        <span className="text-[9px] uppercase font-bold text-sky-400 block">Energia</span>
                        <span className="text-xs font-black text-white">
                          {char.ether_atual ?? 1}/{char.ether_max ?? 1}
                        </span>
                      </div>

                      <div className="bg-purple-950/30 border border-purple-500/20 rounded p-1">
                        <span className="text-[9px] uppercase font-bold text-purple-400 block">Destino</span>
                        <span className="text-xs font-black text-white">
                          {char.destino_atual ?? 1}/{char.destino_max ?? 1}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* SEÇÃO: JOGADORES VINCULADOS À CAMPANHA & GESTÃO DO CRIADOR */}
        <div className="bg-[#14171f] rounded-xl border border-white/10 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
              <Users className="h-4 w-4 text-emerald-400" />
              <span>Jogadores Vinculados à Campanha ({(campaign?.allowedEmails || []).length})</span>
            </h3>
            {isOwner && (
              <span className="text-[10px] text-amber-300 font-bold uppercase tracking-wider bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 flex items-center gap-1">
                <Crown className="h-3 w-3 text-amber-400" />
                Painel do Criador da Campanha
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {(campaign?.allowedEmails || []).map((email, idx) => {
              const isCampaignCreator = email.toLowerCase().trim() === campaign?.ownerEmail?.toLowerCase().trim();
              const isCurrentUser = email.toLowerCase().trim() === currentUserProfile?.email?.toLowerCase().trim();

              return (
                <div
                  key={idx}
                  className="bg-black/40 border border-white/5 p-3 rounded-lg flex items-center justify-between gap-2"
                >
                  <div className="min-w-0 flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-blue-950/60 border border-blue-500/30 flex items-center justify-center text-xs font-bold text-sky-300 shrink-0">
                      {email.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-white truncate" title={email}>
                        {email}
                      </p>
                      <span className="text-[9px] font-mono block text-slate-400">
                        {isCampaignCreator ? '👑 Criador / Mestre' : isCurrentUser ? 'Você' : 'Jogador Convidado'}
                      </span>
                    </div>
                  </div>

                  {/* Botão de Remover Jogador (Apenas para o criador da campanha) */}
                  {isOwner && !isCampaignCreator && (
                    <button
                      type="button"
                      onClick={() => handleRemovePlayer(email)}
                      disabled={removingEmail === email}
                      className="p-1.5 bg-rose-950/30 hover:bg-rose-900/50 text-rose-300 border border-rose-500/30 rounded transition shrink-0"
                      title={`Remover ${email} da campanha`}
                    >
                      <UserMinus className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* SEÇÃO 2: CRÔNICAS & REGISTROS DA CAMPANHA (DIÁRIO DOS 3 CANAIS) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
          
          {/* Coluna 1: Últimos Acontecimentos de Narrativa (Canal 1 Narrativa) */}
          <div className="bg-[#14171f] rounded-xl border border-white/10 p-5 space-y-4 flex flex-col">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-sky-400" />
                <span>1 Narrativa Recente</span>
              </h3>
              <span className="text-[10px] text-slate-400 font-mono">Trama</span>
            </div>

            <div className="flex-1 space-y-3 overflow-hidden">
              {recentNarrative.length === 0 ? (
                <p className="text-xs text-slate-500 italic py-4 text-center">
                  Nenhum acontecimento narrado ainda. Acesse o canal 1 Narrativa para iniciar a história.
                </p>
              ) : (
                recentNarrative.map((msg) => (
                  <div key={msg.id} className="bg-black/30 p-2.5 rounded-lg border border-white/5 space-y-1 text-xs">
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <strong className="text-sky-300">{msg.authorName || 'Narrador'}</strong>
                      <span>{msg.createdAt?.toDate ? msg.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                    </div>
                    <p className="text-slate-300 line-clamp-3 whitespace-pre-wrap leading-relaxed">
                      {msg.content}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Coluna 2: Testes e Rolagens Recentes (Canal 2 Rolagens) */}
          <div className="bg-[#14171f] rounded-xl border border-white/10 p-5 space-y-4 flex flex-col">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
                <Dices className="h-4 w-4 text-amber-400" />
                <span>2 Rolagens de Dados</span>
              </h3>
              <span className="text-[10px] text-amber-300 font-mono">Script</span>
            </div>

            <div className="flex-1 space-y-3 overflow-hidden">
              {recentRolls.length === 0 ? (
                <p className="text-xs text-slate-500 italic py-4 text-center">
                  Nenhum teste de dados rolado ainda. O script do rolador é exclusivo do canal 2 Rolagens.
                </p>
              ) : (
                recentRolls.map((msg) => (
                  <div key={msg.id} className="bg-amber-950/20 p-2.5 rounded-lg border border-amber-500/20 space-y-1 text-xs">
                    <div className="flex items-center justify-between text-[10px] text-amber-400">
                      <strong>{msg.authorName || 'Jogador'}</strong>
                      <span>{msg.createdAt?.toDate ? msg.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                    </div>
                    <div className="text-slate-200 line-clamp-3 font-mono text-[11px] whitespace-pre-wrap">
                      {msg.content}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Coluna 3: Anotações da Campanha (Canal 3 Anotações) */}
          <div className="bg-[#14171f] rounded-xl border border-white/10 p-5 space-y-4 flex flex-col">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
                <FileText className="h-4 w-4 text-emerald-400" />
                <span>3 Anotações & Pistas</span>
              </h3>
              <span className="text-[10px] text-emerald-300 font-mono">Diário</span>
            </div>

            <div className="flex-1 space-y-3 overflow-hidden">
              {recentNotes.length === 0 ? (
                <p className="text-xs text-slate-500 italic py-4 text-center">
                  Nenhuma anotação registrada ainda. Use o canal 3 Anotações para salvar pistas e inventário.
                </p>
              ) : (
                recentNotes.map((msg) => (
                  <div key={msg.id} className="bg-emerald-950/20 p-2.5 rounded-lg border border-emerald-500/20 space-y-1 text-xs">
                    <div className="flex items-center justify-between text-[10px] text-emerald-400">
                      <strong>{msg.authorName || 'Anotação'}</strong>
                      <span>{msg.createdAt?.toDate ? msg.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                    </div>
                    <p className="text-slate-300 line-clamp-3 whitespace-pre-wrap leading-relaxed">
                      {msg.content}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>

      {/* MODAL: EDITAR CAMPANHA */}
      <EditCampaignModal
        isOpen={showEditCampaignModal}
        onClose={() => setShowEditCampaignModal(false)}
        campaign={campaign as any}
      />
    </div>
  );
}
