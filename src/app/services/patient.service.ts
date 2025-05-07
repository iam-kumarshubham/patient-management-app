import { Injectable } from '@angular/core';
import { DatabaseService } from './database.service';
import { Patient } from '../models/patient.model';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PatientService {
  private patientsSubject = new BehaviorSubject<Patient[]>([]);

  constructor(public databaseService: DatabaseService) {
    this.loadPatients();
  }

  private async loadPatients() {
    try {
      const patients = await this.databaseService.getAllPatients();
      this.patientsSubject.next(patients);
    } catch (err) {
      console.error('Error loading patients:', err);
    }
  }

  getPatients(): Observable<Patient[]> {
    return this.patientsSubject.asObservable();
  }

  async getPatient(id: number): Promise<Patient | undefined> {
    try {
      return await this.databaseService.getPatient(id);
    } catch (error) {
      console.error('Error getting patient:', error);
      throw error;
    }
  }

  async createPatient(patient: Omit<Patient, 'id'>): Promise<void> {
    try {
      await this.databaseService.addPatient(patient);
      await this.loadPatients();
    } catch (error) {
      console.error('Error creating patient:', error);
      throw error;
    }
  }

  async updatePatient(id: number, patient: Omit<Patient, 'id'>): Promise<void> {
    try {
      await this.databaseService.updatePatient(id, patient);
      await this.loadPatients();
    } catch (error) {
      console.error('Error updating patient:', error);
      throw error;
    }
  }

  async deletePatient(id: number): Promise<void> {
    try {
      await this.databaseService.deletePatient(id);
      await this.loadPatients();
    } catch (error) {
      console.error('Error deleting patient:', error);
      throw error;
    }
  }

  async getAllPatients(): Promise<Patient[]> {
    try {
      return await this.databaseService.getAllPatients();
    } catch (error) {
      console.error('Error getting patients:', error);
      throw error;
    }
  }

  async searchPatients(searchTerm: string): Promise<Patient[]> {
    try {
      return await this.databaseService.searchPatients(searchTerm);
    } catch (error) {
      console.error('Error searching patients:', error);
      throw error;
    }
  }
}
