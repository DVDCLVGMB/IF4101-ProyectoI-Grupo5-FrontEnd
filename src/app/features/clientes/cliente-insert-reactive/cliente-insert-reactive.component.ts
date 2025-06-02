import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ClienteService } from '@app/services/cliente/cliente.service';
import { Component, EventEmitter, Output, Input, OnInit } from '@angular/core';
import { Cliente } from '@app/domain/cliente.model';
import Swal from 'sweetalert2';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-cliente-insert-reactive',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './cliente-insert-reactive.component.html',
  styleUrls: ['./cliente-insert-reactive.component.css']
})
export class ClienteInsertReactiveComponent implements OnInit {
  form: FormGroup;

  @Input() clienteAEditar?: Cliente;
  @Output() guardado = new EventEmitter<void>();

  constructor(private fb: FormBuilder, private clienteService: ClienteService) {
    this.form = this.fb.group({
      idPersona: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
      nombre: ['', Validators.required],
      apellidos: ['', Validators.required],
      fechaNacimiento: ['', Validators.required],
      sexo: ['', Validators.required],
      telefono: ['', Validators.required],
      correoElectronico: ['', [Validators.required, Validators.email]],
      imagenRuta: [''],
      direccion: [''], 
      nombreContactoEmergencia: [''], 
      telContactoEmergencia: [''], 
      activo: [true]
    });
    
  }

  clientesExistentes: Cliente[] = []; // Listado de clientes actuales
  cargandoImagen: boolean = false;
  porcentajeCarga: number = 0; // Barra de progreso
  imagenPreview: string | ArrayBuffer | null = null;
  
  // Cargar los clientes en ngOnInit
  ngOnInit() {
    if (this.clienteAEditar) {
      this.form.patchValue(this.clienteAEditar);
    }
  
    // Cargar clientes existentes para validar duplicados
    this.clienteService.listarClientes().subscribe({
      next: (clientes: Cliente[]) => {
        this.clientesExistentes = clientes;
      },
      error: (err) => {
        console.error('Error al cargar clientes:', err);
      }
    });
  }
  

  onSubmit() {
    if (this.form.valid) {
      const clienteParaEnviar = { ...this.form.value };
  
      // Validar cédula repetida si es nuevo cliente
      if (!this.clienteAEditar) {
        const cedulaYaExiste = this.clientesExistentes.some(c => c.idPersona === clienteParaEnviar.idPersona);
        if (cedulaYaExiste) {
          Swal.fire('❌ Error', 'La cédula ingresada ya está registrada en el sistema.', 'error');
          return;
        }
      }
  
      // Validar imagen demasiado grande
      if (clienteParaEnviar.imagenRuta && clienteParaEnviar.imagenRuta.length > 7000000) {
        Swal.fire('❌ Imagen muy grande', 'La imagen excede el tamaño permitido. Intente con una más pequeña.', 'error');
        return;
      }
  
      // Continuar con guardar o actualizar
      if (this.clienteAEditar && this.clienteAEditar.idPersona) {
        const clienteActualizado = { ...this.clienteAEditar, ...clienteParaEnviar };
  
        this.clienteService.actualizarCliente(clienteActualizado).subscribe({
          next: (respuesta: any) => {
            Swal.fire('✅ ¡Éxito!', respuesta.mensaje, 'success');
            this.guardado.emit();
          },
          error: err => {
            this.manejarErrorHttp(err);
          }
        });
      } else {
        this.clienteService.registrarCliente(clienteParaEnviar).subscribe({
          next: (respuesta: any) => {
            Swal.fire('✅ ¡Éxito!', respuesta.mensaje, 'success');
            this.guardado.emit();
          },
          error: err => {
            this.manejarErrorHttp(err);
          }
        });
      }
    }
  }
  
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
      const maxSizeInBytes = 5 * 1024 * 1024; // 5MB
  
      if (!allowedTypes.includes(file.type)) {
        alert('❌ Solo se permiten imágenes JPG o PNG.');
        return;
      }
  
      if (file.size > maxSizeInBytes) {
        const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
        alert(`❌ La imagen pesa ${sizeInMB} MB. El máximo permitido es 5 MB.`);
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
  
          // 🔥 Simular progreso de carga
          const interval = setInterval(() => {
            this.porcentajeCarga += 10;
            if (this.porcentajeCarga >= 100) {
              clearInterval(interval);
  
              // 🔥 Cuando termina, guardar imagen optimizada
              const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
              this.imagenPreview = dataUrl;
              this.cargandoImagen = false;
              this.form.patchValue({
                imagenRuta: this.imagenPreview
              });
            }
          }, 50); // Cada 50 ms sube 10% para simular una carga fluida
        };
  
        img.onerror = (e) => {
          console.error('Error al cargar imagen:', e);
          this.cargandoImagen = false;
          this.porcentajeCarga = 0;
          alert('❌ Error al procesar la imagen. Intente con otra.');
        };
  
        img.src = e.target?.result as string;
      };
  
      reader.readAsDataURL(file);
    }
  }
  

// Manejar error HTTP de forma bonita
private manejarErrorHttp(err: any): void {
  if (err.error && typeof err.error === 'string') {
    Swal.fire('❌ Error', err.error, 'error');
  } else if (err.error && err.error.mensaje) {
    Swal.fire('❌ Error', err.error.mensaje, 'error');
  } else {
    Swal.fire('❌ Error', 'Ocurrió un error inesperado. Intente nuevamente.', 'error');
  }
}


}
