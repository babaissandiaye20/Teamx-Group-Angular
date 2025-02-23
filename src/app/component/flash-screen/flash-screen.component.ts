import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LoaderComponent } from '../loader/loader.component';
@Component({
  selector: 'app-flash-screen',
  imports: [LoaderComponent],
  templateUrl: './flash-screen.component.html',
  styleUrl: './flash-screen.component.css'
})
export class FlashScreenComponent {
  fadeOut = false;

  constructor(private router: Router) {}

  ngOnInit() {
    // Vérifier si le splash screen a déjà été affiché
   /*  if (localStorage.getItem('splashShown')) {
      this.router.navigate(['/users']);
      return;
    } */

    setTimeout(() => {
      this.fadeOut = true;
      setTimeout(() => {
        localStorage.setItem('splashShown', 'true');
        this.router.navigate(['/users']);
      }, 500);
    }, 2500);
  }
}

