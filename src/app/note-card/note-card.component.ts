import { Component, ElementRef, EventEmitter, Input, OnInit, Output, Renderer2, ViewChild } from '@angular/core';

@Component({
  selector: 'app-note-card',
  templateUrl: './note-card.component.html',
  styleUrls: ['./note-card.component.scss']
})
export class NoteCardComponent implements OnInit {

  @Input()
  title!: string;
  @Input()
  body!: string;
  @Input() link!: any;

  // we can use the delete string instead of the whole event
  @Output('delete') deleteEvent:  EventEmitter<void> = new EventEmitter<void>();

  @ViewChild('truncator', { static: true })
  truncator!: ElementRef<HTMLElement>;
  @ViewChild('bodyText', { static: true })
  bodyText!: ElementRef<HTMLElement>;

  constructor(private renderer: Renderer2) { }

  ngOnInit(): void {
    // work out if there is a text overflow and if not, the hide the truncator
    let style = window.getComputedStyle(this.bodyText.nativeElement, null);
    let viewableHeight = parseInt(style.getPropertyValue('height'), 10);

    if (this.bodyText.nativeElement.scrollHeight > viewableHeight){
      // if there is a text overflow, show the fade out truncator
      this.renderer.setStyle(this.truncator.nativeElement, 'display', 'block');
    } else{
      // else there is no text overflow, hide the fade out truncator
      this.renderer.setStyle(this.truncator.nativeElement, 'display', 'none');
    }
  
  }

  onXButtonClick() {
    this.deleteEvent.emit();
  }

}
