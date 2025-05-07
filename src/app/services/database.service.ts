import { Injectable } from '@angular/core';
import initSqlJs from 'sql.js';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  private db: any;
  private dbReady = new BehaviorSubject<boolean>(false);

  constructor() {
    this.initDatabase();
  }

  async initDatabase() {
    try {
      const SQL = await initSqlJs({
        locateFile: file => `https://sql.js.org/dist/${file}`
      });
      this.db = new SQL.Database();
      
      // Create patients table
      this.db.run(`
        CREATE TABLE IF NOT EXISTS patients (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          firstName TEXT NOT NULL,
          lastName TEXT NOT NULL,
          dateOfBirth TEXT NOT NULL,
          gender TEXT NOT NULL,
          contactNumber TEXT NOT NULL,
          email TEXT NOT NULL,
          address TEXT NOT NULL,
          createdAt TEXT NOT NULL,
          updatedAt TEXT NOT NULL
        )
      `);

      this.dbReady.next(true);
    } catch (err) {
      console.error('Failed to initialize database:', err);
      this.dbReady.next(false);
    }
  }

  isDatabaseReady() {
    return this.dbReady.asObservable();
  }

  executeQuery(query: string, params: any[] = []): any[] {
    try {
      const result = this.db.exec(query, params);
      return result;
    } catch (err) {
      console.error('Error executing query:', err);
      throw err;
    }
  }

  getDatabase() {
    return this.db;
  }

  // Save database state to localStorage
  saveToStorage() {
    if (this.db) {
      const data = this.db.export();
      const buffer = new Uint8Array(data);
      const blob = new Blob([buffer.buffer], { type: 'application/x-sqlite3' });
      const reader = new FileReader();
      
      reader.onload = () => {
        if (reader.result) {
          localStorage.setItem('patientDB', reader.result as string);
        }
      };
      
      reader.readAsDataURL(blob);
    }
  }

  // Load database state from localStorage
  async loadFromStorage() {
    const data = localStorage.getItem('patientDB');
    if (data) {
      try {
        const SQL = await initSqlJs({
          locateFile: file => `https://sql.js.org/dist/${file}`
        });

        const response = await fetch(data);
        const arrayBuffer = await response.arrayBuffer();
        const uInt8Array = new Uint8Array(arrayBuffer);
        
        this.db = new SQL.Database(uInt8Array);
        this.dbReady.next(true);
      } catch (err) {
        console.error('Error loading database from storage:', err);
        this.initDatabase(); // Fallback to creating new database
      }
    }
  }
}
