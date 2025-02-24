import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, catchError, finalize, delay } from 'rxjs/operators';
import { FormModalComponent } from '../../shared/component/form-modal/form-modal.component';
import { DeleteModalComponent } from '../../shared/component/delete-modal/delete-modal.component';
import { SkeletonComponent } from '../../shared/skeleton/skeleton.component';
import { Product } from './product';
import { ProductService } from './service/product.service';
import { NotificationService } from '../../shared/service/notification/notification.service';
import { ToastComponent } from '../../shared/component/toast/toast.component';
import { CreateProductDto, UpdateProductDto } from './product';
import { FcfaCurrencyPipe } from '../../fcfa-currency.pipe';
import { ProductValidator } from './product.validator';

interface ApiError {
  error?: {
    message?: string;
    errors?: string[];
  }; 
}

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [
    ToastComponent,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    FormModalComponent,
    DeleteModalComponent,
    FcfaCurrencyPipe,
    SkeletonComponent
  ],
  templateUrl: './product.component.html',
  styleUrl: './product.component.css'
})
export class ProductComponent implements OnInit {
  private productsSubject = new BehaviorSubject<Product[]>([]);
  products$ = this.productsSubject.asObservable();
  isLoading = true;
  
  showFormModal = false;
  isEditing = false;
  currentProduct: Partial<Product> = {};
  selectedFile: File | null = null;
  previewImage: string | undefined | null | File = null;

  productForm!: FormGroup;
  formErrors: { [key: string]: string } = {};

  showDeleteModal = false;
  productToDelete: Product | null = null;

  constructor(
    private productService: ProductService,
    private notificationService: NotificationService,
    public productValidator: ProductValidator,  
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.loadProducts();
    this.initForm();
  }

  private initForm(): void {
    this.productForm = this.fb.group({
      name: ['', [
        Validators.required,
        (control: AbstractControl<any, any>) => this.productValidator.validateName(control)
      ]],
      price: [0, [
        Validators.required,
        (control: AbstractControl<any, any>) => this.productValidator.validatePrice(control)
      ]],
      quantity: [0, [
        Validators.required,
        (control: AbstractControl<any, any>) => this.productValidator.validateQuantity(control)
      ]]
    });
  }

  private loadProducts(): void {
    this.isLoading = true;
    this.productService.getAll().pipe(
      map((response: any) => {
        if (response?.data?.data) {
          return response.data.data;
        } else if (response?.data) {
          return response.data;
        } else if (Array.isArray(response)) {
          return response;
        }
        console.error('Format de données invalide:', response);
        return [];
      }),
      delay(800),
      catchError(error => {
        this.notificationService.error('Erreur lors du chargement des produits');
        console.error('Error loading products:', error);
        return [];
      }),
      finalize(() => {
        this.isLoading = false;
      })
    ).subscribe(products => {
      this.productsSubject.next(products);
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      
      const validationErrors = this.productValidator.validateImage(file);
      if (validationErrors) {
        this.formErrors['image'] = this.productValidator.getErrorMessage('image', validationErrors);
        this.notificationService.error(this.formErrors['image']);
        input.value = '';
        this.selectedFile = null;
        this.previewImage = null;
        return;
      }

      this.selectedFile = file;
      this.formErrors['image'] = '';
      
      const reader = new FileReader();
      reader.onload = (e) => {
        this.previewImage = e.target?.result as string;
      };
      reader.onerror = () => {
        this.notificationService.error("Erreur lors de la lecture du fichier");
        this.selectedFile = null;
        this.previewImage = null;
      };
      reader.readAsDataURL(file);
    }
  }

  validateForm(): boolean {
    this.formErrors = {};
    let isValid = true;

    // Validate form fields
    Object.keys(this.productForm.controls).forEach(key => {
      const control = this.productForm.get(key);
      control?.markAsTouched();
      
      if (control?.invalid) {
        this.formErrors[key] = this.productValidator.getErrorMessage(
          key, 
          control.errors || {}
        );
        isValid = false;
      }
    });

    // Validate image for new products
    if (!this.isEditing) {
      const imageErrors = this.productValidator.validateImage(this.selectedFile);
      if (imageErrors) {
        this.formErrors['image'] = this.productValidator.getErrorMessage('image', imageErrors);
        isValid = false;
      }
    }

    return isValid;
  }

  async saveProduct(): Promise<void> {
    if (!this.validateForm()) {
      const errorMessages = Object.values(this.formErrors);
      if (errorMessages.length > 0) {
        this.notificationService.error(errorMessages[0]);
      }
      return;
    }

    try {
      this.isLoading = true;
      
      const formValue = this.productForm.value;
      
      if (this.isEditing && this.currentProduct._id) {
        const updateData: UpdateProductDto = {
          name: formValue.name,
          price: formValue.price,
          quantity: formValue.quantity,
          image: this.selectedFile || undefined
        };
        
        await this.productService.update(this.currentProduct._id, updateData).toPromise();
        this.notificationService.success('Produit modifié avec succès');
      } else {
        const createData: CreateProductDto = {
          name: formValue.name.trim(),
          price: formValue.price,
          quantity: formValue.quantity,
          image: this.selectedFile as File
        };
        
        await this.productService.create(createData).toPromise();
        this.notificationService.success('Produit ajouté avec succès');
      }

      this.showFormModal = false;
      await this.loadProducts();
      this.resetForm();
    } catch (error: unknown) {
      const apiError = error as ApiError;
      let errorMessage = "Erreur lors de l'enregistrement du produit";
      
      if (apiError.error?.errors && apiError.error.errors.length > 0) {
        errorMessage = apiError.error.errors.join(', ');
      } else if (apiError.error?.message) {
        errorMessage = apiError.error.message;
      }
      
      this.notificationService.error(errorMessage);
      this.isLoading = false;
    }
  }

  onDeleteClick(product: Product): void {
    if (!product || !product._id) {
      this.notificationService.error('Produit invalide');
      return;
    }
    this.productToDelete = product;
    this.showDeleteModal = true;
  }

  deleteProduct(product: Product) {
    if (product && product._id) {
      this.isLoading = true;
      this.productService.delete(product._id).subscribe({
        next: () => {
          this.showDeleteModal = false;
          this.notificationService.success('Produit supprimé avec succès');
          this.loadProducts();
        },
        error: (error) => {
          console.error('Erreur lors de la suppression:', error);
          this.notificationService.error('Erreur lors de la suppression du produit');
          this.isLoading = false;
        }
      });
    }
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.productToDelete = null;
  }

  openAddModal(): void {
    this.resetForm();
    this.isEditing = false;
    this.showFormModal = true;
  }

  editProduct(product: Product): void {
    this.resetForm();
    this.isEditing = true;
    
    this.productForm.patchValue({
      name: product.name,
      price: product.price,
      quantity: product.quantity
    });
    
    this.currentProduct = { ...product };
    this.previewImage = product.image;
    this.showFormModal = true;
  }

  private resetForm(): void {
    this.initForm();
    this.formErrors = {};
    this.currentProduct = {};
    this.selectedFile = null;
    this.previewImage = null;
  }

  getFieldError(fieldName: string): string {
    return this.formErrors[fieldName] || '';
  }

  hasFieldError(fieldName: string): boolean {
    return !!this.formErrors[fieldName];
  }

  isFieldTouched(fieldName: string): boolean {
    return this.productForm.get(fieldName)?.touched || false;
  }
}