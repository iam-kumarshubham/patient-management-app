import { Routes } from '@angular/router';
import { PatientListComponent } from './components/patient-list/patient-list.component';
import { PatientFormComponent } from './components/patient-form/patient-form.component';

export const routes: Routes = [
  { path: '', redirectTo: '/patients', pathMatch: 'full' },
  { path: 'patients', component: PatientListComponent },
  { path: 'patients/new', component: PatientFormComponent },
  { path: 'patients/:id/edit', component: PatientFormComponent }
];
