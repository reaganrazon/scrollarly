
import { supabase } from '@/integrations/supabase/client';

const availableColors = [
  "#FFE0E0", "#E0FFE0", "#E0E0FF", "#FFE0FF", "#FFFFE0", "#E0FFFF", 
  "#FFE0E9", "#E9FFE0", "#E0EAFF", "#FFE9E0", "#F0E0FF", "#E0FFE9",

  "#FFD1DC", "#FFDFD3", "#FFF1E0", "#FCE1FF", "#E5E0FF", "#E0F8FF",
  "#D4FFE0", "#E0FFD8", "#FFE0F4", "#E0FFF5", "#FFDFE5", "#D0E0FF",
  "#EAE0FF", "#E0E5FF", "#E0F0FF", "#DFFFE0", "#E0FFE4", "#FFECF0",
  "#F5E0FF", "#E0F7FF", "#FFF3E0", "#FDE0E0", "#E0FFE0", "#E0FFF7"
];

const assignedColors = new Map<string, string>(); 

export const getTopicColor = async (topic: string): Promise<string> => {
  if (!topic) return availableColors[0];

  const normalizedTopic = topic.toLowerCase().trim();

  if (assignedColors.has(normalizedTopic)) {
    return assignedColors.get(normalizedTopic)!;
  }

  const { data: existingColor } = await supabase
    .from('topic_colors')
    .select('color')
    .eq('topic', normalizedTopic)
    .single();

  if (existingColor) {
    assignedColors.set(normalizedTopic, existingColor.color);
    return existingColor.color;
  }

  const { data: existingColors } = await supabase.from('topic_colors').select('color');
  const usedColors = new Set(existingColors?.map(entry => entry.color) || []);

  const newColor = availableColors.find(color => !usedColors.has(color)) || availableColors[0];
  await supabase.from('topic_colors').insert({ topic: normalizedTopic, color: newColor });
  assignedColors.set(normalizedTopic, newColor);

  return newColor;
};
