import { Injectable } from '@angular/core';
declare const initSqlJs: any;
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
        locateFile: (file: string) => `assets/${file}`,
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

  isInitialized(): boolean {
    return this.dbReady.value;
  }

  closeDatabase() {
    if (this.db) {
      this.saveToStorage(); // Save current state before closing
      this.db.close();
      this.db = null;
      this.dbReady.next(false);
    }
  }

  executeQuery(query: string, params: any[] = []): any[] {
    if (!this.db) {
      throw new Error('Database is not initialized');
    }

    try {
      let result;
      if (query.trim().toUpperCase().startsWith('SELECT')) {
        // For SELECT queries, use db.exec to get results
        const execResult = this.db.exec(query, params);
        if (execResult.length > 0) {
          // Convert column/value format to array of objects
          const columns = execResult[0].columns;
          result = execResult[0].values.map((row: any[]) => {
            const obj: any = {};
            columns.forEach((col: string, i: number) => {
              obj[col] = row[i];
            });
            return obj;
          });
        } else {
          result = [];
        }
      } else {
        // For INSERT, UPDATE, DELETE queries, use db.run
        this.db.run(query, params);
        result = [];
      }
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
          locateFile: (file: string) => `https://sql.js.org/dist/${file}`
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
