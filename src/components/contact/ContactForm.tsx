'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const contactSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  company: z.string().optional(),
  email: z.string().email('Email inválido'),
  phone: z.string().min(8, 'Teléfono inválido'),
  product: z.string().optional(),
  message: z.string().min(10, 'El mensaje debe tener al menos 10 caracteres'),
  isEmergency: z.boolean().default(false),
});

type ContactFormData = z.infer<typeof contactSchema>;

export default function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      // Aquí iría la integración con EmailJS o Resend
      // Por ahora simulamos el envío
      await new Promise((resolve) => setTimeout(resolve, 1500));

      console.log('Form data:', data);
      setSubmitStatus('success');
      reset();

      // Reset status después de 5 segundos
      setTimeout(() => {
        setSubmitStatus('idle');
      }, 5000);
    } catch (error) {
      console.error('Error:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Nombre */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-stone-700 mb-1">
          Nombre completo *
        </label>
        <input
          {...register('name')}
          type="text"
          id="name"
          className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 bg-stone-50 focus:bg-white"
          placeholder="Juan Pérez"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>

      {/* Empresa */}
      <div>
        <label htmlFor="company" className="block text-sm font-medium text-stone-700 mb-1">
          Empresa (opcional)
        </label>
        <input
          {...register('company')}
          type="text"
          id="company"
          className="w-full px-4 py-2 border border-stone-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 bg-stone-50 focus:bg-white"
          placeholder="Mi Empresa S.A."
        />
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-stone-700 mb-1">
          Email *
        </label>
        <input
          {...register('email')}
          type="email"
          id="email"
          className="w-full px-4 py-2 border border-stone-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 bg-stone-50 focus:bg-white"
          placeholder="correo@ejemplo.com"
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
        )}
      </div>

      {/* Teléfono */}
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-stone-700 mb-1">
          Teléfono *
        </label>
        <input
          {...register('phone')}
          type="tel"
          id="phone"
          className="w-full px-4 py-2 border border-stone-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 bg-stone-50 focus:bg-white"
          placeholder="299-1234567"
        />
        {errors.phone && (
          <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
        )}
      </div>

      {/* Producto de interés */}
      <div>
        <label htmlFor="product" className="block text-sm font-medium text-stone-700 mb-1">
          Producto de interés (opcional)
        </label>
        <select
          {...register('product')}
          id="product"
          className="w-full px-4 py-2 border border-stone-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 bg-stone-50 focus:bg-white"
        >
          <option value="">Seleccione una opción</option>
          <option value="rodamientos">Rodamientos Industriales</option>
          <option value="retenes">Retenes</option>
          <option value="orings">O-Rings</option>
          <option value="transmision">Componentes de Transmisión</option>
          <option value="herramientas">Herramientas</option>
          <option value="sellos">Sellos Mecánicos</option>
          <option value="automotriz">Línea Automotriz</option>
          <option value="otro">Otro</option>
        </select>
      </div>

      {/* Mensaje */}
      <div>
        <label htmlFor="message" className="block text-sm font-medium text-stone-700 mb-1">
          Mensaje *
        </label>
        <textarea
          {...register('message')}
          id="message"
          rows={5}
          className="w-full px-4 py-2 border border-stone-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 bg-stone-50 focus:bg-white"
          placeholder="Describa su consulta o necesidad..."
        />
        {errors.message && (
          <p className="mt-1 text-sm text-red-600">{errors.message.message}</p>
        )}
      </div>

      {/* Emergencia */}
      <div className="flex items-center">
        <input
          {...register('isEmergency')}
          type="checkbox"
          id="isEmergency"
          className="h-4 w-4 text-primary focus:ring-primary border-stone-300 rounded"
        />
        <label htmlFor="isEmergency" className="ml-2 block text-sm text-stone-600">
          Es una emergencia (requiere atención inmediata)
        </label>
      </div>

      {/* Submit button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-primary hover:bg-primary-dark text-white px-6 py-3.5 rounded-xl font-medium transition-all duration-300 ease-out-expo disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5 active:translate-y-0"
      >
        {isSubmitting ? 'Enviando...' : 'Enviar Consulta'}
      </button>

      {/* Status messages */}
      {submitStatus === 'success' && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-md">
          <p className="text-green-800 font-medium">
            ¡Mensaje enviado exitosamente! Nos pondremos en contacto a la brevedad.
          </p>
        </div>
      )}

      {submitStatus === 'error' && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800 font-medium">
            Error al enviar el mensaje. Por favor, intente nuevamente o contáctenos por teléfono.
          </p>
        </div>
      )}
    </form>
  );
}
