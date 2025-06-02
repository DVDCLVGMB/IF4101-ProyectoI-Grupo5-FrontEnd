import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslationService } from './services/translate/translate.service';

@Component({
  selector: 'app-root',
  // Eliminamos templateUrl y styleUrls, y mantenemos solo el template inline:
  template: `
    <div class="language-switcher">
      <label for="lang-select">Idioma:</label>
      <select id="lang-select"
              (change)="onLanguageChange($any($event.target).value)">
        <option value="es" [selected]="getCurrentLang() === 'es'">Español</option>
        <option value="en" [selected]="getCurrentLang() === 'en'">Inglés</option>
        <option value="pt" [selected]="getCurrentLang() === 'pt'">Portugués</option>
      </select>
    </div>

    <router-outlet></router-outlet>
  `,
  styles: [`
    .language-switcher {
      position: fixed;
      bottom: 1rem;
      left: 1rem;
      background: white;
      padding: 0.5rem;
      border-radius: 4px;
      box-shadow: 0 0 4px rgba(0,0,0,0.2);
    }
    label { margin-right: 0.5rem; }
    select { font-size: 1rem; }
  `],
  imports: [RouterOutlet]
})
export class AppComponent {
  constructor(private translationService: TranslationService) { }

  onLanguageChange(lang: string) {
    this.translationService.setLanguage(lang);
  }

  getCurrentLang(): string {
    return this.translationService.getCurrentLanguage();
  }
}
