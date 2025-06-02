import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CategoriaEjercicio } from '@app/domain/categoriaejercicio.model';
import { CategoriaEjercicioService } from '@app/services/categoriaejercicio/categoriaejercicio.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-categoria-ejercicio',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './categoriaejercicio.component.html',
  styleUrls: ['./categoriaejercicio.component.css']
})
export class CategoriaEjercicioComponent implements OnInit {
  categorias: CategoriaEjercicio[] = [];
  categoriasFiltradas: CategoriaEjercicio[] = [];
  categoriaForm: FormGroup;
  mostrarModal: boolean = false;
  editando: boolean = false;
  idEditando: number | null = null;
  filtro: string = '';

  constructor(
    private categoriaService: CategoriaEjercicioService,
    private fb: FormBuilder
  ) {
    this.categoriaForm = this.fb.group({
      nombreCategoria: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.obtenerCategorias();
  }

  obtenerCategorias() {
    this.categoriaService.obtenerCategorias().subscribe(data => {
      this.categorias = data;
      this.filtrarCategorias();
    });
  }

  filtrarCategorias() {
    this.categoriasFiltradas = this.categorias.filter(categoria =>
      categoria.nombreCategoria.toLowerCase().includes(this.filtro.toLowerCase())
    );
  }

  abrirModalNueva() {
    this.editando = false;
    this.categoriaForm.reset();
    this.mostrarModal = true;
  }

  abrirModalEditar(categoria: CategoriaEjercicio) {
    this.editando = true;
    this.idEditando = categoria.idCategoriaEjercicio;
    this.categoriaForm.patchValue({
      nombreCategoria: categoria.nombreCategoria
    });
    this.mostrarModal = true;
  }

  guardarCategoria() {
    if (this.categoriaForm.invalid) return;
  
    const categoria: CategoriaEjercicio = {
      idCategoriaEjercicio: this.idEditando !== null ? this.idEditando : 0, // Aquí se asegura de que el ID no sea undefined
      nombreCategoria: this.categoriaForm.value.nombreCategoria
    };
  
    if (this.editando && this.idEditando !== null) {
      this.categoriaService.actualizarCategoria(this.idEditando, categoria).subscribe(() => {
        this.obtenerCategorias();
        this.cerrarModal();
      });
    } else {
      this.categoriaService.crearCategoria(categoria).subscribe(() => {
        this.obtenerCategorias();
        this.cerrarModal();
      });
    }
  }  

  eliminarCategoria(id: number) {
    if (confirm('¿Está seguro de eliminar esta categoria?')) {
      this.categoriaService.eliminarCategoria(id).subscribe(() => {
        this.obtenerCategorias();
      });
    }
  }
  
  cerrarModal() {
    this.mostrarModal = false;
    this.idEditando = null;
  }
}
