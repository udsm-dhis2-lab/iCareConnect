import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TheatreHomeComponent } from './pages/theatre-home/theatre-home.component';
import { TheatreOrdersComponent } from './pages/theatre-orders/theatre-orders.component';
const routes: Routes = [
  {
    path: '',
    component: TheatreHomeComponent,
  },
  {
    path: 'orders',
    component: TheatreOrdersComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TheatreRoutingModule {}
