import { useState, useEffect, useRef, useCallback } from 'react';
import { PaperCard } from '@/components/PaperCard';
import { UserCircle, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { UserMenu } from '@/components/UserMenu';
import { useInfiniteQuery } from '@tanstack/react-query';
import { getTopicColor } from '@/utils/topicColors';
// import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import axios from "axios";
// import { useToast } from '@/components/ui/use-toast';


const API_BASE_URL = "http://127.0.0.1:8000";

const backgrounds = [
  "linear-gradient(90deg, rgb(245,152,168) 0%, rgb(246,237,178) 100%)",
  "linear-gradient(180deg, rgb(254,100,121) 0%, rgb(251,221,186) 100%)",
  "linear-gradient(102.3deg, rgba(147,39,143,1) 5.9%, rgba(234,172,232,1) 64%, rgba(246,219,245,1) 89%)",
  "linear-gradient(111.4deg, rgba(238,113,113,1) 1%, rgba(246,215,148,1) 58%)",
  "linear-gradient(225deg, #FFE29F 0%, #FFA99F 48%, #FF719A 100%)",
  "linear-gradient(to right, #ffc3a0 0%, #ffafbd 100%)",
  
  "linear-gradient(120deg, #84fab0 0%, #8fd3f4 100%)",  
  "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)", 
  "linear-gradient(150deg, #5ee7df 0%, #b490ca 100%)",  
  "linear-gradient(160deg, #ff9a9e 0%, #fad0c4 100%)",  
  "linear-gradient(180deg, #a1c4fd 0%, #c2e9fb 100%)", 
  "linear-gradient(200deg, #fbc2eb 0%, #a6c1ee 100%)",  
  "linear-gradient(220deg, #ffdde1 0%, #ee9ca7 100%)",  
  "linear-gradient(240deg, #cfd9df 0%, #e2ebf0 100%)",  
  "linear-gradient(270deg, #ff758c 0%, #ff7eb3 100%)",  
  "linear-gradient(300deg, #fad0c4 0%, #ffd1ff 100%)",  
  "linear-gradient(320deg, #ff9966 0%, #ff5e62 100%)",  
  "linear-gradient(340deg, #00c6fb 0%, #005bea 100%)",  
];


interface OpenAlexWork {
  title: string;
  abstract: string;
  publication_year: number;
  authorships: Array<{
    author: {
      display_name: string;
    };
  }>;
  primary_topic?: {
    display_name: string;
  };
  doi?: string;
}

interface ProcessedPaper {
  title: string;
  authors: string;
  abstract: string;
  date: string;
  topic?: string;
  background: string;
  topicColor?: string;
  doi?: string;
}

function getRandomBackground(prevPapers: ProcessedPaper[]): string {
  const recentBackgrounds = prevPapers.slice(-2).map(p => p.background);
  let availableBackgrounds = backgrounds.filter(bg => !recentBackgrounds.includes(bg));
  if (availableBackgrounds.length === 0) availableBackgrounds = backgrounds;
  return availableBackgrounds[Math.floor(Math.random() * availableBackgrounds.length)];
}

export default function Index() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  // const [isRefreshing, setIsRefreshing] = useState(false);
  // const { toast } = useToast();

  
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    // refetch
  } = useInfiniteQuery({
    queryKey: ['papers'],
    initialPageParam: 1,
    queryFn: async ({ pageParam = 1 }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');
    

      const response = await axios.get(`${API_BASE_URL}/papers`, {
        params: { user_id: user.id }
      });

      console.log(response.data.papers)
  
      const papers = await Promise.all(
        response.data.papers.map(async (paper: any) => ({
          title: paper.title || "Untitled",
          abstract: paper.abstract ? paper.abstract.split(".").slice(0, 3).join(".") + "." : "Click the link to read more!",
          date: paper.pub_date?.toString() || "Unknown Date",
          topic: paper.topics ? paper.topics.split(";")[0] : "Research",
          topicColor: await getTopicColor(paper.topics.split(";")[0]), 
          authors: paper.authorships 
            ? paper.authorships.split(";").slice(0, 2).join(" and ") 
            : "Unknown Author",
          doi: paper.doi || "N/A",
        }))
      );
      
      papers.forEach((paper, index) => {
        paper.background = getRandomBackground(papers.slice(0, index));
      });
    
      return {
        papers,
        nextPage: pageParam + 1,
        hasMore: papers.length > 0,
      };
    },
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.nextPage : undefined),
  });

  // const handleRefresh = async () => {
  //   setIsRefreshing(true);
  //   try {
  //     await refetch();

  //   } catch (error) {
  //     toast({
  //       title: "Error",
  //       description: "Could not refresh the feed",
  //       variant: "destructive"
  //     });
  //   } finally {
  //     setIsRefreshing(false);
  //   }
  // };

  const handleScroll = useCallback((entries: IntersectionObserverEntry[]) => {
    const [entry] = entries;
    if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  useEffect(() => {
    const observer = new IntersectionObserver(handleScroll, { threshold: 0.1 });
    const currentContainer = containerRef.current;

    if (currentContainer) {
      observer.observe(currentContainer);
    }

    return () => {
      if (currentContainer) {
        observer.unobserve(currentContainer);
      }
    };
  }, [handleScroll]);

//   <div className="fixed top-4 left-4 z-50">
//   <Button
//     variant="outline"
//     onClick={handleRefresh}
//     disabled={isRefreshing}
//     className="bg-white/10 hover:bg-white/20"
//   >
//     <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
//     Refresh Feed
//   </Button>
// </div>

  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-background text-foreground flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  const allPapers = data?.pages.flatMap(page => page.papers) || [];

  return (
    <div className="min-h-screen w-full bg-background text-foreground">
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={() => setMenuOpen(true)}
          className="p-2 rounded-full hover:bg-white/10 transition-colors"
        >
          <UserCircle className="w-6 h-6 text-white" />
        </button>
      </div>
      <UserMenu open={menuOpen} onOpenChange={setMenuOpen} />
      <div className="h-[100dvh] overflow-y-auto snap-y snap-mandatory">
        {allPapers.map((paper, index) => (
          <div 
            key={index} 
            className="h-[100dvh] w-full snap-start snap-always"
            ref={index === allPapers.length - 1 ? containerRef : undefined}
          >
            <PaperCard {...paper} />
          </div>
        ))}
        {isFetchingNextPage && (
          <div className="h-[100dvh] w-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-white"></div>
          </div>
        )}
      </div>
    </div>
  );
}