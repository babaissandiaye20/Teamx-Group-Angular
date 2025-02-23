import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { FormModalComponent } from '../../shared/component/form-modal/form-modal.component';
import { DeleteModalComponent } from '../../shared/component/delete-modal/delete-modal.component';
import { Product } from './product';
import { ProductService } from './service/product.service';
import { NotificationService } from '../../shared/service/notification/notification.service';
import { ToastComponent } from '../../shared/component/toast/toast.component';
import { CreateProductDto, UpdateProductDto } from './product';
import { FcfaCurrencyPipe } from '../../fcfa-currency.pipe';
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
    FormModalComponent,
    DeleteModalComponent,
    FcfaCurrencyPipe
  ],
  templateUrl: './product.component.html',
  styleUrl: './product.component.css'
})
export class ProductComponent implements OnInit {
  private productsSubject = new BehaviorSubject<Product[]>([]);
  products$ = this.productsSubject.asObservable();
  
  showFormModal = false;
  isEditing = false;
  currentProduct: Partial<Product> = {};
  selectedFile: File | null = null;
  previewImage: string | undefined | null | File = null;

  showDeleteModal = false;
  productToDelete: Product | null = null;

  private readonly ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/gif'];
  private readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 5MB

  constructor(
    private productService: ProductService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadProducts();
    this.resetForm();
  }

  private loadProducts(): void {
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
      catchError(error => {
        this.notificationService.error('Erreur lors du chargement des produits');
        console.error('Error loading products:', error);
        return [];
      })
    ).subscribe(products => {
      this.productsSubject.next(products);
    });
  }

  validateFile(file: File): string | null {
    if (!this.ALLOWED_FILE_TYPES.includes(file.type)) {
      return 'Format de fichier non supporté. Utilisez JPG, PNG ou GIF.';
    }

    if (file.size > this.MAX_FILE_SIZE) {
      return 'Le fichier est trop volumineux (maximum 5MB)';
    }

    return null;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      
      const validationError = this.validateFile(file);
      if (validationError) {
        this.notificationService.error(validationError);
        input.value = '';
        this.selectedFile = null;
        this.previewImage = null;
        return;
      }

      this.selectedFile = file;
      
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

  async saveProduct(product: Partial<Product>): Promise<void> {
    if (!this.isFormValid()) {
      this.notificationService.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    try {
      if (this.isEditing && this.currentProduct._id) {
        const updateData: UpdateProductDto = {
          name: this.currentProduct.name,
          price: typeof this.currentProduct.price === 'number' 
                 ? this.currentProduct.price 
                 : Number(this.currentProduct.price),
          quantity: typeof this.currentProduct.quantity === 'number'
                   ? this.currentProduct.quantity
                   : Number(this.currentProduct.quantity),
          image: this.selectedFile || undefined
        };
        
        await this.productService.update(this.currentProduct._id, updateData).toPromise();
        this.notificationService.success('Produit modifié avec succès');
      } else {
        if (!this.currentProduct.name || this.currentProduct.price === undefined || this.currentProduct.quantity === undefined) {
          throw new Error("Tous les champs sont requis pour la création d'un produit");
        }
        
        const createData: CreateProductDto = {
          name: this.currentProduct.name.trim(),
          price: typeof this.currentProduct.price === 'number'
                 ? this.currentProduct.price
                 : Number(this.currentProduct.price),
          quantity: typeof this.currentProduct.quantity === 'number'
                   ? this.currentProduct.quantity
                   : Number(this.currentProduct.quantity),
          image: this.selectedFile || undefined
        };
        
        await this.productService.create(createData).toPromise();
        this.notificationService.success('Produit ajouté avec succès');
      }

      this.showFormModal = false;
      this.loadProducts();
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
      this.productService.delete(product._id).subscribe({
        next: () => {
          this.showDeleteModal = false;
          this.notificationService.success('Produit supprimé avec succès');
          this.loadProducts();
        },
        error: (error) => {
          console.error('Erreur lors de la suppression:', error);
          this.notificationService.error('Erreur lors de la suppression du produit');
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
    this.currentProduct = { ...product };
    this.previewImage = product.image;
    this.showFormModal = true;
  }

  private resetForm(): void {
    this.currentProduct = {
      name: '',
      price: 0,
      quantity: 0,
      image: null
    };
    this.selectedFile = null;
    this.previewImage = null;
  }

  isFormValid(): boolean {
    // Ne vérifier que si on est dans le contexte du formulaire
    if (!this.showFormModal) {
      return true;
    }
    
    return this.isEditing
      ? !!(this.currentProduct.name?.trim()) &&
        this.currentProduct.quantity !== undefined &&
        this.currentProduct.price !== undefined
      : !!(this.currentProduct.name?.trim()) &&
        this.currentProduct.quantity !== undefined &&
        this.currentProduct.quantity >= 0 &&
        this.currentProduct.price !== undefined &&
        this.currentProduct.price >= 0 &&
        !!(this.selectedFile || this.previewImage);
  }
}