
  

#  📚 Club de lectores - Marvel Comics Stock Scraper

  

Un script simple y efectivo para extraer la lista de cómics [Marvel Clásicos en Club de Lectores](https://www.clubdelectores.cl/marvel-superheroes-clasico/) y su stock disponible.

Ideal para monitorear rápido el inventario y detectar qué cómics están a punto de agotarse.

---

##  🔥 ¿Qué hace?

  

-  Extrae títulos y URLs de la página principal.

-  Consulta cada página individual para obtener el stock disponible.

-  Muestra en consola una lista ordenada por stock, con emojis para que lo interpretes al vuelo.

-  Guarda los resultados en **JSON** y **CSV** para que puedas analizarlos o integrarlos donde quieras.

-  Maneja errores con reintentos automáticos para no parar por fallos temporales.

---


##  🚀 Cómo usar

  

```bash

git  clone  https://github.com/pipetboy2001/club-de-lectores-Mercurio-scraper.git

cd  club-de-lectores-Mercurio-scraper

npm  install

node  scraper.js

```


-  Verás la lista ordenada en consola, fácil de leer.

-  Se crearán dos archivos en la raíz:

-  `comics-stock.json`

-  `comics-stock.csv`

 
---

##  🛠 Tecnologías

  

-  Node.js

-  Axios (para hacer peticiones HTTP)

-  Cheerio (para parsear HTML, estilo jQuery)

-  FS (para guardar archivos localmente)

 
---  

##  ✨ Mejoras futuras (PRs súper bienvenidos)

  

-  [ ] Limitar la concurrencia para no saturar el servidor.

-  [ ] Mostrar barra o porcentaje de progreso.

-  [ ] Hacer CLI con flags para personalizar opciones (formato, límites, etc).

-  [ ] Agregar tests con mocks para evitar romper con cambios en la web.

-  [ ] Exportar a más formatos (Excel, PDF).

 
---
  

##  📝 Licencia

  

MIT — libre para usar, modificar y compartir sin líos.

  

---
  

