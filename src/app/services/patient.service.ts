import { Injectable } from '@angular/core';
import { DatabaseService } from './database.service';
import { Patient } from '../models/patient.model';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PatientService {
  private patientsSubject = new BehaviorSubject<Patient[]>([]);

  constructor(private dbService: DatabaseService) {
    this.loadPatients();
  }

  private loadPatients() {
    this.dbService.isDatabaseReady().subscribe(ready => {
      if (ready) {
        try {
          const result = this.dbService.executeQuery('SELECT * FROM patients');
          if (result.length > 0) {
            const patients = result[0].values.map((row: any[]) => ({
              id: row[0],
              firstName: row[1],
              lastName: row[2],
              dateOfBirth: row[3],
              gender: row[4],
              contactNumber: row[5],
              email: row[6],
              address: row[7],
              createdAt: row[8],
              updatedAt: row[9]
            }));
            this.patientsSubject.next(patients);
          }
        } catch (err) {
          console.error('Error loading patients:', err);
        }
      }
    });
  }

  getPatients(): Observable<Patient[]> {
    return this.patientsSubject.asObservable();
  }

  getPatient(id: string): Observable<Patient | undefined> {
    return new Observable<Patient | undefined>(observer => {
      this.getPatients().subscribe(patients => {
        const patient = patients.find(p => p.id === parseInt(id));
        observer.next(patient);
        observer.complete();
      });
    });
  }

  createPatient(patient: Omit<Patient, 'id'>): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const now = new Date().toISOString();
        const query = `
          INSERT INTO patients (
            firstName, lastName, dateOfBirth, gender,
            contactNumber, email, address, createdAt, updatedAt
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        this.dbService.executeQuery(query, [
          patient.firstName,
          patient.lastName,
          patient.dateOfBirth,
          patient.gender,
          patient.contactNumber,
          patient.email,
          patient.address,
          now,
          now
        ]);

        this.dbService.saveToStorage();
        this.loadPatients();
        resolve();
      } catch (err) {
        console.error('Error adding patient:', err);
        reject(err);
      }
    });
  }

  updatePatient(id: string, patient: Omit<Patient, 'id'>): Promise<void> {
    return new Promise((resolve, reject) => {
      const patientId = parseInt(id);
      if (isNaN(patientId)) {
        reject(new Error('Invalid patient ID'));
        return;
      }

      try {
        const now = new Date().toISOString();
        const query = `
          UPDATE patients SET
            firstName = ?,
            lastName = ?,
            dateOfBirth = ?,
            gender = ?,
            contactNumber = ?,
            email = ?,
            address = ?,
            updatedAt = ?
          WHERE id = ?
        `;

        this.dbService.executeQuery(query, [
          patient.firstName,
          patient.lastName,
          patient.dateOfBirth,
          patient.gender,
          patient.contactNumber,
          patient.email,
          patient.address,
          now,
          patientId
        ]);

        this.dbService.saveToStorage();
        this.loadPatients();
        resolve();
      } catch (err) {
        console.error('Error updating patient:', err);
        reject(err);
      }
    });
  }

  deletePatient(id: number): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.dbService.executeQuery('DELETE FROM patients WHERE id = ?', [id]);
        this.dbService.saveToStorage();
        this.loadPatients();
        resolve();
      } catch (err) {
        console.error('Error deleting patient:', err);
        reject(err);
      }
    });
  }

  executeCustomQuery(query: string): any[] {
    return this.dbService.executeQuery(query);
  }
}
