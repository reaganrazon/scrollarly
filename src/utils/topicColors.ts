
import { supabase } from '@/integrations/supabase/client';

// const availableColors = [
//   "#FFE0E0", 
//   "#E0FFE0",
//   "#E0E0FF",
//   "#FFE0FF", 
//   "#FFFFE0", 
//   "#E0FFFF", 
//   "#FFE0E9", 
//   "#E9FFE0", 
//   "#E0EAFF", 
//   "#FFE9E0", 
//   "#F0E0FF", 
//   "#E0FFE9", 
// ];

// export const getTopicColor = async (topic: string): Promise<string> => {
//   if (!topic) return availableColors[0];
  
//   const normalizedTopic = topic.toLowerCase().trim();
  
//   const { data: existingColor } = await supabase
//     .from('topic_colors')
//     .select('color')
//     .eq('topic', normalizedTopic)
//     .single();

//   if (existingColor) {
//     return existingColor.color;
//   }

//   const { data: existingColors } = await supabase
//     .from('topic_colors')
//     .select('color');

//   const usedColors = existingColors?.map(entry => entry.color) || [];
  
//   const newColor = availableColors.find(color => !usedColors.includes(color)) || availableColors[0];

//   await supabase
//     .from('topic_colors')
//     .insert({
//       topic: normalizedTopic,
//       color: newColor
//     });

//   return newColor;
// };

const availableColors = [
  "#FFE0E0", "#E0FFE0", "#E0E0FF", "#FFE0FF", "#FFFFE0", "#E0FFFF", 
  "#FFE0E9", "#E9FFE0", "#E0EAFF", "#FFE9E0", "#F0E0FF", "#E0FFE9"
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

  // Get all colors already assigned in the database
  const { data: existingColors } = await supabase.from('topic_colors').select('color');
  const usedColors = new Set(existingColors?.map(entry => entry.color) || []);

  // Find the first available color
  const newColor = availableColors.find(color => !usedColors.has(color)) || availableColors[0];

  // Insert into database
  await supabase.from('topic_colors').insert({ topic: normalizedTopic, color: newColor });

  // Cache the assigned color
  assignedColors.set(normalizedTopic, newColor);

  return newColor;
};
