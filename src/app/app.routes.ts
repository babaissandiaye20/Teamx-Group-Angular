import { Routes } from '@angular/router';
import { UserComponent } from './pages/user/user.component';
import { ProductComponent } from './pages/product/product.component';
import { FlashScreenComponent } from './component/flash-screen/flash-screen.component';

export const routes: Routes = [
  { path: '', component: FlashScreenComponent },
  { path: 'users', component: UserComponent },
  { path: 'products', component: ProductComponent },
  { path: '**', redirectTo: 'users' }
];