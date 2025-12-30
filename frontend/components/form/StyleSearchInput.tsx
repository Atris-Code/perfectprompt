import React, { useState, useEffect, useRef } from 'react';
import type { StyleDefinition } from '../../types';

interface StyleSearchInputProps {
  label: string;
  id: string;
  name: string;
  value: string;
  onChange: (e: { target: { name: string; value: string } }) => void;
  placeholder?: string;
  allStyles: StyleDefinition[];
}

export const StyleSearchInput: React.FC<StyleSearchInputProps> = ({
  label,
  id,
  name,
  value,
  onChange,
  placeholder,
  allStyles,
}) => {
  const [inputValue, setInputValue] = useState(value);
  const [suggestions, setSuggestions] = useState<StyleDefinition[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
        // If user clicks outside and the input doesn't match the original value, trigger change.
        if (inputValue !== value) {
          onChange({ target: { name, value: inputValue } });
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [wrapperRef, inputValue, value, name, onChange]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setInputValue(query);
    if (query.length > 1) {
      const filteredSuggestions = allStyles.filter(
        (style) =>
          style.style.toLowerCase().includes(query.toLowerCase()) ||
          style.description.toLowerCase().includes(query.toLowerCase()) ||
          style.keywords?.some(kw => kw.toLowerCase().includes(query.toLowerCase()))
      );
      setSuggestions(filteredSuggestions);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: StyleDefinition) => {
    setInputValue(suggestion.style);
    setShowSuggestions(false);
    onChange({ target: { name, value: suggestion.style } });
  };
  
  const handleBlur = () => {
      // Small delay to allow click on suggestion to register before blur hides it
      setTimeout(() => {
        if (showSuggestions) {
            setShowSuggestions(false);
            if (inputValue !== value) {
               onChange({ target: { name, value: inputValue } });
            }
        }
      }, 150);
  };


  return (
    <div className="relative" ref={wrapperRef}>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <input
        type="text"
        id={id}
        name={name}
        value={inputValue}
        onChange={handleInputChange}
        onFocus={() => inputValue.length > 1 && suggestions.length > 0 && setShowSuggestions(true)}
        onBlur={handleBlur}
        placeholder={placeholder}
        autoComplete="off"
        className="w-full px-4 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out bg-white text-gray-800 border-gray-300"
      />
      {showSuggestions && suggestions.length > 0 && (
        <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((suggestion) => (
            <li
              key={suggestion.id_style}
              className="p-3 cursor-pointer hover:bg-gray-100"
              onMouseDown={() => handleSuggestionClick(suggestion)} // use onMouseDown to fire before onBlur
            >
              <p className="font-semibold text-gray-800">{suggestion.style}</p>
              <p className="text-xs text-gray-500">{suggestion.description}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};