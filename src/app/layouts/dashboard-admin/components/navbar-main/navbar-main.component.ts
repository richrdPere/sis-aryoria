import { Component, ChangeDetectionStrategy } from '@angular/core';
import { NavbarOptionsComponent } from "./navbar-options/navbar-options.component";
import { NavbarProfileComponent } from "./navbar-profile/navbar-profile.component";

@Component({
  selector: 'navbar-main',
  imports: [NavbarOptionsComponent, NavbarProfileComponent],
  templateUrl: './navbar-main.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: ``
})
export class NavbarMainComponent {

}
