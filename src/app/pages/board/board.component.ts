import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss'],
})
export class BoardComponent implements OnInit {
  editorView: boolean = false;

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    this.route.url.subscribe((url) => {
      this.editorView = url.some((segment) => segment.path === 'editor');
    });
  }

  toggleEditorView(): void {
    if (this.editorView) {
      this.router.navigate(['/board']);
    } else {
      this.router.navigate(['/board/editor']);
    }
  }
}
