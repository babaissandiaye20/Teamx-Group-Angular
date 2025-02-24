import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-pagination',
  imports: [NgFor, NgIf],
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.css'
})
export class PaginationComponent implements OnChanges {
  @Input() currentPage: number = 1;
  @Input() totalPages: number = 1;
  @Input() total: number = 0;
  @Input() limit: number = 10;
  @Output() pageChange = new EventEmitter<number>();

  visiblePages: (number | string)[] = [];

  startItem: number = 0;
  endItem: number = 0;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['currentPage'] || changes['totalPages']) {
      this.calculateVisiblePages();
    }
    this.calculateItemRange();
  }

  private calculateVisiblePages() {
    const maxVisiblePages = 5;
    let pages: number[] = [];

    if (this.totalPages <= maxVisiblePages) {
      pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
    } else {
      pages.push(1);

      if (this.currentPage <= 3) {
        pages.push(2, 3, 4);
        pages.push(this.totalPages);
      } else if (this.currentPage >= this.totalPages - 2) {
        pages.push(this.totalPages - 3, this.totalPages - 2, this.totalPages - 1);
        pages.push(this.totalPages);
      } else {
        pages.push(this.currentPage - 1, this.currentPage, this.currentPage + 1);
        pages.push(this.totalPages);
      }
    }
    this.visiblePages = pages;
  }

  private calculateItemRange() {
    this.startItem = (this.currentPage - 1) * this.limit + 1;
    this.endItem = Math.min(this.currentPage * this.limit, this.total);
  }

  onPageChange(page: number | string) {
    const pageNumber = Number(page); // Convertir en nombre
  
    if (isNaN(pageNumber) || pageNumber < 1 || pageNumber > this.totalPages || pageNumber === this.currentPage) {
      return; // Ignore les valeurs invalides
    }
  
    this.currentPage = pageNumber;
    this.pageChange.emit(pageNumber);
  }
  
}  
