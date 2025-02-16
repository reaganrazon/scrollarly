import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Node,
  Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

interface SavedPaper {
  id: number;
  paper_title: string;
  authors: string;
  doi?: string;
  topic?: string;
  topic_color?: string;
}

const SavedPapers = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [papers, setPapers] = useState<SavedPaper[]>([]);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    fetchSavedPapers();
  }, []);

  const fetchSavedPapers = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to view saved papers",
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
        description: "Could not fetch saved papers",
        variant: "destructive"
      });
      return;
    }

    setPapers(data || []);
    createGraphData(data || []);
  };

  const createGraphData = (papers: SavedPaper[]) => {
    const newNodes: Node[] = papers.map((paper, index) => {
      const relevanceFactor = 0.5 + Math.random() * 1.5;
      const baseSize = 150;
      const size = Math.floor(baseSize * relevanceFactor);

      return {
        id: paper.id.toString(),
        data: { 
          label: paper.paper_title,
          doi: paper.doi,
          topic: paper.topic,
        },
        position: { 
          x: 100 + Math.random() * 500, 
          y: 100 + Math.random() * 500 
        },
        style: { 
          background: paper.topic_color || '#4CAF50',
          color: 'black',
          padding: 10,
          borderRadius: '50%',
          width: size,
          height: size,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          fontSize: `${12 * Math.sqrt(relevanceFactor)}px`,
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          fontWeight: 500,
        },
      };
    });

    const newEdges: Edge[] = [];
    papers.forEach((paper, index) => {
      if (index > 0) {
        newEdges.push({
          id: `e${index}`,
          source: papers[index - 1].id.toString(),
          target: paper.id.toString(),
          style: { stroke: '#ddd' },
          animated: true,
        });
      }
    });

    setNodes(newNodes);
    setEdges(newEdges);
  };

  const onConnect = (params: any) => {
    setEdges((eds) => addEdge(params, eds));
  };

  const onNodeClick = (_: any, node: Node) => {
    if (node.data.doi) {
      window.open(`https://doi.org/${node.data.doi}`, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="p-6">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => navigate('/home')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        
        <h1 className="text-4xl font-bold mb-8 text-white">Saved Papers</h1>
      </div>

      <div style={{ width: '100vw', height: 'calc(100vh - 200px)' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          fitView
        >
          <Controls />
          <MiniMap />
          <Background />
        </ReactFlow>
      </div>
    </div>
  );
};

export default SavedPapers;