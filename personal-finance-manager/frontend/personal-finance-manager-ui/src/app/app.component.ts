import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ToastComponent } from './components/toast/toast.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, ToastComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  readonly navLinks = [
    { label: 'Summary',      path: '/summary' },
    { label: 'Transactions', path: '/transactions' },
    { label: 'Categories',   path: '/categories' },
    { label: 'Budgets',      path: '/budgets' },
  ];
}
