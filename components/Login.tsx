
import React, { useState } from 'react';
import { supabase } from '../services/supabase';

interface LoginProps {
    onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSignUp, setIsSignUp] = useState(false);
    const [name, setName] = useState('');

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isSignUp) {
                const { error: signUpError } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: { name }
                    }
                });
                if (signUpError) throw signUpError;
                alert('Cadastro realizado! Verifique seu e-mail (se habilitado) ou faça login.');
                setIsSignUp(false);
            } else {
                const { error: signInError } = await supabase.auth.signInWithPassword({
                    email,
                    password
                });
                if (signInError) throw signInError;
                onLogin();
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--bg-main)] p-4 relative overflow-hidden">
            {/* Background Accents */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-600/10 rounded-full blur-[120px]" />

            <div className="bg-white/70 backdrop-blur-2xl p-8 md:p-12 rounded-3xl md:rounded-[2.5rem] border border-white shadow-2xl w-full max-w-md relative z-10 animate-in zoom-in-95 duration-500">
                <div className="text-center mb-8 md:mb-12">
                    <div className="inline-block px-4 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full mb-4 md:mb-6">
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400">Plataforma Pessoal</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter mb-2">
                        SINCRO
                    </h1>
                    <div className="h-1 w-12 bg-indigo-600 mx-auto rounded-full" />
                    <p className="text-slate-500 font-bold mt-4 md:mt-6 uppercase text-[10px] tracking-widest">{isSignUp ? 'Criar Novo Acesso' : 'Controle Governamental'}</p>
                </div>

                <form onSubmit={handleAuth} className="space-y-6">
                    {isSignUp && (
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nome Completo</label>
                            <input
                                required
                                type="text"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                className="w-full px-6 py-4 rounded-2xl bg-white/50 border border-slate-200 text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold placeholder:text-slate-400"
                                placeholder="Seu nome"
                            />
                        </div>
                    )}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Endereço de E-mail</label>
                        <input
                            required
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            className="w-full px-6 py-4 rounded-2xl bg-slate-950/50 border border-slate-800 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold placeholder:text-slate-700"
                            placeholder="exemplo@sincro.com"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Chave de Acesso</label>
                        <input
                            required
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            className="w-full px-6 py-4 rounded-2xl bg-slate-950/50 border border-slate-800 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold placeholder:text-slate-700"
                            placeholder="••••••••"
                        />
                    </div>

                    {error && (
                        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl">
                            <p className="text-rose-400 text-xs font-bold text-center uppercase tracking-tight">{error}</p>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl shadow-[0_0_30px_rgba(99,102,241,0.3)] transition-all disabled:opacity-50 active:scale-95 text-sm uppercase tracking-widest"
                    >
                        {loading ? 'Autenticando...' : (isSignUp ? 'Finalizar Cadastro' : 'Acessar Workspace')}
                    </button>
                </form>

                <button
                    onClick={() => setIsSignUp(!isSignUp)}
                    className="w-full mt-10 text-slate-500 text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors"
                >
                    {isSignUp ? 'Já possui uma conta? Voltar' : 'Solicitar acesso à plataforma'}
                </button>
            </div>
        </div>
    );
};

export default Login;
