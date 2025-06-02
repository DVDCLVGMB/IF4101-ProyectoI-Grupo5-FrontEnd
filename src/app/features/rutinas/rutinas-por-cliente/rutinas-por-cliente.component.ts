// src/app/features/rutinas-por-cliente/rutinas-por-cliente.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { RutinaService } from '@app/services/rutina/rutina.service';
import { Rutina } from '@app/domain/rutina.model';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-rutinas-por-cliente',
  standalone: true,
  imports: [
    CommonModule,  // para *ngIf, *ngFor, pipe date, etc.
    FormsModule,    // para [(ngModel)]
    TranslateModule
  ],
  templateUrl: './rutinas-por-cliente.component.html',
  styleUrls: ['./rutinas-por-cliente.component.css']
})
export class RutinasPorClienteComponent implements OnInit {

  /** ID actual del cliente cuyas rutinas se muestran (null si aún no se ha buscado) */
  clienteId: number | null = null;

  /** Valor que el usuario escribe para buscar un cliente (input) */
  clienteIdBuscado: number | null = null;

  /** Arreglo de rutinas que carga el servicio */
  rutinas: Rutina[] = [];

  constructor(
    private route: ActivatedRoute,
    private rutinaService: RutinaService
  ) { }

  ngOnInit(): void {
    const param = this.route.snapshot.paramMap.get('clienteId');
    if (param) {
      this.clienteId = +param;
      this.cargarRutinas();
    }
  }

  /**
   * Se ejecuta al hacer clic en “Buscar Cliente”.
   * toma clienteIdBuscado, lo valida y, si es válido asigna a clienteId y carga rutinas
   */
  buscarCliente(): void {
    if (
      this.clienteIdBuscado == null ||
      isNaN(this.clienteIdBuscado) ||
      this.clienteIdBuscado <= 0
    ) {
      alert('Ingresa un ID de cliente válido antes de buscar.');
      return;
    }
    this.clienteId = this.clienteIdBuscado;
    this.cargarRutinas();
  }

  /**
   * Llama al servicio para traer todas las rutinas del cliente actual.
   * Si clienteId no es válido, vacía el arreglo.
   */
  cargarRutinas(): void {
    if (this.clienteId == null || this.clienteId <= 0) {
      this.rutinas = [];
      return;
    }

    this.rutinaService.getByCliente(this.clienteId).subscribe({
      next: (r: Rutina[]) => this.rutinas = r,
      error: err => {
        console.error('Error cargando rutinas:', err);
        this.rutinas = [];
      }
    });
  }

  /**
   * DESCARGA el PDF de la rutina indicada y fuerza la descarga en el navegador.
   * Usa GET /api/clientes/{clienteId}/rutinas/{idRutina}/pdf
   */
  descargarPDF(idRutina: number): void {
    if (this.clienteId == null) {
      console.error('No hay cliente seleccionado para descargar PDF.');
      return;
    }

    this.rutinaService
      .descargarPdfParaCliente(this.clienteId, idRutina)
      .subscribe({
        next: (blob: Blob) => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `rutina_${idRutina}.pdf`;
          a.click();
          window.URL.revokeObjectURL(url);
        },
        error: (err: any) => {
          console.error('Error descargando PDF:', err);
          alert('Ocurrió un error al descargar el PDF.');
        }
      });
  }

}
