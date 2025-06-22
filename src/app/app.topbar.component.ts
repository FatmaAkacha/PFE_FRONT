import {Component, OnInit} from '@angular/core';
import {AppMainComponent} from './app.main.component';
import { logout } from './app-init';
import { KeycloakService } from 'keycloak-angular';
import { UserService } from './demo/service/user.service';

@Component({
    selector: 'app-topbar',
    template: `
        <div class="layout-topbar">
			<div class="layout-topbar-wrapper">
                <div class="layout-topbar-left">
					<div class="layout-topbar-logo-wrapper">
						<a href="#" class="layout-topbar-logo">
							<img src="assets/images/asm.png" alt="mirage-layout" />
							<span class="app-name">Application</span>
						</a>
					</div>

					<a href="#" class="sidebar-menu-button" (click)="appMain.onMenuButtonClick($event)">
						<i class="pi pi-bars"></i>
					</a>

					<a href="#" class="megamenu-mobile-button" (click)="appMain.onMegaMenuMobileButtonClick($event)">
						<i class="pi pi-align-right megamenu-icon"></i>
					</a>

					<a href="#" class="topbar-menu-mobile-button" (click)="appMain.onTopbarMobileMenuButtonClick($event)">
						<i class="pi pi-ellipsis-v"></i>
					</a>

                </div>
                <div class="layout-topbar-right fadeInDown">
					<ul class="layout-topbar-actions">
						<li #search class="search-item topbar-item" [ngClass]="{'active-topmenuitem': appMain.activeTopbarItem === search}">
							<a href="#" class="topbar-search-mobile-button" (click)="appMain.onTopbarItemClick($event,search)">
								<i class="topbar-icon pi pi-search"></i>
							</a>
							<ul class="search-item-submenu fadeInDown" (click)="appMain.topbarItemClick = true">
								<li>
                                    <span class="md-inputfield search-input-wrapper">
                                        <input pInputText placeholder="Recherche..."/>
                                        <i class="pi pi-search"></i>
                                    </span>
                                </li>
                            </ul>
                        </li>
						<li #calendar class="topbar-item" [ngClass]="{'active-topmenuitem': appMain.activeTopbarItem === calendar}">
							<a href="#" (click)="appMain.onTopbarItemClick($event,calendar)">
								<i class="topbar-icon pi pi-calendar"></i>
							</a>
							<ul class="fadeInDown" (click)="appMain.topbarItemClick = true">
								<li class="layout-submenu-header">
									<h1>Calendar</h1>
								</li>
								<li class="calendar">
                                    <p-calendar [inline]="true"></p-calendar>
								</li>
							</ul>
						</li>

						<li #gift class="topbar-item" [ngClass]="{'active-topmenuitem': appMain.activeTopbarItem === gift}">
							<a routerLink="/pages/email" (click)="appMain.onTopbarItemClick($event, gift)">
								<i class="topbar-icon pi pi-envelope"></i>
							</a>
							<!-- Le reste du code reste inchangé -->
						</li>

						<li #profile class="topbar-item profile-item" [ngClass]="{'active-topmenuitem': appMain.activeTopbarItem === profile}">
							<a href="#" (click)="appMain.onTopbarItemClick($event,profile)">
                            <span class="profile-image-wrapper">
								<img src="assets/images/user.png" alt="users-icon" />
                            </span>
								<span class="profile-info-wrapper">
                                <h3>{{ user?.username }}</h3>
                                <span>{{ user?.role.name }}</span>
                            </span>
							</a>
							<ul class="profile-item-submenu fadeInDown">
								<li class="profile-submenu-header">
									<div class="performance">
										<span>Weekly Performance</span>
										<img src="assets/layout/images/topbar/asset-bars.svg" alt="mirage-layout" />
									</div>
									<div class="profile">
										<img src="assets/layout/images/topbar/avatar-eklund.png" alt="mirage-layout"
														width="40" />
										<h1>{{ user?.username }}</h1>
										<span>{{ user?.role.name }}</span>
									</div>
								</li>
								<li class="layout-submenu-item">
									<i class="pi pi-list icon icon-1"></i>
									<div class="menu-text">
										<p>Tasks</p>
										<span>3 open issues</span>
									</div>
									<i class="pi pi-angle-right"></i>
								</li>
								<li class="layout-submenu-item">
									<i class="pi pi-shopping-cart icon icon-2"></i>
									<div class="menu-text">
										<p>Payments</p>
										<span>24 new</span>
									</div>
									<i class="pi pi-angle-right"></i>
								</li>
								<li class="layout-submenu-item">
									<i class="pi pi-users icon icon-3"></i>
									<div class="menu-text">
										<p>Clients</p>
										<span>+80%</span>
									</div>
									<i class="pi pi-angle-right"></i>
								</li>
								<li class="layout-submenu-footer">
									<button class="signout-button" (click)="onLogout()">Sign Out</button>
									<button class="buy-mirage-button">Buy Mirage</button>
								</li>
							</ul>
						</li>
						<li>
							<a href="#" class="layout-rightpanel-button" (click)="appMain.onRightPanelButtonClick($event)">
								<i class="pi pi-arrow-left"></i>
							</a>
						</li>
                    </ul>

					<ul class="profile-mobile-wrapper">
						<li #mobileProfile class="topbar-item profile-item" [ngClass]="{'active-topmenuitem': appMain.activeTopbarItem === mobileProfile}">
							<a href="#" (click)="appMain.onTopbarItemClick($event,mobileProfile)">
                            <span class="profile-image-wrapper">
                                <img src="assets/layout/images/topbar/avatar-eklund.png" alt="mirage-layout" />
                            </span>
								<span class="profile-info-wrapper">
                                <h3>{{ user?.username }}</h3>
                                <span>Design</span>
                            </span>
							</a>
							<ul class="fadeInDown">
								<li class="profile-submenu-header">
									<div class="performance">
										<span>Weekly Performance</span>
										<img src="assets/layout/images/topbar/asset-bars.svg" alt="mirage-layout" />
									</div>
									<div class="profile">
										<img src="assets/layout/images/topbar/avatar-eklund.png" alt="mirage-layout" width="45" />
										<h1>{{ user?.username }}</h1>
										<span>{{ user?.role.name }}</span>
									</div>
								</li>
								<li>
									<i class="pi pi-list icon icon-1"></i>
									<div class="menu-text">
										<p>Tasks</p>
										<span>3 open issues</span>
									</div>
									<i class="pi pi-angle-right"></i>
								</li>
								<li>
									<i class="pi pi-shopping-cart icon icon-2"></i>
									<div class="menu-text">
										<p>Payments</p>
										<span>24 new</span>
									</div>
									<i class="pi pi-angle-right"></i>
								</li>
								<li>
									<i class="pi pi-users icon icon-3"></i>
									<div class="menu-text">
										<p>Clients</p>
										<span>+80%</span>
									</div>
									<i class="pi pi-angle-right"></i>
								</li>
								<li class="layout-submenu-footer">
									<button class="signout-button" (click)="onLogout()">Sign Out</button>
									<button class="buy-mirage-button">Buy Mirage</button>
								</li>
							</ul>
						</li>
					</ul>
                </div>
            </div>
        </div>
    `
})
export class AppTopBarComponent implements OnInit {

    activeItem: number;
	  user: any;
  roles: any;


    constructor(public appMain: AppMainComponent, private keycloak: KeycloakService, private userService: UserService) {}

    mobileMegaMenuItemClick(index) {
        this.appMain.megaMenuMobileClick = true;
        this.activeItem = this.activeItem === index ? null : index;
    }

		    onLogout() {
        logout(this.keycloak);
    }

	  ngOnInit() {
    this.userService.getUser().subscribe({
      next: (data) => {
		console.log('Utilisateur récupéré', data);
		       this.user = data.user;
      },
      error: (err) => {
        console.error('Erreur récupération utilisateur', err);
      }
    });
  }


}
