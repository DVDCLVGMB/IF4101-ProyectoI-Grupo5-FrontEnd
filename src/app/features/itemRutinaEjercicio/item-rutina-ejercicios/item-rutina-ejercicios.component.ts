import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ItemRutinaEjercicioService } from '@app/services/itemRutinaEjercicio/item-rutina-ejercicio.service';
import { EjercicioService } from '@app/services/ejercicio/ejercicio.service';
import { ItemRutinaEjercicio } from '@app/domain/item-rutina-ejercicio.model';
import { Ejercicio } from '@app/domain/ejercicio.model';
import Swal from 'sweetalert2';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-item-rutina-ejercicio',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './item-rutina-ejercicios.component.html',
  styleUrls: ['./item-rutina-ejercicios.component.css']
})
export class ItemRutinaEjercicioComponent implements OnInit {

  formulario: FormGroup;
  items: ItemRutinaEjercicio[] = [];
  ejercicios: Ejercicio[] = [];

  mostrarModal = false;
  modoEditar = false;
  idRutinaEditar: number | null = null;
  idEjercicioEditar: number | null = null;

  private ejercicioMap: Map<number, string> = new Map();

  constructor(
    private fb: FormBuilder,
    private itemService: ItemRutinaEjercicioService,
    private ejercicioService: EjercicioService
  ) {
    this.formulario = this.fb.group({
      //idRutina: ['', Validators.required],
      idEjercicio: ['', Validators.required],
      seriesEjercicio: [1, [Validators.required, Validators.min(1)]],
      repeticionesEjercicio: [1, [Validators.required, Validators.min(1)]],
      equipoEjercicio: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.ejercicioService.listarEjercicios().subscribe(data => {
      this.ejercicios = data;

      // Crea un Map para búsqueda rápida
      this.ejercicioMap = new Map(data.map(e => [e.idEjercicio!, e.nombreEjercicio]));

    });
  }

  listarItems(): void {
    this.itemService.listarTodos().subscribe(data => {
      this.items = data;
    });
  }

  listarEjercicios(): void {
    this.ejercicioService.listarEjercicios().subscribe(data => {
      this.ejercicios = data;
    });
  }

  abrirModal(): void {
    this.formulario.reset({ seriesEjercicio: 1, repeticionesEjercicio: 1 });
    this.mostrarModal = true;
    this.modoEditar = false;
    this.idRutinaEditar = null;
    this.idEjercicioEditar = null;

    // Habilitar el campo idEjercicio por si quedó deshabilitado antes
    this.formulario.get('idEjercicio')?.enable();
  }

  cerrarModal(): void {
    this.mostrarModal = false;
  }

  guardar(): void {
    if (this.formulario.invalid) return;

    const nuevoItem: ItemRutinaEjercicio = this.formulario.value;

    if (this.modoEditar && this.idEjercicioEditar !== null) {
      const index = this.items.findIndex(i => i.idEjercicio === this.idEjercicioEditar);
      if (index !== -1) {
        this.items[index] = { ...this.items[index], ...nuevoItem };
      }

      Swal.fire('✅', 'Item editado localmente', 'success');
    } else {
      // Verifica que no se agregue dos veces el mismo ejercicio
      if (this.items.some(i => i.idEjercicio === nuevoItem.idEjercicio)) {
        Swal.fire('⚠️', 'Este ejercicio ya fue agregado.', 'warning');
        return;
      }

      // Validar que el ejercicio existe (para consistencia, aunque no lo vamos a guardar)
      const ejercicioRelacionado = this.ejercicios.find(e => e.idEjercicio === nuevoItem.idEjercicio);
      if (!ejercicioRelacionado) {
        Swal.fire('⚠️', 'No se pudo encontrar el ejercicio seleccionado.', 'error');
        return;
      }

      this.items.push(nuevoItem);
      Swal.fire('✅', 'Item agregado localmente', 'success');
    }

    this.cerrarModal();
  }


  editar(item: ItemRutinaEjercicio): void {
    this.mostrarModal = true;
    this.modoEditar = true;
    this.idRutinaEditar = item.idRutina;
    this.idEjercicioEditar = item.idEjercicio;

    this.formulario.patchValue({
      idRutina: item.idRutina,
      idEjercicio: item.idEjercicio,
      seriesEjercicio: item.seriesEjercicio,
      repeticionesEjercicio: item.repeticionesEjercicio,
      equipoEjercicio: item.equipoEjercicio
    });

    // Deshabilitar select de ejercicio en modo edición
    this.formulario.get('idEjercicio')?.disable();
  }

  eliminar(item: ItemRutinaEjercicio): void {
    if (confirm('¿Está seguro de eliminar este item?')) {
      this.itemService.eliminar(item.idRutina, item.idEjercicio).subscribe(() => {
        Swal.fire('✅', 'Item eliminado', 'success');
        this.listarItems();
      });
    }
  }

  obtenerNombreEjercicio(id: number): string {
  const ejercicio = this.ejercicios.find(e => e.idEjercicio === id);
  return ejercicio ? ejercicio.nombreEjercicio : 'Desconocido';
  }

}
