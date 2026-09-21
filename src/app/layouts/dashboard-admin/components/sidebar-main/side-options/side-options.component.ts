import { CommonModule } from '@angular/common';
import { Component, ElementRef, QueryList, ViewChildren, ChangeDetectorRef } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { combineLatest, Subscription } from 'rxjs';
import { SafeHtmlPipe } from 'src/app/shared/pipe/safe-html.pipe';
import { SidebarService } from 'src/app/shared/services/sidebar.service';

type NavItem = {
  name: string;
  icon: string;
  roles: string[];
  path?: string;
  new?: boolean;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
};

@Component({
  selector: 'side-options',
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './side-options.component.html',
  styles: ``
})
export class SideOptionsComponent {

  // Main nav items
  navItems: NavItem[] = [
    {
      icon: "assets/icons/sidebar/dashboard.svg",
      name: "Dashboard",
      roles: ['ADMIN', 'EMPLEADO'],
      subItems: [
        { name: "Ecommerce", path: "/main/dashboard" },
      ],
    },
    {
      icon: "assets/icons/sidebar/company.svg",
      name: "Actividades",
      roles: ['ADMIN', 'EMPLEADO'],
      subItems: [
        { name: "Compras", path: "/main/compras" },
        { name: "Ventas", path: "/main/ventas" },
      ],
    },
    {
      icon: "assets/icons/sidebar/bag-money.svg",
      name: "Creditos",
      roles: ['ADMIN', 'EMPLEADO'],
      subItems: [
        { name: "Ingresos", path: "/main/ingresos" },
        { name: "Egresos", path: "/main/egresos" },
      ],
    },
    {
      icon: "assets/icons/sidebar/empresa.svg",
      name: "Empresas",
      roles: ['ADMIN', 'EMPLEADO'],
      path: "/main/empresas",
    },
    {
      icon: "assets/icons/sidebar/user.svg",
      name: "Clientes",
      roles: ['ADMIN', 'EMPLEADO'],
      path: "/main/usuarios",
    },



  ];
  // Others nav items
  othersItems: NavItem[] = [
    {
      icon: "assets/icons/sidebar/calendario.svg",
      name: "Calendario",
      roles: ['ADMIN', 'EMPLEADO'],
      path: "/main/calendar",
    },
    {
      icon: 'assets/icons/sidebar/charts.svg',
      name: "Charts",
      roles: ['ADMIN', 'EMPLEADO'],
      subItems: [
        { name: "Line Chart", path: "/line-chart" },
        { name: "Bar Chart", path: "/bar-chart" },
      ],
    },
    {
      icon: 'assets/icons/sidebar/ui-elements.svg',
      name: "UI Elements",
      roles: ['ADMIN', 'EMPLEADO'],
      subItems: [
        { name: "Alerts", path: "/alerts" },
        { name: "Avatar", path: "/avatars" },
        { name: "Badge", path: "/badge" },
        { name: "Buttons", path: "/buttons" },
        { name: "Images", path: "/images" },
        { name: "Videos", path: "/videos" },
      ],
    },
    {
      icon: 'assets/icons/sidebar/autenticados.svg',
      name: "Authentication",
      roles: ['ADMIN', 'EMPLEADO'],
      subItems: [
        { name: "Sign In", path: "/signin" },
        { name: "Sign Up", path: "/signup" },
      ],
    },
  ];






  rolUsuario = '';


  private subscription: Subscription = new Subscription();

  constructor(
    private router: Router,
  ) {

    const user = JSON.parse(localStorage.getItem('usuario') || '{}');
    this.rolUsuario = (user?.rol || '').toUpperCase();

  }


  //Methods
  isActive(path?: string) {
    if (!path) return false;
    return this.router.url === path;
  }

  isParentActive(nav: any) {
    if (!nav.subItems) return false;

    return nav.subItems.some(
      (sub: any) => this.router.url === sub.path
    );
  }




  // Helpers methods
  get filteredMenu() {
    return this.navItems.filter(item => item.roles.includes(this.rolUsuario));
  }

  get othersMenu() {
    return this.othersItems.filter(item => item.roles.includes(this.rolUsuario));
  }

  logout() {
    localStorage.removeItem('usuario');
    this.router.navigate(['/login']);
  }
}
