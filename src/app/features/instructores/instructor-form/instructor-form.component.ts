import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { InstructorService } from '../../../services/instructor/instructor.service';
import { Instructor } from '../../../domain/instructor.model';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-instructor-form',
  standalone: true,
  templateUrl: './instructor-form.component.html',
  styleUrls: ['./instructor-form.component.css'],
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule
  ]
})
export class InstructorFormComponent {

  instructor: Instructor = {
    idInstructor: 0,
    idPersona: 0,
    nombre: '',
    apellidos: '',
    fechaNacimiento: new Date(),
    sexo: '',
    telefono: '',
    correoElectronico: '',
    imagenRuta: '',
    fechaIngreso: new Date()
  };

  mensaje: string = '';
  mensajeTipo: 'success' | 'error' = 'success';

  constructor(
    private instructorService: InstructorService,
    public router: Router
  ) { }

  guardar(): void {
    this.instructorService.create(this.instructor).subscribe({
      next: () => {
        this.mensaje = '¡Instructor creado exitosamente!';
        this.mensajeTipo = 'success';

        // Redirige después para mostrar el mensaje
        setTimeout(() => {
          this.router.navigate(['/instructores']);
        }, 1500);
      },
      error: (err) => {
        console.error('Error al crear instructor:', err);
        this.mensaje = 'Error al crear instructor.';
        this.mensajeTipo = 'error';
      }
    });
  }

  cancelar(): void {
    this.router.navigate(['/instructores']);
  }
}
