  import { Component, OnInit } from '@angular/core';
  import { CommonModule } from '@angular/common';
  import { RouterModule } from '@angular/router';
  import { PanelPrincipalService } from '../../services/panel-principal/panel-principal.service';  // 🔥 Importa el servicio
  import { HttpClientModule } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';

  @Component({
    selector: 'app-panel-principal',
    standalone: true,
    imports: [CommonModule, RouterModule, HttpClientModule, TranslateModule],
    templateUrl: './panel-principal.component.html',
    styleUrls: ['./panel-principal.component.css']
  })
  export class PanelPrincipalComponent implements OnInit {
    
    cantidadClientes = 0;      
    nuevosClientesMes = 0;     
   
    cantidadClientesActivos = 0;   
    cantidadClientesInactivos = 0;  
    
    cantidadEmpleados = 24;
    cantidadEntrenadores = 3;
    cantidadStaff = 21;

    cantidadEjercicios = 87;
    cantidadCategorias = 8;

    cantidadRutinasActivas = 132;
    rutinasSemana = 18;

    actividadesRecientes: { descripcion: string, fecha: Date }[] = [];

    constructor(private panelService: PanelPrincipalService) {}

    ngOnInit(): void {
      this.cargarEstadisticas();
    }

    cargarEstadisticas() {
      this.panelService.obtenerCantidadClientes().subscribe({
        next: (respuesta) => {
          this.cantidadClientes = respuesta.cantidadClientes;
        },
        error: (err) => {
          console.error('Error cargando cantidad de clientes:', err);
        }
      });

      this.panelService.obtenerClientesRecientes().subscribe({
        next: (clientes) => {
          this.actividadesRecientes = clientes.map(c => ({
            descripcion: `Nuevo cliente registrado: ${c.nombre} ${c.apellidos}`,
            fecha: new Date()   // Aquí podrías mapear a fecha real si tuvieras en el objeto
          }));
        },
        error: (err) => {
          console.error('Error cargando clientes recientes:', err);
        }
      });

      this.panelService.obtenerCantidadClientesActivos().subscribe({
        next: (respuesta) => {
          this.cantidadClientesActivos = respuesta.clientesActivos;
        },
        error: (err) => {
          console.error('Error cargando clientes activos:', err);
        }
      });
      
      this.panelService.obtenerCantidadClientesInactivos().subscribe({
        next: (respuesta) => {
          this.cantidadClientesInactivos = respuesta.clientesInactivos;
        },
        error: (err) => {
          console.error('Error cargando clientes inactivos:', err);
        }
      });
      

      
  this.panelService.obtenerCantidadEjercicios().subscribe({
    next: (respuesta) => {
      this.cantidadEjercicios = respuesta.cantidadEjercicios;
    },
    error: (err) => {
      console.error('Error cargando cantidad de ejercicios:', err);
    }
  });

  this.panelService.obtenerCantidadCategorias().subscribe({
    next: (respuesta) => {
      this.cantidadCategorias = respuesta.cantidadCategorias;
    },
    error: (err) => {
      console.error('Error cargando cantidad de categorías:', err);
    }
  });
    }


  }
