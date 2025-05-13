// This is the edit invoice page associated with the route /dashboard/invoices/[invoiceID]/edit
// The brackets around [id] indicate that this is a Dynamic Route Segment: the route will change based on the input data
import Form from '@/app/ui/invoices/edit-form';
import Breadcrumbs from '@/app/ui/invoices/breadcrumbs';
import { fetchInvoiceById, fetchCustomers } from '@/app/lib/data';
import { notFound } from 'next/navigation';

export default async function Page(props: { params: Promise<{ id: string }> }) {
  // Get id params from the props
  const params = await props.params;
  const id = params.id;
  // Get specific invoice and list of customers
  const [invoice, customers] = await Promise.all([fetchInvoiceById(id), fetchCustomers()]);

  // Use notFound to handle 404 page cases. Loads the not-found.tsx component instead.
  if (!invoice) {
    notFound();
  }

  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Invoices', href: '/dashboard/invoices' },
          { label: 'Edit Invoice', href: `/dashboard/invoices/${id}/edit`, active: true },
        ]}
      />
      <Form invoice={invoice} customers={customers} />
    </main>
  );
}
