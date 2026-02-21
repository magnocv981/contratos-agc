import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

interface LoginProps {
    onLogin: () => void;
    initialMode?: Mode;
}

type Mode = 'login' | 'recovery' | 'update_password';

const Login: React.FC<LoginProps> = ({ onLogin, initialMode = 'login' }) => {
    const [mode, setMode] = useState<Mode>(initialMode);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    useEffect(() => {
        // Backup: Detectar se estamos voltando de um email de recuperação localmente
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'PASSWORD_RECOVERY') {
                setMode('update_password');
            }
        });

        // Caso o initialMode tenha mudado lá em cima, forçamos o efeito local
        if (initialMode === 'update_password') {
            setMode('update_password');
        }

        return () => subscription.unsubscribe();
    }, [initialMode]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
            if (signInError) throw signInError;
            onLogin();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const [recoveryCooldown, setRecoveryCooldown] = useState(0);

    const handleRecovery = async (e: React.FormEvent) => {
        e.preventDefault();
        if (recoveryCooldown > 0) return;

        setLoading(true);
        setError(null);
        setSuccessMsg(null);

        try {
            const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: window.location.origin
            });
            if (resetError) throw resetError;
            setSuccessMsg('E-mail de recuperação enviado! Verifique sua caixa de entrada.');
            setRecoveryCooldown(60); // 60 seconds cooldown
            const timer = setInterval(() => {
                setRecoveryCooldown(prev => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } catch (err: any) {
            if (err.status === 429) {
                setError('Muitas solicitações. Aguarde um momento antes de tentar novamente.');
            } else {
                setError(err.message);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError('As senhas não coincidem.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const { error: updateError } = await supabase.auth.updateUser({ password });
            if (updateError) throw updateError;
            setSuccessMsg('Senha atualizada com sucesso! Você já pode acessar.');
            setTimeout(() => {
                onLogin(); // Notifica o App que o processo terminou e libera a tela
            }, 3000);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const switchMode = (newMode: Mode) => {
        setMode(newMode);
        setError(null);
        setSuccessMsg(null);
        setPassword('');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--bg-main)] p-4 relative overflow-hidden">
            {/* Background Accents */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-600/10 rounded-full blur-[120px]" />

            <div className="bg-white/70 backdrop-blur-2xl p-8 md:p-12 rounded-3xl md:rounded-[2.5rem] border border-white shadow-2xl w-full max-w-md relative z-10 animate-in zoom-in-95 duration-500">
                <div className="text-center mb-8 md:mb-12">
                    <div className="inline-block px-4 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full mb-4 md:mb-6">
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400">
                            {mode === 'login' ? 'Plataforma Corporativa' : mode === 'recovery' ? 'Recuperação de Acesso' : 'Nova Credencial'}
                        </span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter mb-2">
                        SINCRO
                    </h1>
                    <div className="h-1 w-12 bg-indigo-600 mx-auto rounded-full" />
                    <p className="text-slate-500 font-bold mt-4 md:mt-6 uppercase text-[10px] tracking-widest">
                        {mode === 'login' ? 'Controle Governamental' : mode === 'recovery' ? 'Insira seu e-mail cadastrado' : 'Defina sua nova chave de acesso'}
                    </p>
                </div>

                {/* LOGIN FORM */}
                {mode === 'login' && (
                    <form onSubmit={handleLogin} className="space-y-6">
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
                            <div className="flex justify-between items-center ml-1">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Chave de Acesso</label>
                                <button
                                    type="button"
                                    onClick={() => switchMode('recovery')}
                                    className="text-[10px] font-black text-indigo-500 hover:text-indigo-700 uppercase tracking-widest transition-colors"
                                >
                                    Esqueci a senha
                                </button>
                            </div>
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
                            {loading ? 'Autenticando...' : 'Acessar Workspace'}
                        </button>
                    </form>
                )}

                {/* RECOVERY FORM */}
                {mode === 'recovery' && (
                    <form onSubmit={handleRecovery} className="space-y-6">
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

                        {error && (
                            <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl">
                                <p className="text-rose-400 text-xs font-bold text-center uppercase tracking-tight">{error}</p>
                            </div>
                        )}

                        {successMsg && (
                            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                                <p className="text-emerald-500 text-xs font-bold text-center tracking-tight">{successMsg}</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading || recoveryCooldown > 0}
                            className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl shadow-[0_0_30px_rgba(99,102,241,0.3)] transition-all disabled:opacity-50 active:scale-95 text-sm uppercase tracking-widest"
                        >
                            {loading ? 'Enviando...' : recoveryCooldown > 0 ? `Aguarde ${recoveryCooldown}s` : 'Enviar Link de Recuperação'}
                        </button>

                        <button
                            type="button"
                            onClick={() => switchMode('login')}
                            className="w-full text-slate-500 text-[10px] font-black uppercase tracking-widest hover:text-slate-900 transition-colors"
                        >
                            ← Voltar ao login
                        </button>
                    </form>
                )}

                {/* UPDATE PASSWORD FORM */}
                {mode === 'update_password' && (
                    <form onSubmit={handleUpdatePassword} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nova Senha</label>
                            <input
                                required
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="w-full px-6 py-4 rounded-2xl bg-slate-950/50 border border-slate-800 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold placeholder:text-slate-700"
                                placeholder="••••••••"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Confirmar Nova Senha</label>
                            <input
                                required
                                type="password"
                                value={confirmPassword}
                                onChange={e => setConfirmPassword(e.target.value)}
                                className="w-full px-6 py-4 rounded-2xl bg-slate-950/50 border border-slate-800 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold placeholder:text-slate-700"
                                placeholder="••••••••"
                            />
                        </div>

                        {error && (
                            <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl">
                                <p className="text-rose-400 text-xs font-bold text-center uppercase tracking-tight">{error}</p>
                            </div>
                        )}

                        {successMsg && (
                            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                                <p className="text-emerald-500 text-xs font-bold text-center tracking-tight">{successMsg}</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl shadow-[0_0_30px_rgba(99,102,241,0.3)] transition-all disabled:opacity-50 active:scale-95 text-sm uppercase tracking-widest"
                        >
                            {loading ? 'Salvando...' : 'Salvar Nova Senha'}
                        </button>

                        <button
                            type="button"
                            onClick={() => switchMode('login')}
                            className="w-full text-slate-500 text-[10px] font-black uppercase tracking-widest hover:text-slate-900 transition-colors"
                        >
                            ← Cancelar
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default Login;
