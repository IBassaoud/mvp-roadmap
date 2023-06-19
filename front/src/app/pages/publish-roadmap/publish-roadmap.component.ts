import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SnackbarService } from 'src/app/core/services/snackbar.service';

@Component({
  selector: 'app-publish-roadmap',
  templateUrl: './publish-roadmap.component.html',
  styleUrls: ['./publish-roadmap.component.scss']
})
export class PublishRoadmapComponent implements OnInit {
  loading = false;
  boardId: string = '';
  boardUrl: string = '';
  @ViewChild('boardLink', { static: false }) boardLink!: ElementRef<HTMLAnchorElement>;

  messageForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private snackbarService: SnackbarService
  ) {
    this.messageForm = this.formBuilder.group({
      message: ''
    })
   }

  ngOnInit(): void {
    this.loading = true;
    this.boardId = this.route.snapshot.paramMap.get('boardId') || '';
    this.boardUrl = this.getBoardUrl();
    this.loading = false;
  }

  getBoardUrl(): string {
    const url = this.router.createUrlTree(['/board', this.boardId]);
    const baseUrl = window.location.origin + '/mvp-roadmap/#';
    const fullUrl = this.router.serializeUrl(url);
    return baseUrl + fullUrl;
  }

  // NOTE: This method is to use if HashLocationStrategy isn't used as a provider in the app.module inside the application
  // getBoardUrl(): string {
  //   const url = this.router.createUrlTree(['/board', this.boardId]);
  //   console.log(window.location.origin + url.toString());
  //   return window.location.origin + url.toString();
  // }

  copyLink(linkElement: HTMLAnchorElement): void {
    const link = linkElement.href;
    navigator.clipboard.writeText(link).then(() => {
      this.snackbarService.showSuccess('Link copied to clipboard');
    }).catch((error) => {
      this.snackbarService.showError('Failed to copy link to clipboard');
    });
  }

  publishChange() {
    if (this.messageForm.valid) {
      // Send email
    }
  }
}
