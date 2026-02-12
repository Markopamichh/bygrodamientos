import React from 'react';
import { companyInfo } from '@/data/company';

export default function ContactInfo() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-secondary mb-4">Información de Contacto</h3>
      </div>

      {/* Dirección */}
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-xl">📍</span>
        </div>
        <div>
          <h4 className="font-medium text-gray-900 mb-1">Dirección</h4>
          <p className="text-gray-600">
            {companyInfo.address}
            <br />
            {companyInfo.city}, {companyInfo.province}
          </p>
        </div>
      </div>

      {/* Teléfonos */}
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-xl">📞</span>
        </div>
        <div>
          <h4 className="font-medium text-gray-900 mb-1">Teléfonos</h4>
          <p className="text-gray-600">
            <a href={`tel:${companyInfo.phone}`} className="hover:text-primary transition">
              {companyInfo.phone}
            </a>
            <br />
            {companyInfo.phone2 && (
              <a href={`tel:${companyInfo.phone2}`} className="hover:text-primary transition">
                {companyInfo.phone2}
              </a>
            )}
          </p>
        </div>
      </div>

      {/* WhatsApp */}
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-xl">💬</span>
        </div>
        <div>
          <h4 className="font-medium text-gray-900 mb-1">WhatsApp</h4>
          <a
            href={`https://wa.me/${companyInfo.whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-600 hover:text-green-700 transition"
          >
            {companyInfo.whatsapp}
          </a>
        </div>
      </div>

      {/* Email */}
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-xl">✉️</span>
        </div>
        <div>
          <h4 className="font-medium text-gray-900 mb-1">Email</h4>
          <a
            href={`mailto:${companyInfo.email}`}
            className="text-gray-600 hover:text-primary transition"
          >
            {companyInfo.email}
          </a>
        </div>
      </div>

      {/* Horarios */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h4 className="font-bold text-gray-900 mb-3">Horarios de Atención</h4>
        <div className="space-y-2 text-sm">
          <p className="text-gray-700">
            <span className="font-medium">Lunes a Viernes:</span> 8:00 - 18:00
          </p>
          <p className="text-gray-700">
            <span className="font-medium">Sábados:</span> 9:00 - 13:00
          </p>
          <p className="text-gray-700">
            <span className="font-medium">Domingos:</span> Cerrado
          </p>
        </div>
      </div>
    </div>
  );
}
