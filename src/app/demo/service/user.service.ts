import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../domain/user';
import { Role } from '../domain/role';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrlUser = 'http://127.0.0.1:8000/api/users';
  private apiUrlRole = 'http://127.0.0.1:8000/api/roles'; 

  constructor(private httpClient: HttpClient) {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json'
    });
  }

  // ================================
  // ✅ Users CRUD
  // ================================

  getUsers(): Observable<User[]> {
    return this.httpClient.get<User[]>(this.apiUrlUser, {
      headers: this.getHeaders()
    });
  }

  getUserById(id: string): Observable<User> {
    return this.httpClient.get<User>(`${this.apiUrlUser}/${id}`, {
      headers: this.getHeaders()
    });
  }

  insertUser(user: User): Observable<User> {
    return this.httpClient.post<User>(this.apiUrlUser, user, {
      headers: this.getHeaders()
    });
  }

  updateUser(id: string, user: Partial<User>): Observable<User> {
    return this.httpClient.put<User>(`${this.apiUrlUser}/${id}`, user, {
      headers: this.getHeaders()
    });
  }

  deleteUser(id: string): Observable<void> {
    return this.httpClient.delete<void>(`${this.apiUrlUser}/${id}`, {
      headers: this.getHeaders()
    });
  }

  getUserByEmail(email: string): Observable<User> {
    return this.httpClient.post<User>(`${this.apiUrlUser}/by-email`, { email }, {
      headers: this.getHeaders()
    });
  }

  getUserRole(id: string): Observable<Role> {
    return this.httpClient.get<Role>(`${this.apiUrlUser}/${id}/roles`, {
      headers: this.getHeaders()
    });
  }

  // ================================
  // ✅ Roles CRUD (If applicable)
  // ================================

  getRoles(): Observable<Role[]> {
    return this.httpClient.get<Role[]>(this.apiUrlRole, {
      headers: this.getHeaders()
    });
  }

  getRoleById(id: string): Observable<Role> {
    return this.httpClient.get<Role>(`${this.apiUrlRole}/${id}`, {
      headers: this.getHeaders()
    });
  }

  insertRole(role: Role): Observable<Role> {
    return this.httpClient.post<Role>(this.apiUrlRole, role, {
      headers: this.getHeaders()
    });
  }

  updateRole(id: string, role: Role): Observable<Role> {
    return this.httpClient.put<Role>(`${this.apiUrlRole}/${id}`, role, {
      headers: this.getHeaders()
    });
  }

  deleteRole(id: string): Observable<void> {
    return this.httpClient.delete<void>(`${this.apiUrlRole}/${id}`, {
      headers: this.getHeaders()
    });
  }
}