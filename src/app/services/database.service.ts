import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  private dbName = 'patientDB';
  private dbVersion = 1;
  private db: IDBDatabase | null = null;
  private dbReady = new BehaviorSubject<boolean>(false);

  constructor() {
    this.initDatabase();
  }

  private async initDatabase() {
    try {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = (event) => {
        console.error('Failed to open database:', event);
        this.dbReady.next(false);
      };

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        this.dbReady.next(true);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('patients')) {
          const store = db.createObjectStore('patients', { keyPath: 'id', autoIncrement: true });
          store.createIndex('email', 'email', { unique: true });
          store.createIndex('lastName', 'lastName', { unique: false });
        }
      };
    } catch (err) {
      console.error('Failed to initialize database:', err);
      this.dbReady.next(false);
    }
  }

  isDatabaseReady() {
    return this.dbReady.asObservable();
  }

  isInitialized(): boolean {
    return this.dbReady.value;
  }

  async addPatient(patient: any): Promise<number> {
    if (!this.db) {
      throw new Error('Database is not initialized');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['patients'], 'readwrite');
      const store = transaction.objectStore('patients');

      const request = store.add({
        ...patient,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      request.onsuccess = () => resolve(request.result as number);
      request.onerror = () => reject(request.error);
    });
  }

  async updatePatient(id: number, patient: any): Promise<void> {
    if (!this.db) {
      throw new Error('Database is not initialized');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['patients'], 'readwrite');
      const store = transaction.objectStore('patients');

      const request = store.put({
        ...patient,
        id,
        updatedAt: new Date().toISOString()
      });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async deletePatient(id: number): Promise<void> {
    if (!this.db) {
      throw new Error('Database is not initialized');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['patients'], 'readwrite');
      const store = transaction.objectStore('patients');
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getPatient(id: number): Promise<any> {
    if (!this.db) {
      throw new Error('Database is not initialized');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['patients'], 'readonly');
      const store = transaction.objectStore('patients');
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getAllPatients(): Promise<any[]> {
    if (!this.db) {
      throw new Error('Database is not initialized');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['patients'], 'readonly');
      const store = transaction.objectStore('patients');
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async searchPatients(query: string): Promise<any[]> {
    if (!this.db) {
      throw new Error('Database is not initialized');
    }

    const patients = await this.getAllPatients();
    const searchTerm = query.toLowerCase();

    return patients.filter(patient => 
      patient.firstName.toLowerCase().includes(searchTerm) ||
      patient.lastName.toLowerCase().includes(searchTerm) ||
      patient.email.toLowerCase().includes(searchTerm)
    );
  }
}
