import { Component, inject, signal } from '@angular/core';
import { CategoriesService } from '../../../../core/services/Categories/categories.service';
import { ICategory } from '../../../../core/models/Category/icategory.interface';
import { RouterLink } from '@angular/router';

@Component({
  imports: [RouterLink],
  selector: 'app-home-categories',
  styleUrl: './home-categories.component.css',
  templateUrl: './home-categories.component.html',
})
export class HomeCategoriesComponent {
  private _CategoriesService = inject(CategoriesService)
  categories = signal<ICategory[]>([])
  ngOnInit(){
    this.getAllCategories()
  }

  getAllCategories(){
    this._CategoriesService.GetAllCategories().subscribe({
      next:(res)=>{
        // console.log(res);
        this.categories.set(res.data)
      }
    })
  }
}
