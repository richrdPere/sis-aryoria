import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

// Service
import { ThemeService } from 'src/app/shared/services/theme.service';

@Component({
  selector: 'app-theme-toggle-button',
  imports: [CommonModule],
  templateUrl: './theme-toggle-button.component.html',
  styles: ``
})
export class ThemeToggleButtonComponent {
  theme$;

  constructor(private themeService: ThemeService) {
    this.theme$ = this.themeService.theme$;
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }
}
