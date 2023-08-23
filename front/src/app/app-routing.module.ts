import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LandingComponent } from './pages/landing/landing.component';
import { BoardComponent } from './pages/board/board.component';
import { PublishRoadmapComponent } from './pages/publish-roadmap/publish-roadmap.component';
import { MilestonesComponent } from './pages/milestones/milestones.component';

const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'board/:boardId', component: BoardComponent },
  { path: 'publish/:boardId', component: PublishRoadmapComponent },
  { path: 'milestones/:boardId', component: MilestonesComponent },


];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
