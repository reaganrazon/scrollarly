
import { supabase } from '@/integrations/supabase/client';

const availableColors = [
  "#FFE0E0", // Light Red
  "#E0FFE0", // Light Green
  "#E0E0FF", // Light Blue
  "#FFE0FF", // Light Purple
  "#FFFFE0", // Light Yellow
  "#E0FFFF", // Light Cyan
  "#FFE0E9", // Light Pink
  "#E9FFE0", // Light Lime
  "#E0EAFF", // Light Sky Blue
  "#FFE9E0", // Light Coral
  "#F0E0FF", // Light Lavender
  "#E0FFE9", // Light Mint
];

export const getTopicColor = async (topic: string): Promise<string> => {
  if (!topic) return availableColors[0];
  
  const normalizedTopic = topic.toLowerCase().trim();
  
  // Try to get existing color
  const { data: existingColor } = await supabase
    .from('topic_colors')
    .select('color')
    .eq('topic', normalizedTopic)
    .single();

  if (existingColor) {
    return existingColor.color;
  }

  // Get all existing colors to avoid duplicates
  const { data: existingColors } = await supabase
    .from('topic_colors')
    .select('color');

  const usedColors = existingColors?.map(entry => entry.color) || [];
  
  // Find first available color
  const newColor = availableColors.find(color => !usedColors.includes(color)) || availableColors[0];

  // Store new color mapping
  await supabase
    .from('topic_colors')
    .insert({
      topic: normalizedTopic,
      color: newColor
    });

  return newColor;
};
