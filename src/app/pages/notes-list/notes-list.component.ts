import {
  animate,
  style,
  transition,
  trigger,
  query,
  stagger
} from '@angular/animations';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Note } from 'src/app/shared/note.model';
import { NotesService } from 'src/app/shared/notes.service';

@Component({
  selector: 'app-notes-list',
  templateUrl: './notes-list.component.html',
  styleUrls: ['./notes-list.component.scss'],
  animations: [
    trigger('itemAnim', [
      //ENTRY ANIMATION
      transition('void => *', [
        //transition will go from void/nonexistant to many states
        //initial state
        style({
          height: 0,
          opasity: 0,
          transform: 'scale(0:85)', //css expresion has to be in quotes since it can't b converted to JS.
          'margin-bottom': 0,
          // we have to 'expand' out the padding properties cuz of bug in FireFox + other browsers
          paddingTop: 0,
          paddingBottom: 0,
          paddingRight: 0,
          paddingLeft: 0,
        }),
        // we first want to animate the spacing (which includes height and margin)
        animate(
          '50ms',
          style({
            height: '*',
            'margin-bottom': '*',
            paddingTop: '*',
            paddingBottom: '*',
            paddingRight: '*',
            paddingLeft: '*',
          })
        ),
        animate(68),
      ]),
      transition('* => void', [
        //first scale up
        animate(
          50,
          style({
            tranform: 'scale(1.05)',
          })
        ),
        // then scale down back to normal size while beginning to fade out
        animate(
          50,
          style({
            tranform: 'scale(1)',
            opacity: 0.75,
          })
        ),
        // scale down and fade out completely
        animate(
          '120ms ease-out',
          style({
            tranform: 'scale(0.68)',
            opacity: 0,
          })
        ),
        // then animate the spacing (which includes height, padding and margin)
        animate(
          '150ms ease-out',
          style({
            height: 0,
            'margin-bottom': 0,
            paddingTop: 0,
            paddingBottom: 0,
            paddingRight: 0,
            paddingLeft: 0,
          })
        ),
      ]),
    ]),
    trigger('listAnim', [
      transition('* => *', [
        query(
          ':enter',
          [
            style({
              opacity: 0,
              height: 0,
            }),
            stagger(100, [animate('0.2s ease')]),
          ],
          {
            optional: true,
          }
        ),
      ]),
    ]),
  ],
})
export class NotesListComponent implements OnInit {
  notes: Note[] = new Array<Note>();
  filteredNotes: Note[] = new Array<Note>();

  @ViewChild('filterInput') filterInputElRef: ElementRef<HTMLInputElement>;

  constructor(private notesService: NotesService) {}

  ngOnInit(): void {
    // we want to retrieve all notes from NotesService
    this.notes = this.notesService.getAll();
    //this.filteredNotes = this.notes;
    this.filter('');
  }

  deleteNote(note: Note) {
    let noteId = this.notesService.getId(note); 
    this.notesService.delete(noteId);
    this.filter(this.filterInputElRef.nativeElement.value);
  }

  generateNoteURL(note: Note){
    let noteId = this.notesService.getId(note); 
    return noteId;
  }

  filter(query: string) {
    query = query.toLowerCase().trim();

    let allResults: Note[] = new Array<Note>();
    // slipt up the search query into individual words
    let terms: string[] = query.split(' '); //split on spaces
    // remove duplucate search terms
    terms = this.removeDuplicates(terms);
    //compile all relevant results into the allResults array
    terms.forEach((term) => {
      let results: Note[] = this.relevantNotes(term);
      //append results to the allResults array
      allResults = [...allResults, ...results];
    });
    //allResults will include duplicate notes because a singular note can be the result
    // of many search terms  but we dont want to show the same note multiple times on the UI so we first
    // must remove the duplicates
    let uniqueResults = this.removeDuplicates(allResults);
    this.filteredNotes = uniqueResults;

    // sort by relevancy
    this.sortByRelevancy(allResults);
  }

  removeDuplicates(arr: Array<any>): Array<any> {
    let uniqueResults: Set<any> = new Set<any>(); // sets have unique values
    // loop through the input array and add the items to the set
    arr.forEach((e) => uniqueResults.add(e));
    return Array.from(uniqueResults);
  }

  relevantNotes(query: string): Array<Note> {
    query = query.toLowerCase().trim();
    let relevantNotes = this.notes.filter((note) => {
      if (note.title && note.title.toLowerCase().includes(query)) {
        return true;
      }
      if (note.body && note.body.toLowerCase().includes(query)) {
        return true;
      }
      return false;
    });
    return relevantNotes;
  }

  sortByRelevancy(searchResult: Note[]) {
    // this method will calculate the relevancy of a note based on the number of times it
    // appears in the search results

    let noteCountObj: Object = {}; // format - key:value => NoteId:number(note obj id : count)

    searchResult.forEach((note) => {
      let noteId = this.notesService.getId(note); // get the notes id
      if (noteCountObj[noteId]) {
        noteCountObj[noteId] += 1;
      } else {
        noteCountObj[noteId] = 1;
      }
    });
    this.filteredNotes = this.filteredNotes.sort((a: Note, b: Note) => {
      let aId = this.notesService.getId(a);
      let bId = this.notesService.getId(b);

      let aCount = noteCountObj[aId];
      let bCount = noteCountObj[bId];

      return bCount - aCount; // descending order to get the most relevant at the top
    });
  }

}
