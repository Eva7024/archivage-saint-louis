// src/app/notifications/notifications.component.ts
import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { DatePipe } from '@angular/common';
import { NotificationService } from '../core/services/notification.service';
import { NotificationGed } from '../core/models/models';

@Component({
  selector: 'app-notifications',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe],
  styles: [`
    .ligne { padding: 0.75rem 1rem; border-bottom: 0.5px solid rgba(0,0,0,0.06); font-size: 0.88rem; }
    .ligne.neuve { background: var(--bleu-pale); border-left: 4px solid var(--bleu); }
    .ligne small { display: block; color: #888; margin-top: 0.15rem; }
  `],
  template: `
    <div class="page">
      <h2>Notifications</h2>
      <div class="card sans-marge">
        @for (n of liste(); track n.id) {
          <div class="ligne" [class.neuve]="!n.lu">
            <b>{{ n.titre }}</b> — {{ n.message }}
            <small>{{ n.dateCreation | date:'dd/MM/yyyy HH:mm' }}</small>
          </div>
        } @empty { <div class="vide">Aucune notification.</div> }
      </div>
    </div>
  `
})
export class NotificationsComponent implements OnInit {
  private readonly service = inject(NotificationService);
  protected readonly liste = signal<NotificationGed[]>([]);

  ngOnInit(): void {
    this.service.lister().subscribe(l => {
      this.liste.set(l);
      // Une fois affichées, les notifications sont marquées comme lues
      this.service.toutLire().subscribe(() => this.service.nonLues.set(0));
    });
  }
}
