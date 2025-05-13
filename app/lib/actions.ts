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
  customerId: z.string({
    invalid_type_error: 'Please select a customer.',
  }),
  amount: z.coerce.number().gt(0, { message: 'Please enter an amount greater than $0.' }),
  status: z.enum(['pending', 'paid'], {
    invalid_type_error: 'Please select an invoice status.',
  }),
  date: z.string(),
});

const CreateInvoice = FormSchema.omit({ id: true, date: true });

// Create State type
export type State = {
  errors?: {
    customerId?: string[];
    amount?: string[];
    status?: string[];
  };
  message?: string | null;
};

export async function createInvoice(prevState: State, formData: FormData) {
  // Extract the form data
  const rawFormData = {
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  };
  // Validate data (formatting and type validation)
  const validatedFields = CreateInvoice.safeParse(rawFormData);
  console.log(validatedFields);
  // If form validation fails, return errors early. Otherwise, continue.
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to create invoice.',
    };
  }
  // Prepare data for insertion into the database
  const { customerId, amount, status } = validatedFields.data;
  // Store amount as cents in database
  const amountInCents = amount * 100;
  // Store date [YYYY-MM-DD]
  const date = new Date().toISOString().split('T')[0];
  try {
    // Create invoice in database
    await sql`INSERT INTO invoices (customer_id, amount, status, date) VALUES (${customerId}, ${amountInCents}, ${status}, ${date})`;
  } catch (error) {
    console.error(error);
    // If a database error occurs, return a more specific error.
    return {
      message: 'Database Error: Failed to create invoice.',
    };
  }
  // Clear the client-side router cache and trigger a new request to the server
  revalidatePath('/dashboard/invoices');
  // Redirect user back to invoices page
  // Per Next.js docs, works by throwing an error so must be outside try/catch block or will trigger catch
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
  try {
    // Update invoice in database
    await sql`UPDATE invoices SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status} WHERE id = ${id}`;
  } catch (error) {
    console.error(error);
  }
  // Clear client cache and redirect user back to invoices
  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

export async function deleteInvoice(id: string) {
  try {
    // Delete invoice from database
    await sql`DELETE FROM invoices WHERE id = ${id}`;
  } catch (error) {
    console.error(error);
  }
  // Clear client cache and trigger new request to server to re-render table
  revalidatePath('/dashboard/invoices');
}
