import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/store/reducers';
import { loadConcept } from 'src/app/store/actions';
import { loadSpecimenSources } from '../../store/actions/specimen-sources-and-tests-management.actions';

@Component({
  selector: 'app-laboratory-home',
  templateUrl: './laboratory-home.component.html',
  styleUrls: ['./laboratory-home.component.scss'],
})
export class LaboratoryHomeComponent implements OnInit {
  constructor(private store: Store<AppState>) {
    // TODO: soft code
    // this.store.dispatch(
    //   loadConcept({
    //     name: 'Specimen sources',
    //     fields:
    //       'custom:(uuid,name,setMembers:(uuid,display,setMembers:(uuid,display,datatype,mappings:(uuid,display,conceptReferenceTerm:(name,code)),hiNormal,lowNormal,units,numeric,answers)))',
    //   })
    // );

    this.store.dispatch(loadSpecimenSources());
  }

  ngOnInit(): void {}
}
