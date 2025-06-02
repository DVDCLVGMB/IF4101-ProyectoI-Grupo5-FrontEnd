import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import Swal from 'sweetalert2';

import { Empleado } from '../../../domain/empleado.model';
import { EmpleadoService } from '../../../services/empleado/empleado.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-empleado-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TranslateModule],
  templateUrl: './empleado-form.component.html',
  styleUrls: ['./empleado-form.component.css']
})
export class EmpleadoFormComponent implements OnInit {
  @Input() empleadoAEditar?: Empleado;
  @Output() guardado = new EventEmitter<void>();

  empleado: Empleado = {
    idEmpleado: 0,
    idPersona: 0,
    nombre: '',
    apellidos: '',
    fechaNacimiento: '',
    sexo: 'O',
    telefono: '',
    correoElectronico: '',
    imagenRuta: '',
    direccion: '',
    nombreContactoEmergencia: '',
    telContactoEmergencia: '',
    rolEmpleado: ''
  };
  isEdit = false;
  mensaje: string = '';
  // Para la carga de imagen
  cargandoImagen = false;
  porcentajeCarga = 0;
  imagenPreview: string | ArrayBuffer | null = null;

  constructor(
    private service: EmpleadoService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    // si viene por Input (modal), precargo
    if (this.empleadoAEditar) {
      this.isEdit = true;
      this.empleado = { ...this.empleadoAEditar };
      this.imagenPreview = this.empleado.imagenRuta || null;
      return;
    }
    // si vengo de /empleados/edit/:id
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEdit = true;
      const id = +idParam;
      this.service.getById(id).subscribe({
        next: emp => {
          this.empleado = { ...emp };
          this.imagenPreview = this.empleado.imagenRuta || null;
        },
        error: err => {
          Swal.fire('❌ Error al cargar', err.error?.mensaje || err.message, 'error');
        }
      });
    }
  }

  cancelar(): void {
    this.router.navigate(['/empleados']);
  }

  guardar(): void {
    const peticion$ = this.isEdit
      ? this.service.update(this.empleado.idPersona, this.empleado)
      : this.service.create(this.empleado);

    peticion$.subscribe({
      next: () => {
        Swal.fire(
          this.isEdit ? '¡Actualizado!' : '¡Creado!',
          this.isEdit
            ? 'El empleado se actualizó correctamente.'
            : 'El empleado se creó correctamente.',
          'success'
        ).then(() => {
          // si vienes de un modal:
          this.guardado.emit();
          // o si es página suelta:
          if (!this.empleadoAEditar) {
            this.router.navigate(['/empleados']);
          }
        });
      },
      error: err => {
        Swal.fire(
          '❌ Error',
          err.error?.mensaje ||
          err.error ||
          'Ocurrió un problema al ' + (this.isEdit ? 'actualizar' : 'crear') + ' empleado.',
          'error'
        );
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      Swal.fire('❌ Imagen muy grande', 'El tamaño máximo es 5 MB.', 'error');
      return;
    }

    this.cargandoImagen = true;
    this.porcentajeCarga = 0;

    const reader = new FileReader();
    reader.onload = () => {
      this.imagenPreview = reader.result;
      const interval = setInterval(() => {
        this.porcentajeCarga += 20;
        if (this.porcentajeCarga >= 100) {
          clearInterval(interval);
          this.cargandoImagen = false;
          this.empleado.imagenRuta = this.imagenPreview as string;
        }
      }, 100);
    };
    reader.readAsDataURL(file);
  }
}
