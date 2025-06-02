import { HttpClient } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

/**
 * le dice a ngx-translate que busque los archivos en `assets/i18n/{lang}.json`.
 */
export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(
    http,
    'assets/i18n/',   // Carpeta donde se guardan los JSONs de idiomas
    '.json'           // Extensión de los archivos
  );
}
