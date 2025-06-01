import { inject, Injectable } from '@angular/core';
import {
  Auth,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from '@angular/fire/auth';
import {
  Firestore,
  doc,
  getDoc,
  updateDoc,
  collection,
  getDocs,
  query,
  where,
  setDoc,
} from '@angular/fire/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private auth = inject(Auth);
  private firestore = inject(Firestore);
  private loggedUserName: string | null = null;
  private userType: 'admin' | 'usuario' | null = null;

  async login(email: string, password: string): Promise<boolean> {
    try {
      const userCredential = await signInWithEmailAndPassword(
        this.auth,
        email,
        password
      );
      const uid = userCredential.user.uid;

      // Buscar en admins
      const adminDocRef = doc(this.firestore, 'admins', uid);
      const adminSnap = await getDoc(adminDocRef);

      if (adminSnap.exists()) {
        this.loggedUserName = adminSnap.data()['nombre'] || null;
        this.userType = 'admin';
        return true;
      }

      // Buscar en usuarios (no admin)
      const userDocRef = doc(this.firestore, 'usuarios', uid);
      const userSnap = await getDoc(userDocRef);

      if (userSnap.exists()) {
        this.loggedUserName = userSnap.data()['nombre'] || null;
        this.userType = 'usuario';
        return true;
      }

      // Si no está ni en admins ni en usuarios, salir
      this.logout();
      return false;
    } catch (error) {
      return false;
    }
  }

  async register(
    nombre: string,
    email: string,
    password: string
  ): Promise<boolean> {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        this.auth,
        email,
        password
      );
      const uid = userCredential.user.uid;

      await setDoc(doc(this.firestore, 'usuarios', uid), {
        nombre: nombre,
        email: email,
        intentosFallidos: 0,
        bloqueado: false,
      });

      return true;
    } catch (error) {
      return false;
    }
  }

  logout() {
    this.loggedUserName = null;
    this.userType = null;
    this.auth.signOut();
  }

  isAdmin(): boolean {
    return this.userType === 'admin';
  }

  get userName() {
    return this.loggedUserName;
  }

  isLoggedIn(): boolean {
    return this.loggedUserName !== null; // ksjks
  }
}
