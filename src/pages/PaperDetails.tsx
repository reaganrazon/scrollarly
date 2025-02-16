import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { ArrowLeft, VolumeIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface PaperDetailsProps {
  title: string;
  authors: string;
  date: string;
  doi?: string;
  background: string;
  topic?: string;
  topicColor?: string;
}

interface RelatedWork {
  title: string;
  doi?: string;
}

export default function PaperDetails() {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [summary, setSummary] = useState<string>("");
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [isReadingAloud, setIsReadingAloud] = useState(false);
  const paper = location.state as PaperDetailsProps;

  useEffect(() => {
    if (!paper) {
      navigate('/home');
      return;
    }
  }, [paper, navigate, toast]);

  const generateSummary = async () => {
    setIsGeneratingSummary(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-summary', {
        body: { title: paper.title }
      });

      if (error) throw error;
      setSummary(data.summary);
    } catch (error) {
      console.error('Error generating summary:', error);
      toast({
        title: "Error",
        description: "Could not generate summary",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const readAloud = async () => {
    setIsReadingAloud(true);
    try {
      toast({
        title: "Coming Soon",
        description: "Text-to-speech functionality will be implemented soon!",
      });
    } catch (error) {
      console.error('Error reading text:', error);
      toast({
        title: "Error",
        description: "Could not read the text aloud",
        variant: "destructive"
      });
    } finally {
      setIsReadingAloud(false);
    }
  };

  if (!paper) return null;


  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => navigate('/home')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        
        <Card className="p-4 md:p-8 mb-8" style={{
          background: paper.background,
          boxShadow: 'inset 0 0 0 2000px rgba(0, 0, 0, 0.3)'
        }}>
          <h1 className="text-xl md:text-3xl lg:text-4xl font-bold mb-2 md:mb-4 text-white">{paper.title}</h1>
          <p className="text-base md:text-lg text-white/80 mb-1 md:mb-2">{paper.authors}</p>
          <p className="text-sm md:text-base text-white/60">{paper.date}</p>
        </Card>

        <div className="space-y-6 md:space-y-8">
          <section>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl md:text-2xl font-semibold text-white">Summary</h2>
              <div className="flex gap-2">
                <Button 
                  onClick={readAloud}
                  disabled={isReadingAloud}
                  className="bg-white/10 hover:bg-white/20 text-white"
                >
                  <VolumeIcon className="w-4 h-4 mr-2" />
                  {isReadingAloud ? "Reading..." : "Read Aloud"}
                </Button>
                {!summary && (
                  <Button 
                    onClick={generateSummary} 
                    disabled={isGeneratingSummary}
                    className="bg-white/10 hover:bg-white/20 text-white"
                  >
                    {isGeneratingSummary ? "Generating..." : "Generate Summary"}
                  </Button>
                )}
              </div>
            </div>
            {summary ? (
              <p className="text-white/80">{summary}</p>
            ) : (
              <div className="text-white/60 italic">
                {isGeneratingSummary ? 
                  "Generating summary..." : 
                  "Click the button above to generate an AI summary of this paper."
                }
              </div>
            )}
          </section>

          <section>
            <div className="space-y-4">
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}