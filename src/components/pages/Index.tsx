import { useState, useEffect, useRef, useCallback } from 'react';
import { PaperCard } from '@/components/PaperCard';
import { UserCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { UserMenu } from '@/components/UserMenu';
import { useInfiniteQuery } from '@tanstack/react-query';
import { getTopicColor } from '@/utils/topicColors';

const backgrounds = [
  "linear-gradient(90deg, rgb(245,152,168) 0%, rgb(246,237,178) 100%)",
  "linear-gradient(180deg, rgb(254,100,121) 0%, rgb(251,221,186) 100%)",
  "linear-gradient(102.3deg, rgba(147,39,143,1) 5.9%, rgba(234,172,232,1) 64%, rgba(246,219,245,1) 89%)",
  "linear-gradient(111.4deg, rgba(238,113,113,1) 1%, rgba(246,215,148,1) 58%)",
  "linear-gradient(225deg, #FFE29F 0%, #FFA99F 48%, #FF719A 100%)",
  "linear-gradient(to right, #ffc3a0 0%, #ffafbd 100%)",
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

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ['papers'],
    initialPageParam: 1,
    queryFn: async ({ pageParam = 1 }) => {
      const response = await fetch(
        `https://api.openalex.org/works?filter=is_paratext:false&sort=publication_date:desc&per_page=6&page=${pageParam}`
      );
      const data = await response.json();
      
      const allProcessedPapers = await Promise.all(data.results.map(async (paper: OpenAlexWork): Promise<ProcessedPaper> => {
        const topic = paper.primary_topic?.display_name || "Research";
        const topicColor = await getTopicColor(topic);
        
        return {
          title: paper.title,
          authors: paper.authorships.map(a => a.author.display_name).join(', '),
          abstract: paper.abstract || "Abstract not available",
          date: paper.publication_year.toString(),
          topic,
          background: "",  // Will be set after
          topicColor,
          doi: paper.doi
        };
      }));

      allProcessedPapers.forEach((paper, index) => {
        paper.background = getRandomBackground(allProcessedPapers.slice(0, index));
      });

      return {
        papers: allProcessedPapers,
        nextPage: pageParam + 1,
        hasMore: data.results.length > 0,
      };
    },
    getNextPageParam: (lastPage) => lastPage.hasMore ? lastPage.nextPage : undefined,
  });

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