import { Component } from '@angular/core';
import { environment } from '@environments/environment';

@Component({
  selector: 'side-header',
  imports: [],
  templateUrl: './side-header.component.html',
  styles: ``
})
export class SideHeaderComponent {
  envs = environment;
}
