import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { ResearchInterest } from '@/components/about/ResearchInterest';
import { SkillInput } from '@/components/about/SkillInput';
import { useProfileData } from '@/hooks/useProfileData';

export default function AboutMe() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
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
  } = useProfileData();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const filteredInterests = interests.filter(i => i.topic.trim() !== '');
      const filteredSkills = skills.filter(s => s.trim() !== '');

      const { data: existingProfile } = await supabase
        .from('profile_details')
        .select('*')
        .eq('id', user.id)
        .single();

      let error;
      
      if (existingProfile) {
        ({ error } = await supabase
          .from('profile_details')
          .update({
            interests: filteredInterests.map(i => i.topic),
            skills: filteredSkills,
            research_fields: filteredInterests.map(i => ({
              topic: i.topic,
              level: i.level
            }))
          })
          .eq('id', user.id));
      } else {
        ({ error } = await supabase
          .from('profile_details')
          .insert({
            id: user.id,
            interests: filteredInterests.map(i => i.topic),
            skills: filteredSkills,
            research_fields: filteredInterests.map(i => ({
              topic: i.topic,
              level: i.level
            }))
          }));
      }

      if (error) throw error;
      
      navigate('/home');
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully saved!",
      });
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
      <div className="w-full max-w-2xl space-y-8 bg-white p-8 rounded-2xl shadow-xl">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-[#00539B]">Tell us about yourself</h1>
          <p className="text-gray-600">We'll customize your research experience based on your preferences</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-[#00539B]">Research Interests</h2>
            {interests.map((interest, index) => (
              <ResearchInterest
                key={index}
                interest={interest}
                index={index}
                onDelete={handleDeleteInterest}
                onChange={handleInterestChange}
              />
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={handleAddInterest}
              className="w-full bg-white border-gray-300 text-black hover:bg-black hover:text-white hover:border-black transition-colors"
            >
              Add Another Interest
            </Button>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-[#00539B]">Skills & Background</h2>
            {skills.map((skill, index) => (
              <SkillInput
                key={index}
                skill={skill}
                index={index}
                onDelete={handleDeleteSkill}
                onChange={handleSkillChange}
              />
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={handleAddSkill}
              className="w-full bg-white border-gray-300 text-black hover:bg-black hover:text-white hover:border-black transition-colors"
            >
              Add Another Skill
            </Button>
          </div>

          <Button 
            type="submit" 
            className="w-full bg-[#00539B] hover:bg-[#00539B]/90"
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : 'Save Profile'}
          </Button>
        </form>
      </div>
    </div>
  );
}