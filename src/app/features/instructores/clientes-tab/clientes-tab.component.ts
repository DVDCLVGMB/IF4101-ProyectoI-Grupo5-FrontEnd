import { Component, OnInit } from '@angular/core';
import { Cliente } from '@app/domain/cliente.model';
import { ClienteService } from '@app/services/cliente/cliente.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ClienteSeleccionado } from '@app/services/rutina-cliente/cliente-seleccionado.service'
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-clientes-tab',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
  templateUrl: './clientes-tab.component.html',
  styleUrls: ['./clientes-tab.component.css']
})
export class ClientesTabComponent implements OnInit {
  clientes: Cliente[] = [];

  constructor(
    private clienteService: ClienteService,
    private route: ActivatedRoute,
    private router: Router,
    private selCli: ClienteSeleccionado
  ) { }

  ngOnInit() {
    this.clienteService.listarClientes().subscribe({
      next: list => this.clientes = list,
      error: err => console.error(err)
    });
  }

  verRutinas(cliente: Cliente) {
    this.router.navigate(['/clientes', cliente.idCliente, 'rutinas']);
  }
}
