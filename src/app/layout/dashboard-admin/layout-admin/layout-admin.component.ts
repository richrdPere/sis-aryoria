import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

// Pipe
import { CapitalizePipe } from 'src/app/pipes/capitalize.pipe';
import { SidebarMainComponent } from "../components/sidebar-main/sidebar-main.component";
import { AuthService } from 'src/app/services/auth.service';
import { NavbarMainComponent } from "../components/navbar-main/navbar-main.component";

@Component({
  selector: 'app-layout-admin',
  imports: [RouterOutlet, CapitalizePipe, SidebarMainComponent, NavbarMainComponent],
  templateUrl: './layout-admin.component.html',
  styles: ``
})
export class LayoutAdminComponent {
  rol: string = '';
  nombre: string = '';

  constructor(authService: AuthService,) {

    const usuario = authService.getCurrentUser()

    if (usuario) {
      this.rol = usuario.rol;
      this.nombre = usuario.nombre;
    }
  }
}
