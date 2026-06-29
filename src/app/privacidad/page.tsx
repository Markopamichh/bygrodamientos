import type { Metadata } from 'next';
import Container from '@/components/shared/Container';
import { CONTACT } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Política de Privacidad',
  description: 'Política de privacidad y protección de datos personales de BYG Rodamientos.',
  robots: { index: false },
};

export default function PrivacidadPage() {
  return (
    <Container className="py-16 max-w-3xl">
      <h1 className="text-3xl font-bold text-secondary mb-2">Política de Privacidad</h1>
      <p className="text-stone-500 text-sm mb-10">Última actualización: junio de 2025</p>

      <div className="prose prose-stone max-w-none space-y-8 text-stone-700">

        <section>
          <h2 className="text-xl font-semibold text-secondary mb-3">1. Responsable del tratamiento</h2>
          <p>
            <strong>BYG Rodamientos</strong>, con domicilio en Collon Cura 240, Neuquén (8300), Argentina.
            CUIT: 20-20794031-4. Correo de contacto: <a href={`mailto:${CONTACT.email}`} className="text-primary hover:underline">{CONTACT.email}</a>.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-secondary mb-3">2. Datos que recolectamos</h2>
          <p>A través del formulario de contacto de este sitio podemos recolectar:</p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Nombre y apellido</li>
            <li>Dirección de correo electrónico</li>
            <li>Número de teléfono</li>
            <li>Mensaje o consulta enviada</li>
          </ul>
          <p className="mt-3">No recolectamos datos sensibles, datos de pago ni información de menores de 18 años.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-secondary mb-3">3. Finalidad del tratamiento</h2>
          <p>Los datos recolectados se utilizan exclusivamente para:</p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Responder consultas comerciales y técnicas enviadas a través del formulario de contacto.</li>
            <li>Enviar presupuestos o información solicitada por el usuario.</li>
          </ul>
          <p className="mt-3">No utilizamos los datos con fines publicitarios ni los cedemos a terceros.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-secondary mb-3">4. Base legal</h2>
          <p>
            El tratamiento de datos se realiza con el consentimiento del usuario al completar y enviar el formulario de contacto,
            en cumplimiento de la <strong>Ley 25.326 de Protección de Datos Personales</strong> de la República Argentina.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-secondary mb-3">5. Almacenamiento y seguridad</h2>
          <p>
            Los datos se almacenan en servidores seguros provistos por Supabase (infraestructura en Amazon Web Services).
            Aplicamos medidas técnicas y organizativas para proteger la información contra accesos no autorizados,
            pérdida o alteración.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-secondary mb-3">6. Plazo de conservación</h2>
          <p>
            Los datos se conservan mientras sean necesarios para responder la consulta del usuario y por el tiempo
            que requieran las obligaciones legales o comerciales derivadas de la misma.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-secondary mb-3">7. Derechos del titular</h2>
          <p>
            Conforme a la Ley 25.326, el titular de los datos tiene derecho a acceder, rectificar, actualizar
            o suprimir sus datos personales. Para ejercer estos derechos, puede comunicarse a:
          </p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Email: <a href={`mailto:${CONTACT.email}`} className="text-primary hover:underline">{CONTACT.email}</a></li>
            <li>Teléfono: {CONTACT.phone}</li>
            <li>Dirección: Collon Cura 240, Neuquén (8300), Argentina</li>
          </ul>
          <p className="mt-3 text-sm text-stone-500">
            La Dirección Nacional de Protección de Datos Personales tiene la atribución de atender las denuncias
            y reclamos que interpongan quienes resulten afectados en sus derechos por incumplimiento de las normas vigentes.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-secondary mb-3">8. Cookies</h2>
          <p>
            Este sitio utiliza únicamente cookies técnicas necesarias para el funcionamiento de la plataforma.
            No utilizamos cookies de seguimiento ni de publicidad de terceros.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-secondary mb-3">9. Modificaciones</h2>
          <p>
            BYG Rodamientos se reserva el derecho de actualizar esta política en cualquier momento.
            Los cambios se publicarán en esta misma página con la fecha de última actualización.
          </p>
        </section>

      </div>
    </Container>
  );
}
