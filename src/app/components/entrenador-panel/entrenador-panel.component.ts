import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RutinaService } from '@app/services/rutina/rutina.service';
import { Router } from '@angular/router';
import { Rutina } from '@app/domain/rutina.model';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-entrenador-panel',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatTableModule,
    MatButtonModule,
    MatTooltipModule,
    TranslateModule
  ],
  templateUrl: './entrenador-panel.component.html',
  styleUrls: ['./entrenador-panel.component.scss']
})
export class EntrenadorPanelComponent implements OnInit {
  rutinasActivas = 0;
  clientesTotales = 0;
  rutinasPorRenovar = 0;
  rutinasRecientes: Rutina[] = [];
  rutinasParaMostrar: any[] = []; // Nueva propiedad para datos formateados

  constructor(
    private rutinaService: RutinaService,
    public router: Router
  ) {}

  ngOnInit() {
    this.cargarRutinasRecientes();
  }

  cargarRutinasRecientes() {
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() - 7);

    this.rutinaService.getRutinasRecientes(fechaLimite).subscribe({
      next: (rutinas: Rutina[]) => {
        this.rutinasRecientes = rutinas;
        
        // Creamos una copia formateada para mostrar
        this.rutinasParaMostrar = rutinas.map(r => ({
          ...r,
          fechaCreacionFormateada: this.formatearFecha(r.fechaCreacion),
          clienteNombre: this.getNombreCliente(r.idCliente)
        }));

        this.actualizarMetricas(rutinas);
      },
      error: (err) => console.error('Error cargando rutinas', err)
    });
  }

  private actualizarMetricas(rutinas: Rutina[]) {
    this.rutinasActivas = rutinas.length;
    this.clientesTotales = [...new Set(rutinas.map(r => r.idCliente))].length;
    
    const hoy = new Date();
    this.rutinasPorRenovar = rutinas.filter(r => 
      new Date(r.fechaRenovacion) <= hoy
    ).length;
  }

  formatearFecha(fecha: Date | string): string {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  getNombreCliente(idCliente: number): string {
    return `Cliente #${idCliente}`; // Implementa tu lógica real aquí
  }

  verDetalleRutina(idRutina: number) {
    this.router.navigate(['/rutinas', idRutina]);
  }
}
