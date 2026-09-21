import { Component } from '@angular/core';
import { SideHeaderComponent } from "./side-header/side-header.component";
import { SideOptionsComponent } from "./side-options/side-options.component";

@Component({
  selector: 'sidebar-main',
  imports: [SideHeaderComponent, SideOptionsComponent],
  templateUrl: './sidebar-main.component.html',
  styles: ``
})
export class SidebarMainComponent {



}
