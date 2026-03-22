import React, { useState } from 'react';
import { Book, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';

interface LoginProps {
  onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const getUsers = () => {
    const users = localStorage.getItem('paulo_users');
    return users ? JSON.parse(users) : [];
  };

  const saveUser = (user: any) => {
    const users = getUsers();
    users.push(user);
    localStorage.setItem('paulo_users', JSON.stringify(users));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isRegistering) {
      if (password !== confirmPassword) {
        setError('As senhas não coincidem');
        return;
      }

      const users = getUsers();
      if (users.find((u: any) => u.email === email)) {
        setError('Este email já está cadastrado');
        return;
      }

      saveUser({ email, password });
      alert('Cadastro realizado com sucesso! Agora você pode fazer login.');
      setIsRegistering(false);
      setPassword('');
      setConfirmPassword('');
    } else {
      const users = getUsers();
      const user = users.find((u: any) => u.email === email && u.password === password);

      if (user) {
        onLogin();
      } else {
        setError('Email ou senha incorretos');
      }
    }
  };

  return (
    <div className="min-h-screen bg-emerald-600 flex items-center justify-center p-6 font-sans">
      <div className="bg-white w-full max-w-[480px] rounded-[3rem] p-12 shadow-2xl animate-in fade-in zoom-in duration-500">
        <div className="flex flex-col items-center mb-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-emerald-100 p-3 rounded-xl text-emerald-600">
              <Book size={32} />
            </div>
            <div className="flex flex-col">
              <h1 className="text-2xl font-black tracking-tighter text-slate-900 leading-none">
                ESTRUTURADOR <span className="text-emerald-600">DE</span>
              </h1>
              <h1 className="text-2xl font-black tracking-tighter text-slate-900 leading-none">
                SERMÕES <span className="text-emerald-600 uppercase tracking-tight">Paulo</span>
              </h1>
            </div>
          </div>
          <div className="w-12 h-1 bg-emerald-600 rounded-full mt-2"></div>
        </div>

        <div className="text-center mb-10">
          <h2 className="text-3xl font-black text-slate-900 mb-2">
            {isRegistering ? 'Crie sua conta' : 'Bem-vindo de volta!'}
          </h2>
          <p className="text-slate-500 font-medium">
            {isRegistering ? 'Preencha os dados abaixo para se cadastrar' : 'Faça login para acessar sua conta'}
          </p>
        </div>

        {error && (
          <div className="bg-rose-50 text-rose-600 p-4 rounded-2xl text-sm font-bold mb-6 animate-in fade-in slide-in-from-top-2">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 ml-1 text-left block">Email</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 transition-colors" size={20} />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Digite seu email"
                className="w-full bg-slate-50 border-2 border-transparent focus:border-emerald-500/20 rounded-2xl p-4 pl-12 outline-none font-medium text-slate-900 transition-all"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 ml-1 text-left block">Senha</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 transition-colors" size={20} />
              <input 
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite sua senha"
                className="w-full bg-slate-50 border-2 border-transparent focus:border-emerald-500/20 rounded-2xl p-4 pl-12 pr-12 outline-none font-medium text-slate-900 transition-all"
                required
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-600 transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {isRegistering && (
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1 text-left block">Confirmar Senha</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 transition-colors" size={20} />
                <input 
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirme sua senha"
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-emerald-500/20 rounded-2xl p-4 pl-12 pr-12 outline-none font-medium text-slate-900 transition-all"
                  required
                />
              </div>
            </div>
          )}

          <button 
            type="submit"
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black py-5 rounded-2xl shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98] group"
          >
            {isRegistering ? 'Cadastrar' : 'Entrar'}
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        <div className="mt-10 text-center">
          <p className="text-slate-500 font-medium">
            {isRegistering ? 'Já tem uma conta?' : 'Não tem uma conta?'} 
            <button 
              onClick={() => {
                setIsRegistering(!isRegistering);
                setError('');
              }}
              className="text-emerald-600 font-bold hover:underline ml-1"
            >
              {isRegistering ? 'Faça login aqui' : 'Cadastre-se aqui'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
