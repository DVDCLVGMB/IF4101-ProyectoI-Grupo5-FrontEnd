// src/app/services/translate/translate.service.ts

import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({ providedIn: 'root' })
export class TranslationService {

  private defaultLang = 'es';

  constructor(private translate: TranslateService) {
    // defino los idiomas que soporta la app
    this.translate.addLangs(['es', 'en', 'pt']);
    // fijo el idioma por defecto al cargar la app
    this.translate.setDefaultLang(this.defaultLang);

    // Si en LocalStorage ya había un idioma guardado, lo uso:
    const saved = localStorage.getItem('app_lang');
    if (saved && this.translate.getLangs().includes(saved)) {
      this.translate.use(saved);
    } else {
      this.translate.use(this.defaultLang);
      localStorage.setItem('app_lang', this.defaultLang);
    }
  }

  setLanguage(lang: string) {
    if (this.translate.getLangs().includes(lang)) {
      this.translate.use(lang);
      localStorage.setItem('app_lang', lang);
    }
  }

  getCurrentLanguage(): string {
    return this.translate.currentLang || this.defaultLang;
  }
}
