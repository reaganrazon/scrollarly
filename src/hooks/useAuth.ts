import { supabase } from '@/integrations/supabase/client';

export const useAuth = () => {
  const getUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  };
  return { getUser };
};
