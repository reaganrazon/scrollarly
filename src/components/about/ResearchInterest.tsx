
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";

export type ResearchLevel = 'expert' | 'learning' | 'general';

export interface Interest {
  topic: string;
  level: ResearchLevel;
}

interface ResearchInterestProps {
  interest: Interest;
  index: number;
  onDelete: (index: number) => void;
  onChange: (index: number, field: 'topic' | 'level', value: string) => void;
}

export function ResearchInterest({ interest, index, onDelete, onChange }: ResearchInterestProps) {
  return (
    <div className="relative space-y-4 p-6 border border-gray-200 rounded-lg hover:border-[#00539B] transition-colors bg-gray-50/50">
      <button
        type="button"
        onClick={() => onDelete(index)}
        className="absolute top-2 right-2 p-1 hover:bg-gray-100 rounded-full transition-colors"
      >
        <X className="h-5 w-5 text-gray-500 hover:text-gray-700" />
      </button>
      <div className="relative">
        <Input
          placeholder="Enter a research topic"
          value={interest.topic}
          onChange={(e) => onChange(index, 'topic', e.target.value)}
          className="bg-white text-black text-base md:text-sm placeholder:text-gray-500 placeholder:text-base md:placeholder:text-sm border-gray-200 focus:border-[#00539B] transition-colors px-4 hidden md:block"
        />
        <Input
          placeholder="e.g., AI uses in healthcare"
          value={interest.topic}
          onChange={(e) => onChange(index, 'topic', e.target.value)}
          className="bg-white text-black text-base md:text-sm placeholder:text-gray-500 placeholder:text-base md:placeholder:text-sm border-gray-200 focus:border-[#00539B] transition-colors px-4 block md:hidden"
        />
      </div>
      <RadioGroup
        value={interest.level}
        onValueChange={(value) => onChange(index, 'level', value)}
        className="flex flex-col sm:flex-row gap-2 sm:gap-6"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="expert" id={`expert-${index}`} />
          <Label htmlFor={`expert-${index}`} className="text-gray-700">Expert</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="learning" id={`learning-${index}`} />
          <Label htmlFor={`learning-${index}`} className="text-gray-700">Learning</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="general" id={`general-${index}`} />
          <Label htmlFor={`general-${index}`} className="text-gray-700">Limited Knowledge</Label>
        </div>
      </RadioGroup>
    </div>
  );
}