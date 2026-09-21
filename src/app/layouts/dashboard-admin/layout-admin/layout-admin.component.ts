import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

// Pipe
import { CapitalizePipe } from 'src/app/pipes/capitalize.pipe';
import { SidebarMainComponent } from "../components/sidebar-main/sidebar-main.component";

import { NavbarMainComponent } from "../components/navbar-main/navbar-main.component";
import { AuthService } from 'src/app/core/auth/auth.service';

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
      this.rol = usuario.roles[0];
      this.nombre = usuario.persona?.nombres!;
    }
  }
}
