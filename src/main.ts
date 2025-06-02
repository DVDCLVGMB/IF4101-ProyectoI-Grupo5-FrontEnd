// src/main.ts

import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

import { importProvidersFrom } from '@angular/core';
import { HttpClient, provideHttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { createTranslateLoader } from './app/translate-loader';

// Llamamos a bootstrapApplication y “mezclamos” appConfig con los providers de ngx-translate
bootstrapApplication(AppComponent, {
  providers: [
    ...appConfig.providers!,
    provideHttpClient(),
    // importProvidersFrom inyecta los providers de TranslateModule.forRoot(...)
    importProvidersFrom(
      TranslateModule.forRoot({
        defaultLanguage: 'es', // idioma por defecto (fallback)
        loader: {
          provide: TranslateLoader,
          useFactory: (http: HttpClient) => createTranslateLoader(http),
          deps: [HttpClient]
        }
      })
    )
  ]
})
  .catch(err => console.error(err));
