'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="bg-white shadow">
      <div className="container mx-auto px-4">
        <div>
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="">
                {/* Content removed */}
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {/* Navigation items removed */}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
} 