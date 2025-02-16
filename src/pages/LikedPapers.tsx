
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { getTopicColor } from '@/utils/topicColors';

interface LikedPaper {
  id: number;
  paper_title: string;
  authors: string;
  background: string;
  date: string;
  doi?: string;
  topic?: string;
  topic_color?: string;
}

interface ProcessedLikedPaper extends LikedPaper {
  topicColor: string;
}

export default function LikedPapers() {
  const [papers, setPapers] = useState<ProcessedLikedPaper[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchLikedPapers();
  }, []);

  const fetchLikedPapers = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to view liked papers",
        variant: "destructive"
      });
      navigate('/home');
      return;
    }

    const { data, error } = await supabase
      .from('liked_papers')
      .select('*')
      .eq('user_id', user.id);

    if (error) {
      toast({
        title: "Error",
        description: "Could not fetch liked papers",
        variant: "destructive"
      });
      return;
    }

    // Process papers to get their colors
    const processedPapers = await Promise.all((data || []).map(async (paper) => ({
      ...paper,
      topicColor: await getTopicColor(paper.topic || 'Research')
    })));

    setPapers(processedPapers);
  };

  const handleCardClick = (doi?: string) => {
    if (doi) {
      window.open(`https://doi.org/${doi}`, '_blank');
    }
  };

  const getTruncatedTopic = (topic?: string) => {
    if (!topic) return '';
    return topic.split(' ')[0];
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => navigate('/home')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        
        <h1 className="text-4xl font-bold mb-8 text-white">Liked Papers</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {papers.map((paper) => (
            <Card
              key={paper.id}
              className="p-6 cursor-pointer transform transition-transform hover:scale-105"
              style={{
                background: paper.background,
                boxShadow: 'inset 0 0 0 2000px rgba(0, 0, 0, 0.3)'
              }}
              onClick={() => handleCardClick(paper.doi)}
            >
              {paper.topic && (
                <div className="mb-4">
                  <span
                    className="px-3 py-1 rounded-full text-sm font-medium text-black"
                    style={{ backgroundColor: paper.topicColor }}
                  >
                    {getTruncatedTopic(paper.topic)}
                  </span>
                </div>
              )}
              <h2 className="text-xl font-semibold mb-2 text-white">{paper.paper_title}</h2>
              <p className="text-sm text-white/80">{paper.authors}</p>
              <p className="text-sm text-white/80 mt-2">{paper.date}</p>
            </Card>
          ))}
        </div>
        
        {papers.length === 0 && (
          <div className="text-center text-white/80 mt-12">
            <p>You haven't liked any papers yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
