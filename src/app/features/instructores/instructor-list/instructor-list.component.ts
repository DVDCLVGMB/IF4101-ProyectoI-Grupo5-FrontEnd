import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Empleado } from '../../../domain/empleado.model';
import { EmpleadoService } from '@app/services/empleado/empleado.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-instructor-list',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './instructor-list.component.html',
  styleUrls: ['./instructor-list.component.css']
})
export class InstructorListComponent implements OnInit {
  instructores: Empleado[] = [];
  filtro = '';

  constructor(private empleadoService: EmpleadoService) { }

  ngOnInit(): void {
    this.cargarInstructores();
  }

  private cargarInstructores(): void {
    this.empleadoService.getAll().subscribe({
      next: todos => {
        // Filtrar solo los de rol "Instructor"
        this.instructores = todos.filter(e => e.rolEmpleado === 'Instructor');
      },
      error: err => console.error('Error cargando instructores', err)
    });
  }

  filtrarInstructores(): Empleado[] {
    const termino = this.filtro.toLowerCase().trim();
    return this.instructores.filter(i =>
      i.nombre.toLowerCase().includes(termino) ||
      i.apellidos.toLowerCase().includes(termino) ||
      i.telefono.includes(termino) ||
      i.correoElectronico.toLowerCase().includes(termino)
    );
  }
}
