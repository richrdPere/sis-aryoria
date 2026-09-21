import { isPlatformBrowser } from '@angular/common';
import { Component, computed, inject, signal, PLATFORM_ID} from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-auth-layout',
  imports: [RouterOutlet],
  templateUrl: './auth-layout.component.html',
  styles: ``
})
export class AuthLayoutComponent {
  readonly currentYear = new Date().getFullYear();
  private readonly platformId = inject(PLATFORM_ID);

  readonly benefits = signal([
    {
      icon: 'fa-solid fa-chart-line',
      title: 'Control financiero',
      description: 'Visualiza tus ingresos, egresos y saldos en un solo lugar.',
    },
    {
      icon: 'fa-solid fa-chart-pie',
      title: 'Reportes claros',
      description: 'Analiza el rendimiento de tu empresa mediante reportes y gráficas.',
    },
    {
      icon: 'fa-solid fa-shield-halved',
      title: 'Información segura',
      description: 'Tus datos financieros se mantienen protegidos y organizados.',
    },
  ]);

  readonly totalBenefits = computed(
    () => this.benefits().length,
  );

  /*
 |--------------------------------------------------------------------------
 | Estado del tema
 |--------------------------------------------------------------------------
 */
  readonly isDarkMode = signal(false);

  /*
|--------------------------------------------------------------------------
| Cambiar tema
|--------------------------------------------------------------------------
*/

  toggleTheme(): void {
    const darkMode =
      !this.isDarkMode();

    this.isDarkMode.set(darkMode);

    this.applyTheme(
      darkMode ? 'dark' : 'light',
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Aplicar tema
  |--------------------------------------------------------------------------
  */

  private applyTheme(
    theme: 'light' | 'dark',
  ): void {
    if (
      !isPlatformBrowser(
        this.platformId,
      )
    ) {
      return;
    }

    // this.document
    //   .documentElement
    //   .setAttribute('data-theme', theme);

    localStorage.setItem('recoleccion_theme', theme);
  }
}
