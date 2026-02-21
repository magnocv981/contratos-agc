import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

interface LoginProps {
    onLogin: () => void;
    initialMode?: 'login' | 'update_password';
}

const Login: React.FC<LoginProps> = ({ onLogin, initialMode = 'login' }) => {
    const [mode, setMode] = useState<'login' | 'recovery' | 'update_password'>(initialMode);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    const [recoveryCooldown, setRecoveryCooldown] = useState(0);

    useEffect(() => {
        if (recoveryCooldown > 0) {
            const timer = setInterval(() => {
                setRecoveryCooldown(prev => prev - 1);
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [recoveryCooldown]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const { error: loginError } = await supabase.auth.signInWithPassword({ email, password });
            if (loginError) throw loginError;
            onLogin();
        } catch (err: any) {
            setError(err.message === 'Invalid login credentials' ? 'E-mail ou senha incorretos.' : err.message);
        } finally {
            setLoading(false);
        }
    };

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
            setRecoveryCooldown(60);
        } catch (err: any) {
            setError(err.status === 429 ? 'Muitas solicitações. Aguarde um momento.' : err.message);
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
            setSuccessMsg('Senha atualizada com sucesso!');
            setTimeout(() => onLogin(), 2000);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center p-6 bg-[var(--background-app)] relative overflow-hidden">
            {/* Background Orbs */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-primary/5 rounded-full blur-[120px] -mr-64 -mt-64" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-brand-emerald/5 rounded-full blur-[120px] -ml-64 -mb-64" />

            <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-700">
                <div className="premium-card shadow-premium relative z-10 p-10 md:p-12">
                    <header className="text-center mb-10">
                        <h1 className="text-5xl font-black tracking-tighter text-strong mb-2">
                            SINCRO<span className="text-brand-primary">.</span>
                        </h1>
                        <p className="text-xs font-black uppercase tracking-widest text-muted">Contratos Governamentais</p>
                    </header>

                    {error && (
                        <div className="mb-6 p-4 bg-brand-rose/10 border border-brand-rose/20 rounded-2xl text-brand-rose text-xs font-bold animate-in slide-in-from-top-2">
                            {error}
                        </div>
                    )}

                    {successMsg && (
                        <div className="mb-6 p-4 bg-brand-emerald/10 border border-brand-emerald/20 rounded-2xl text-brand-emerald text-xs font-bold animate-in slide-in-from-top-2">
                            {successMsg}
                        </div>
                    )}

                    <form
                        onSubmit={mode === 'login' ? handleLogin : mode === 'recovery' ? handleRecovery : handleUpdatePassword}
                        className="space-y-6"
                    >
                        {mode !== 'update_password' && (
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted ml-1">E-mail Corporativo</label>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-6 py-4 bg-slate-50 border border-border-default rounded-2xl focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/5 transition-all outline-none font-medium text-strong"
                                    placeholder="exemplo@sincro.com"
                                />
                            </div>
                        )}

                        {mode !== 'recovery' && (
                            <>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted ml-1">
                                        {mode === 'update_password' ? 'Nova Senha' : 'Senha de Acesso'}
                                    </label>
                                    <input
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full px-6 py-4 bg-slate-50 border border-border-default rounded-2xl focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/5 transition-all outline-none font-medium text-strong"
                                        placeholder="••••••••"
                                    />
                                </div>
                                {mode === 'update_password' && (
                                    <div className="space-y-2 animate-in slide-in-from-top-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted ml-1">Confirmar Nova Senha</label>
                                        <input
                                            type="password"
                                            required
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="w-full px-6 py-4 bg-slate-50 border border-border-default rounded-2xl focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/5 transition-all outline-none font-medium text-strong"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                )}
                            </>
                        )}

                        <button
                            type="submit"
                            disabled={loading || (mode === 'recovery' && recoveryCooldown > 0)}
                            className="btn-primary w-full py-5 text-sm uppercase tracking-widest transition-all disabled:opacity-50"
                        >
                            {loading ? 'Processando...' :
                                mode === 'login' ? 'Entrar no Sistema' :
                                    mode === 'recovery' ? (recoveryCooldown > 0 ? `Aguarde ${recoveryCooldown}s` : 'Enviar Link de Recuperação') :
                                        'Atualizar Senha'}
                        </button>
                    </form>

                    <footer className="mt-10 pt-8 border-t border-border-default text-center space-y-4">
                        {mode === 'login' ? (
                            <button
                                onClick={() => setMode('recovery')}
                                className="text-xs font-bold text-brand-primary hover:text-brand-indigo transition-colors"
                            >
                                Esqueceu sua senha? Recuperar acesso
                            </button>
                        ) : mode === 'recovery' ? (
                            <button
                                onClick={() => setMode('login')}
                                className="text-xs font-bold text-brand-primary hover:text-brand-indigo transition-colors"
                            >
                                Voltar para o Login
                            </button>
                        ) : mode === 'update_password' ? (
                            <button
                                onClick={() => setMode('login')}
                                className="text-xs font-bold text-muted hover:text-brand-primary transition-colors"
                            >
                                Cancelar e voltar
                            </button>
                        ) : null}
                    </footer>
                </div>
            </div>
        </div>
    );
};

export default Login;
