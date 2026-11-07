import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Location } from '@angular/common';

@Component({
  imports: [RouterLink],
  selector: 'app-wildcard',
  styleUrl: './wildcard.component.css',
  templateUrl: './wildcard.component.html',
})
export class WildcardComponent {
  private readonly router = inject(Router);
  private readonly location = inject(Location);

  goBack(): void {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      this.location.back();
      return;
    }
    this.router.navigateByUrl('/home');
  }
}
