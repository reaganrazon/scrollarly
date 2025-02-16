
import React, { useState, useEffect } from 'react';
import { BookmarkIcon, Share2Icon, Heart, ThumbsDown, Info } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './ui/use-toast';
import { useNavigate } from 'react-router-dom';

interface PaperCardProps {
  title: string;
  authors: string;
  abstract: string;
  date: string;
  background: string;
  topic?: string;
  topicColor?: string;
  doi?: string;
}

export const PaperCard: React.FC<PaperCardProps> = ({ 
  title, 
  authors, 
  abstract, 
  date, 
  background, 
  topic,
  topicColor,
  doi
}) => {
  const [isLiked, setIsLiked] = useState(false);
  const [showHeart, setShowHeart] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    checkIfLiked();
  }, []);

  const checkIfLiked = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('liked_papers')
      .select()
      .eq('user_id', user.id)
      .eq('paper_title', title)
      .maybeSingle();

    setIsLiked(!!data);
  };

  const handleHeartClick = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to like papers",
        variant: "destructive"
      });
      return;
    }

    try {
      if (!isLiked) {
        const { error } = await supabase.from('liked_papers').insert({
          user_id: user.id,
          paper_title: title,
          authors,
          date,
          background,
          topic,
          topic_color: topicColor,
          doi
        });

        if (error) throw error;
        setShowHeart(true);
        setTimeout(() => setShowHeart(false), 1000);
      } else {
        const { error } = await supabase
          .from('liked_papers')
          .delete()
          .eq('user_id', user.id)
          .eq('paper_title', title);

        if (error) throw error;
      }

      setIsLiked(!isLiked);
    } catch (error) {
      toast({
        title: "Error",
        description: "There was an error updating your liked papers",
        variant: "destructive"
      });
    }
  };

  const handleBookmarkClick = () => {
    setIsBookmarked(!isBookmarked);
  };

  const handleDislikeClick = () => {
    setIsDisliked(!isDisliked);
  };

  const handleShareClick = () => {
    if (doi) {
      window.open(`https://doi.org/${doi}`, '_blank');
    } else {
      toast({
        title: "No link available",
        description: "This paper doesn't have an associated DOI link",
        variant: "destructive"
      });
    }
  };

  const handleInfoClick = () => {
    const encodedTitle = encodeURIComponent(title);
    navigate(`/paper/${encodedTitle}`, { 
      state: { 
        title,
        authors,
        date,
        doi,
        background,
        topic,
        topicColor
      }
    });
  };

  return (
    <div 
      className="glass-card w-full h-full p-6 relative flex flex-col md:flex-row md:items-center overflow-y-auto"
      style={{ 
        background,
        boxShadow: 'inset 0 0 0 2000px rgba(0, 0, 0, 0.3)'
      }}
    >
      <div className="absolute bottom-6 left-6">
        <Button 
          variant="ghost" 
          size="icon" 
          className="rounded-full bg-white/10 hover:bg-white/20"
          onClick={handleDislikeClick}
        >
          <ThumbsDown className={`w-5 h-5 ${isDisliked ? 'fill-current' : ''}`} />
        </Button>
      </div>

      <div className="absolute bottom-6 right-6 flex flex-row gap-2 z-10">
        <Button 
          variant="ghost" 
          size="icon" 
          className="rounded-full bg-white/10 hover:bg-white/20"
          onClick={handleBookmarkClick}
        >
          <BookmarkIcon className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
        </Button>
        <div className="relative">
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full bg-white/10 hover:bg-white/20"
            onClick={handleHeartClick}
          >
            <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
          </Button>
          <AnimatePresence>
            {showHeart && (
              <motion.div
                initial={{ scale: 0.5, y: 0, opacity: 0 }}
                animate={{ scale: 1.5, y: -20, opacity: 1 }}
                exit={{ scale: 0, y: -30, opacity: 0 }}
                className="absolute left-1/2 -translate-x-1/2 pointer-events-none text-red-500"
              >
                ❤️
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          className="rounded-full bg-white/10 hover:bg-white/20"
          onClick={handleInfoClick}
        >
          <Info className="w-5 h-5" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className="rounded-full bg-white/10 hover:bg-white/20"
          onClick={handleShareClick}
        >
          <Share2Icon className="w-5 h-5" />
        </Button>
      </div>

      <div className="max-w-2xl mx-auto h-full flex items-center">
        <div className="space-y-4 w-full">
          {topic && (
            <div className="flex flex-wrap gap-2">
              <Badge 
                className="text-black border-none px-3 py-1 text-sm font-medium rounded-full"
                style={{ backgroundColor: topicColor }}
              >
                {topic}
              </Badge>
            </div>
          )}
          <h1 className="text-2xl md:text-4xl font-bold leading-tight">{title}</h1>
          <div className="flex justify-between items-center text-sm text-white/80">
            <span>{authors}</span>
            <span className="ml-4">{date}</span>
          </div>
          <p className="text-base md:text-lg leading-relaxed text-white/90 pb-6">{abstract}</p>
        </div>
      </div>
    </div>
  );
};