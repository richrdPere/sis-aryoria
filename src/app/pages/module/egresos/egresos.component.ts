import { Component } from '@angular/core';
import { FormsModule, } from '@angular/forms';

@Component({
  selector: 'app-egresos',
  imports: [FormsModule],
  templateUrl: './egresos.component.html',
  styles: ``
})
export class EgresosComponent {
  // Ingresos
  egresos: any = [];
  searchTimeout: any;

  loading = true;

  filtro: string = '';
  modoEdicion = false;
  mostrarModal = false;


  compraSeleccionado: any | null = null;

  // Paginado
  page = 1;
  limit = 5;
  totalItems = 0;
  totalPages = 0;
  currentPage = 1;

  pageSizeOptions = [5, 10, 20, 50];

  // Search
  nombreBusqueda: string = '';
  rolFiltro: string = '';

  meses = [
    { value: 1, label: 'Enero' },
    { value: 2, label: 'Febrero' },
    { value: 3, label: 'Marzo' },
    { value: 4, label: 'Abril' },
    { value: 5, label: 'Mayo' },
    { value: 6, label: 'Junio' },
    { value: 7, label: 'Julio' },
    { value: 8, label: 'Agosto' },
    { value: 9, label: 'Septiembre' },
    { value: 10, label: 'Octubre' },
    { value: 11, label: 'Noviembre' },
    { value: 12, label: 'Diciembre' },
  ];

  anios: number[] = [];

  filtroMes: number | '' = '';
  filtroAnio: number | '' = '';
  filtroSearch = '';

  // Constructor
  constructor(

  ) {
  }



  // onInit
  ngOnInit(): void {

    const anioActual = new Date().getFullYear();
    for (let i = anioActual; i >= anioActual - 5; i--) {
      this.anios.push(i);
    }
    // this.cargarCompras();

  }


  // Helpers Methods
  aplicarFiltros() {
    throw new Error('Method not implemented.');
  }
  onSearchChange() {
    throw new Error('Method not implemented.');
  }
}
