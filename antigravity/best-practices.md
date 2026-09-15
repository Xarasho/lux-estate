# Buenas Prácticas para Aplicaciones Inmobiliarias con Next.js (Lux Estate)

Guía exhaustiva de estándares, patrones de arquitectura, optimización y recomendaciones de negocio para el desarrollo de plataformas de bienes raíces modernas, escalables y de alto rendimiento utilizando **Next.js (App Router)** y **Tailwind CSS**.

---

## 1. Arquitectura y Rendimiento en Next.js (App Router)

- **Priorizar React Server Components (RSC):**
  - Renderizar por defecto en el servidor todas las vistas públicas (catálogos, fichas de propiedad, páginas informativas) para reducir el bundle de JavaScript enviado al cliente.
  - Reservar `'use client'` exclusivamente para componentes con interactividad directa (filtros interactivos, carruseles, mapas, modales y formularios).
- **Carga progresiva con Streaming y Suspense:**
  - Envolver componentes asíncronos y listados de propiedades en límites de `<Suspense>`.
  - Implementar **Skeleton Loaders** que repliquen la estructura visual de las tarjetas de propiedades para minimizar el Cumulative Layout Shift (CLS).
- **Estrategia de Caching e Invalidación Inteligente:**
  - Emplear **Incremental Static Regeneration (ISR)** con `revalidate` en fichas de propiedades de baja rotación para tiempos de carga casi instantáneos.
  - Utilizar revalidación bajo demanda (`revalidatePath` / `revalidateTag`) activada mediante webhooks desde el CMS o base de datos cuando se actualicen precios, disponibilidad o imágenes.
- **Server Actions & Route Handlers:**
  - Usar Server Actions para el procesamiento de leads, solicitudes de visita y suscripciones a alertas, garantizando validación segura en el servidor sin exponer lógica sensible.
  - Mantener Route Handlers dedicados si se requiere exponer endpoints para integraciones con CRMs (HubSpot, Salesforce) o APIs de terceros.

---

## 2. Optimización Multimedia y Renderizado Visual (Foco Crítico en Real Estate)

- **Optimización estricta con `next/image`:**
  - Declarar siempre dimensiones explícitas o `fill` junto al atributo `sizes` adaptado a breakpoints móviles, tablets y desktop.
  - Marcar con `priority={true}` únicamente la imagen principal (Hero / Portada) visible en el viewport inicial (LCP).
  - Usar formatos modernos de alta compresión (**AVIF** y **WebP**) configurados en `next.config.js`.
  - Generar y aplicar `placeholder="blur"` con `blurDataURL` (versiones base64 de baja resolución) para evitar pantallas vacías mientras cargan las fotografías de alta calidad.
- **Galerías y Carruseles Eficientes:**
  - Implementar carga diferida (*lazy loading*) para las fotos secundarias de la galería.
  - Descargar recursos pesados (visores 360°, tours virtuales de Matterport, videos 4K) mediante carga dinámica con `next/dynamic` solo cuando el usuario interactúe con ellos.
- **Servicio y CDN de Medios:**
  - Centralizar las fotografías en un almacenamiento en la nube con CDN global optimizado para transformación de imágenes al vuelo (Cloudinary, Cloudflare Images o Supabase Storage).

---

## 3. SEO Técnico y Posicionamiento Local Inmobiliario

- **Metadatos Dinámicos con `generateMetadata`:**
  - Generar títulos y meta-descripciones únicos y orientados a intención de búsqueda inmobiliaria:  
    *Ejemplo:* `Penthouse de Lujo en Venta en Polanco | 3 Recámaras | Lux Estate`.
  - Incluir en los metadatos el rango de precio, ubicación exacta (colonia/municipio/ciudad) y características principales.
- **Datos Estructurados (Schema.org / JSON-LD):**
  - Inyectar microdatos específicos como `RealEstateListing`, `SingleFamilyResidence`, `Apartment`, `Offer` y `PostalAddress`.
  - Especificar precios, divisas, geocoordenadas (lat/long) y estado de disponibilidad (`InStock` / `Sold`).
- **Previsualizaciones en Redes Sociales (Open Graph Dinámico):**
  - Utilizar `@vercel/og` (`ImageResponse`) para generar automáticamente banners de Open Graph con la foto principal, precio formateado, título y logotipo de la marca al compartir enlaces en WhatsApp, Twitter o Facebook.
- **Estructura de URLs Limpias y Canónicas:**
  - Diseñar rutas descriptivas y legibles: `/propiedades/[ciudad]/[zona]/[slug-propiedad]`.
  - Generar un sitemap dinámico (`sitemap.ts`) que indexe automáticamente todas las propiedades activas y categorías de búsqueda.

---

## 4. Búsqueda, Filtros y Manejo de Estado

- **Filtros Sincronizados con URL Search Params:**
  - Mantener el estado de los filtros (rango de precio, recámaras, tipo de inmueble, amenidades) en la URL (`/propiedades?tipo=casa&minPrecio=5000000&zona=san-pedro`).
  - Permite compartir búsquedas filtradas directamente, guardar en favoritos del navegador y mantener la funcionalidad de retroceso/avance del historial.
- **Debounce en Búsquedas de Texto Libre:**
  - Aplicar un retraso (300ms–400ms) en inputs de texto de búsqueda por palabra clave o colonia para evitar peticiones redundantes.
- **Filtros Inmobiliarios Esenciales:**
  - Selector de moneda (MXN / USD).
  - Rango de precio interactivo (Dual Range Slider).
  - Tipo de transacción (Venta / Renta / Preventa).
  - Tipo de propiedad (Casa, Departamento, Terreno, Villa, Penthouse).
  - Métricas clave: Mínimo de recámaras, baños, cajones de estacionamiento y m² (terreno y construcción).
  - Checkboxes de amenidades exclusivas: Alberca, seguridad privada 24/7, gimnasio, elevador, terraza, pet friendly, vista panorámica.
- **Conteo Dinámico de Resultados (Faceted Search):**
  - Mostrar en tiempo real cuántas propiedades coinciden con cada opción antes de aplicar el filtro (ej. `Departamentos (14)`, `Casas (8)`).

---

## 5. Integración de Mapas y Geolocalización

- **Carga Condicional y Modular:**
  - Importar las librerías de mapas (Mapbox GL, Leaflet o Google Maps) usando `next/dynamic` con `{ ssr: false }` para evitar errores de hidratación de window y no inflar el tamaño inicial de la página.
- **Agrupamiento de Pines (Clustering):**
  - Usar algoritmos de clustering para agrupar marcadores cuando se aleja el zoom, manteniendo 60 FPS en pantalla.
- **Sincronización Bidireccional (Split-View):**
  - Al pasar el cursor sobre una tarjeta del listado, destacar su pin en el mapa.
  - Al hacer clic en un marcador del mapa, hacer scroll suave a la tarjeta correspondiente o abrir una vista previa rápida (*card preview*).
- **Filtro por Radio o Búsqueda en Esta Área:**
  - Permitir al usuario mover el mapa y volver a consultar propiedades dentro de los límites visibles (*bounding box*).

---

## 6. Experiencia de Usuario (UX), Diseño UI y Conversión (CRO)

- **Jerarquía Visual y Estética de Lujo:**
  - Aplicar la paleta corporativa estricta (`Nordic`, `Mosque`, `Hint of Green`, `Clear Day`) y tipografía del sistema (`SF Pro Display`).
  - Utilizar espaciado generoso, líneas sutiles y tarjetas bien estructuradas para transmitir exclusividad y confianza.
- **Ficha de Propiedad (PDP) de Alto Impacto:**
  - **Above the Fold:** Precio visible con formato de moneda claro, clave de referencia, etiquetas de estado ("Exclusiva", "En Venta", "Preventa") y resumen de amenidades principales.
  - **Calculadora Hipotecaria Integrada:** Permitir al usuario estimar cuotas mensuales ajustando enganche, tasa de interés y plazo en años.
  - **Ficha Técnica Detallada:** Superficie total, superficie construida, año de construcción, cuota de mantenimiento, orientación y nivel/piso.
  - **Puntos de Interés Cercanos:** Distancias y tiempos de traslado a escuelas de prestigio, hospitales, centros comerciales y vías principales.
  - **Información del Asesor / Broker:** Foto profesional, nombre, cédula/licencia y botón de contacto verificado.
- **Optimización de Captura de Leads:**
  - **Acceso Directo a WhatsApp:** Botón flotante o integrado en la ficha con mensaje predeterminado que incluye la clave y enlace de la propiedad.
  - **Agendamiento de Visitas:** Calendario integrado para seleccionar fecha y horario (presencial o videollamada guiada).
  - **Formularios Reducidos:** Solicitar solo información indispensable (Nombre, Teléfono, Correo y Horario de preferencia).
- **Herramientas de Valor para el Usuario:**
  - Lista de favoritos persistente (guardada en `localStorage` para usuarios no registrados o en base de datos para usuarios autenticados).
  - Botón de compartir nativo mediante la API `navigator.share` en móviles.
  - Descarga instantánea de ficha técnica en formato PDF con diseño limpio de la marca.

---

## 7. Calidad de Código, Seguridad y Accesibilidad

- **Validación con Esquemas Fuertes (Zod):**
  - Validar todos los formularios de contacto, filtros y parámetros de consulta con esquemas Zod compartidos entre cliente y servidor.
- **Prevención de Spam y Abuso:**
  - Proteger los formularios de contacto mediante Cloudflare Turnstile o reCAPTCHA v3 invisible para evitar envíos automatizados de bots.
  - Aplicar rate limiting en endpoints de contacto para prevenir ataques de denegación de servicio o saturación de bandejas.
- **Accesibilidad (a11y):**
  - Atributos `alt` descriptivos en todas las fotografías (ej. `Recámara principal con ventanales de piso a techo y vista al jardín`).
  - Navegación completa por teclado en carruseles, modales y selectores de filtros.
  - Contraste cromático adecuado conforme a normas WCAG 2.1 AA entre los colores oscuros (`Nordic`) y fondos claros (`Clear Day`).

---

## 8. Ideas Innovadoras y Diferenciadoras para Lux Estate

1. **Comparador Lado a Lado de Propiedades:**
   - Permitir seleccionar hasta 3 propiedades y comparar en una tabla interactiva precios por m², amenidades, mantenimiento y ubicación.
2. **Alertas de Precio y Notificaciones de Oportunidades:**
   - Opción para suscribirse a una propiedad específica y recibir aviso si hay una reducción de precio o cambio de estatus.
3. **Conversor de Divisas en Tiempo Real:**
   - Alternar de forma transparente entre Pesos Mexicanos (MXN) y Dólares (USD) con actualización automática del tipo de cambio.
4. **Modo Presentación para Asesores (Broker Mode):**
   - Vista optimizada para tabletas que oculta comisiones o datos internos de corretaje al mostrar el catálogo a un cliente de forma presencial.
5. **Score de Calidad de Vida / Neighborhood Insights:**
   - Tarjetas informativas con índices de seguridad, caminabilidad (*walk score*) y áreas verdes de la colonia donde se ubica el inmueble.
