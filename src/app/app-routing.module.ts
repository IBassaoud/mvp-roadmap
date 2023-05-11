import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LandingComponent } from './pages/landing/landing.component';
import { BoardComponent } from './pages/board/board.component';
import { SprintComponent } from './shared/components/sprint/sprint.component';

const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'board/:boardId', component: BoardComponent },
  { path: 'board/:boardId/editor', component: BoardComponent },
  // Add other routes as needed
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
