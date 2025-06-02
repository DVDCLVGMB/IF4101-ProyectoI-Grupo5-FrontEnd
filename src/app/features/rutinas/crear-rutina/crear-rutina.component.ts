import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatStepperModule } from '@angular/material/stepper';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatStepper } from '@angular/material/stepper';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { environment } from '@environments/environment';
import { ItemRutinaMedidasComponent } from '@app/features/itemRutinaMedida/item-rutina-medidas.component';
import { ItemRutinaEjercicioComponent } from '@app/features/itemRutinaEjercicio/item-rutina-ejercicios/item-rutina-ejercicios.component';

import { Cliente } from '@app/domain/cliente.model';
import { ClienteService } from '@app/services/cliente/cliente.service';
import { RutinaCompletaDTO } from '@app/domain/dto/RutinaCompletaDTO';
import { ItemRutinaMedidaDTO } from '@app/domain/dto/RutinaCompletaDTO';
import { ItemRutinaEjercicioDTO } from '@app/domain/dto/RutinaCompletaDTO';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-crear-rutina',
  standalone: true,
  templateUrl: './crear-rutina.component.html',
  styleUrls: ['./crear-rutina.component.css'],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatStepperModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    ItemRutinaMedidasComponent ,
    ItemRutinaEjercicioComponent,
    TranslateModule

  ]
})
export class CrearRutinaComponent implements OnInit {
  clientes: Cliente[] = [];
  clienteSeleccionado: Cliente | null = null;

  objetivo = '';
  horario = '';
  lesiones = '';
  padecimientos = '';

  medidaInput: ItemRutinaMedidaDTO = {
    idMedidaCorporal: 0,
    valorMedida: 0,
    fechaMedicion: new Date().toISOString().substring(0, 10)
  };

  ejercicioInput: ItemRutinaEjercicioDTO = {
    idEjercicio: 0,
    series: 0,
    repeticiones: 0,
    equipo: ''
  };

  rutina: Partial<RutinaCompletaDTO> = {
    medidas: [],
    ejercicios: []
  };



  @ViewChild('stepper') stepper!: MatStepper;

  // Usar @ViewChild para acceder al componente
   @ViewChild(ItemRutinaMedidasComponent)
itemRutinaMedidasComp!: ItemRutinaMedidasComponent;
@ViewChild(ItemRutinaEjercicioComponent)
itemRutinaEjerciciosComp!: ItemRutinaEjercicioComponent;


  constructor(
    private route: ActivatedRoute,
    private clienteService: ClienteService,
    private http: HttpClient
  ) {}

  
  ngOnInit(): void {


    this.clienteService.obtenerClientes().subscribe(data => {
      this.clientes = data;
    });
  }

  seleccionarCliente(cliente: Cliente): void {
    this.clienteSeleccionado = cliente;
  }

  
  continuar(): void {
   if (!this.clienteSeleccionado) {
    alert('Selecciona un cliente primero');
    return;
  }
  this.stepper.next();

    this.rutina.objetivo = this.objetivo;
    this.rutina.lesiones = this.lesiones;
    this.rutina.padecimientos = this.padecimientos;
    this.rutina.horario = this.horario;
    this.rutina.fechaCreacion = new Date().toISOString();
    this.rutina.fechaRenovacion = new Date().toISOString();
    this.rutina.idInstructor = 1; // cambiar si tienes autenticación real
  }

  agregarMedida(): void {
    if (this.rutina.medidas) {
      this.rutina.medidas.push({ ...this.medidaInput });
    }
  }

  agregarEjercicio(): void {
    if (this.rutina.ejercicios) {
      this.rutina.ejercicios.push({ ...this.ejercicioInput });
    }
  }

  continuarDesdeMedidas(): void {
    this.stepper.next();
  }

  continuarDesdeEjercicios(): void {
    this.stepper.next();
  }








 finalizar(): void {
  if (!this.clienteSeleccionado?.idCliente) {
    console.error('ID de cliente no definido');
    return;
  }

  // 🧠 Setear valores comunes de rutina
  this.rutina.objetivo = this.objetivo;
  this.rutina.lesiones = this.lesiones;
  this.rutina.padecimientos = this.padecimientos;
  this.rutina.horario = this.horario;
  this.rutina.fechaCreacion = new Date().toISOString();
  this.rutina.fechaRenovacion = new Date().toISOString();
  this.rutina.idInstructor = 1; // o el real si hay auth

  // ✅ Obtener medidas del componente que no debe tocarse
  this.rutina.medidas = (this.itemRutinaMedidasComp?.rutina || [])
    .filter(item => item.medidaCorporal && item.medidaCorporal.codMedida !== undefined)
    .map(item => ({
      idMedidaCorporal: item.medidaCorporal.codMedida!,
      valorMedida: item.valorMedida,
      fechaMedicion: new Date().toISOString().substring(0, 10)
    }));

  // ✅ Convertir ejercicios al formato esperado por el backend (DTO)
  this.rutina.ejercicios = (this.itemRutinaEjerciciosComp?.items || [])
    .filter(item => item.idEjercicio !== undefined)
    .map(item => ({
      idEjercicio: item.idEjercicio!,
      series: item.seriesEjercicio,          // Cambiado
      repeticiones: item.repeticionesEjercicio,  // Cambiado
      equipo: item.equipoEjercicio          // Cambiado
    }));


  // ✅ Preparar objeto final DTO
  const rutinaDTO: RutinaCompletaDTO = {
  idRutina: this.rutina.idRutina!,
  idInstructor: this.rutina.idInstructor!,
  objetivo: this.rutina.objetivo || '',
  lesiones: this.rutina.lesiones || '',
  padecimientos: this.rutina.padecimientos || '',
  horario: this.rutina.horario || '',
  fechaCreacion: this.rutina.fechaCreacion!,
  fechaRenovacion: this.rutina.fechaRenovacion!,
  medidas: this.rutina.medidas!,
  ejercicios: this.rutina.ejercicios!, 
  cliente: {
  idPersona: this.clienteSeleccionado.idPersona,
  nombre: this.clienteSeleccionado.nombre,
  apellidos: this.clienteSeleccionado.apellidos,
  sexo: this.clienteSeleccionado.sexo,
  telefono: this.clienteSeleccionado.telefono,
  correoElectronico: this.clienteSeleccionado.correoElectronico,
  imagenRuta: this.clienteSeleccionado.imagenRuta || '',
  direccion: this.clienteSeleccionado.direccion || '',
  nombreContactoEmergencia: this.clienteSeleccionado.nombreContactoEmergencia || '',
  telContactoEmergencia: this.clienteSeleccionado.telContactoEmergencia || '',
  activo: this.clienteSeleccionado.activo
}

};


  // ✅ Enviar al backend
  this.http.post(`${environment.apiBaseUrl}/clientes/${this.clienteSeleccionado.idCliente}/rutinas/completa`, rutinaDTO)
    .subscribe({
      next: () => {
        alert('Rutina creada correctamente');
        localStorage.removeItem('itemsRutina');
      },
      error: (err) => {
        console.error('❌ Error al guardar rutina', err);
      }
    });
}



}
