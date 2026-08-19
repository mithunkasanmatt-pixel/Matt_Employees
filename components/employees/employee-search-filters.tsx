'use client';

import { useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, Plus, RotateCcw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button, buttonVariants } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Link from 'next/link';

export function EmployeeSearchFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [searchVal, setSearchVal] = useState(searchParams.get('search') || '');
  const [typeVal, setTypeVal] = useState(searchParams.get('type') || 'ALL');

  const handleApplyFilters = (search: string, type: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', '1'); // reset page to 1 on filter change

    if (search.trim()) {
      params.set('search', search.trim());
    } else {
      params.delete('search');
    }

    if (type && type !== 'ALL') {
      params.set('type', type);
    } else {
      params.delete('type');
    }

    startTransition(() => {
      router.push(`/dashboard/employees?${params.toString()}`);
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleApplyFilters(searchVal, typeVal);
  };

  const handleTypeChange = (value: string | null) => {
    const val = value || 'ALL';
    setTypeVal(val);
    handleApplyFilters(searchVal, val);
  };

  const handleReset = () => {
    setSearchVal('');
    setTypeVal('ALL');
    startTransition(() => {
      router.push('/dashboard/employees');
    });
  };

  return (
    <div className="flex flex-col md:flex-row gap-3 items-stretch justify-between bg-background border border-slate-200/80 p-4 rounded-xl shadow-sm">
      <form onSubmit={handleSearchSubmit} className="flex flex-1 flex-col sm:flex-row gap-3 items-stretch">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search name, email, ID, or mobile..."
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            className="pl-9 h-10 w-full"
            disabled={isPending}
          />
        </div>

        <div className="w-full sm:w-[180px] shrink-0">
          <Select value={typeVal} onValueChange={handleTypeChange} disabled={isPending}>
            <SelectTrigger className="h-10">
              <SelectValue placeholder="All Personnel" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Types</SelectItem>
              <SelectItem value="EMPLOYEE">Employees</SelectItem>
              <SelectItem value="INTERN">Interns</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <Button type="submit" className="h-10 px-4" disabled={isPending}>
            Search
          </Button>
          {(searchParams.get('search') || searchParams.get('type')) && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-10 w-10 text-slate-500 hover:text-slate-700"
              onClick={handleReset}
              disabled={isPending}
              title="Reset Search"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          )}
        </div>
      </form>

      <div className="shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 flex justify-end">
        <Link
          href="/dashboard/employees/new"
          className={buttonVariants({ variant: 'default', size: 'default', className: 'h-10 font-semibold' })}
        >
          <Plus className="mr-1.5 h-4 w-4" />
          Add Employee
        </Link>
      </div>
    </div>
  );
}
export default EmployeeSearchFilters;
