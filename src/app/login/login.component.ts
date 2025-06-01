import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Router } from '@angular/router';
import { AuthService } from '../shared/auth.service';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  imports: [
    MatCardModule,
    MatFormFieldModule,
    FormsModule,
    MatInputModule,
    CommonModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  // Modo para alternar entre login y registro
  isRegisterMode = false;

  // Login
  email: string = '';
  password: string = '';
  error: boolean = false;

  // Registro
  name: string = '';
  regEmail: string = '';
  regPassword: string = '';
  confirmPassword: string = '';
  regError: string = '';

  // Bloqueo
  mostrarBotonDesbloqueo: boolean = false;
  emailBloqueado: string = '';
  mensajeExito: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  async login() {
    const success = await this.authService.login(this.email, this.password);
    if (success) {
      this.error = false;
      this.router.navigate(['/']);
    } else {
      this.error = true;
    }
  }

  // Validar contraseña para registro
  private validatePassword(password: string): string | null {
    if (password.length < 8 || password.length > 16)
      return 'La contraseña debe tener entre 8 y 16 caracteres.';
    if (!/^[A-Za-z0-9_]+$/.test(password))
      return 'La contraseña solo puede contener letras, dígitos y guion bajo (_).';
    if (!/[A-Z]/.test(password))
      return 'La contraseña debe contener al menos una letra mayúscula.';
    if (!/\d/.test(password))
      return 'La contraseña debe contener al menos un dígito.';
    return null;
  }

  async register() {
    this.regError = '';

    // Validar campos
    if (
      !this.name ||
      !this.regEmail ||
      !this.regPassword ||
      !this.confirmPassword
    ) {
      this.regError = 'Por favor, complete todos los campos.';
      return;
    }

    // Validar contraseña
    const pwdError = this.validatePassword(this.regPassword);
    if (pwdError) {
      this.regError = pwdError;
      return;
    }

    // Confirmar contraseña
    if (this.regPassword !== this.confirmPassword) {
      this.regError = 'Las contraseñas no coinciden.';
      return;
    }

    // Registrar con el servicio
    try {
      await this.authService.register(
        this.name,
        this.regEmail,
        this.regPassword
      );
      alert('Usuario registrado con éxito.');
      // Reset campos y volver a login
      this.name = '';
      this.regEmail = '';
      this.regPassword = '';
      this.confirmPassword = '';
      this.isRegisterMode = false;
    } catch (err) {
      this.regError = 'Error al registrar el usuario. Intente de nuevo.';
    }
  }

  toggleMode() {
    this.isRegisterMode = !this.isRegisterMode;
    this.error = false;
    this.regError = '';
  }
}
