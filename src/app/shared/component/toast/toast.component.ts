import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Toast } from '../../service/notification/toast.interface';
import { NotificationService } from '../../service/notification/notification.service';
import { Observable } from 'rxjs';
@Component({
  standalone:true,
  selector: 'app-toast',
  imports: [CommonModule ],
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.css'
})
export class ToastComponent  implements OnInit{
  toasts$: Observable<Toast[]>;

  constructor(private notificationService: NotificationService) {
    this.toasts$ = this.notificationService.getToasts();
  }

  ngOnInit(): void {}

  closeToast(id: string): void {
    this.notificationService.remove(id);
  }


}
