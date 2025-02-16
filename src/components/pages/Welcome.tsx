import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export default function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-b from-[#00539B] to-white/90">
      <div className="max-w-md w-full space-y-12 px-4">
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold text-white">
            Welcome to
            <span className="block text-6xl mt-2">Research.</span>
          </h1>
          <p className="text-xl text-blue-100">
            Dive into new research and discover groundbreaking papers
          </p>
        </div>

        <div className="space-y-4">
          <Button 
            className="w-full py-6 text-lg bg-white hover:bg-white/90 text-[#00539B] font-semibold rounded-2xl shadow-lg"
            onClick={() => navigate('/signup')}
          >
            Join Now!
          </Button>

          <Button 
            variant="outline"
            className="w-full py-6 text-lg bg-white/10 hover:bg-white/20 text-white border-white/20 font-semibold rounded-2xl"
            onClick={() => navigate('/login')}
          >
            Log in
          </Button>
        </div>
      </div>
    </div>
  );
}