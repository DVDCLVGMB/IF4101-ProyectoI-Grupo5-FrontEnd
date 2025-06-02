import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SesionService } from '../../services/sesion/sesion.service';
import { LoginRequestDTO } from '../../domain/dto/login-request.dto';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule]
})
export class LoginComponent {

  formularioLogin: FormGroup;
  error: string = '';

  constructor(
    private fb: FormBuilder,
    private sesionService: SesionService,
    private router: Router
  ) {
    this.formularioLogin = this.fb.group({
      usuario: ['', Validators.required],
      contrasenia: ['', Validators.required]
    });
  }

  iniciarSesion() {
    if (this.formularioLogin.invalid) {
      return;
    }

    const datos: LoginRequestDTO = this.formularioLogin.value;

    this.sesionService.login(datos).subscribe({
      next: (respuesta) => {
        this.sesionService.guardarSesion(datos.usuario, respuesta.rol, respuesta.token);

        if (respuesta.rol === 'ADMINISTRADOR') {
          this.router.navigate(['/dashboard']);
        } else if (respuesta.rol === 'INSTRUCTOR') {
          this.router.navigate(['/instructor']);
        }
      },
      error: () => {
        this.error = 'Usuario o contraseña incorrectos';
      }
    });
  }
}
