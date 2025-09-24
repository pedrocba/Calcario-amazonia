import React, { useState, useEffect, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

export default function SearchDebounce({ 
  onSearch, 
  placeholder = "Buscar...", 
  debounceMs = 300,
  minChars = 2,
  ...props 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Debounce da busca
  useEffect(() => {
    if (searchTerm.length === 0 || searchTerm.length >= minChars) {
      setIsSearching(true);
      const timer = setTimeout(() => {
        onSearch(searchTerm);
        setIsSearching(false);
      }, debounceMs);

      return () => {
        clearTimeout(timer);
        setIsSearching(false);
      };
    }
  }, [searchTerm, onSearch, debounceMs, minChars]);

  return (
    <div className="relative">
      <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
        isSearching ? 'text-blue-500 animate-pulse' : 'text-gray-400'
      }`} />
      <Input
        {...props}
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="pl-10"
      />
      {isSearching && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
}