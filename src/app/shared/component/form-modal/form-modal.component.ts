import { Component,EventEmitter, Input, Output, TemplateRef  } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-form-modal',
  imports: [CommonModule, FormsModule],
  templateUrl: './form-modal.component.html',
  styleUrl: './form-modal.component.css'
})
export class FormModalComponent {
  @Input() visible = false;
  @Input() isEditing = false;
  @Input() entityName = 'élément';
  @Input() currentEntity: any = {};
  @Input() formTemplate!: TemplateRef<any>;
  @Input() isValid = true;

  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() save$ = new EventEmitter<any>();

  close() {
    this.visible = false;
    this.visibleChange.emit(false);
  }

  save() {
    this.save$.emit(this.currentEntity);
    this.close();
  }

}
