import React, { useState } from 'react';
import { ChevronsUpDown, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandInput, CommandEmpty, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';
import { cn } from '@/lib/utils';

export default function CustomerCombobox({ customers, value, onValueChange, placeholder = "Selecione um cliente..." }) {
    const [open, setOpen] = useState(false);
    const selectedCustomer = customers.find(c => c.id === value);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between font-normal">
                    {selectedCustomer ? 
                        (<span className="truncate">{selectedCustomer.name}</span>) 
                        : (<span className="text-gray-500">{placeholder}</span>)
                    }
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                <Command
                    filter={(itemValue, search) => {
                        const customer = customers.find(c => c.id === itemValue);
                        if (!customer) return 0;
                        const combinedText = `${customer.name} ${customer.document || ''}`.toLowerCase();
                        if (combinedText.includes(search.toLowerCase())) return 1;
                        return 0;
                    }}
                >
                    <CommandInput placeholder="Buscar por nome ou documento..." />
                    <CommandList>
                        <CommandEmpty>Nenhum cliente encontrado.</CommandEmpty>
                        <CommandGroup>
                            {customers.map(customer => (
                                <CommandItem
                                    key={customer.id}
                                    value={customer.id}
                                    onSelect={(currentValue) => {
                                        onValueChange(currentValue === value ? "" : currentValue);
                                        setOpen(false);
                                    }}
                                >
                                    <Check className={cn("mr-2 h-4 w-4", value === customer.id ? "opacity-100" : "opacity-0")} />
                                    <div className="flex flex-col">
                                        <span className="font-medium">{customer.name}</span>
                                        {customer.document && <span className="text-xs text-slate-500">{customer.document}</span>}
                                    </div>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}