
import React, { useState } from 'react';
import { AppState, Participant } from './types';
import { DAILY_TIMER, LEADER_TIMER, NEXT_STEPS_TIMER } from './constants';
import Timer from './components/Timer';

const App: React.FC = () => {
  const [currentState, setCurrentState] = useState<AppState>(AppState.SETUP);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [newName, setNewName] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentRating, setCurrentRating] = useState<number | null>(null);

  // Added 'extends object' constraint to generic T to allow spreading elements of the returned array
  const shuffle = <T extends object>(array: T[]): T[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  const addParticipant = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (newName.trim()) {
      setParticipants([...participants, { id: crypto.randomUUID(), name: newName.trim() }]);
      setNewName('');
    }
  };

  const removeParticipant = (id: string) => {
    setParticipants(participants.filter(p => p.id !== id));
  };

  const startDaily = () => {
    if (participants.length < 2) return;
    // Explicitly typed p as Participant to ensure object spread is valid during the map operation
    setParticipants(shuffle(participants).map((p: Participant) => ({ ...p, rating: undefined })));
    setCurrentIndex(0);
    setCurrentState(AppState.DAILY);
  };

  const nextTurn = () => {
    if (currentIndex < participants.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentState(AppState.LEADER_RECAP);
    }
  };

  const finishLeader = () => {
    setCurrentIndex(0);
    setCurrentRating(null);
    setCurrentState(AppState.NEXT_STEPS);
  };

  const nextStepTurn = () => {
    if (currentRating === null) return;

    const updatedParticipants = [...participants];
    updatedParticipants[currentIndex].rating = currentRating;
    setParticipants(updatedParticipants);

    if (currentIndex < participants.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setCurrentRating(null);
    } else {
      setCurrentState(AppState.FINISHED);
    }
  };

  const calculateAverageRating = () => {
    const total = participants.reduce((acc, p) => acc + (p.rating || 0), 0);
    return (total / participants.length).toFixed(1);
  };

  const resetAll = (clearNames: boolean = false) => {
    if (clearNames) setParticipants([]);
    setCurrentIndex(0);
    setCurrentRating(null);
    setCurrentState(AppState.SETUP);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center py-12 px-4 sm:px-6">
      <div className="max-w-3xl w-full">
        
        {/* Header Section */}
        <header className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-brand text-white rounded-xl shadow-lg mb-4">
            <i className="fas fa-chart-line text-xl"></i>
          </div>
          <h1 className="text-3xl font-black text-black tracking-tight uppercase">Daily Stand-up <span className="text-brand">Master</span></h1>
          <p className="mt-1 text-slate-500 font-medium">Panel de Control Comercial</p>
        </header>

        {/* Main Interface */}
        <main className="bg-white rounded-[2rem] shadow-2xl shadow-slate-200 p-8 md:p-12 border border-slate-100 relative overflow-hidden">
          
          {/* Progress Bar (Decoration) */}
          <div className="absolute top-0 left-0 w-full h-1.5 bg-slate-50">
            <div 
              className="h-full bg-brand transition-all duration-500" 
              style={{ width: `${(currentState === AppState.SETUP ? 0 : currentState === AppState.FINISHED ? 100 : 50)}%` }}
            ></div>
          </div>

          {currentState === AppState.SETUP && (
            <section className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="text-center">
                <h2 className="text-xl font-bold text-black uppercase tracking-wide">Registro de Participantes</h2>
                <p className="text-slate-400 mt-1 text-sm">Equipo Comercial listo para el éxito</p>
              </div>

              <form onSubmit={addParticipant} className="flex gap-2">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Nombre..."
                  className="flex-1 px-5 py-4 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-brand transition-all font-medium"
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={!newName.trim()}
                  className="bg-black text-white px-8 py-4 rounded-xl font-bold hover:bg-brand transition-all disabled:opacity-30 shadow-lg active:scale-95"
                >
                  <i className="fas fa-plus"></i>
                </button>
              </form>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                {participants.length === 0 ? (
                  <div className="text-center py-10 border-2 border-dashed border-slate-100 rounded-2xl">
                    <p className="text-slate-300 font-medium italic">Lista vacía</p>
                  </div>
                ) : (
                  participants.map((p) => (
                    <div key={p.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl group hover:bg-white hover:shadow-md border border-transparent hover:border-brand/10 transition-all">
                      <span className="font-bold text-black">{p.name}</span>
                      <button
                        onClick={() => removeParticipant(p.id)}
                        className="text-slate-300 hover:text-red-500 transition-colors"
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    </div>
                  ))
                )}
              </div>

              <button
                onClick={startDaily}
                disabled={participants.length < 2}
                className="w-full bg-brand text-white py-5 rounded-2xl font-black text-lg hover:bg-brand-dark disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xl shadow-brand/20 uppercase tracking-widest active:scale-[0.98]"
              >
                Comenzar Sesión <i className="fas fa-bolt ml-2"></i>
              </button>
            </section>
          )}

          {currentState === AppState.DAILY && (
            <section className="text-center space-y-8 animate-in zoom-in-95">
              <div className="space-y-2">
                <span className="inline-block px-3 py-1 bg-brand/10 text-brand rounded-lg text-[10px] font-black uppercase tracking-widest">
                  Fase 1: Reporte Individual • {currentIndex + 1}/{participants.length}
                </span>
                <h2 className="text-5xl font-black text-black break-words leading-tight">{participants[currentIndex].name}</h2>
              </div>

              <div className="grid grid-cols-1 gap-3 text-left">
                {[
                  '¿Qué lograste cerrar ayer?',
                  '¿Cuál es tu objetivo de ventas hoy?',
                  '¿Tienes algún bloqueo en el funnel?'
                ].map((text, idx) => (
                  <div key={idx} className="p-4 bg-slate-50 rounded-xl flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-brand font-black text-xs">{idx + 1}</div>
                    <p className="text-sm font-bold text-slate-700">{text}</p>
                  </div>
                ))}
              </div>

              <Timer 
                config={DAILY_TIMER} 
                resetTrigger={currentIndex}
              />

              <button
                onClick={nextTurn}
                className="w-full bg-black text-white py-6 rounded-2xl font-black text-xl hover:bg-brand shadow-2xl transition-all active:scale-[0.98] uppercase"
              >
                SIGUIENTE TURNO <i className="fas fa-arrow-right ml-2"></i>
              </button>
            </section>
          )}

          {currentState === AppState.LEADER_RECAP && (
            <section className="text-center space-y-8 animate-in slide-in-from-right">
              <div className="space-y-4">
                <div className="w-20 h-20 bg-black text-white rounded-3xl flex items-center justify-center text-3xl mx-auto shadow-2xl rotate-3">
                  <i className="fas fa-crown text-brand"></i>
                </div>
                <h2 className="text-4xl font-black text-black uppercase tracking-tight">Leonardo <span className="text-brand">Recap</span></h2>
                <p className="text-slate-500 font-medium px-8">Visión general de Leonardo para desbloquear al equipo.</p>
              </div>

              <div className="p-5 bg-brand/5 border border-brand/20 rounded-2xl text-brand-dark font-bold text-sm italic">
                "Si los bloqueos persisten, Leonardo agendará un Follow-up inmediato."
              </div>

              <Timer config={LEADER_TIMER} />

              <button
                onClick={finishLeader}
                className="w-full bg-brand text-white py-6 rounded-2xl font-black text-xl hover:bg-brand-dark shadow-xl transition-all active:scale-[0.98] uppercase"
              >
                CERRAR RECAP <i className="fas fa-check-circle ml-2"></i>
              </button>
            </section>
          )}

          {currentState === AppState.NEXT_STEPS && (
            <section className="text-center space-y-8 animate-in slide-in-from-bottom-8">
              <div className="space-y-2">
                <span className="text-brand font-black text-xs uppercase tracking-widest">Compromisos y Feedback</span>
                <h2 className="text-3xl font-black text-black">{participants[currentIndex].name}</h2>
              </div>

              <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 space-y-6">
                <p className="text-sm font-black text-black uppercase tracking-wide">Califica la reunión (1-10)</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                    <button
                      key={num}
                      onClick={() => setCurrentRating(num)}
                      className={`w-10 h-10 rounded-full font-bold transition-all border-2 ${
                        currentRating === num 
                        ? 'bg-brand border-brand text-white scale-110' 
                        : 'bg-white border-slate-200 text-slate-400 hover:border-brand/30 hover:text-brand'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              <Timer config={NEXT_STEPS_TIMER} resetTrigger={currentIndex} />

              <button
                onClick={nextStepTurn}
                disabled={currentRating === null}
                className="w-full bg-black text-white py-6 rounded-2xl font-black text-xl hover:bg-brand disabled:opacity-20 transition-all shadow-xl uppercase active:scale-[0.98]"
              >
                {currentIndex < participants.length - 1 ? 'GUARDAR Y SIGUIENTE' : 'VER RESULTADOS FINAL'}
              </button>
            </section>
          )}

          {currentState === AppState.FINISHED && (
            <section className="text-center space-y-8 animate-in zoom-in duration-700">
              <div className="relative">
                <div className="text-[120px] font-black text-slate-50 absolute inset-0 -top-10 select-none">DAILY</div>
                <h2 className="text-5xl font-black text-black relative z-10">COMPLETADA</h2>
              </div>

              <div className="bg-brand text-white p-8 rounded-[2rem] shadow-2xl shadow-brand/20 transform -rotate-1">
                <p className="text-brand-light font-black uppercase text-xs tracking-[0.2em] mb-2">Score de Satisfacción</p>
                <div className="text-7xl font-black">{calculateAverageRating()}</div>
                <p className="mt-2 font-bold text-sm">Promedio del Equipo Comercial</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => resetAll(false)}
                  className="bg-slate-50 text-black py-4 rounded-2xl font-black hover:bg-slate-100 transition-all border border-slate-200"
                >
                  NUEVA VUELTA
                </button>
                <button
                  onClick={() => resetAll(true)}
                  className="bg-black text-white py-4 rounded-2xl font-black hover:bg-brand transition-all shadow-lg"
                >
                  NUEVA SESIÓN
                </button>
              </div>
            </section>
          )}

        </main>

        <footer className="mt-8 text-center">
           <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Propiedad de Leonardo & Co • 2024</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
