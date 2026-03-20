import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { TranslationService } from './core/services/translation.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: true,
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent {
  // Injecting TranslationService triggers its constructor which calls
  // applyDirection() to set lang/dir on <html> from persisted preference.
  constructor(private _ts: TranslationService) {}
}
