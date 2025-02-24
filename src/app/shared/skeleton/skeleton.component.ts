import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-skeleton',
  imports: [CommonModule],
  templateUrl: './skeleton.component.html',
  styleUrl: './skeleton.component.css'
})
export class SkeletonComponent implements OnInit {
  @Input() type: 'card' | 'table-row' | 'list-item' | 'custom' = 'card';
  @Input() containerClass = '';
  @Input() loading = true; // Ajout du décorateur @Input()


  ngOnInit() {
    setTimeout(() => {
      this.loading = false;
    }, 5000);
  }
}
