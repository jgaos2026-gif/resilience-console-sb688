/**
 * Login.jsx — JWT login page
 */
import React, { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const GOLD = '#C9A84C';

export default function Login() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
      <div className="w-full max-w-sm space-y-6 p-8 rounded-2xl border border-border" style={{ background: 'hsl(220,22%,5%)' }}>
        <div className="text-center space-y-2">
          <Shield className="w-10 h-10 mx-auto" style={{ color: GOLD }} />
          <h1 className="text-xl font-bold font-mono" style={{ color: GOLD }}>SB688 CONSOLE</h1>
          <p className="text-xs text-muted-foreground">Braided Topology Runtime — Operator Access</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground uppercase tracking-widest">Username</label>
            <Input
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="operator"
              autoComplete="username"
              className="bg-secondary border-border text-sm font-mono"
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground uppercase tracking-widest">Password</label>
            <Input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="current-password"
              className="bg-secondary border-border text-sm font-mono"
              required
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-xs text-red-400 bg-red-950/30 border border-red-900/40 rounded-lg px-3 py-2">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full text-xs font-bold font-mono uppercase tracking-widest"
            style={{ background: `rgba(201,168,76,0.15)`, color: GOLD, border: `1px solid rgba(201,168,76,0.4)` }}
          >
            <Lock className="w-3.5 h-3.5 mr-2" />
            {loading ? 'Authenticating…' : 'Authenticate'}
          </Button>
        </form>

        <p className="text-center text-[10px] text-muted-foreground/40">
          All access events are logged and audited.
        </p>
      </div>
    </div>
  );
}
