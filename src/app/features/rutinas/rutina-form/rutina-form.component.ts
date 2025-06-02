// src/app/features/rutina-form/rutina-form.component.ts
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { Rutina } from '@app/domain/rutina.model';
import { RutinaService } from '@app/services/rutina/rutina.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-rutina-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, TranslateModule],
  templateUrl: './rutina-form.component.html',
  styleUrls: ['./rutina-form.component.css']
})

export class RutinaFormComponent implements OnInit {
  /** ID del cliente al que pertenece la rutina */
  @Input() clienteId!: number;
  /** Si se pasa, carga los datos para editar */
  @Input() rutinaAEditar?: Rutina;
  /** Evento que dispara al crear o actualizar */
  @Output() guardado = new EventEmitter<void>();

  form!: FormGroup;
  mensaje = '';
  submitting = false;
  isEdit = false;

  constructor(
    private fb: FormBuilder,
    private svc: RutinaService
  ) { }

  ngOnInit(): void {
    this.isEdit = !!this.rutinaAEditar;
    this.form = this.fb.group({
      objetivo: [this.rutinaAEditar?.objetivo || '', Validators.required],
      fechaCreacion: [this.formatDate(this.rutinaAEditar?.fechaCreacion || new Date()), Validators.required],
      fechaRenovacion: [this.formatDate(this.rutinaAEditar?.fechaRenovacion || new Date()), Validators.required],
      horario: [this.rutinaAEditar?.horario || '', Validators.required],
      lesiones: [this.rutinaAEditar?.lesiones || ''],
      padecimientos: [this.rutinaAEditar?.padecimientos || ''],
    });
  }

  /** convierte DATE o string a "YYYY-MM-DD" para el input date */
  private formatDate(value: Date | string): string {
    const d = new Date(value);
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }

  /** cuando envia el formulario crea (o actualiza) la rutina */
  onSubmit(): void {
    if (this.form.invalid) {
      this.mensaje = 'Por favor, corrige los errores del formulario.';
      return;
    }

    this.mensaje = '';
    this.submitting = true;

    const dto: Rutina = {
      idCliente: this.clienteId,
      ...this.form.value
    };

    this.svc.crearParaCliente(this.clienteId, dto).subscribe({
      next: () => {
        this.submitting = false;
        this.mensaje = this.isEdit
          ? 'Rutina actualizada correctamente.'
          : 'Rutina creada correctamente.';
        this.guardado.emit();
      },
      error: (err: any) => {
        console.error('Error al guardar rutina', err);
        this.submitting = false;
        this.mensaje = 'Ocurrió un error al guardar la rutina.';
      }
    });
  }
}
