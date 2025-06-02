import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router } from '@angular/router';
import { SesionService } from '../../services/sesion/sesion.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, TranslateModule],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css']
})
export class LayoutComponent {

  constructor(private router: Router,
    private sesionService: SesionService
  ) {}

  navegar(ruta: string) {
    this.router.navigate([ruta]);
  }

    // 🔥 Saber si una ruta está activa
    esRutaActiva(ruta: string): boolean {
      return this.router.url.startsWith(ruta);
    }

  // Método para cerrar sesión directamente
  cerrarSesion() {
      this.sesionService.logout();
  }

}
