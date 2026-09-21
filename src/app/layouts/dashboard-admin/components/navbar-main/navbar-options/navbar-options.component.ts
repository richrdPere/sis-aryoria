import { Component } from '@angular/core';
import { DarkService } from 'src/app/services/dark.service';

@Component({
  selector: 'navbar-options',
  imports: [],
  templateUrl: './navbar-options.component.html',
  styles: ``
})
export class NavbarOptionsComponent {
  theme: string = 'light';

  constructor(private themeService: DarkService) { }

  ngOnInit(): void {
    this.theme = this.themeService.getTheme();
  }

  toggleTheme() {
    this.themeService.toggleTheme();
    this.theme = this.themeService.getTheme();
  }
}
