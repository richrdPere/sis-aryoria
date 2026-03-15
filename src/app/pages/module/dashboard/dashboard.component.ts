import { Component } from '@angular/core';
import { EcommerceMetricsComponent } from "./ecommerce-metrics/ecommerce-metrics.component";
import { MonthlySalesChartComponent } from "./monthly-sales-chart/monthly-sales-chart.component";

@Component({
  selector: 'app-dashboard',
  imports: [EcommerceMetricsComponent, MonthlySalesChartComponent],
  templateUrl: './dashboard.component.html',
  styles: ``
})
export class DashboardComponent {

}
