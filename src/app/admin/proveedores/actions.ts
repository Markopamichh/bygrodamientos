'use server';

import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/server';

export async function crearProveedorAction(formData: FormData) {
  const supabase = createAdminClient();
  const { error } = await supabase.from('proveedores').insert({
    nombre: formData.get('nombre') as string,
    telefono: (formData.get('telefono') as string) || null,
    email: (formData.get('email') as string) || null,
    sitio_web: (formData.get('sitio_web') as string) || null,
    contacto: (formData.get('contacto') as string) || null,
    notas: (formData.get('notas') as string) || null,
  });
  if (error) throw new Error(error.message);
  revalidatePath('/admin/proveedores');
}

export async function editarProveedorAction(id: string, formData: FormData) {
  const supabase = createAdminClient();
  const { error } = await supabase.from('proveedores').update({
    nombre: formData.get('nombre') as string,
    telefono: (formData.get('telefono') as string) || null,
    email: (formData.get('email') as string) || null,
    sitio_web: (formData.get('sitio_web') as string) || null,
    contacto: (formData.get('contacto') as string) || null,
    notas: (formData.get('notas') as string) || null,
  }).eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/admin/proveedores');
}

export async function eliminarProveedorAction(id: string) {
  const supabase = createAdminClient();
  const { error } = await supabase.from('proveedores').delete().eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/admin/proveedores');
}
