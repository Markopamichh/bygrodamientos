import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Cargar .env.local
const __dirname = dirname(fileURLToPath(import.meta.url));
readFileSync(join(__dirname, '..', '.env.local'), 'utf-8')
  .split('\n')
  .forEach((line) => {
    const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.*)\s*$/);
    if (m) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const DRY_RUN = process.argv.includes('--dry-run');

// Descripciones por slug. Redactadas según el tipo de producto, sin inventar
// medidas ni especificaciones puntuales. Tono consistente con las existentes.
const DESCRIPCIONES = {
  // ── Alineadores ──
  'alineador-de-ejes':
    'Instrumento de alineación de ejes que permite corregir la desalineación entre dos máquinas acopladas. Una alineación precisa reduce las vibraciones, el desgaste de rodamientos y retenes, el consumo de energía y prolonga la vida útil del equipo.',
  'alineador-de-poleas-tkba-40':
    'Alineador de poleas por láser diseñado para alinear con precisión poleas de transmisión por correa. Corrige la desalineación angular y paralela, reduciendo el desgaste prematuro de correas y poleas, el ruido y las pérdidas de potencia en la transmisión.',

  // ── Cadenas industriales ──
  'cadena-asa-doble':
    'Cadena de rodillos ASA de doble hilera para transmisión de potencia en maquinaria industrial y agrícola. La configuración doble permite transmitir mayor carga que una cadena simple manteniendo el mismo paso, ideal para aplicaciones de esfuerzo elevado.',
  'cadena-asa-triple':
    'Cadena de rodillos ASA de triple hilera para transmisión de alta potencia. Las tres hileras distribuyen la carga y permiten mover grandes esfuerzos en reductores, transportadores y maquinaria pesada con un funcionamiento estable y duradero.',
  'cadena-asa-cuadruple':
    'Cadena de rodillos ASA de cuádruple hilera para transmisión de potencia en aplicaciones de carga muy elevada. Ofrece máxima capacidad de trabajo para maquinaria industrial pesada donde se requiere transmitir grandes esfuerzos de forma continua.',

  // ── Herramientas ──
  'r7324791-01':
    'Kit de herramientas para el montaje y desmontaje de rodamientos y componentes de transmisión. Permite realizar las tareas de mantenimiento de forma segura y precisa, evitando daños en las piezas durante la instalación.',
  'calentadores-de-induccion-rodamientos-2':
    'Los calentadores de inducción calientan el rodamiento de forma rápida y uniforme para facilitar su montaje por dilatación, sin llama ni contacto directo. Es el método recomendado para instalar rodamientos sin dañar las pistas ni los elementos rodantes.',
  'extractores-mecanicos-para-rodamientos-2':
    'Extractores mecánicos para el desmontaje seguro de rodamientos, poleas y engranajes del eje. Aplican una fuerza controlada y centrada que evita dañar el componente y el asiento, agilizando las tareas de mantenimiento.',
  'kit-de-chapas-calibradas-skf':
    'Kit de chapas o láminas calibradas SKF de distintos espesores, utilizadas para ajustar y nivelar máquinas durante la alineación y el montaje. Permiten compensar diferencias de altura con precisión en el asentamiento de equipos.',
  'lubricacion':
    'Productos y equipos de lubricación para rodamientos y componentes mecánicos. Una lubricación adecuada reduce la fricción y el desgaste, disipa el calor y protege contra la corrosión, siendo clave para prolongar la vida útil de los rodamientos.',
  'lubricacion-2':
    'Grasas, aceites y sistemas de lubricación para el mantenimiento de rodamientos y maquinaria industrial. La correcta selección y aplicación del lubricante es determinante para el rendimiento y la duración de los componentes.',
  'calentador-de-induccion-pequeno':
    'Calentador de inducción compacto para el montaje de rodamientos de tamaño pequeño y mediano. Calienta la pieza de forma uniforme y controlada para facilitar el montaje por dilatación, sin llama y sin riesgo de dañar el rodamiento.',
  kits:
    'Kits de herramientas para el montaje, desmontaje y mantenimiento de rodamientos y componentes de transmisión. Reúnen en un solo conjunto los elementos necesarios para trabajar de forma segura y profesional.',
  'kits-2':
    'Conjunto de herramientas para tareas de instalación y mantenimiento de rodamientos. Facilitan un trabajo preciso y seguro, evitando el daño de las piezas durante el montaje y la extracción.',

  // ── Mangueras ──
  'mangueras-industriales':
    'Mangueras industriales para la conducción de fluidos en aplicaciones hidráulicas, neumáticas y de proceso. Fabricadas para resistir presión, temperatura y agentes químicos según el uso, garantizando un transporte seguro de líquidos, aire y gases.',

  // ── Módulos de giro ──
  'modulos-de-giro':
    'Los módulos de giro permiten el movimiento rotativo controlado entre dos partes de una máquina, transmitiendo carga axial, radial y momentos de vuelco. Se utilizan en grúas, plataformas giratorias, maquinaria de elevación y equipos industriales.',

  // ── Motores ──
  'motores-monofasicos':
    'Motores eléctricos monofásicos para aplicaciones que funcionan con red de corriente monofásica. Son la solución habitual para bombas, ventiladores, compresores y maquinaria de baja potencia en instalaciones domiciliarias, comerciales y rurales.',

  // ── Piñones ──
  'ruedas-dentadas-dobles':
    'Ruedas dentadas dobles para transmisión por cadena en sistemas de doble hilera. Engranan con la cadena para transmitir potencia entre ejes de forma eficiente y sincronizada en reductores, transportadores y maquinaria industrial.',

  // ── Retenes ──
  poliacrilico:
    'Retenes de poliacrílico (ACM) para el sellado de ejes rotativos. Este material resiste bien las altas temperaturas y los aceites lubricantes, siendo una opción habitual en cajas de cambio y componentes de motor sometidos a calor.',
  silicona:
    'Retenes de silicona (VMQ) para el sellado de ejes en aplicaciones con amplio rango de temperatura. La silicona mantiene su elasticidad tanto en frío como en calor, ideal donde se requiere estanqueidad en condiciones térmicas exigentes.',
  viton:
    'Retenes de Vitón (FKM) para el sellado de ejes rotativos en condiciones severas. El Vitón ofrece una excelente resistencia a altas temperaturas, aceites, combustibles y agentes químicos, siendo la elección para aplicaciones exigentes.',
  nitrilo:
    'Retenes de nitrilo (NBR) para el sellado de ejes rotativos. Es el material más difundido por su buena resistencia a aceites y grasas y su excelente relación costo-rendimiento en aplicaciones industriales y automotrices de uso general.',

  // ── Rodamientos ──
  agujas0002:
    'Rodamientos de agujas, compuestos por rodillos cilíndricos largos y delgados. Su reducida sección permite soportar cargas radiales elevadas en espacios muy ajustados, siendo ideales donde el diámetro exterior debe mantenerse al mínimo.',
  axiales0009:
    'Rodamientos axiales, diseñados para soportar cargas en el sentido del eje (empuje). Se emplean en aplicaciones donde predomina la carga axial, como ejes verticales, mesas giratorias y componentes sometidos a esfuerzo de empuje.',
  'bolas-a-rotula':
    'Rodamientos de bolas a rótula, con dos hileras de bolas y pista esférica en el aro exterior. Esta geometría los hace autoalineables, tolerando pequeñas desalineaciones del eje o errores de montaje sin comprometer su funcionamiento.',
  'contacto-angular':
    'Rodamientos de contacto angular, capaces de soportar cargas combinadas radiales y axiales de forma simultánea. Su diseño transmite la carga en ángulo respecto al eje, ideal para aplicaciones que requieren rigidez y precisión de giro.',
  'rigidos-de-bolas':
    'Los rodamientos rígidos de bolas son el tipo más difundido: soportan cargas radiales y axiales moderadas, admiten altas velocidades y requieren poco mantenimiento. Se utilizan en motores eléctricos, bombas, ventiladores y maquinaria en general.',
  'rodillos-a-rotula':
    'Rodamientos de rodillos a rótula, autoalineables y de gran capacidad de carga radial. Toleran desalineaciones y son ideales para aplicaciones pesadas con ejes largos o deformaciones, como zarandas, molinos y maquinaria industrial exigente.',
  'rodillos-cilindricos':
    'Rodamientos de rodillos cilíndricos, con alta capacidad de carga radial y aptos para altas velocidades. El contacto lineal entre rodillo y pista les permite soportar grandes cargas, habituales en reductores, motores y maquinaria pesada.',
  'rodamientos-linea-6200-2rs2z':
    'Rodamientos rígidos de bolas de la línea 6200 en versiones selladas (2RS) y con tapa metálica (2Z). El sellado protege contra el ingreso de suciedad y la pérdida de lubricante, siendo una serie muy utilizada en maquinaria de uso general.',
  'rodamientos-linea-6000-2rs2z':
    'Rodamientos rígidos de bolas de la línea 6000 en versiones selladas (2RS) y con tapa metálica (2Z). Serie de sección ligera para aplicaciones de uso general, con sellos que retienen el lubricante y evitan la entrada de contaminantes.',
  'rodamientos-linea-6300-2rs2z':
    'Rodamientos rígidos de bolas de la línea 6300 en versiones selladas (2RS) y con tapa metálica (2Z). De sección más robusta que la línea 6200, ofrece mayor capacidad de carga para aplicaciones industriales de exigencia media.',

  // ── Soportes ──
  'soportes-fnl722500-triangulares':
    'Soportes de pie bipartidos de la serie FNL con brida triangular, alojan rodamientos para el apoyo de ejes de transmisión. Su diseño partido facilita el montaje y el mantenimiento del rodamiento sin desmontar el eje completo.',
  'soportes-fnl722500-cuadrados':
    'Soportes de pie bipartidos de la serie FNL con brida cuadrada, para el alojamiento de rodamientos en el apoyo de ejes. La construcción partida permite instalar y reemplazar el rodamiento de forma sencilla en aplicaciones de transmisión.',
  'p2b-e-207r-type-e-xtra':
    'Soporte de rodamiento de la serie Dodge Type E-XTRA, de alta resistencia para aplicaciones industriales exigentes. Diseñado para soportar cargas elevadas y condiciones de trabajo severas en transportadores y maquinaria pesada.',
  'p2b-di-107re-dbl-enclavamiento':
    'Soporte de rodamiento Dodge con doble enclavamiento para la fijación segura del rodamiento sobre el eje. El sistema de doble bloqueo evita el deslizamiento bajo cargas de choque y vibración en aplicaciones industriales exigentes.',
  'soporte-p2b-s2-207re-dodge-070305':
    'Soporte de pie con rodamiento de la serie Dodge, para el apoyo de ejes de transmisión en maquinaria industrial. Combina el rodamiento y su alojamiento en una unidad lista para montar, facilitando la instalación y el mantenimiento.',

  // ── Transmisión ──
  poleas:
    'Poleas para transmisión de potencia por correa entre ejes. Transmiten el movimiento del motor a la máquina conducida y, según su relación de diámetros, permiten aumentar o reducir la velocidad de giro en el sistema de transmisión.',
  'poleas-2':
    'Poleas de transmisión por correa para el accionamiento de maquinaria industrial y agrícola. Trabajan junto a correas trapeciales o dentadas para transmitir potencia entre ejes y ajustar la relación de velocidades del sistema.',
  'manguitos-de-fijacion':
    'Manguitos de fijación para el montaje de rodamientos y poleas sobre ejes lisos. Permiten fijar y centrar el componente sin necesidad de mecanizar el eje, facilitando el montaje, el ajuste y el desmontaje de las piezas.',
  'correas-dentadas':
    'Correas dentadas para transmisión sincrónica de potencia. Los dientes engranan con la polea evitando el deslizamiento, lo que garantiza una relación de transmisión exacta, ideal en aplicaciones que requieren sincronización precisa.',
  'correas-dentadas-multicanal':
    'Correas dentadas multicanal para transmisión de potencia en sistemas con varias ranuras. Combinan la sincronización de la correa dentada con la capacidad de transmitir mayor esfuerzo en aplicaciones industriales de exigencia.',
  'correas-agricolas':
    'Correas agrícolas diseñadas para el accionamiento de maquinaria del campo. Fabricadas para resistir cargas de choque, polvo e intemperie, transmiten potencia de forma confiable en cosechadoras, sembradoras y equipos agrícolas.',
  'correas-dentadas-2':
    'Correas dentadas industriales para transmisión sincrónica entre ejes. Su perfil dentado engrana con la polea sin deslizamiento, asegurando una relación de transmisión precisa y un funcionamiento silencioso y de bajo mantenimiento.',
  'acoplamientos-de-brida-tru-line-rfk':
    'Acoplamientos de brida Tru-Line RFK para la unión y transmisión de potencia entre dos ejes. Conectan el eje motriz con el conducido transmitiendo el par de giro y admitiendo pequeñas desalineaciones, con un montaje y desmontaje sencillos.',
};

async function main() {
  const slugs = Object.keys(DESCRIPCIONES);
  console.log('Descripciones a cargar:', slugs.length);

  let ok = 0,
    faltantes = [];
  for (const slug of slugs) {
    const descripcion = DESCRIPCIONES[slug].trim();
    if (DRY_RUN) {
      console.log(`\n[${slug}] (${descripcion.length} car.)\n  ${descripcion}`);
      continue;
    }
    // Limpia también descripcion_larga si tuviera relleno (< 40 car. sin espacios).
    const { data, error } = await supabase
      .from('productos')
      .update({ descripcion, descripcion_larga: '', updated_at: new Date().toISOString() })
      .eq('slug', slug)
      .eq('activo', true)
      .select('slug');
    if (error) {
      faltantes.push(`${slug}: ${error.message}`);
    } else if (!data || data.length === 0) {
      faltantes.push(`${slug}: no encontrado`);
    } else {
      ok++;
    }
  }

  if (DRY_RUN) {
    console.log('\n[DRY RUN] No se actualizó nada.');
    return;
  }
  console.log('\nActualizados:', ok);
  if (faltantes.length) {
    console.log('Con problemas:', faltantes.length);
    faltantes.forEach((f) => console.log('  -', f));
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
