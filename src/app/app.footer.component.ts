import {Component} from '@angular/core';

@Component({
    selector: 'app-footer',
    template: `
        <div class="layout-footer">
			<div class="logo-text">
			<img src="assets/images/asm.png" alt="app-icon" />
				<div class="text">
				</div>
			</div>
			<div class="icons">
				<div class="icon icon-hastag">
					<i class="pi pi-home"></i>
				</div>
				<div class="icon icon-twitter">
					<i class="pi pi-globe"></i>
				</div>
				<div class="icon icon-prime">
					<i class="pi pi-bookmark"></i>
				</div>
			</div>
        </div>
    `
})
export class AppFooterComponent {

}
