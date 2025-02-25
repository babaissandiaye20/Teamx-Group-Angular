import { Component, OnInit } from '@angular/core';
import { NgClass, NgFor, NgIf, AsyncPipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { User, CreateUserDto, UpdateUserDto } from './user';
import { UserService } from './service/user.service';
import { UserValidator } from './user.validator';
import { NotificationService } from '../../shared/service/notification/notification.service';
import { DeleteModalComponent } from '../../shared/component/delete-modal/delete-modal.component';
import { FormModalComponent } from '../../shared/component/form-modal/form-modal.component';
import { ToastComponent } from '../../shared/component/toast/toast.component';
import { SkeletonComponent } from '../../shared/skeleton/skeleton.component';
import { PaginationComponent } from '../../shared/pagination/pagination.component';
import { Observable, map, catchError, of, finalize } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-user',
  imports: [
    NgClass, 
    NgFor, 
    NgIf, 
    ReactiveFormsModule,
    DeleteModalComponent, 
    FormModalComponent, 
    ToastComponent,
    SkeletonComponent,
    PaginationComponent,
    AsyncPipe
  ],
  templateUrl: './user.component.html',
  styleUrl: './user.component.css'
})
export class UserComponent implements OnInit {
  lastAddedId: string | null = null;
  allUsers: User[] = []; // Tous les utilisateurs
  displayedUsers: User[] = []; // Utilisateurs de la page courante
  userForm: FormGroup;
  loading = true;
  
  itemsPerPage = 10; // Nombre d'éléments par page
  
  showFormModal = false;
  isEditing = false;
  showDeleteModal = false;
  userToDelete: User | null = null;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private userValidator: UserValidator,
    private notificationService: NotificationService
  ) {
    this.userForm = this.createUserForm();
  }

  private createUserForm(): FormGroup {
    return this.fb.group({
      firstname: ['', { validators: [this.userValidator.validateFirstName.bind(this.userValidator)] }],
      lastname: ['', { validators: [this.userValidator.validateLastName.bind(this.userValidator)] }],
      address: ['', { validators: [this.userValidator.validateAddress.bind(this.userValidator)] }]
    });
  }

  ngOnInit() {
    this.refreshUsers();
  }

  private loadUsers(): Observable<User[]> {
    this.loading = true;
    return this.userService.getAll().pipe(
      map((response: any) => {
        console.log('Response received:', response);
        
        let users: User[] = [];
        if (response?.data?.data) {
          users = response.data.data;
        } else if (response?.data) {
          users = response.data;
        } else if (Array.isArray(response)) {
          users = response;
        } else {
          console.error('Impossible de trouver les données dans la réponse:', response);
          return [];
        }
        
        return users.sort((a, b) => {
          if (a._id === this.lastAddedId) return -1;
          if (b._id === this.lastAddedId) return 1;
          return b._id.localeCompare(a._id);
        });
      }),
      catchError(error => {
        console.error('Error loading users:', error);
        this.notificationService.error('Erreur lors du chargement des utilisateurs');
        return of([]);
      }),
      finalize(() => {
        this.loading = false;
      })
    );
  }
  
  refreshUsers() {
    this.loadUsers().subscribe(users => {
      this.allUsers = users;
    });
  }

  // Méthode appelée lorsque la page change dans le composant de pagination
  onPageChange(pageUsers: User[]) {
    this.displayedUsers = pageUsers;
  }

  openAddModal() {
    this.isEditing = false;
    this.userForm.reset();
    this.showFormModal = true;
  }

  openEditModal(user: User) {
    this.isEditing = true;
    this.userToDelete = user; // Stocker l'utilisateur à éditer
    this.userForm.patchValue({
      firstname: user.firstname,
      lastname: user.lastname,
      address: user.address
    });
    this.showFormModal = true;
  }
  
  openDeleteModal(user: User) {
    this.userToDelete = user;
    this.showDeleteModal = true;
  }

  onFieldBlur(fieldName: string) {
    const control = this.userForm.get(fieldName);
    control?.markAsTouched();
    control?.updateValueAndValidity();
  }

  saveUser() {
    // Marquer tous les champs comme touchés
    Object.keys(this.userForm.controls).forEach(key => {
      const control = this.userForm.get(key);
      control?.markAsTouched();
      control?.updateValueAndValidity();
    });

    if (this.userForm.invalid) {
      return;
    }

    const formValue = this.userForm.value;

    if (this.isEditing && this.userToDelete?._id) {
      const updateDto: UpdateUserDto = {
        firstname: formValue.firstname,
        lastname: formValue.lastname,
        address: formValue.address
      };
      
      this.userService.update(this.userToDelete._id, updateDto).subscribe({
        next: () => {
          this.showFormModal = false;
          this.notificationService.success('Utilisateur modifié avec succès!');
          this.refreshUsers();
        },
        error: (error) => {
          this.notificationService.error('Erreur lors de la modification de l\'utilisateur');
          console.error('Error updating user:', error);
        }
      });
    } else {
      const createDto: CreateUserDto = {
        firstname: formValue.firstname,
        lastname: formValue.lastname,
        address: formValue.address
      };
  
      this.userService.create(createDto).subscribe({
        next: (response) => {
          this.showFormModal = false;
          this.lastAddedId = response.data._id;
          this.notificationService.success('Utilisateur créé avec succès!');
          this.refreshUsers();
          
          setTimeout(() => {
            this.lastAddedId = null;
            this.refreshUsers();
          }, 5000);
        },
        error: (error) => {
          this.notificationService.error('Erreur lors de la création de l\'utilisateur');
          console.error('Error creating user:', error);
        }
      });
    }
  }

  deleteUser(user: User) {
    if (user && user._id) {
      this.userService.delete(user._id).subscribe({
        next: () => {
          this.showDeleteModal = false;
          this.notificationService.success('Utilisateur supprimé avec succès!');
          this.refreshUsers();
        },
        error: (error) => {
          this.notificationService.error('Erreur lors de la suppression de l\'utilisateur');
          console.error('Error deleting user:', error);
        }
      });
    }
  }

  isFormValid(): boolean {
    return this.userForm.valid;
  }

  getErrorMessage(fieldName: string): string {
    const control = this.userForm.get(fieldName);
    if (control?.errors) {
      return this.userValidator.getErrorMessage(fieldName, control.errors);
    }
    return '';
  }
}