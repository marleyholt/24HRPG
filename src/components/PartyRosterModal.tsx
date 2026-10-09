import React from 'react';
import { Character } from '../types';
import { X, Users, BookOpen, Shield, Heart, Zap, Star } from 'lucide-react';

interface PartyRosterModalProps {
  isOpen: boolean;
  onClose: () => void;
  characters: Character[];
  currentSelectedId: string | null;
  onSelectCharacter: (charId: string) => void;
}

export function PartyRosterModal({
  isOpen,
  onClose,
  characters,
  currentSelectedId,
  onSelectCharacter
}: PartyRosterModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#080808] border border-blue-500/40 w-full max-w-5xl rounded-xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] animate-in fade-in">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-[#0d0f14] border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600/20 border border-blue-500/30 text-sky-400 rounded-lg">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-black uppercase tracking-wider text-white flex items-center gap-2">
                <span>Rolo de Fotos da Party</span>
                <span className="text-xs font-mono font-normal text-sky-400">({characters.length} heróis)</span>
              </h2>
              <p className="text-xs text-white/50">
                Companheiros de campanha que compartilharam a visualização de suas fichas com o grupo.
              </p>
            </div>
          </div>
          
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition"
            title="Fechar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Photos Reel Container (Rolo de Fotos com rolagem horizontal e fotos verticais) */}
        <div className="flex-1 p-6 overflow-x-auto overflow-y-hidden custom-scroll flex items-center gap-5">
          {characters.length === 0 ? (
            <div className="w-full py-16 text-center space-y-2">
              <Users className="h-10 w-10 text-white/20 mx-auto" />
              <p className="text-sm font-bold text-white/60 uppercase">Nenhum aliado visível na party ainda</p>
              <p className="text-xs text-white/40 max-w-md mx-auto">
                Seus companheiros podem marcar a opção "Visível para Party" em suas fichas para aparecerem aqui no rolo de aliados.
              </p>
            </div>
          ) : (
            characters.map((char) => {
              const isSelected = char.id === currentSelectedId;
              const avatar = char.img_saudavel || 'https://via.placeholder.com/300x500?text=Sem+Foto';
              const hpMax = char.hp_max && char.hp_max <= 20 ? char.hp_max : (2 + Math.floor((char.fisico || 10) / 10));
              const etherMax = char.ether_max && char.ether_max <= 20 ? char.ether_max : (1 + Math.floor((char.carisma || 10) / 10));
              const destinoMax = char.destino_max && char.destino_max <= 20 ? char.destino_max : (1 + Math.floor((char.primordio || 10) / 10));

              return (
                <div
                  key={char.id}
                  onClick={() => {
                    onSelectCharacter(char.id);
                    onClose();
                  }}
                  className={`w-64 shrink-0 bg-[#0e1017] border rounded-lg overflow-hidden transition-all duration-300 group cursor-pointer flex flex-col justify-between hover:scale-[1.02] shadow-xl ${
                    isSelected
                      ? 'border-blue-500 shadow-blue-500/20 ring-2 ring-blue-500/50'
                      : 'border-white/10 hover:border-blue-500/40'
                  }`}
                >
                  {/* Portrait Art */}
                  <div className="relative aspect-[9/13] bg-black overflow-hidden">
                    <img
                      src={avatar}
                      alt={char.nome}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent pointer-events-none" />
                    
                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                      <span className="px-2 py-0.5 bg-blue-600 text-white font-mono font-black text-[10px] uppercase shadow">
                        Nível {Math.max(1, char.nivel || 1)}
                      </span>
                    </div>

                    <div className="absolute bottom-2.5 left-2.5 right-2.5">
                      <h3 className="text-sm font-black uppercase text-white truncate drop-shadow">
                        {char.nome}
                      </h3>
                      {char.cla && (
                        <p className="text-[10px] text-sky-300 font-mono uppercase truncate drop-shadow">
                          {char.cla}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Vitals Summary Card */}
                  <div className="p-3.5 space-y-2 bg-[#0a0c10] border-t border-white/5">
                    <div className="grid grid-cols-3 gap-1.5 text-center text-[10px] font-mono">
                      <div className="p-1.5 bg-red-950/30 border border-red-500/20 rounded">
                        <span className="text-[8px] text-red-400 block uppercase font-bold flex items-center justify-center gap-0.5">
                          <Heart className="h-2.5 w-2.5 fill-red-400" />
                          HP
                        </span>
                        <span className="font-bold text-white">
                          {char.hp_atual ?? hpMax}/{hpMax}
                        </span>
                      </div>
                      
                      <div className="p-1.5 bg-blue-950/30 border border-blue-500/20 rounded">
                        <span className="text-[8px] text-blue-400 block uppercase font-bold flex items-center justify-center gap-0.5">
                          <Zap className="h-2.5 w-2.5 fill-blue-400" />
                          Éter
                        </span>
                        <span className="font-bold text-white">
                          {char.ether_atual ?? etherMax}/{etherMax}
                        </span>
                      </div>

                      <div className="p-1.5 bg-yellow-950/30 border border-yellow-500/20 rounded">
                        <span className="text-[8px] text-yellow-400 block uppercase font-bold flex items-center justify-center gap-0.5">
                          <Star className="h-2.5 w-2.5 fill-yellow-400" />
                          Destino
                        </span>
                        <span className="font-bold text-white">
                          {char.destino_atual ?? destinoMax}/{destinoMax}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      className={`w-full py-2 px-3 text-xs font-black uppercase tracking-wider rounded transition flex items-center justify-center gap-1.5 shadow ${
                        isSelected
                          ? 'bg-blue-600 text-white'
                          : 'bg-white/5 hover:bg-blue-600 hover:text-white text-white/70'
                      }`}
                    >
                      <BookOpen className="h-3.5 w-3.5" />
                      <span>{isSelected ? 'Ficha Aberta' : 'Abrir Ficha'}</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-[#0a0c10] border-t border-white/5 flex items-center justify-between text-xs text-white/40 font-mono">
          <span>Role horizontalmente para ver todos os companheiros de equipe</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-white/5 hover:bg-white/10 text-white font-bold rounded uppercase text-[11px] transition"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
}
