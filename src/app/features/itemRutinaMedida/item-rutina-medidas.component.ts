import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ItemRutinaMedida } from '@app/domain/item-rutina-medida.model';
import { ItemRutinaMedidasService } from '@app/services/itemRutinaMedida/item-rutina-medidas.service';
import { MedidaCorporal } from '@app/domain/medidaCorporal.model';
import { MedidasCorporalesService } from '@app/services/medidaCorporal/medidas-corporales.service';
import { NgbModal, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';


@Component({
  selector: 'app-item-rutina-medidas',
  standalone: true,
  imports: [CommonModule, FormsModule, NgbModalModule, TranslateModule],
  templateUrl: './item-rutina-medidas.component.html',
  styleUrls: ['./item-rutina-medidas.component.css']
})
export class ItemRutinaMedidasComponent implements OnInit {
  @ViewChild('buscarInput') buscarInput!: ElementRef<HTMLInputElement>;
  
  medidasDisponibles: MedidaCorporal[] = [];
  medidasFiltradas: MedidaCorporal[] = [];
  rutina: ItemRutinaMedida[] = [];
  medidaSeleccionada: MedidaCorporal | null = null;
  valorMedida: number | null = null;
  itemAEditar: ItemRutinaMedida | null = null;
  nuevoValor: number | null = null;
  
  // Variables para controlar el estado de eliminación
  showShake: boolean = false;
  eliminando: boolean = false;
  eliminacionCompletada: boolean = false;
  eliminacionExitosa: boolean = false;
  
  // Variables para búsqueda
  terminoBusqueda: string = '';

  constructor(
    private medidaService: ItemRutinaMedidasService,
    private modalService: NgbModal
  ) {}

  ngOnInit(): void {
    this.cargarMedidas();
  }

  private cargarMedidas(): void {
    this.medidaService.obtenerTodas().subscribe({
      next: (data) => {
        this.medidasDisponibles = data;
        this.filtrarMedidasDisponibles();
      },
      error: (err) => console.error('Error al cargar medidas:', err)
    });
  }


   filtrarMedidasDisponibles(): void {
  const termino = this.terminoBusqueda.toLowerCase();
  this.medidasFiltradas = this.medidasDisponibles
    .filter(m => !this.rutina.some(item => item.medidaCorporal.codMedida === m.codMedida))
    .filter(m =>
      m.nombreMedida.toLowerCase().includes(termino) ||
      m.unidadMedida.toLowerCase().includes(termino)
    );
}


  agregarMedida(): void {
    if (this.medidaSeleccionada && this.valorMedida && this.valorMedida > 0) {
      const existe = this.rutina.some(i => i.medidaCorporal.codMedida === this.medidaSeleccionada?.codMedida);
      
      if (!existe) {
        this.rutina.push({
          medidaCorporal: this.medidaSeleccionada,
          valorMedida: this.valorMedida
        });
        
        this.resetearFormulario();
        this.filtrarMedidasDisponibles();
      }
    }
  }

  private resetearFormulario(): void {
    this.medidaSeleccionada = null;
    this.valorMedida = null;
  }

  abrirModalEliminar(content: any, item: ItemRutinaMedida): void {
    this.itemAEditar = item;
    this.resetEliminacionState();
    this.modalService.open(content, { 
      centered: true,
      backdrop: 'static',
      keyboard: false
    });
  }

  abrirModalEditar(content: any, item: ItemRutinaMedida): void {
    this.itemAEditar = item;
    this.nuevoValor = item.valorMedida;
    this.modalService.open(content, { centered: true });
  }

  confirmarEliminacion(): void {
    this.eliminando = true;
    
    setTimeout(() => {
      try {
        this.rutina = this.rutina.filter(
          i => i.medidaCorporal.codMedida !== this.itemAEditar?.medidaCorporal.codMedida
        );
        this.eliminacionExitosa = true;
      } catch (error) {
        this.eliminacionExitosa = false;
      }
      
      this.eliminacionCompletada = true;
      this.eliminando = false;
      this.filtrarMedidasDisponibles();
    }, 1500);
  }

  actualizarMedida(): void {
    if (this.itemAEditar && this.nuevoValor && this.nuevoValor > 0) {
      const index = this.rutina.findIndex(
        i => i.medidaCorporal.codMedida === this.itemAEditar?.medidaCorporal.codMedida
      );
      
      if (index !== -1) {
        this.rutina[index].valorMedida = this.nuevoValor;
      }
      
      this.modalService.dismissAll();
      this.itemAEditar = null;
      this.nuevoValor = null;
    }
  }

  cancelarEliminacion(): void {
    this.showShake = true;
    setTimeout(() => this.showShake = false, 500);
  }

  resetEliminacionState(): void {
    this.eliminando = false;
    this.eliminacionCompletada = false;
    this.eliminacionExitosa = false;
    this.showShake = false;
  }

  validarNumero(item: ItemRutinaMedida): boolean {
    return item.valorMedida == null || isNaN(item.valorMedida) || item.valorMedida <= 0;
  }

  get rutinaFiltrada(): ItemRutinaMedida[] {
  if (!this.terminoBusqueda.trim()) {
    return this.rutina;
  }
  const termino = this.terminoBusqueda.toLowerCase();
  return this.rutina.filter(item =>
    item.medidaCorporal.nombreMedida.toLowerCase().includes(termino) ||
    item.medidaCorporal.unidadMedida.toLowerCase().includes(termino)
  );
}



}
