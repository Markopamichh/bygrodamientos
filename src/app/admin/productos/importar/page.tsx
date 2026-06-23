import ImportCSVForm from './ImportCSVForm';

export const metadata = { title: 'Importar Productos — Admin BYG' };

export default function ImportarProductosPage() {
  return (
    <div className="p-6 md:p-8 max-w-4xl">
      <div className="mb-6">
        <a
          href="/admin/productos"
          className="text-white/30 hover:text-white text-sm transition-colors flex items-center gap-1.5 mb-4"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Volver a productos
        </a>
        <h1 className="text-2xl font-bold text-white">Importar productos desde CSV</h1>
        <p className="text-white/40 text-sm mt-1">
          Cargá múltiples productos de una sola vez subiendo un archivo CSV.
        </p>
      </div>

      <ImportCSVForm />
    </div>
  );
}
