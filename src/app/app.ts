import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  title = 'Quick Links';
  
  // Inject AuthService to ensure it's initialized early
  private authService = inject(AuthService);
  
  constructor() {
    console.log('🚀 App component initialized, AuthService injected');
  }
}
