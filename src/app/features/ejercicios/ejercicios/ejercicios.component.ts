import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { EjercicioService } from '@app/services/ejercicio/ejercicio.service';
import { CategoriaEjercicioService } from '@app/services/categoriaejercicio/categoriaejercicio.service';
import { Ejercicio } from '@app/domain/ejercicio.model';
import Swal from 'sweetalert2';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-ejercicio',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './ejercicios.component.html',
  styleUrls: ['./ejercicios.component.css']
})
export class EjercicioComponent implements OnInit {

  ejercicios: Ejercicio[] = [];
  categorias: any[] = [];
  formulario: FormGroup;
  modoEditar = false;
  idEditar: number | null = null;
  mostrarModal = false;

  cargandoImagen = false;
  porcentajeCarga = 0;
  imagenPreview: string | ArrayBuffer | null = null;

  constructor(
    private fb: FormBuilder,
    private ejercicioService: EjercicioService,
    private categoriaService: CategoriaEjercicioService
  ) {
    this.formulario = this.fb.group({
      nombreEjercicio: ['', Validators.required],
      idCategoria: ['', Validators.required],
      imagen: ['']
    });
  }

  ngOnInit(): void {
    this.listarEjercicios();
    this.listarCategorias();
  }

  listarEjercicios(): void {
    this.ejercicioService.listarEjercicios().subscribe(data => {
      this.ejercicios = data;
    });
  }

  listarCategorias(): void {
    this.categoriaService.listarCategorias().subscribe(data => {
      this.categorias = data;
    });
  }

  abrirModal(): void {
    this.mostrarModal = true;
    this.formulario.reset();
    this.imagenPreview = null;
    this.modoEditar = false;
    this.idEditar = null;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
  }

  guardarEjercicio(): void {
    if (this.formulario.invalid) return;

    const ejercicio = {
      nombreEjercicio: this.formulario.value.nombreEjercicio,
      idCategoria: this.formulario.value.idCategoria,
      imagen: this.formulario.value.imagen
    };

    if (this.modoEditar && this.idEditar != null) {
      this.ejercicioService.actualizarEjercicio(this.idEditar, ejercicio).subscribe(() => {
        Swal.fire('✅', 'Ejercicio actualizado', 'success');
        this.listarEjercicios();
        this.cerrarModal();
      });
    } else {
      this.ejercicioService.insertarEjercicio(ejercicio).subscribe(() => {
        Swal.fire('✅', 'Ejercicio creado', 'success');
        this.listarEjercicios();
        this.cerrarModal();
      });
    }
  }

  editarEjercicio(ejercicio: Ejercicio): void {
    this.mostrarModal = true;
    this.modoEditar = true;
    this.idEditar = ejercicio.idEjercicio ?? null;
    this.imagenPreview = ejercicio.imagen || null;

    this.formulario.patchValue({
      nombreEjercicio: ejercicio.nombreEjercicio,
      idCategoria: ejercicio.categoriaEjercicio?.[0]?.idCategoriaEjercicio || '',
      imagen: ejercicio.imagen
    });
  }

  eliminarEjercicio(id: number): void {
    if (confirm('¿Está seguro de eliminar este ejercicio?')) {
      this.ejercicioService.eliminarEjercicio(id).subscribe(() => {
        Swal.fire('✅', 'Ejercicio eliminado', 'success');
        this.listarEjercicios();
      });
    }
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
      const maxSizeInBytes = 5 * 1024 * 1024;

      if (!allowedTypes.includes(file.type)) {
        alert('❌ Solo se permiten imágenes JPG o PNG.');
        return;
      }

      if (file.size > maxSizeInBytes) {
        alert('❌ Imagen muy grande (máximo 5MB).');
        return;
      }

      this.cargandoImagen = true;
      this.porcentajeCarga = 0;

      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          const maxWidth = 400;
          const maxHeight = 400;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxWidth) {
              height *= maxWidth / width;
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width *= maxHeight / height;
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;
          ctx?.drawImage(img, 0, 0, width, height);

          const interval = setInterval(() => {
            this.porcentajeCarga += 20;
            if (this.porcentajeCarga >= 100) {
              clearInterval(interval);

              const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
              this.imagenPreview = dataUrl;
              this.formulario.patchValue({ imagen: this.imagenPreview });
              this.cargandoImagen = false;
            }
          }, 50);
        };

        img.src = e.target?.result as string;
      };

      reader.readAsDataURL(file);
    }
  }

}
