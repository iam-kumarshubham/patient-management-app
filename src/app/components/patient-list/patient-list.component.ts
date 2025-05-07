import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { Patient } from '../../models/patient.model';
import { PatientService } from '../../services/patient.service';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-patient-list',
  templateUrl: './patient-list.component.html',
  styleUrls: ['./patient-list.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule
  ]
})
export class PatientListComponent implements OnInit {
  displayedColumns: string[] = [
    'firstName',
    'lastName',
    'dateOfBirth',
    'gender',
    'contactNumber',
    'email',
    'actions'
  ];
  dataSource = new MatTableDataSource<Patient>();
  isLoading = true;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private patientService: PatientService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadPatients();
    this.patientService.getPatients().subscribe(patients => {
      this.dataSource.data = patients;
      this.isLoading = false;
    });
  }

  async loadPatients(): Promise<void> {
    this.isLoading = true;
    try {
      const patients = await this.patientService.getAllPatients();
      this.dataSource.data = patients;
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    } catch (error) {
      console.error('Error loading patients:', error);
      this.showErrorMessage('Error loading patients');
    } finally {
      this.isLoading = false;
    }
  }

  async applyFilter(event: Event): Promise<void> {
    const filterValue = (event.target as HTMLInputElement).value;
    if (filterValue) {
      const filteredPatients = await this.patientService.searchPatients(filterValue);
      this.dataSource.data = filteredPatients;
    } else {
      this.loadPatients();
    }
  }

  editPatient(id: number): void {
    // Navigation will be handled by the router link in the template
  }

  deletePatient(id: number): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Confirm Delete',
        message: 'Are you sure you want to delete this patient?'
      }
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        try {
          await this.patientService.deletePatient(id);
          this.showSuccessMessage('Patient deleted successfully');
          await this.loadPatients();
        } catch (error) {
          console.error('Error deleting patient:', error);
          this.showErrorMessage('Error deleting patient');
        }
      }
    });
  }

  private showSuccessMessage(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['success-snackbar']
    });
  }

  private showErrorMessage(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['error-snackbar']
    });
  }
}
