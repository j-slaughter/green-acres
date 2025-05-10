/* This file contains all the Server Actions functions.
 Note: any functions included in this file that are not used will 
 be automatically removed from the final application bundle per Next.js docs. */
'use server';
// Import type validation library to easily validate data
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import postgres from 'postgres';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

// Use Zod to update the expected types
const FormSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  amount: z.coerce.number(),
  status: z.enum(['pending', 'paid']),
  date: z.string(),
});

const CreateInvoice = FormSchema.omit({ id: true, date: true });

export async function createInvoice(formData: FormData) {
  // Extract the form data
  const rawFormData = {
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  };
  // Validate data (formatting and type validation)
  const { customerId, amount, status } = CreateInvoice.parse(rawFormData);
  // Store amount as cents in database
  const amountInCents = amount * 100;
  // Store date [YYYY-MM-DD]
  const date = new Date().toISOString().split('T')[0];
  // Create invoice in database
  await sql`INSERT INTO invoices (customer_id, amount, status, date) VALUES (${customerId}, ${amountInCents}, ${status}, ${date})`;
  // Clear the client-side router cache and trigger a new request to the server
  revalidatePath('/dashboard/invoices');
  // Redirect user back to invoices page
  redirect('/dashboard/invoices');
}

const UpdateInvoice = FormSchema.omit({ id: true, date: true });

export async function updateInvoice(id: string, formData: FormData) {
  // Extract and validate form data
  const { customerId, amount, status } = UpdateInvoice.parse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });
  // Store amount as cents
  const amountInCents = amount * 100;
  // Update invoice in database
  await sql`UPDATE invoices SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status} WHERE id = ${id}`;
  // Clear client cache and redirect user back to invoices
  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}
