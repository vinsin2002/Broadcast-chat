import { FC } from "react";

interface SuggestionsProps {
    suggestions: string[];
    inputValue: string;
    setInputValue: (value: string) => void;
    setSuggestions: (suggestions: string[]) => void;
}

export const Suggestions: FC<SuggestionsProps> = ({ suggestions, inputValue, setInputValue, setSuggestions }) => {
    return (
        <div className="absolute bottom-full left-0 w-full z-10 flex gap-2 p-2">
            {suggestions.map((suggestion, index) => (
                <div
                    key={index}
                    className="bg-gray-300 rounded-full px-3 py-1 text-sm cursor-pointer"
                    onClick={() => {
                        const words = inputValue.trim().split(" ");
                        words[words.length - 1] = suggestion;
                        setInputValue(words.join(" "));
                        setSuggestions([]);  // Clear suggestions after selecting
                    }}
                >
                    {suggestion}
                </div>
            ))}
        </div>
    );
};
