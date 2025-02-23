import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-delete-modal',
  imports: [CommonModule ],
  templateUrl: './delete-modal.component.html',
  styleUrl: './delete-modal.component.css'
})
export class DeleteModalComponent {
  @Input() visible = false;
  @Input() entityName: string = '';
  @Input() entityPreview: string = '';
  @Input() entityToDelete: any = null;

  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() delete$ = new EventEmitter<any>();

  close() {
    this.visible = false;
    this.visibleChange.emit(false);
  }

  confirm() {
    this.delete$.emit(this.entityToDelete);
    this.close();
  }

}
