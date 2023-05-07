import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LandingComponent } from './pages/landing/landing.component';
import { BoardComponent } from './pages/board/board.component';

const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'board', component: BoardComponent },
  { path: 'roadmap', component: BoardComponent },
  { path: 'board/editor', component: BoardComponent }, // Editor view route
  // Add other routes as needed
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
