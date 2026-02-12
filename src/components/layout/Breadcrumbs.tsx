import React from 'react';
import Link from 'next/link';
import Container from '@/components/shared/Container';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <div className="bg-gray-50 py-4">
      <Container>
        <nav aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2 text-sm">
            <li>
              <Link href="/" className="text-gray-500 hover:text-primary transition">
                Inicio
              </Link>
            </li>
            {items.map((item, index) => (
              <li key={index} className="flex items-center">
                <span className="mx-2 text-gray-400">/</span>
                {item.href ? (
                  <Link href={item.href} className="text-gray-500 hover:text-primary transition">
                    {item.label}
                  </Link>
                ) : (
                  <span className="text-gray-900 font-medium">{item.label}</span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      </Container>
    </div>
  );
}
