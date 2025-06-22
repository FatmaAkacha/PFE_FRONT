import { Component, OnInit } from '@angular/core';
import { AppMainComponent } from './app.main.component';
import { DocumentService } from './demo/service/document.service';
import { Document } from './demo/domain/document';


@Component({
  selector: 'app-rightpanel',
  template: `
    <div class="layout-rightpanel" (click)="appMain.onRightPanelClick($event)">
      <div class="right-panel-header">
        <div class="title">
          <span>Today</span>
          <h1>{{ currentDate | date:'EEEE, d MMM' }}</h1>
        </div>
        <a href="#" class="rightpanel-exit-button" (click)="appMain.onRightPanelClose($event)">
          <i class="pi pi-times"></i>
        </a>
      </div>
      <div class="right-panel-content">
        <div class="right-panel-content-row">
          <div class="tasks">
            <div class="tasks-header">
              <div class="title">
                <h1>Tasks</h1>
              </div>
              <div class="tasks-info">
                <span>You have</span><span class="highlighted"> {{ documents.length }} tasks</span><span> today</span>
              </div>
            </div>
            <ul class="tasks-list">
              <li class="tasks-list-item" *ngFor="let doc of documents; let i = index">
                <div class="checkbox">
                  <p-checkbox binary="true"></p-checkbox>
                  <p>{{ i + 1 }}. {{ doc.libelle }} {{ doc.num_seq || '' }}</p>
                </div>
                <div class="tasks-day">
                  <span class="time" [ngClass]="{'later': isLater(doc.dateDocument)}">
                    {{ isToday(doc.dateDocument) ? 'Today' : 'Later' }}
                  </span>
                </div>
              </li>
              <li *ngIf="!documents.length" class="tasks-list-item">
                <p>No tasks available</p>
              </li>
            </ul>
          </div>
        </div>
        <div class="right-panel-content-row">
          <div class="calendar">
            <h1>Calendar</h1>
            <p-calendar [inline]="true"></p-calendar>
          </div>
        </div>
        <div class="right-panel-content-row">
					<div class="weather">
						<h1>Weather</h1>
						<ul class="weather-list">
							<li class="weather-list-item">
								<div class="time-location">
									<span>15.03</span>
									<p>Lille</p>
								</div>
								<div class="weather-info">
									<div class="weather-icon icon-1">
										<img src="assets/layout/images/rightpanel/weather-icon-1.svg" alt="mirage-layout" />
									</div>
									<div class="weather-value">
										31°
									</div>
								</div>
							</li>
							<li class="weather-list-item">
								<div class="time-location">
									<span>15.03</span>
									<p>Barcelona</p>
								</div>
								<div class="weather-info">
									<div class="weather-icon icon-2">
										<img src="assets/layout/images/rightpanel/weather-icon-3.svg" alt="mirage-layout" />
									</div>
									<div class="weather-value">
										26°
									</div>
								</div>
							</li>
							<li class="weather-list-item">
								<div class="time-location">
									<span>09.03</span>
									<p>New York</p>
								</div>
								<div class="weather-info">
									<div class="weather-icon icon-1">
										<img src="assets/layout/images/rightpanel/weathericon-4.svg" alt="mirage-layout" />
									</div>
									<div class="weather-value">
										23°
									</div>
								</div>
							</li>
							<li class="weather-list-item">
								<div class="time-location">
									<span>15.03</span>
									<p>Amsterdam</p>
								</div>
								<div class="weather-info">
									<div class="weather-icon icon-3">
										<img src="assets/layout/images/rightpanel/weather-icon-4.svg" alt="mirage-layout" />
									</div>
									<div class="weather-value">
										31°
									</div>
								</div>
							</li>
							<li class="weather-list-item">
								<div class="time-location">
									<span>09.03</span>
									<p>Antalya</p>
								</div>
								<div class="weather-info">
									<div class="weather-icon icon-4">
										<img src="assets/layout/images/rightpanel/weather-icon-4.svg" alt="mirage-layout" />
									</div>
									<div class="weather-value">
										33°
									</div>
								</div>
							</li>
						</ul>
					</div>
				</div>
            </div>
        </div>
    `
})
export class AppRightPanelComponent implements OnInit {
  documents: Document[] = [];
  currentDate = new Date();

  constructor(
    public appMain: AppMainComponent,
    private documentService: DocumentService
  ) {}

  ngOnInit() {
    this.documentService.getDocuments().subscribe({
      next: (documents) => {
        this.documents = documents;
        console.log('Documents loaded:', this.documents);
      },
      error: (error) => {
        console.error('Error fetching documents:', error);
      }
    });
  }

  isToday(date: string | Date): boolean {
    const taskDate = new Date(date);
    const today = new Date();
    return (
      taskDate.getDate() === today.getDate() &&
      taskDate.getMonth() === today.getMonth() &&
      taskDate.getFullYear() === today.getFullYear()
    );
  }

isLater(date: string | Date): boolean {
    const taskDate = new Date(date);
    const today = new Date();
    return taskDate > today;
  }
}