import { Globe } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SupportedLanguage, languageLabels } from '@/types/bill';

interface LanguageSelectorProps {
  value: SupportedLanguage;
  onChange: (language: SupportedLanguage) => void;
  disabled?: boolean;
}

const LanguageSelector = ({ value, onChange, disabled }: LanguageSelectorProps) => {
  return (
    <div className="flex items-center gap-2">
      <Globe className="h-4 w-4 text-muted-foreground" />
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select language" />
        </SelectTrigger>
        <SelectContent>
          {(Object.keys(languageLabels) as SupportedLanguage[]).map((lang) => (
            <SelectItem key={lang} value={lang}>
              {languageLabels[lang]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default LanguageSelector;
