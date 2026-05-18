# Submódulos IPSUR

Mapa de responsabilidades del proyecto. Cada carpeta bajo `modules/` describe un **submódulo lógico** y apunta a los archivos reales en la raíz del repo.

## Índice

| ID | Carpeta | Qué es |
|----|---------|--------|
| sitio-publico | `sitio-publico/` | Home, newsletter |
| paginas-institucionales | `paginas-institucionales/` | Páginas HTML estáticas |
| cms-publicaciones | `cms-publicaciones/` | Publicaciones + admin |
| newsletter | `newsletter/` | Suscripciones Firestore |
| base-datos | `base-datos/` | Firebase / Firestore |
| autenticacion | `autenticacion/` | Login del panel |
| layout-ui | `layout-ui/` | Header, footer, nav |
| estilos | `estilos/` | `css/style.css` |
| activos-estaticos | `activos-estaticos/` | Imágenes fijas |

Registro maestro: [`manifest.json`](manifest.json)

## Estructura objetivo (futura, opcional)

```
IPSUR/
├── index.html                    ← Home (sitio-publico)
├── pages/
│   ├── institucionales/        ← Quiénes somos, convocatorias, etc.
│   └── cms/
│       └── publicaciones.html  ← Publicaciones + Firebase
├── admin/
│   └── index.html              ← Panel admin
├── js/ · css/ · assets/images/
└── modules/
```

Solo `index.html` queda en la raíz (GitHub Pages). El resto de HTML vive en la carpeta de su submódulo.
