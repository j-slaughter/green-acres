// UI Search component. This is a React Client Component, which means you can use event listeners and hooks.
'use client';

import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';

export default function Search({ placeholder }: { placeholder: string }) {
  // Get search params (readonly)
  const searchParams = useSearchParams();
  // Get URL pathname (i.e. /dashboard/invoices)
  const pathname = usePathname();
  const { replace } = useRouter();

  /* handleSearch - handles the submitted search input. Wrapped in 
  debounced function to execute only after user has stopped typing 
  for 400ms.
  */
  const handleSearch = useDebouncedCallback((term: string) => {
    // Create URLSearchParams instance to manipulate URL query params
    const params = new URLSearchParams(searchParams);
    // Update search params with user's search term
    if (term) {
      params.set('query', term);
    } else {
      // If no search term, delete the search 'query' key
      params.delete('query');
    }
    // Update the URL by replacing the router path
    replace(`${pathname}?${params.toString()}`);
  }, 400);

  return (
    <div className="relative flex flex-1 flex-shrink-0">
      <label htmlFor="search" className="sr-only">
        Search
      </label>
      <input
        className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
        placeholder={placeholder}
        onChange={(e) => {
          handleSearch(e.target.value);
        }}
        defaultValue={searchParams.get('query')?.toString()}
      />
      {/* Use defaultValue to ensure input field is in sync with the URL and will be populated 
          when sharing the route page. If we were using state to manage the value of an input, 
          we'd use the 'value' attribute instead. */}
      <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
    </div>
  );
}
