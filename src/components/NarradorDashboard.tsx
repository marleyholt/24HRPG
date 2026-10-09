import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, getDoc, setDoc, collection, getDocs, addDoc, deleteDoc } from 'firebase/firestore';
import { Save, Book, MessageSquare, Settings, Plus, Trash2 } from 'lucide-react';

interface NarradorDashboardProps {
  campaignId: string;
}

export function NarradorDashboard({ campaignId }: NarradorDashboardProps) {
  const [activeTab, setActiveTab] = useState<'prompt' | 'knowledge'>('prompt');
  const [narratorPrompt, setNarratorPrompt] = useState('');
  const [automationJson, setAutomationJson] = useState('');

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const configDoc = await getDoc(doc(db, 'campaigns', campaignId, 'config', 'narrator'));
      if (configDoc.exists()) {
        setNarratorPrompt(configDoc.data().prompt || '');
        setAutomationJson(JSON.stringify(configDoc.data().automation || {}, null, 2));
      }
      setLoading(false);
    };
    loadData();
  }, [campaignId]);

  const saveConfig = async () => {
    try {
      const automation = JSON.parse(automationJson);
      await setDoc(doc(db, 'campaigns', campaignId, 'config', 'narrator'), { 
        prompt: narratorPrompt,
        automation 
      }, { merge: true });
      alert('Configurações salvas!');
    } catch (e) {
      alert('Erro ao salvar: JSON de automação inválido');
    }
  };

  return (
    <div className="bg-[#0f0f0f] border border-white/10 p-6 rounded-lg space-y-6">
      <h2 className="text-xl font-black text-white uppercase">Narrador Dashboard</h2>
      <div className="flex gap-4 border-b border-white/10 pb-4">
        <button onClick={() => setActiveTab('prompt')} className={`px-4 py-2 ${activeTab === 'prompt' ? 'bg-blue-600' : 'bg-white/5'}`}>Prompt do Narrador</button>
        <button onClick={() => setActiveTab('knowledge')} className={`px-4 py-2 ${activeTab === 'knowledge' ? 'bg-blue-600' : 'bg-white/5'}`}>Base de Conhecimento</button>
      </div>

      {activeTab === 'prompt' && (
        <div className="space-y-4">
          <label className="block text-xs font-bold text-sky-300">Prompt do Sistema (Agente GM)</label>
          <textarea 
            className="w-full h-64 bg-black p-4 text-sm border border-white/10"
            value={narratorPrompt}
            onChange={(e) => setNarratorPrompt(e.target.value)}
          />
          <label className="block text-xs font-bold text-sky-300">JSON de Automação (Tarefas)</label>
          <textarea 
            className="w-full h-48 bg-black p-4 text-sm font-mono border border-white/10"
            value={automationJson}
            onChange={(e) => setAutomationJson(e.target.value)}
          />
          <button onClick={saveConfig} className="flex items-center gap-2 bg-blue-600 px-4 py-2 rounded font-bold text-xs"><Save className="w-4 h-4"/> Salvar Configurações</button>
        </div>
      )}

      {activeTab === 'knowledge' && (
        <div>Base de conhecimento... (implementar CRUD posteriormente)</div>
      )}
    </div>
  );
}
