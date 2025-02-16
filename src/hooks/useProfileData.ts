import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Interest, ResearchLevel } from '@/components/about/ResearchInterest';

export function useProfileData() {
  const [interests, setInterests] = useState<Interest[]>([{ topic: '', level: 'learning' }]);
  const [skills, setSkills] = useState<string[]>(['']);
  const [isLoading, setIsLoading] = useState(false);

  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { data } = await supabase
        .from('profile_details')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      return data;
    }
  });

  useEffect(() => {
    if (profile) {
      if (profile.research_fields && Array.isArray(profile.research_fields)) {
        const fields = profile.research_fields as { topic: string; level: ResearchLevel }[];
        if (fields.length > 0) {
          setInterests(fields);
        }
      }

      if (profile.skills && Array.isArray(profile.skills)) {
        if (profile.skills.length > 0) {
          setSkills(profile.skills);
        }
      }
    }
  }, [profile]);

  const handleAddInterest = () => {
    setInterests([...interests, { topic: '', level: 'learning' }]);
  };

  const handleAddSkill = () => {
    setSkills([...skills, '']);
  };

  const handleInterestChange = (index: number, field: 'topic' | 'level', value: string) => {
    const newInterests = [...interests];
    newInterests[index] = {
      ...newInterests[index],
      [field]: value,
    };
    setInterests(newInterests);
  };

  const handleSkillChange = (index: number, value: string) => {
    const newSkills = [...skills];
    newSkills[index] = value;
    setSkills(newSkills);
  };

  const handleDeleteInterest = (indexToDelete: number) => {
    setInterests(interests.filter((_, index) => index !== indexToDelete));
  };

  const handleDeleteSkill = (indexToDelete: number) => {
    setSkills(skills.filter((_, index) => index !== indexToDelete));
  };

  return {
    interests,
    skills,
    isLoading,
    setIsLoading,
    handleAddInterest,
    handleAddSkill,
    handleInterestChange,
    handleSkillChange,
    handleDeleteInterest,
    handleDeleteSkill
  };
}