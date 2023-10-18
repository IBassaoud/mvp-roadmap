import { Component } from '@angular/core';
import { LogsFirebaseService } from 'src/app/core/services/logs-firebase.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'MVP Ror';

  constructor(public logsService: LogsFirebaseService) {}
}
