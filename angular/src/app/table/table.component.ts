import { Component, Input } from "@angular/core";
import { animate, state, style, transition, trigger } from '@angular/animations';
import { Transaction, License } from "../interfaces/transaction";

@Component({
  selector: 'pm-table',
  styleUrls: ['./table.component.css'],
  templateUrl: './table.component.html',
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0', display: 'none' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class TableComponent {
  @Input() childHistory: Transaction[];
  dropdownList = ['adapt', 'diminish', 'embed', 'enhance', 'enlarge', 'issue', 'modify', 'play', 'print', 'reduce'];
  displayedColumns = ['idImage', 'hashImage', 'newOwner'];
  expandedElement: Transaction | null;

  constructor() {

  }
}

