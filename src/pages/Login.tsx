import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { ArrowLeft } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      navigate('/home');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-b from-[#00539B] to-white/90">
      <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-2xl shadow-xl relative">
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-4 top-4 text-[#00539B] hover:bg-[#00539B]/10"
          onClick={() => navigate('/welcome')}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>

        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-[#00539B]">Welcome Back!</h1>
          <p className="text-gray-600">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <Button 
            type="submit" 
            className="w-full bg-[#00539B] hover:bg-[#00539B]/90"
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Button>

          <Button
            type="button"
            variant="ghost"
            className="w-full text-[#00539B]"
            onClick={() => navigate('/signup')}
          >
            Don't have an account? Sign up
          </Button>
        </form>
      </div>
    </div>
  );
}