import { Input } from '@/components/ui/input';
import { X } from "lucide-react";

interface SkillInputProps {
  skill: string;
  index: number;
  onDelete: (index: number) => void;
  onChange: (index: number, value: string) => void;
}

export function SkillInput({ skill, index, onDelete, onChange }: SkillInputProps) {
  return (
    <div className="relative border border-gray-200 rounded-lg hover:border-[#00539B] transition-colors bg-gray-50/50 p-1">
      <button
        type="button"
        onClick={() => onDelete(index)}
        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
      >
        <X className="h-4 w-4 text-gray-500 hover:text-gray-700" />
      </button>
      <Input
        placeholder="Enter a skill or area of expertise"
        value={skill}
        onChange={(e) => onChange(index, e.target.value)}
        className="bg-white text-black text-base md:text-sm placeholder:text-gray-500 placeholder:text-base md:placeholder:text-sm border-0 focus:ring-0 focus:border-0 pr-10 pl-4"
      />
    </div>
  );
}